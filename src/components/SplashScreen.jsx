import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 1150);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 1500);

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
          <div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-paw-400 to-amber-400 opacity-20 animate-ping" 
            style={{ animationDuration: '2.2s' }} 
          />
          
          <div 
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-paw-500 to-amber-500 text-white shadow-xl shadow-paw-500/30 flex items-center justify-center animate-bounce" 
            style={{ animationDuration: '1.5s' }}
          >
            <FontAwesomeIcon icon={faPaw} className="text-5xl text-white drop-shadow-md" />
          </div>
        </div>

        {/* Pure App Title in Mitr */}
        <div className="mt-5 text-center">
          <h1 className="font-mitr text-4xl font-semibold tracking-wide bg-gradient-to-r from-paw-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-2xs">
            MyPaw
          </h1>
        </div>

        {/* Minimal Loading Dots */}
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-paw-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-paw-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-paw-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
