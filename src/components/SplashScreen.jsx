import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  const [isParting, setIsParting] = useState(false);
  const [isSquashing, setIsSquashing] = useState(false);

  useEffect(() => {
    // 1. Subtle anticipation squash on logo at 950ms
    const tSquash = setTimeout(() => {
      setIsSquashing(true);
    }, 950);

    // 2. Trigger Cloud Parting Transition at 1100ms
    const tPart = setTimeout(() => {
      setIsParting(true);
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate([15, 25]); } catch (e) {}
      }
    }, 1100);

    // 3. Complete unmount after clouds have fully cleared the screen at 1850ms
    const tFinish = setTimeout(() => {
      onFinish();
    }, 1850);

    return () => {
      clearTimeout(tSquash);
      clearTimeout(tPart);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  // Shared CSS transition timing for cloud parting (Compositor GPU only: transform & opacity)
  const cloudTransitionStyle = {
    transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease-out',
    willChange: 'transform, opacity',
  };

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ========================================================
          🌅 1. SOFT HEAVENLY SKY BACKDROP (Smoothly fades out during parting)
          ======================================================== */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-orange-50/90 pointer-events-none"
        style={{
          opacity: isParting ? 0 : 1,
          transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'opacity'
        }}
      />

      {/* ========================================================
          ☁️ 2. LUSH CLOUD CURTAIN COVERAGE (Full Screen Blanket & Parting)
          Multiple overlapping SVG clouds that cover the screen and sweep
          outwards to the edges without any SVG mask overhead (60fps GPU)
          ======================================================== */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        
        {/* Cloud 1: Top Center Horizon */}
        <div 
          className="absolute -top-16 sm:-top-24 left-1/2 w-[28rem] sm:w-[36rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-50%, -150%, 0) scale(1.15)' 
              : 'translate3d(-50%, 0, 0) scale(1)',
            opacity: isParting ? 0 : 0.95
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-sm" />
        </div>

        {/* Cloud 2: Top-Left Corner */}
        <div 
          className="absolute -top-12 sm:-top-16 -left-16 sm:-left-24 w-80 sm:w-[28rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-140%, -130%, 0) rotate(-14deg) scale(1.1)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-md" />
        </div>

        {/* Cloud 3: Top-Right Corner */}
        <div 
          className="absolute -top-12 sm:-top-16 -right-16 sm:-right-24 w-84 sm:w-[30rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(140%, -130%, 0) rotate(14deg) scale(1.1)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto drop-shadow-md" />
        </div>

        {/* Cloud 4: Center Atmosphere Cloud (Behind Logo) */}
        <div 
          className="absolute top-[28%] left-1/2 w-[32rem] sm:w-[42rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-50%, -15%, 0) scale(1.4)' 
              : 'translate3d(-50%, -15%, 0) scale(1)',
            opacity: isParting ? 0 : 0.85
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto" />
        </div>

        {/* Cloud 5: Middle-Left Flank */}
        <div 
          className="absolute top-[28%] sm:top-[30%] -left-20 sm:-left-28 w-84 sm:w-[30rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-150%, -20%, 0) rotate(-10deg) scale(1.2)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-lg" />
        </div>

        {/* Cloud 6: Middle-Right Flank */}
        <div 
          className="absolute top-[30%] sm:top-[32%] -right-20 sm:-right-28 w-88 sm:w-[32rem] pointer-events-none"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(150%, -20%, 0) rotate(10deg) scale(1.2)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-lg" />
        </div>

        {/* Cloud 7: Bottom-Left Base */}
        <div 
          className="absolute -bottom-14 sm:-bottom-20 -left-16 sm:-left-24 w-88 sm:w-[32rem] pointer-events-none z-10"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-140%, 130%, 0) rotate(12deg) scale(1.15)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto drop-shadow-xl" />
        </div>

        {/* Cloud 8: Bottom-Right Base */}
        <div 
          className="absolute -bottom-14 sm:-bottom-20 -right-16 sm:-right-24 w-92 sm:w-[34rem] pointer-events-none z-10"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(140%, 130%, 0) rotate(-12deg) scale(1.15)' 
              : 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
            opacity: isParting ? 0 : 0.98
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-xl" />
        </div>

        {/* Cloud 9: Bottom-Center Cushion */}
        <div 
          className="absolute -bottom-16 sm:-bottom-24 left-1/2 w-[30rem] sm:w-[40rem] pointer-events-none z-20"
          style={{
            ...cloudTransitionStyle,
            transform: isParting 
              ? 'translate3d(-50%, 150%, 0) scale(1.2)' 
              : 'translate3d(-50%, 0, 0) scale(1)',
            opacity: isParting ? 0 : 1
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-2xl" />
        </div>

      </div>

      {/* ========================================================
          🌟 3. FOREGROUND LOGO & TITLES
          ======================================================== */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center">
        {/* Main Animated Icon Container */}
        <div 
          className="relative w-28 h-28 flex items-center justify-center"
          style={{
            transform: isParting 
              ? 'scale(0.85) translate3d(0, -20px, 0)' 
              : isSquashing 
                ? 'scale(0.93)' 
                : 'scale(1)',
            opacity: isParting ? 0 : 1,
            transition: isParting 
              ? 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-out' 
              : 'transform 0.2s ease-out',
            willChange: 'transform, opacity'
          }}
        >
          {/* Ambient Glow Aura */}
          <div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-paw-400 to-amber-400 opacity-30 animate-ping" 
            style={{ animationDuration: '2s' }} 
          />
          
          {/* Physical Paw Icon Badge */}
          <div 
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-paw-500 via-orange-500 to-amber-500 text-white shadow-2xl shadow-paw-500/40 flex items-center justify-center animate-bounce" 
            style={{ animationDuration: '1.4s' }}
          >
            <FontAwesomeIcon icon={faPaw} className="text-5xl text-white drop-shadow-md" />
          </div>
        </div>

        {/* App Title in Mitr */}
        <div 
          className="mt-5 text-center"
          style={{
            transform: isParting ? 'translate3d(0, 15px, 0) scale(0.9)' : 'translate3d(0, 0, 0) scale(1)',
            opacity: isParting ? 0 : 1,
            transition: isParting 
              ? 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out' 
              : 'none',
            willChange: 'transform, opacity'
          }}
        >
          <h1 className="font-mitr text-4xl font-semibold tracking-wide bg-gradient-to-r from-paw-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-2xs">
            MyPaw
          </h1>
        </div>

        {/* Minimal Loading Dots */}
        <div 
          className="mt-6 flex items-center gap-2"
          style={{
            opacity: isParting ? 0 : 1,
            transform: isParting ? 'translate3d(0, 10px, 0)' : 'translate3d(0, 0, 0)',
            transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
            willChange: 'opacity, transform'
          }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-paw-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-paw-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-paw-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
