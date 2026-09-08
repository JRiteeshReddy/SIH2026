import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(onFinish, 600);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  // Rich varied botanical leaf particles floating and swaying upward
  const leaves = [
    { left: '8%', delay: '0s', size: '28px', duration: '4.2s', emoji: '🍃', opacity: 0.9, blur: '0px' },
    { left: '20%', delay: '0.8s', size: '34px', duration: '5.1s', emoji: '🌿', opacity: 0.85, blur: '0px' },
    { left: '35%', delay: '0.3s', size: '22px', duration: '3.8s', emoji: '🌱', opacity: 0.6, blur: '1px' },
    { left: '50%', delay: '1.4s', size: '38px', duration: '5.5s', emoji: '🍁', opacity: 0.9, blur: '0px' },
    { left: '62%', delay: '0.5s', size: '26px', duration: '4.4s', emoji: '🍃', opacity: 0.75, blur: '0px' },
    { left: '76%', delay: '1.1s', size: '32px', duration: '4.9s', emoji: '🍀', opacity: 0.85, blur: '0px' },
    { left: '88%', delay: '0.2s', size: '24px', duration: '3.9s', emoji: '🌿', opacity: 0.6, blur: '1px' },
    { left: '15%', delay: '2.0s', size: '30px', duration: '4.8s', emoji: '🌾', opacity: 0.8, blur: '0px' },
    { left: '42%', delay: '1.8s', size: '36px', duration: '5.2s', emoji: '🍃', opacity: 0.9, blur: '0px' },
    { left: '70%', delay: '2.3s', size: '25px', duration: '4.1s', emoji: '🌱', opacity: 0.7, blur: '0.5px' },
    { left: '92%', delay: '1.6s', size: '32px', duration: '4.6s', emoji: '🍁', opacity: 0.85, blur: '0px' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-forest text-white overflow-hidden transition-opacity duration-600 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Upward Swaying Leaf Particles with Physics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {leaves.map((leaf, idx) => (
          <span
            key={idx}
            className="leaf-particle-sway select-none"
            style={{
              left: leaf.left,
              animationDuration: leaf.duration,
              animationDelay: leaf.delay,
              fontSize: leaf.size,
              opacity: leaf.opacity,
              filter: `blur(${leaf.blur}) drop-shadow(0 4px 8px rgba(0,0,0,0.25))`
            }}
          >
            {leaf.emoji}
          </span>
        ))}
      </div>

      {/* Radial soft glow background */}
      <div className="absolute w-96 h-96 rounded-full bg-leaf opacity-20 blur-3xl pointer-events-none"></div>

      {/* Main Brand Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Emblem */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border-2 border-leaf-light/40 flex items-center justify-center shadow-nature-glow animate-pulse-glow">
            <span className="text-6xl select-none filter drop-shadow-lg">🌿</span>
          </div>
          <div className="absolute -top-1 -right-1 bg-golden text-forest-deep p-1.5 rounded-full shadow-gold-glow animate-bounce">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 text-white drop-shadow-md">
          Eco<span className="text-golden font-journal italic">Dex</span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg font-medium text-leaf-pale max-w-xs sm:max-w-sm tracking-wide leading-snug drop-shadow">
          Explore Nature. Collect Wildlife. Stay Fit.
        </p>

        {/* Botanical subtitle */}
        <div className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-200/80 bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
          <span className="w-2 h-2 rounded-full bg-golden animate-ping"></span>
          Biodiversity Field Guide
        </div>
      </div>

      {/* Skip Button for impatient tester */}
      <button
        onClick={onFinish}
        className="absolute bottom-8 text-xs text-white/70 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
      >
        Skip intro
      </button>
    </div>
  );
};
