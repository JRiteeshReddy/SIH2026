import React, { useState } from 'react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail,
  resetPasswordWithEmail,
  formatAuthError
} from '../services/firebase';
import { audio } from '../services/audioService';
import { Mail, Lock, Sparkles, ChevronRight, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

export const AuthView: React.FC = () => {
  // View mode: 'login' | 'signup' | 'forgot_password'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      audio.playChime();
      await loginWithGoogle();
      // Auth listener onAuthStateChanged will handle routing to Home or Onboarding
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (mode === 'forgot_password') {
      setLoading(true);
      try {
        await resetPasswordWithEmail(email.trim());
        setSuccessMessage('Password reset email sent. Check your inbox!');
        audio.playChime();
      } catch (err) {
        setErrorMessage(formatAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }
    }

    setLoading(true);
    try {
      audio.playChime();
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F7F4] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Mobile-first centered card container */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-nature-lg border border-leaf-pale overflow-hidden p-6 sm:p-8 animate-fadeIn">
        {/* Top Decorative Nature Bar */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-leaf"></div>

        {/* EcoDex Header & Branding */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-leaf-pale text-forest text-3xl mb-3 shadow-inner">
            🌿
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-extrabold text-forest tracking-tight">Eco</span>
            <span className="text-2xl font-extrabold text-golden-dark font-journal italic -ml-1">Dex</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Explore Nature. Collect Wildlife. Stay Fit.
          </p>
        </div>

        {/* Dynamic Title */}
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {mode === 'login' && 'Sign in to your Field Journal'}
            {mode === 'signup' && 'Create Explorer Account'}
            {mode === 'forgot_password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'login' && 'Enter your credentials to continue your wildlife journey'}
            {mode === 'signup' && 'Register to track species, log expeditions & earn EcoXP'}
            {mode === 'forgot_password' && 'Enter your email and we will send a reset link'}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <span className="text-rose-500 font-bold mt-0.5">⚠️</span>
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-fadeIn">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* Main Form Body */}
        <div className="space-y-4">
          {mode !== 'forgot_password' && (
            <>
              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[11px] uppercase text-slate-400 font-bold tracking-wider">or with email</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
            </>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="explorer@ecodex.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent text-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot_password' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Field (Sign Up Mode) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-leaf focus:border-transparent text-sm bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-forest hover:bg-forest-light text-white font-bold text-sm shadow-nature flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('signup');
                  }}
                  className="text-forest hover:underline font-bold cursor-pointer"
                >
                  Don't have an account? Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('forgot_password');
                  }}
                  className="text-slate-500 hover:text-forest font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setMode('login');
                }}
                className="text-forest hover:underline font-bold cursor-pointer mx-auto"
              >
                Already have an account? Sign In
              </button>
            )}

            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setMode('login');
                }}
                className="text-forest hover:underline font-bold cursor-pointer mx-auto"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
