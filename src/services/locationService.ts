export type GPSStatusState = 
  | 'GPS_REQUESTING'
  | 'GPS_ACTIVE'
  | 'GPS_DENIED'
  | 'GPS_UNAVAILABLE'
  | 'GPS_ERROR';

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  speed?: number | null;
  heading?: number | null;
}

export class LocationService {
  private currentStatus: GPSStatusState = 'GPS_UNAVAILABLE';
  private watchId: number | null = null;
  private currentLocation: LocationPoint | null = null;
  private locationHistory: LocationPoint[] = [];
  private listeners: Set<(location: LocationPoint | null, status: GPSStatusState) => void> = new Set();

  /**
   * Calculates distance between two geographic coordinates using the Haversine formula (in km).
   */
  public calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(4));
  }

  public getStatus(): GPSStatusState {
    return this.currentStatus;
  }

  public getCurrentLocation(): LocationPoint | null {
    return this.currentLocation;
  }

  public subscribe(callback: (location: LocationPoint | null, status: GPSStatusState) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentLocation, this.currentStatus);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLocation, this.currentStatus));
  }

  /**
   * Obtains initial GPS position once.
   */
  public async getSinglePosition(): Promise<LocationPoint | null> {
    if (!('geolocation' in navigator)) {
      this.currentStatus = 'GPS_UNAVAILABLE';
      this.notifyListeners();
      return null;
    }

    this.currentStatus = 'GPS_REQUESTING';
    this.notifyListeners();

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
        });
      });

      const point: LocationPoint = {
        lat: parseFloat(pos.coords.latitude.toFixed(6)),
        lng: parseFloat(pos.coords.longitude.toFixed(6)),
        accuracy: Math.round(pos.coords.accuracy),
        timestamp: pos.timestamp,
        speed: pos.coords.speed,
        heading: pos.coords.heading
      };

      this.currentLocation = point;
      this.currentStatus = 'GPS_ACTIVE';
      this.notifyListeners();
      return point;
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 1) {
        this.currentStatus = 'GPS_DENIED';
      } else if (error.code === 2) {
        this.currentStatus = 'GPS_UNAVAILABLE';
      } else {
        this.currentStatus = 'GPS_ERROR';
      }
      this.notifyListeners();
      return null;
    }
  }

  /**
   * Starts continuous GPS tracking during an active expedition.
   */
  public startContinuousTracking(
    onLocationUpdate?: (point: LocationPoint, cumulativeDistanceKm: number) => void
  ): boolean {
    if (!('geolocation' in navigator)) {
      this.currentStatus = 'GPS_UNAVAILABLE';
      this.notifyListeners();
      return false;
    }

    this.stopTracking(); // Clear existing watcher if any

    this.currentStatus = 'GPS_REQUESTING';
    this.locationHistory = [];
    this.notifyListeners();

    let totalDistanceKm = 0;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const accuracy = Math.round(pos.coords.accuracy);

        // Ignore inaccurate points (> 50 meters accuracy radius)
        if (accuracy > 50) {
          console.warn(`GPS Point skipped: accuracy (${accuracy}m) exceeds 50m threshold.`);
          return;
        }

        const newPoint: LocationPoint = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy,
          timestamp: pos.timestamp,
          speed: pos.coords.speed,
          heading: pos.coords.heading
        };

        if (this.locationHistory.length > 0) {
          const prevPoint = this.locationHistory[this.locationHistory.length - 1];
          const distDelta = this.calculateHaversineDistance(
            prevPoint.lat,
            prevPoint.lng,
            newPoint.lat,
            newPoint.lng
          );

          // Ignore unreasonable GPS jumps (> 150 km/h impossible human movement)
          const timeDeltaSecs = (newPoint.timestamp - prevPoint.timestamp) / 1000;
          const speedKmH = timeDeltaSecs > 0 ? (distDelta / timeDeltaSecs) * 3600 : 0;

          if (speedKmH <= 150 && distDelta >= 0.003) {
            totalDistanceKm = parseFloat((totalDistanceKm + distDelta).toFixed(4));
            this.locationHistory.push(newPoint);
          }
        } else {
          this.locationHistory.push(newPoint);
        }

        this.currentLocation = newPoint;
        this.currentStatus = 'GPS_ACTIVE';
        this.notifyListeners();

        if (onLocationUpdate) {
          onLocationUpdate(newPoint, totalDistanceKm);
        }
      },
      (err) => {
        if (err.code === 1) {
          this.currentStatus = 'GPS_DENIED';
        } else if (err.code === 2) {
          this.currentStatus = 'GPS_UNAVAILABLE';
        } else {
          this.currentStatus = 'GPS_ERROR';
        }
        this.notifyListeners();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000
      }
    );

    return true;
  }

  /**
   * Stops continuous GPS tracking when an expedition ends.
   */
  public stopTracking(): void {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  public getLocationHistory(): LocationPoint[] {
    return this.locationHistory;
  }
}

export const locationService = new LocationService();
