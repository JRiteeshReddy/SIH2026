export type StepStatusState = 
  | 'STEP_TRACKING'
  | 'STEP_UNAVAILABLE'
  | 'STEP_PERMISSION_DENIED';

export class PedometerService {
  private currentStatus: StepStatusState = 'STEP_UNAVAILABLE';
  private stepCount: number = 0;
  private isListening: boolean = false;
  private lastStepTimestamp: number = 0;

  // Accelerometer peak detection threshold (m/s^2)
  private readonly ACCEL_THRESHOLD = 11.8;
  private readonly STEP_DEBOUNCE_MS = 280;

  private handleMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    if (x === null || y === null || z === null) return;

    // Total acceleration magnitude
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Detect step peak above threshold with temporal debounce
    if (magnitude > this.ACCEL_THRESHOLD && (now - this.lastStepTimestamp) > this.STEP_DEBOUNCE_MS) {
      this.stepCount++;
      this.lastStepTimestamp = now;
    }
  };

  public getStatus(): StepStatusState {
    return this.currentStatus;
  }

  public getStepCount(): number {
    return this.stepCount;
  }

  /**
   * Starts tracking physical steps using DeviceMotion API / Accelerometer.
   */
  public async startTracking(): Promise<StepStatusState> {
    this.stepCount = 0;

    // Check iOS / Safari Motion Permissions if needed
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      // @ts-expect-error iOS DeviceMotionEvent permission API
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        // @ts-expect-error iOS DeviceMotionEvent permission API
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('devicemotion', this.handleMotion, true);
          this.isListening = true;
          this.currentStatus = 'STEP_TRACKING';
        } else {
          this.currentStatus = 'STEP_PERMISSION_DENIED';
        }
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
        this.currentStatus = 'STEP_PERMISSION_DENIED';
      }
    } else if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion, true);
      this.isListening = true;
      this.currentStatus = 'STEP_TRACKING';
    } else {
      this.currentStatus = 'STEP_UNAVAILABLE';
    }

    return this.currentStatus;
  }

  /**
   * Stops motion listener when expedition finishes.
   */
  public stopTracking(): void {
    if (this.isListening && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion, true);
      this.isListening = false;
    }
  }

  public resetCount(): void {
    this.stepCount = 0;
  }
}

export const pedometerService = new PedometerService();
