import React, { useState } from 'react';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { User, School, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';

const AVATAR_OPTIONS = ['🌿', '🦊', '🦉', '🐯', '🐘', '🦋', '🦚', '🐼', '🦌', '🦅'];

export const OnboardingView: React.FC = () => {
  const { completeOnboarding } = useEcoDex();

  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌿');
  const [cityState, setCityState] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please choose your Explorer Username.');
      return;
    }
    if (!college.trim()) {
      setErrorMessage('Please enter your College or Institution name.');
      return;
    }
    if (!cityState.trim()) {
      setErrorMessage('Please enter your City / State location.');
      return;
    }

    setLoading(true);
    try {
      audio.playChime();
      await completeOnboarding({
        username: username.trim(),
        college: college.trim(),
        avatar: selectedAvatar,
        cityState: cityState.trim()
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7F4] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-nature-lg border border-leaf-pale p-6 sm:p-8 overflow-hidden animate-fadeIn">
        {/* Top Decorative Nature Banner */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-leaf"></div>

        {/* Onboarding Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-leaf-pale text-3xl mb-3 shadow-inner scale-110 transition-transform">
            {selectedAvatar}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Field Badge Registration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete your official EcoDex Field Explorer Dossier to start logging wildlife
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Field Mascot / Avatar
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {AVATAR_OPTIONS.map(av => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(av);
                    audio.playChime();
                  }}
                  className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedAvatar === av
                      ? 'bg-leaf-pale border-2 border-forest scale-110 shadow-nature'
                      : 'bg-slate-100 hover:bg-slate-200 opacity-75'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Explorer Username / Handle
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. ForestRanger99"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* College Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College / Educational Institution
            </label>
            <div className="relative">
              <School className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. EcoDex Institute of Ecology"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* City / State Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City / State
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Pune, Maharashtra"
                value={cityState}
                onChange={e => setCityState(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm bg-slate-50/50"
              />
            </div>
          </div>

          {/* Complete Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Field Badge...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Registration & Open EcoDex</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
