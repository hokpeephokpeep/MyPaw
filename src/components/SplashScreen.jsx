import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faHeart } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Keep splash visible for 1.3s, then trigger smooth 400ms fade out
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 1250);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 1650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50/90 via-white to-orange-50/80 transition-opacity duration-400 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background soft glow rings */}
      <div className="absolute w-72 h-72 rounded-full bg-paw-300/25 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute w-48 h-48 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />

      {/* Main Animated Icon Container */}
      <div className="relative flex flex-col items-center">
        {/* Animated Paw Badge */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Pulsing Outer Ring */}
          <div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-paw-400 to-amber-400 opacity-20 animate-ping" 
            style={{ animationDuration: '2.2s' }} 
          />
          
          {/* Main Rounded Card */}
          <div 
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-paw-500 to-amber-500 text-white shadow-xl shadow-paw-500/30 flex items-center justify-center animate-bounce" 
            style={{ animationDuration: '1.5s' }}
          >
            <FontAwesomeIcon icon={faPaw} className="text-5xl text-white drop-shadow-md" />
          </div>
        </div>

        {/* Animated App Title */}
        <div className="mt-6 text-center">
          <h1 className="font-mitr text-4xl font-extrabold tracking-wider bg-gradient-to-r from-paw-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-xs">
            MyPaw
          </h1>
          <p className="font-sans text-xs text-slate-400 font-medium tracking-wide mt-1.5 flex items-center justify-center gap-1.5">
            <span>สมุดบันทึกสัตว์เลี้ยง</span>
            <span>•</span>
            <FontAwesomeIcon icon={faHeart} className="text-paw-400 text-[10px]" />
          </p>
        </div>

        {/* Minimal Loading Dots */}
        <div className="mt-7 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-paw-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-paw-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-paw-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Version Tag at bottom */}
      <div className="absolute bottom-8 text-[11px] text-slate-300 font-medium">
        v1.2.0
      </div>
    </div>
  );
}
