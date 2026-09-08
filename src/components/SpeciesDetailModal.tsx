import React, { useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Eye, 
  Lock, 
  HelpCircle, 
  Volume2, 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  Award,
  Zap,
  Info
} from 'lucide-react';
import L from 'leaflet';
import { Species } from '../types';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';

interface SpeciesDetailModalProps {
  species: Species | null;
  onClose: () => void;
  onSimulateDiscovery?: (speciesId: string) => void;
}

export const SpeciesDetailModal: React.FC<SpeciesDetailModalProps> = ({
  species,
  onClose,
  onSimulateDiscovery
}) => {
  const { setOpenScannerModal, recordDiscovery } = useEcoDex();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const isDiscovered = !!species?.discovered;

  // Leaflet Map Lifecycle for Discovered Species
  useEffect(() => {
    if (!species || !isDiscovered || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const coords = species.discoveryCoordinates || { lat: 18.5204, lng: 73.8567 };

    try {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      // Custom animated DivIcon
      const customIcon = L.divIcon({
        className: 'custom-ecodex-pin',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background: #2E7D32; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: #ffffff; border: 2.5px solid #2E7D32; box-shadow: 0 4px 14px rgba(46,125,50,0.35); display: flex; align-items: center; justify-content: center; font-size: 18px;">
              ${species.icon}
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      L.marker([coords.lat, coords.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${species.name}</b><br/>${species.discoveryLocation || 'Logged Sighting'}`);

      mapInstanceRef.current = map;

      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (e) {
      console.warn('Map rendering warning:', e);
    }
  }, [species?.id, isDiscovered]);

  if (!species) return null;

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30',
          border: 'border-amber-400',
          text: 'text-amber-500',
          chip: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      case 'Epic':
        return {
          bg: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30',
          border: 'border-purple-400',
          text: 'text-purple-600',
          chip: 'bg-purple-100 text-purple-900 border-purple-300'
        };
      case 'Rare':
        return {
          bg: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-blue-500/30',
          border: 'border-blue-400',
          text: 'text-blue-600',
          chip: 'bg-blue-100 text-blue-900 border-blue-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30',
          border: 'border-emerald-400',
          text: 'text-emerald-700',
          chip: 'bg-emerald-100 text-emerald-900 border-emerald-300'
        };
    }
  };

  const rarityStyle = getRarityBadge(species.rarity);

  const handleSoundPlay = () => {
    audio.playChime();
  };

  const handleSimulateUnlock = () => {
    if (onSimulateDiscovery) {
      onSimulateDiscovery(species.id);
    } else {
      recordDiscovery(species.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* ================= HERO IMAGE HEADER ================= */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-950 flex-shrink-0">
          {isDiscovered ? (
            /* Discovered Hero Image */
            <>
              <img
                src={species.discoveryPhoto || species.image}
                alt={species.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Sound Player Button */}
              <button
                onClick={handleSoundPlay}
                title="Play Specimen Audio"
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all shadow-lg cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Undiscovered Silhouette Hero with Question Mark */
            <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden">
              {/* Silhouette Masked Animal Image */}
              <img
                src={species.image}
                alt="Undiscovered Silhouette"
                className="w-full h-full object-cover filter brightness-0 contrast-200 opacity-25 scale-105 blur-[1.5px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

              {/* Glowing Mystery Silhouette Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-2 shadow-2xl animate-pulse">
                  <HelpCircle className="w-8 h-8 text-amber-300" />
                </div>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono uppercase tracking-widest text-slate-300 border border-white/10 font-bold">
                  Undiscovered Specimen
                </span>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${rarityStyle.bg}`}>
              {species.rarity}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
              {species.category}
            </span>
          </div>

          {/* Hero Title & Scientific Name */}
          <div className="absolute bottom-4 left-4 right-16 text-white">
            {isDiscovered ? (
              <>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-2xl">{species.icon}</span>
                  <h2 className="text-2xl font-black tracking-tight leading-none">{species.name}</h2>
                </div>
                <p className="text-xs italic text-slate-300 font-serif tracking-wide">{species.scientificName}</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xl opacity-60">❓</span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-300">Unknown Specimen</h2>
                </div>
                <p className="text-xs italic text-slate-400 font-mono tracking-wider">Taxonomy Undocumented</p>
              </>
            )}
          </div>
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="relative flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Key Stats Bar: Rarity, EcoXP Reward, First Discovered, Total Sightings */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {/* EcoXP Reward */}
            <div className="text-center p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                EcoXP
              </div>
              <div className="text-sm font-black text-forest mt-0.5">
                +{species.xp} XP
              </div>
            </div>

            {/* First Discovered Date */}
            <div className="text-center p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3 text-blue-500" />
                First Seen
              </div>
              <div className="text-[11px] font-bold text-slate-800 mt-0.5 truncate">
                {isDiscovered ? (species.firstDiscoveredDate || species.discoveredAt || 'March 2026') : 'Unobserved'}
              </div>
            </div>

            {/* Total Sightings */}
            <div className="text-center p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3 text-emerald-500" />
                Sightings
              </div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {isDiscovered ? (species.totalSightings || 1) : 0}
              </div>
            </div>
          </div>

          {/* ================= CONDITIONAL BLURRED SILHOUETTE VIEW ================= */}
          {!isDiscovered ? (
            /* LOCKED / UNDISCOVERED BLURRED EXPERIENCE */
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 p-4 bg-slate-50/70">
              {/* Blurred Background Content (Simulating classified field journal) */}
              <div className="filter blur-[5px] select-none pointer-events-none space-y-3 opacity-40">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Field Habitat & Range</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{species.habitat}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Wildlife Facts</h4>
                  <p className="text-slate-600 mt-1 leading-relaxed">{species.description}</p>
                </div>
                <div className="h-28 w-full bg-slate-300 rounded-xl"></div>
              </div>

              {/* Frosted Glass Overlay with Discovery CTA */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-forest-dark text-white flex items-center justify-center shadow-lg mb-3">
                  <Lock className="w-5 h-5 text-golden" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Journal Entry Blurred
                </h3>
                <p className="text-[11px] text-slate-600 max-w-xs mb-4 leading-relaxed">
                  This species has not been logged yet. Scan it in the wild with the AI Camera to unlock its full ecological facts, habitat notes, and exact map sighting!
                </p>

                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      setOpenScannerModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Launch AI Camera Scanner
                  </button>

                  <button
                    onClick={handleSimulateUnlock}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    Simulate Discovery (Test Unlock)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* DISCOVERED EXPERIENCE: FULL JOURNAL DETAILS */
            <>
              {/* Conservation Status & Diet */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="text-[9px] uppercase font-bold text-emerald-800">Status</div>
                    <div className="text-xs font-bold text-emerald-950">{species.conservationStatus}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold text-emerald-800">Dietary Guild</div>
                  <div className="text-xs font-bold text-emerald-950">{species.diet.split(' ')[0]}</div>
                </div>
              </div>

              {/* Habitat */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-forest" />
                  Native Habitat & Range
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {species.habitat}
                </p>
              </div>

              {/* Wildlife Facts */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Field Wildlife Facts
                </h4>
                
                <ul className="space-y-1.5">
                  {(species.wildlifeFacts || [species.funFact, species.description]).map((fact, idx) => (
                    <li key={idx} className="text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                      <span className="text-forest mt-0.5 font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ================= DISCOVERY MAP LOCATION ================= */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Discovery Map Location
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {species.discoveryCoordinates 
                      ? `${species.discoveryCoordinates.lat.toFixed(4)}° N, ${species.discoveryCoordinates.lng.toFixed(4)}° E`
                      : 'GPS Fixed'}
                  </span>
                </div>

                {/* Leaflet Interactive Container */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <div ref={mapContainerRef} className="w-full h-full"></div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-sm">📍</span>
                  <span className="font-medium truncate">
                    {species.discoveryLocation || 'Logged during field expedition'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    setOpenScannerModal(true);
                  }}
                  className="flex-1 py-3 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Log Another Sighting
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
