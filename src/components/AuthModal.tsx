import React, { useState } from 'react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail 
} from '../services/firebase';
import { useEcoDex } from '../context/EcoDexContext';
import { audio } from '../services/audioService';
import { Mail, Lock, Sparkles, Compass, CheckCircle2, ChevronRight, User, School, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🌿', '🦊', '🦉', '🐯', '🐘', '🦋', '🦚', '🐼', '🦌', '🦅'];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { completeOnboarding, loginDemoUser } = useEcoDex();

  // Screen: 'login' | 'register' | 'onboarding'
  const [mode, setMode] = useState<'login' | 'register' | 'onboarding'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Onboarding Fields
  const [username, setUsername] = useState('');
  const [college, setCollege] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌿');
  const [cityState, setCityState] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      audio.playChime();
      const res = await loginWithGoogle();
      if (res.isNew) {
        setMode('onboarding');
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Google login failed. You can use Quick Explorer!');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      audio.playChime();
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else {
        await registerWithEmail(email, password);
        setMode('onboarding');
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Please choose a username');
      return;
    }
    if (!college.trim()) {
      setErrorMessage('Please enter your college or institution');
      return;
    }
    if (!cityState.trim()) {
      setErrorMessage('Please enter your City / State');
      return;
    }

    completeOnboarding({
      username,
      college,
      avatar: selectedAvatar,
      cityState
    });
    audio.playDiscovery();
    onClose();
  };

  const handleQuickDemo = () => {
    loginDemoUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-nature-lg border border-leaf-pale p-6 sm:p-8 overflow-hidden">
        {/* Top Decorative Nature Banner */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-leaf"></div>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-leaf-pale text-3xl mb-3 shadow-inner">
            {mode === 'onboarding' ? selectedAvatar : '🌿'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {mode === 'onboarding' 
              ? 'Explorer Registration' 
              : mode === 'login' 
              ? 'Welcome to EcoDex' 
              : 'Create Explorer Account'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'onboarding'
              ? 'Set up your biodiversity field badge'
              : 'Track wildlife expeditions and earn EcoXP'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Onboarding Mode */}
        {mode === 'onboarding' ? (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Choose Field Avatar
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
                    className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      selectedAvatar === av
                        ? 'bg-leaf-pale border-2 border-forest scale-110 shadow-nature'
                        : 'bg-slate-100 hover:bg-slate-200 opacity-70'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Explorer Handle
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. ForestRanger99"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institution
              </label>
              <div className="relative">
                <School className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. IIT Bombay / EcoDex Academy"
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / State
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune, Maharashtra"
                  value={cityState}
                  onChange={e => setCityState(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Registration & Start
            </button>
          </form>
        ) : (
          /* Login & Registration Form */
          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs uppercase text-slate-400 font-medium tracking-wider">or email</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="explorer@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {mode === 'login' ? 'Sign In with Email' : 'Create New Account'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-forest hover:underline font-medium cursor-pointer"
              >
                {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setMode('onboarding')}
                className="text-slate-500 hover:text-forest cursor-pointer"
              >
                New Explorer Badge
              </button>
            </div>

            {/* Quick Demo Test Access Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-2 px-3 rounded-xl bg-leaf-pale hover:bg-emerald-100 text-forest font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-forest" />
                Launch Quick Explorer Mode (No Password Needed)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
