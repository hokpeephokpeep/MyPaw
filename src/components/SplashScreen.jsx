import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  const [isParting, setIsParting] = useState(false);
  const [isSquashing, setIsSquashing] = useState(false);

  useEffect(() => {
    // 1. Subtle anticipation squash on logo at 900ms
    const tSquash = setTimeout(() => {
      setIsSquashing(true);
    }, 900);

    // 2. Begin Serene Organic Cloud Parting at 1050ms
    // Each cloud floats outward naturally without fading
    const tPart = setTimeout(() => {
      setIsParting(true);
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate([15, 25]); } catch (e) {}
      }
    }, 1050);

    // 3. Complete unmount after clouds have fully cleared at 2250ms
    const tFinish = setTimeout(() => {
      onFinish();
    }, 2250);

    return () => {
      clearTimeout(tSquash);
      clearTimeout(tPart);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ========================================================
          ⛅ 1. SOLID CLOUD BACKDROP SHEETS (Opaque Base Plates)
          Guarantees 100% zero-gap coverage across any screen ratio,
          sliding outward gently to the left & right without fading.
          ======================================================== */}
      {/* Left Base Sheet */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-[55vw] bg-gradient-to-r from-amber-50 via-white to-white pointer-events-none z-10"
        style={{
          transform: isParting ? 'translate3d(-115vw, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: 'transform 1.25s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }}
      />

      {/* Right Base Sheet */}
      <div 
        className="absolute top-0 bottom-0 right-0 w-[55vw] bg-gradient-to-l from-orange-50 via-white to-white pointer-events-none z-10"
        style={{
          transform: isParting ? 'translate3d(115vw, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: 'transform 1.25s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform'
        }}
      />

      {/* ========================================================
          ☁️ 2. INDIVIDUAL ORGANIC BILLOWING CLOUDS (ฉากเมฆ)
          Each cloud moves independently with natural timing, organic drift,
          varied speeds and subtle rotation. ZERO opacity fade!
          ======================================================== */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
        
        {/* ☁️ Cloud 1: Top-Center Horizon Cloud (Drifts upwards gently) */}
        <div 
          className="absolute -top-16 sm:-top-24 left-1/2 w-[30rem] sm:w-[42rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(-50%, -125vh, 0) scale(1.08)' 
              : 'translate3d(-50%, 0, 0) scale(1)',
            transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.4, 1) 0.02s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-sm select-none" />
        </div>

        {/* ☁️ Cloud 2: Top-Left Cloud (Drifts up and out to the left) */}
        <div 
          className="absolute -top-10 sm:-top-16 -left-16 sm:-left-28 w-88 sm:w-[32rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(-125vw, -30vh, 0) rotate(-7deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.35s cubic-bezier(0.22, 1, 0.36, 1) 0s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-md select-none" />
        </div>

        {/* ☁️ Cloud 3: Top-Right Cloud (Drifts up and out to the right) */}
        <div 
          className="absolute -top-10 sm:-top-16 -right-16 sm:-right-28 w-92 sm:w-[34rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(125vw, -35vh, 0) rotate(8deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.04s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto drop-shadow-md select-none" />
        </div>

        {/* ☁️ Cloud 4: Center Atmosphere Cloud (Puffs and parts to upper right) */}
        <div 
          className="absolute top-[26%] left-1/2 w-[34rem] sm:w-[46rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(70vw, -40vh, 0) scale(1.15) rotate(5deg)' 
              : 'translate3d(-50%, -15%, 0) scale(1) rotate(0deg)',
            transition: 'transform 1.3s cubic-bezier(0.25, 1, 0.38, 1) 0.03s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto select-none" />
        </div>

        {/* ☁️ Cloud 5: Middle-Left Flank Cloud (Glides horizontally left) */}
        <div 
          className="absolute top-[28%] -left-20 sm:-left-32 w-92 sm:w-[36rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(-130vw, 12vh, 0) rotate(-5deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.25s cubic-bezier(0.22, 1, 0.36, 1) 0.06s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-lg select-none" />
        </div>

        {/* ☁️ Cloud 6: Middle-Right Flank Cloud (Glides horizontally right) */}
        <div 
          className="absolute top-[32%] -right-20 sm:-right-32 w-96 sm:w-[38rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(130vw, -12vh, 0) rotate(6deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.05s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-lg select-none" />
        </div>

        {/* ☁️ Cloud 7: Bottom-Left Base Cloud (Drifts down and out to the left) */}
        <div 
          className="absolute -bottom-14 sm:-bottom-24 -left-16 sm:-left-28 w-92 sm:w-[36rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(-125vw, 40vh, 0) rotate(7deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.3s cubic-bezier(0.22, 1, 0.36, 1) 0.03s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C2.svg" alt="" className="w-full h-auto drop-shadow-xl select-none" />
        </div>

        {/* ☁️ Cloud 8: Bottom-Right Base Cloud (Drifts down and out to the right) */}
        <div 
          className="absolute -bottom-14 sm:-bottom-24 -right-16 sm:-right-28 w-96 sm:w-[38rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(125vw, 35vh, 0) rotate(-6deg)' 
              : 'translate3d(0, 0, 0) rotate(0deg)',
            transition: 'transform 1.38s cubic-bezier(0.22, 1, 0.36, 1) 0.07s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C1.svg" alt="" className="w-full h-auto drop-shadow-xl select-none" />
        </div>

        {/* ☁️ Cloud 9: Bottom-Center Cushion Cloud (Glides downwards gently) */}
        <div 
          className="absolute -bottom-16 sm:-bottom-24 left-1/2 w-[32rem] sm:w-[44rem] pointer-events-none"
          style={{
            transform: isParting 
              ? 'translate3d(-50%, 125vh, 0) scale(1.06)' 
              : 'translate3d(-50%, 0, 0) scale(1)',
            transition: 'transform 1.25s cubic-bezier(0.25, 1, 0.4, 1) 0.04s',
            willChange: 'transform'
          }}
        >
          <img src="/clouds/C3.svg" alt="" className="w-full h-auto drop-shadow-2xl select-none" />
        </div>

      </div>

      {/* ========================================================
          🌟 3. FOREGROUND: ONE UNIFIED ICON, APP NAME & LOGO
          Floats smoothly up into the sky at the natural pace of the clouds!
          ======================================================== */}
      <div 
        className="relative z-30 w-full h-full flex flex-col items-center justify-center pointer-events-none"
        style={{
          transform: isParting 
            ? 'translate3d(0, -118vh, 0)' 
            : isSquashing 
              ? 'scale(0.95)' 
              : 'scale(1)',
          transition: isParting 
            ? 'transform 1.1s cubic-bezier(0.25, 1, 0.38, 1)' 
            : 'transform 0.25s ease-out',
          willChange: 'transform'
        }}
      >
        {/* Single Unified App Icon: Exactly matching the phone app icon */}
        <div className="w-[92px] h-[92px] sm:w-[108px] sm:h-[108px] flex items-center justify-center">
          <img 
            src="/paw_icon.png" 
            alt="MyPaw" 
            className="w-full h-full object-contain drop-shadow-xl select-none" 
          />
        </div>

        {/* Single Unified Brand Wordmark: MyP🐾w */}
        <div className="mt-4 text-center">
          <h1 className="font-mitr text-3xl sm:text-4xl font-semibold tracking-normal text-slate-900 flex items-center justify-center leading-none drop-shadow-2xs">
            <span>MyP</span>
            <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-[0.70em] ml-[1px] mr-0 -translate-y-[0.5px]" />
            <span>w</span>
          </h1>
        </div>

        {/* Clean, Elegant Loading Capsule */}
        <div className="mt-6 w-20 h-1 rounded-full bg-slate-200/90 overflow-hidden relative">
          <div className="w-10 h-full rounded-full bg-gradient-to-r from-paw-500 to-amber-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
