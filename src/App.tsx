import React, { useState } from 'react';
import { EcoDexProvider, useEcoDex } from './context/EcoDexContext';
import { SplashScreen } from './components/SplashScreen';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeTab } from './components/HomeTab';
import { ExpeditionTab } from './components/ExpeditionTab';
import { EcoDexTab } from './components/EcoDexTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { ProfileTab } from './components/ProfileTab';
import { ScannerModal } from './components/ScannerModal';
import { AchievementModal } from './components/AchievementModal';
import { LevelUpModal } from './components/LevelUpModal';
import { DiscoveryModal } from './components/DiscoveryModal';
import { ExpeditionTrackingModal } from './components/ExpeditionTrackingModal';
import { ExpeditionSummaryModal } from './components/ExpeditionSummaryModal';

const AppContent: React.FC = () => {
  const { 
    user, 
    authStatus,
    authError,
    retryAuthCheck,
    activeTab, 
    openScannerModal, 
    setOpenScannerModal,
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    activeExpeditionSummary,
    setActiveExpeditionSummary,
    saveExpeditionAndApplyStats,
    isOnline,
    pendingSyncCount,
    syncToastMessage,
    dismissSyncToast,
    triggerManualSync
  } = useEcoDex();

  const [splashFinished, setSplashFinished] = useState(false);

  // 1. AUTH_LOADING or Initial Splash Running
  if (authStatus === 'AUTH_LOADING' || !splashFinished) {
    return (
      <div className="relative">
        <SplashScreen onFinish={() => setSplashFinished(true)} />
        {authError && splashFinished && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-900/90 text-white text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-3 border border-rose-500/30">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-white mb-1">Firestore Profile Check Error</h3>
            <p className="text-xs text-slate-300 mb-4 max-w-xs">{authError}</p>
            <button
              onClick={() => retryAuthCheck()}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-nature transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. UNAUTHENTICATED -> Render Full-Screen Login & Sign Up View
  if (authStatus === 'UNAUTHENTICATED') {
    return <AuthView />;
  }

  // 3. AUTHENTICATED_PROFILE_MISSING -> Render Full-Screen Onboarding Registration View
  if (authStatus === 'AUTHENTICATED_PROFILE_MISSING') {
    return <OnboardingView />;
  }

  // 4. AUTHENTICATED_PROFILE_EXISTS -> Render Main Authenticated Application
  return (
    <div className="min-h-screen bg-[#F4F7F4] text-slate-800 flex flex-col items-center relative">
      {/* Sync Toast Notification Banner */}
      {syncToastMessage && (
        <div className="fixed top-3 z-50 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/20 flex items-center gap-2 animate-scaleUp max-w-sm mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="flex-1">{syncToastMessage}</span>
          <button
            onClick={dismissSyncToast}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Centered responsive frame (Mobile-First UI with nature aesthetic) */}
      <main className="w-full max-w-lg min-h-screen bg-white/90 backdrop-blur-sm sm:shadow-2xl sm:border-x sm:border-leaf/20 flex flex-col relative px-4 sm:px-5 pt-3">
        {/* Top Field Journal App Bar */}
        <header className="flex items-center justify-between py-2 border-b border-leaf-pale/80 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-forest text-white flex items-center justify-center text-lg shadow-sm">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold text-forest tracking-tight">Eco</span>
                <span className="text-base font-extrabold text-golden-dark font-journal italic -ml-0.5">Dex</span>
              </div>
              <p className="text-[9px] text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
                Field Journal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Offline / Cloud Sync Status Pill */}
            {!isOnline ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-300 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Offline Cached</span>
              </span>
            ) : pendingSyncCount > 0 ? (
              <button
                onClick={() => triggerManualSync()}
                className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold flex items-center gap-1 border border-blue-300 cursor-pointer shadow-2xs"
                title="Click to sync pending data with Firebase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                <span>Sync ({pendingSyncCount})</span>
              </button>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Cloud Synced</span>
              </span>
            )}

            {user && (
              <div className="flex items-center gap-1.5 bg-leaf-pale px-2.5 py-1 rounded-full text-forest text-xs font-bold">
                <span>{user.avatar}</span>
                <span className="text-[11px]">{user.username}</span>
              </div>
            )}
          </div>
        </header>

        {/* Tab View Container */}
        <div className="flex-1">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'expedition' && <ExpeditionTab />}
          {activeTab === 'ecodex' && <EcoDexTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />
      </main>

      {/* Global Modals */}
      <ScannerModal
        isOpen={openScannerModal}
        onClose={() => setOpenScannerModal(false)}
      />

      <ExpeditionTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        onFinishExpedition={(summary) => {
          setIsTrackingModalOpen(false);
          setActiveExpeditionSummary(summary);
        }}
      />

      <ExpeditionSummaryModal
        isOpen={!!activeExpeditionSummary}
        expedition={activeExpeditionSummary}
        onClose={() => setActiveExpeditionSummary(null)}
        onSaveToFirestore={() => {
          if (activeExpeditionSummary) {
            saveExpeditionAndApplyStats(activeExpeditionSummary);
          }
        }}
      />

      <AchievementModal />
      <LevelUpModal />
      <DiscoveryModal />
    </div>
  );
};

import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <EcoDexProvider>
        <AppContent />
      </EcoDexProvider>
    </ErrorBoundary>
  );
};

export default App;
