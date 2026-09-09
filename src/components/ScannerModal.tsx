import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  Sparkles, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  BookOpen
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { aiModelService, ModelPrediction, AntiCheatRecord } from '../services/aiModelService';
import { audio } from '../services/audioService';
import { compressCanvasToThumbnail } from '../services/safeStorage';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose }) => {
  const { recordDiscovery } = useEcoDex();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<ModelPrediction | null>(null);
  const [antiCheat, setAntiCheat] = useState<AntiCheatRecord | null>(null);
  const [antiCheatError, setAntiCheatError] = useState<string | null>(null);
  const [isSavedToEcoDex, setIsSavedToEcoDex] = useState(false);

  // Model status
  const [modelReady, setModelReady] = useState(false);

  // 1. Initialize Model & Live Camera Preview on open
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    aiModelService.initModel().then((loaded) => setModelReady(loaded));
    startLiveCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const resetState = () => {
    setCapturedImage(null);
    setPrediction(null);
    setAntiCheat(null);
    setAntiCheatError(null);
    setIsProcessing(false);
    setIsSavedToEcoDex(false);
  };

  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Play error:', e));
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access required. Please allow camera permissions for live wildlife verification.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // 2. Capture Live Photo Only (No Gallery Upload Allowed)
  const handleCapturePhoto = async () => {
    if (!videoRef.current || isProcessing) return;

    audio.playRadarPing();
    setIsProcessing(true);
    setAntiCheatError(null);
    setIsSavedToEcoDex(false);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Capture the frame directly from live camera feed
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // High quality photo (90% quality, crisp HD) for on-screen preview - no heavy compression
    const highQualityPhotoUrl = canvas.toDataURL('image/jpeg', 0.90);
    setCapturedImage(highQualityPhotoUrl);

    // Balanced sharp photo for local storage and Firestore (720px at 0.80 quality)
    const storagePhotoUrl = compressCanvasToThumbnail(canvas, 720, 0.80) || highQualityPhotoUrl;

    // 3. Anti-Cheat Verification (Camera live, GPS active, Timestamp, anti-screenshot)
    const antiCheatResult = await aiModelService.verifyAntiCheat(streamRef.current, canvas);
    setAntiCheat(antiCheatResult);

    if (!antiCheatResult.isValidLiveCapture) {
      setAntiCheatError(antiCheatResult.rejectionReason || 'Anti-cheat check failed. Live camera and GPS are required.');
      setIsProcessing(false);
      audio.playChime();
      return;
    }

    // 4. Run Inference directly through the trained Keras model
    try {
      const pred = await aiModelService.predict(canvas);
      setPrediction(pred);
      audio.playScanSuccess();

      // Requirement 7: If confidence is >= 85%, save that animal to user's EcoDex profile in Firebase/Firestore
      if (pred.confidence >= 0.85 && pred.species) {
        recordDiscovery(
          pred.species.id,
          storagePhotoUrl,
          pred.confidence,
          antiCheatResult.coordinates
        );
        setIsSavedToEcoDex(true);
      }
    } catch (e: unknown) {
      console.error('Keras model prediction failed:', e);
      const errorMsg = e instanceof Error ? e.message : 'Model inference error. Please try scanning again.';
      setAntiCheatError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Retake / Scan Again
  const handleScanAgain = () => {
    audio.playChime();
    resetState();
    if (!cameraActive) {
      startLiveCamera();
    }
  };

  // 6. Manual Add to EcoDex (for confidence between 70% and 84%)
  const handleManualAddToEcoDex = () => {
    if (!prediction) return;

    recordDiscovery(
      prediction.species.id, 
      capturedImage || prediction.species.image, 
      prediction.confidence,
      antiCheat?.coordinates
    );
    setIsSavedToEcoDex(true);
    setTimeout(() => onClose(), 800);
  };

  if (!isOpen) return null;

  const confidencePercent = prediction ? prediction.confidencePercent : 0;
  const isHighConfidence = confidencePercent >= 85;
  const isMediumConfidence = confidencePercent >= 70 && confidencePercent < 85;
  const isLowConfidence = confidencePercent < 70;

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
      case 'Epic': return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
      case 'Rare': return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'Uncommon': return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-950 text-white rounded-card-lg border border-leaf/40 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-leaf-light">
              EcoDex AI Scanner
            </span>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] text-slate-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Teachable Machine 5 Animals ({modelReady ? 'Ready' : 'Loading...'})</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera Viewfinder (Only Live Photo Capture, No Gallery Upload) */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[350px] flex items-center justify-center overflow-hidden">
          {/* Live Video Feed */}
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={capturedImage}
              alt="Captured wildlife"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Camera Error Message */}
          {cameraError && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 z-20">
              <ShieldAlert className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Live Camera Required</h3>
              <p className="text-xs text-slate-300 mb-4 max-w-xs">{cameraError}</p>
              <button
                onClick={startLiveCamera}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature cursor-pointer"
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Reticle / Viewfinder Overlay */}
          {!capturedImage && (
            <div className="absolute inset-8 pointer-events-none z-10 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-2 border-l-2 border-leaf-light"></div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-leaf-light"></div>
              </div>

              {/* Scanning Laser Beam */}
              {isProcessing && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-golden to-transparent shadow-gold-glow animate-pulse"></div>
              )}

              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-2 border-l-2 border-leaf-light"></div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-leaf-light"></div>
              </div>
            </div>
          )}

          {/* Anti-Cheat Active Badges Overlay */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Anti-Cheat Active
            </span>
            <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-slate-300 border border-white/10">
              <MapPin className="w-3 h-3 text-amber-400" />
              GPS Locked: 18.5204° N
            </span>
          </div>
        </div>

        {/* Anti-Cheat Rejection Error Banner */}
        {antiCheatError && (
          <div className="p-3 bg-rose-950/80 border-t border-rose-500 text-rose-200 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-rose-100">Anti-Cheat Validation Alert</div>
              <div className="text-[11px] text-rose-300">{antiCheatError}</div>
            </div>
          </div>
        )}

        {/* Prediction Card Section */}
        {prediction && !antiCheatError && (
          <div className="p-4 bg-slate-900 border-t border-leaf/30 space-y-3 animate-fadeIn">
            {/* Top Row: Animal Name, Confidence, Rarity, XP */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-forest/40 border border-leaf/40 flex items-center justify-center text-3xl shadow-inner">
                  {prediction.species.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {prediction.label}
                    </h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase border ${getRarityBadgeColor(prediction.species.rarity)}`}>
                      {prediction.species.rarity}
                    </span>
                  </div>
                  <p className="text-xs italic text-slate-400 font-serif">
                    {prediction.species.scientificName}
                  </p>
                </div>
              </div>

              {/* Confidence & EcoXP */}
              <div className="text-right">
                <div className={`text-base font-black font-mono ${
                  isHighConfidence ? 'text-emerald-400' : isMediumConfidence ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {prediction.confidencePercent}% Match
                </div>
                <div className="text-[10px] font-bold text-golden flex items-center justify-end gap-0.5">
                  <Sparkles className="w-3 h-3 fill-golden" />
                  +{prediction.species.xp} EcoXP
                </div>
              </div>
            </div>

            {/* Auto-Saved Notification for >= 85% */}
            {isSavedToEcoDex && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white">Saved to EcoDex Profile</span>
                    <p className="text-[10px] text-emerald-300">
                      High confidence ({prediction.confidencePercent}% ≥ 85%) logged to Firebase
                    </p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-300">
                  Synced ☁️
                </span>
              </div>
            )}

            {/* Confidence Feedback Rules */}
            {isMediumConfidence && !isSavedToEcoDex && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-white">
                    Confirm Specimen: {prediction.label}
                  </span>
                  <p className="text-[10px] text-amber-300 mt-0.5">
                    Confidence is {prediction.confidencePercent}%. Tap "Confirm & Add" to log to EcoDex.
                  </p>
                </div>
              </div>
            )}

            {isLowConfidence && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-white">
                    Low Confidence ({prediction.confidencePercent}% &lt; 85%)
                  </span>
                  <p className="text-[10px] text-rose-300 mt-0.5">
                    Not saved automatically. Please capture another photo closer to the specimen in good lighting.
                  </p>
                </div>
              </div>
            )}

            {/* Anti-Cheat Audit Stamp */}
            {antiCheat && antiCheat.isValidLiveCapture && (
              <div className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Live Capture
                </span>
                <span>GPS: {antiCheat.coordinates.lat}°, {antiCheat.coordinates.lng}°</span>
                <span>{antiCheat.timestamp.split('T')[1].slice(0, 8)}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleScanAgain}
                className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Again
              </button>

              {isSavedToEcoDex ? (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-bold text-xs shadow-nature-glow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-golden" />
                  View in EcoDex
                </button>
              ) : isMediumConfidence ? (
                <button
                  onClick={handleManualAddToEcoDex}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-nature flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Add (+{prediction.species.xp} XP)
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-white/5 opacity-60"
                  title="Confidence below 85% threshold."
                >
                  Min 85% Required
                </button>
              )}
            </div>
          </div>
        )}

        {/* Large Capture Button (Only Live Photo Capture, No Gallery Upload) */}
        {!capturedImage && (
          <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute -inset-2 rounded-full bg-forest opacity-40 animate-ping"></div>

              {/* Large Circular Shutter Button */}
              <button
                onClick={handleCapturePhoto}
                disabled={isProcessing}
                className="relative w-20 h-20 rounded-full bg-white p-1 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer border-4 border-forest"
                title="Capture Live Wildlife Photo"
              >
                <div className="w-full h-full rounded-full bg-gradient-forest flex items-center justify-center text-white shadow-inner">
                  {isProcessing ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-golden" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </button>
            </div>

            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-slate-300">
                {isProcessing ? 'Running Keras Model (224x224)...' : 'Tap to Capture Live Wildlife Photo'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Teachable Machine Model • Cat, Dog, Elephant, Tiger, Lion
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
