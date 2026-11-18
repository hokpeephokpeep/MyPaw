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

    // 2. Trigger Cloud Slide Out Transition at 1050ms (NO FADE - purely physical flow)
    const tPart = setTimeout(() => {
      setIsParting(true);
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate([15, 25]); } catch (e) {}
      }
    }, 1050);

    // 3. Complete unmount after clouds have fully flowed past the screen boundaries at 1820ms
    const tFinish = setTimeout(() => {
      onFinish();
    }, 1820);

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
          ☁️ 1. LEFT CLOUD CURTAIN (Opaque Cloud Bank)
          Covers the left side with seamless fluffy clouds.
          Slides 100% off-screen to the left on exit without fading!
          ======================================================== */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[58vw] pointer-events-none z-10"
        style={{
          transform: isParting ? 'translate3d(-118vw, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: 'transform 0.75s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform'
        }}
      >
        {/* Solid Cloud Base Canvas */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-white to-white" />

        {/* Puffy Cloud Silhouettes Overlapping Past Center Line */}
        <img 
          src="/clouds/C1.svg" 
          alt="" 
          className="absolute -top-12 -right-28 sm:-right-40 w-64 sm:w-96 max-w-none drop-shadow-md select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C3.svg" 
          alt="" 
          className="absolute top-[20%] -right-32 sm:-right-48 w-72 sm:w-[28rem] max-w-none drop-shadow-lg select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C2.svg" 
          alt="" 
          className="absolute top-[48%] -right-36 sm:-right-52 w-80 sm:w-[32rem] max-w-none drop-shadow-lg select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C1.svg" 
          alt="" 
          className="absolute -bottom-12 -right-28 sm:-right-44 w-72 sm:w-[30rem] max-w-none drop-shadow-xl select-none pointer-events-none" 
        />
      </div>

      {/* ========================================================
          ☁️ 2. RIGHT CLOUD CURTAIN (Opaque Cloud Bank)
          Covers the right side with seamless fluffy clouds.
          Slides 100% off-screen to the right on exit without fading!
          ======================================================== */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[58vw] pointer-events-none z-10"
        style={{
          transform: isParting ? 'translate3d(118vw, 0, 0)' : 'translate3d(0, 0, 0)',
          transition: 'transform 0.75s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform'
        }}
      >
        {/* Solid Cloud Base Canvas */}
        <div className="absolute inset-0 bg-gradient-to-l from-orange-50 via-white to-white" />

        {/* Puffy Cloud Silhouettes Overlapping Past Center Line */}
        <img 
          src="/clouds/C2.svg" 
          alt="" 
          className="absolute -top-12 -left-28 sm:-left-40 w-68 sm:w-[26rem] max-w-none drop-shadow-md select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C1.svg" 
          alt="" 
          className="absolute top-[18%] -left-36 sm:-left-52 w-80 sm:w-[32rem] max-w-none drop-shadow-lg select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C3.svg" 
          alt="" 
          className="absolute top-[46%] -left-32 sm:-left-48 w-76 sm:w-[30rem] max-w-none drop-shadow-lg select-none pointer-events-none" 
        />
        <img 
          src="/clouds/C2.svg" 
          alt="" 
          className="absolute -bottom-12 -left-28 sm:-left-44 w-80 sm:w-[32rem] max-w-none drop-shadow-xl select-none pointer-events-none" 
        />
      </div>

      {/* ========================================================
          🌟 3. FOREGROUND LOGO & TITLES (Flows Upward Off-Screen)
          No fade: Physically glides up out of the viewport!
          ======================================================== */}
      <div 
        className="relative z-30 w-full h-full flex flex-col items-center justify-center pointer-events-none"
        style={{
          transform: isParting 
            ? 'translate3d(0, -115vh, 0)' 
            : isSquashing 
              ? 'scale(0.93)' 
              : 'scale(1)',
          transition: isParting 
            ? 'transform 0.65s cubic-bezier(0.32, 0.72, 0, 1)' 
            : 'transform 0.2s ease-out',
          willChange: 'transform'
        }}
      >
        {/* Main Animated Icon Container */}
        <div className="relative w-28 h-28 flex items-center justify-center">
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
        <div className="mt-5 text-center">
          <h1 className="font-mitr text-4xl font-semibold tracking-wide bg-gradient-to-r from-paw-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-2xs">
            MyPaw
          </h1>
        </div>

        {/* Minimal Loading Dots */}
        <div className="mt-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-paw-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-paw-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-paw-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
