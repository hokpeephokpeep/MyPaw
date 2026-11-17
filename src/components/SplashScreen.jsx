import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';

export default function SplashScreen({ onFinish }) {
  // isMasking: triggers the decisive paw-portal mask opening & cloud parting
  const [isMasking, setIsMasking] = useState(false);
  const [isSquashing, setIsSquashing] = useState(false);

  useEffect(() => {
    // 1. Pre-burst anticipation squash at 950ms
    const tSquash = setTimeout(() => {
      setIsSquashing(true);
    }, 950);

    // 2. The Decisive Paw Mask Burst & Cloud Parting at 1150ms (NO FADE IN)
    const tMask = setTimeout(() => {
      setIsMasking(true);
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate([15, 30, 20]); } catch (e) {}
      }
    }, 1150);

    // 3. Complete unmount after mask has fully engulfed the screen at 1820ms
    const tFinish = setTimeout(() => {
      onFinish();
    }, 1820);

    return () => {
      clearTimeout(tSquash);
      clearTimeout(tMask);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* ========================================================
          🐾 1. THE HERO PAW MASK SVG BACKDROP (Pure Mask Transition)
          - White in mask preserves the solid splash backdrop.
          - Black paw & center core punches an expanding transparent hole
            through which the actual app content underneath is revealed!
          ======================================================== */}
      <svg 
        className="fixed inset-0 w-full h-full pointer-events-none z-0" 
        viewBox="0 0 512 512" 
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Splash background linear gradient */}
          <linearGradient id="splashMaskBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />   {/* amber-50 */}
            <stop offset="40%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fff7ed" />  {/* orange-50 */}
          </linearGradient>

          {/* SVG MASK: Cuts an expanding Paw Silhouette hole straight through the screen */}
          <mask id="pawPortalMask" maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="6512" height="6512">
            {/* White base = Solid backdrop initially visible */}
            <rect x="-3000" y="-3000" width="6512" height="6512" fill="white" />
            
            {/* Black Expanding Paw Silhouette = Transparent hole cutting through! */}
            <g 
              style={{
                transformOrigin: '256px 215px',
                transform: isMasking ? 'scale(38)' : 'scale(0)',
                transition: 'transform 0.65s cubic-bezier(0.75, 0, 0.15, 1)'
              }}
            >
              {/* Center circular expansion core */}
              <circle cx="256" cy="215" r="130" fill="black" />
              {/* Detailed FontAwesome Paw silhouette path (4 toes + palm) */}
              <path d={faPaw.icon[4]} fill="black" />
            </g>
          </mask>
        </defs>

        {/* Full-screen backdrop rendered through the expanding Paw Mask */}
        <rect 
          x="-3000" 
          y="-3000" 
          width="6512" 
          height="6512" 
          fill="url(#splashMaskBg)" 
          mask="url(#pawPortalMask)" 
        />

        {/* ⚡ Golden Energy Shockwave Rim (Traces the expanding paw opening) */}
        <g 
          style={{
            transformOrigin: '256px 215px',
            transform: isMasking ? 'scale(38)' : 'scale(0)',
            opacity: isMasking ? 0 : 0.9,
            transition: 'transform 0.65s cubic-bezier(0.75, 0, 0.15, 1), opacity 0.55s ease-out'
          }}
        >
          <circle cx="256" cy="215" r="130" fill="none" stroke="#f59e0b" strokeWidth="5" />
          <path 
            d={faPaw.icon[4]} 
            fill="none" 
            stroke="#fb923c" 
            strokeWidth="8" 
            style={{ filter: 'drop-shadow(0 0 16px rgba(249, 115, 22, 0.8))' }}
          />
        </g>
      </svg>

      {/* ========================================================
          ☁️ 2. CINEMATIC CLOUD CURTAINS (Parting to sides like heaven's gates)
          ======================================================== */}
      {/* Top Cloud Puff */}
      <div 
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 pointer-events-none transition-transform duration-700 ease-in-out"
        style={{
          transform: isMasking ? 'translate(-50%, -160%)' : 'translate(-50%, 0)'
        }}
      >
        <img src="/clouds/C1.svg" alt="" className="w-full h-auto opacity-75 select-none" />
      </div>

      {/* Left Cloud Curtain: Sweeps left with a dramatic curve */}
      <div 
        className="absolute top-[28%] -left-16 sm:-left-24 w-72 sm:w-88 pointer-events-none transition-transform duration-700 ease-in-out"
        style={{
          transform: isMasking ? 'translateX(-160%) rotate(-14deg)' : 'translateX(0) rotate(0deg)'
        }}
      >
        <img 
          src="/clouds/C3.svg" 
          alt="" 
          className="w-full h-auto select-none" 
          style={{ filter: 'drop-shadow(0 14px 20px rgba(12, 74, 110, 0.25))' }}
        />
      </div>

      {/* Right Cloud Curtain: Sweeps right with a dramatic curve */}
      <div 
        className="absolute top-[26%] -right-16 sm:-right-24 w-80 sm:w-96 pointer-events-none transition-transform duration-700 ease-in-out"
        style={{
          transform: isMasking ? 'translateX(160%) rotate(14deg)' : 'translateX(0) rotate(0deg)'
        }}
      >
        <img 
          src="/clouds/C2.svg" 
          alt="" 
          className="w-full h-auto select-none" 
          style={{ filter: 'drop-shadow(0 14px 20px rgba(79, 70, 229, 0.2))' }}
        />
      </div>

      {/* Bottom Floating Cloud */}
      <div 
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-96 pointer-events-none transition-transform duration-700 ease-in-out"
        style={{
          transform: isMasking ? 'translate(-50%, 160%)' : 'translate(-50%, 0)'
        }}
      >
        <img 
          src="/clouds/C1.svg" 
          alt="" 
          className="w-full h-auto select-none"
          style={{ filter: 'drop-shadow(0 -10px 18px rgba(15, 23, 42, 0.15))' }}
        />
      </div>

      {/* ========================================================
          🌟 3. FOREGROUND LOGO & TITLES (Anticipation Squash & Camera Zoom Through)
          ======================================================== */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* Main Animated Icon Container */}
        <div 
          className="relative w-28 h-28 flex items-center justify-center"
          style={{
            transform: isMasking 
              ? 'scale(7) rotate(-8deg)' 
              : isSquashing 
                ? 'scale(0.92)' 
                : 'scale(1)',
            opacity: isMasking ? 0 : 1,
            transition: isMasking 
              ? 'transform 0.65s cubic-bezier(0.75, 0, 0.15, 1), opacity 0.4s ease-out' 
              : 'transform 0.2s ease-out'
          }}
        >
          {/* Ambient Glow Aura */}
          <div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-paw-400 to-amber-400 opacity-25 animate-ping" 
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

        {/* Pure App Title in Mitr */}
        <div 
          className="mt-5 text-center transition-all duration-400 ease-out"
          style={{
            transform: isMasking ? 'translateY(35px) scale(0.85)' : 'translateY(0) scale(1)',
            opacity: isMasking ? 0 : 1
          }}
        >
          <h1 className="font-mitr text-4xl font-semibold tracking-wide bg-gradient-to-r from-paw-600 via-amber-600 to-orange-600 bg-clip-text text-transparent drop-shadow-2xs">
            MyPaw
          </h1>
        </div>

        {/* Minimal Loading Dots */}
        <div 
          className="mt-6 flex items-center gap-2 transition-all duration-300 ease-out"
          style={{
            opacity: isMasking ? 0 : 1,
            transform: isMasking ? 'translateY(20px)' : 'translateY(0)'
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
