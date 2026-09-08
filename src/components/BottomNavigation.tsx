import React from 'react';
import { Home, Compass, BookOpen, Trophy, User } from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, isExpeditionActive } = useEcoDex();

  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'expedition' as const, label: 'Expedition', icon: Compass, hasActivePulse: isExpeditionActive },
    { id: 'ecodex' as const, label: 'EcoDex', icon: BookOpen },
    { id: 'leaderboard' as const, label: 'Rank', icon: Trophy },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-leaf-pale shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-bottom">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-forest font-semibold scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active Spring Indicator Dot */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 bg-forest rounded-full transition-all"></span>
              )}

              {/* Active Pulse for Ongoing Expedition */}
              {item.hasActivePulse && (
                <span className="absolute top-1 right-5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-golden opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-golden"></span>
                </span>
              )}

              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
