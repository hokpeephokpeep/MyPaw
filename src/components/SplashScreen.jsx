import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Begin gentle fade-out at 950ms
    const tFade = setTimeout(() => {
      setIsFadingOut(true);
    }, 950);

    // 2. Complete unmount at 1300ms
    const tFinish = setTimeout(() => {
      onFinish();
    }, 1300);

    return () => {
      clearTimeout(tFade);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 pointer-events-none select-none overflow-hidden transition-all duration-350 ease-out ${
        isFadingOut ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
      aria-hidden="true"
    >
      {/* Soft warm ambient background glow */}
      <div className="absolute w-[28rem] h-[28rem] rounded-full bg-paw-500/5 blur-3xl pointer-events-none" />

      {/* Main Unified Brand Icon Badge */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-[88px] h-[88px] rounded-[26px] bg-gradient-to-br from-paw-500 via-orange-500 to-amber-500 text-white shadow-xl shadow-paw-500/30 flex items-center justify-center">
          <FontAwesomeIcon icon={faPaw} className="text-[44px] text-white drop-shadow-sm" />
        </div>

        {/* Unified Brand Wordmark: MyP🐾w */}
        <div className="mt-5 text-center">
          <h1 className="font-mitr text-3xl sm:text-4xl font-semibold tracking-normal text-slate-900 flex items-center justify-center leading-none">
            <span>MyP</span>
            <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-[0.70em] ml-[1px] mr-0 -translate-y-[0.5px]" />
            <span>w</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-sans font-medium text-slate-400 tracking-wide">
            อายุและบันทึกความทรงจำเจ้าเหมียว
          </p>
        </div>

        {/* Minimal Modern Loading Capsule */}
        <div className="mt-6 w-20 h-1 rounded-full bg-slate-200 overflow-hidden relative">
          <div className="w-10 h-full rounded-full bg-gradient-to-r from-paw-500 to-amber-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
