import React, { useRef, useState, useEffect } from 'react';
import { calculateAge, calculateCatToHumanAge, formatDate, getDaysUntilBirthday, getHumanAgeIcon } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDays, faVenus, faMars, 
  faRainbow, faCakeCandles, faPaw, faInfinity 
} from '@fortawesome/free-solid-svg-icons';

export default function PetCard({ pet, allPets = [], dateFormat = 'en', compact = false, onOpenMore, onToggleBottomNav }) {
  const isDeceased = pet.status === 'deceased';
  // 🐾 Continuous age counting from birthdate until today (living memory in our hearts)
  const age = calculateAge(pet.birthDate);
  // 🌈 For deceased pets, summarize their earthly lifespan (how old they were at passing)
  const lifespan = isDeceased && pet.deceasedDate 
    ? calculateAge(pet.birthDate, pet.deceasedDate)
    : null;
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : 999;

  // Long press handling: 380ms hold enters detail profile
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // 📱 Scroll-in View Zoom (Optimal for mobile where hover does not exist)
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  // 📸 Multi-photo Slideshow with Staggered / Randomized Transitions & Focus Visibility Guard
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const indicatorTimeoutRef = useRef(null);

  const triggerIndicator = () => {
    setShowIndicator(true);
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowIndicator(false);
    }, 2200);
  };

  // Touch & Swipe tracking (Swipe left / right to change photo & reveal indicator)
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);

  // Normalize photos list
  const photos = React.useMemo(() => {
    const list = [];
    if (pet.avatar) list.push(pet.avatar);
    if (Array.isArray(pet.photos)) {
      pet.photos.forEach(p => {
        if (p && typeof p === 'string' && !list.includes(p)) {
          list.push(p);
        }
      });
    }
    return list;
  }, [pet.avatar, pet.photos]);

  const hasMultiplePhotos = photos.length > 1;

  useEffect(() => {
    // 🛑 Zero CPU usage when:
    // 1. Not in focal view (!isInView)
    // 2. Only 1 photo or no photos
    if (!isInView || !hasMultiplePhotos) return;

    let timer = null;
    let isCancelled = false;

    // Randomize time per card so they don't fade in sync like robots:
    // Staggered interval between 4.8s and 8.0s with per-card random variance
    const scheduleNext = (delay) => {
      timer = setTimeout(() => {
        if (isCancelled) return;
        setPhotoIndex(prev => (prev + 1) % photos.length);
        // Next transition with random interval (4800ms - 8000ms)
        const nextDelay = 4800 + Math.floor(Math.random() * 3200);
        scheduleNext(nextDelay);
      }, delay);
    };

    // Initial stagger delay so cards loaded simultaneously don't fade at the same second
    const initialDelay = 2500 + Math.floor(Math.random() * 3000);
    scheduleNext(initialDelay);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    };
  }, [isInView, hasMultiplePhotos, photos.length]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        // Active focal zone: central 60% of viewport
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.25
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startPress = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate(40); } catch(e) {}
      }
      onOpenMore(pet);
    }, 380);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchStart = (e) => {
    startPress();
    if (e.touches && e.touches[0]) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      isSwipingRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartPosRef.current.x;
    const deltaY = currentY - touchStartPosRef.current.y;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      cancelPress();
    }
  };

  const handleTouchEnd = (e) => {
    cancelPress();
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const currentX = e.changedTouches[0].clientX;
    const currentY = e.changedTouches[0].clientY;
    const deltaX = currentX - touchStartPosRef.current.x;
    const deltaY = currentY - touchStartPosRef.current.y;

    // Detect horizontal swipe (at least 35px, predominantly horizontal)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      isSwipingRef.current = true;
      if (hasMultiplePhotos) {
        if (deltaX < 0) {
          // Swipe Left -> Next Photo
          setPhotoIndex(prev => (prev + 1) % photos.length);
        } else {
          // Swipe Right -> Prev Photo
          setPhotoIndex(prev => (prev - 1 + photos.length) % photos.length);
        }
        triggerIndicator();
      }
    }
  };

  const handleClickCard = (e) => {
    if (isLongPressRef.current || isSwipingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isSwipingRef.current = false;
      return;
    }
    // Normal short tap toggles bottom nav bar
    if (onToggleBottomNav) {
      e.stopPropagation();
      onToggleBottomNav();
    }
  };

  return (
    <div 
      ref={cardRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={handleClickCard}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMore(pet);
      }}
      className={`relative ${isDeceased ? 'overflow-visible' : 'overflow-hidden'} ${
        compact ? 'rounded-2xl' : 'rounded-[32px]'
      } select-none touch-manipulation cursor-pointer group/card`}
    >
      {/* ☁️ OVERSHOOT CLOUDS GRAPHIC (3 CLOUDS: 1 LEFT, 2 RIGHT STAGGERED) - Middle zone, 100% Opacity (No alpha blending to save CPU/GPU) */}
      {isDeceased && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible select-none">
          {/* 1. Left Cloud (1 ก้อนซ้าย: ขยับออกไปทางซ้ายตามลูกศร) */}
          <div className={`absolute ${compact ? '-left-5 top-[34%] w-[68px]' : '-left-14 sm:-left-18 top-[34%] sm:top-[36%] w-40 sm:w-44'}`}>
            <img
              src="/clouds/C3.svg"
              alt=""
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-1'} select-none pointer-events-none`}
              style={{
                filter: compact
                  ? 'drop-shadow(0 4px 8px rgba(12, 74, 110, 0.25)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))'
                  : 'drop-shadow(0 16px 24px rgba(12, 74, 110, 0.45)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.22))'
              }}
            />
          </div>

          {/* 2. Right Cloud 1 (ก้อนขวาบน: ขยับออกไปทางขวาตามลูกศร) */}
          <div className={`absolute ${compact ? '-right-3.5 top-[18%] w-[50px]' : '-right-10 sm:-right-14 top-[18%] sm:top-[20%] w-32 sm:w-36'}`}>
            <img
              src="/clouds/C1.svg"
              alt=""
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-3'} select-none pointer-events-none`}
              style={{
                filter: compact
                  ? 'drop-shadow(0 3px 6px rgba(14, 165, 233, 0.25)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))'
                  : 'drop-shadow(0 14px 20px rgba(14, 165, 233, 0.35)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18))'
              }}
            />
          </div>

          {/* 3. Right Cloud 2 (ก้อนขวาล่าง: ขยับออกไปทางขวาตามลูกศร) */}
          <div className={`absolute ${compact ? '-right-4 top-[50%] w-[56px]' : '-right-14 sm:-right-18 top-[50%] sm:top-[52%] w-36 sm:w-40'}`}>
            <img
              src="/clouds/C2.svg"
              alt=""
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-2'} select-none pointer-events-none`}
              style={{
                filter: compact
                  ? 'drop-shadow(0 4px 7px rgba(79, 70, 229, 0.22)) drop-shadow(0 1px 3px rgba(14, 165, 233, 0.15))'
                  : 'drop-shadow(0 16px 22px rgba(79, 70, 229, 0.35)) drop-shadow(0 6px 14px rgba(14, 165, 233, 0.3))'
              }}
            />
          </div>
        </div>
      )}

      {/* Main Card Container Box (Clipped Inner Elements) */}
      <div 
        className={`relative overflow-hidden ${compact ? 'rounded-2xl' : 'rounded-[32px]'} shadow-xs transition-all duration-300 hover:shadow-md active:scale-[0.985] ${
          isDeceased
            ? 'border-2 border-sky-200/80 shadow-sky-100/50'
            : 'bg-white border border-slate-200/70 hover:border-paw-300'
        }`}
      >
        
        {/* 🌈 Heavenly Sky Background (ONLY FOR DECEASED PETS) */}
        {isDeceased && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-sky-400 via-sky-200 to-indigo-100">
            <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full opacity-40 blur-xs animate-rainbow pointer-events-none bg-gradient-to-tr from-transparent via-red-300 via-amber-200 via-emerald-200 via-sky-300 to-purple-400" />
          </div>
        )}

        {/* Main Content Container */}
        <div className="relative z-10">

        {/* 📸 HERO PHOTO SLIDESHOW - STRICT 1:1 SQUARE ASPECT RATIO WITH CLEAN CORNER RADIUS */}
        <div 
          className={`relative w-full aspect-square overflow-hidden bg-slate-100 ${
            compact ? 'rounded-t-[14px]' : 'rounded-t-[30px]'
          } group`}
        >
          {photos.length > 0 ? (
            photos.map((src, idx) => {
              const isCurrent = idx === photoIndex;
              return (
                <img
                  key={`${src}-${idx}`}
                  src={src}
                  alt={pet.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out select-none pointer-events-none ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  } ${isInView ? 'scale-105' : 'scale-100 group-hover:scale-105'} transition-transform duration-700 ease-out`}
                />
              );
            })
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-paw-100 to-amber-100 text-paw-400">
              <FontAwesomeIcon icon={faPaw} className="text-6xl" />
            </div>
          )}

          {/* Minimal Circle Dots Indicator: centered at bottom of image, appears ONLY on swipe then times out */}
          {hasMultiplePhotos && (
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-none transition-all duration-300 ${
              showIndicator ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}>
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === photoIndex
                      ? 'bg-white shadow-xs'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Top-Left Rainbow Bridge Tag OR Birthday Countdown Pill */}
          {isDeceased ? (
            <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-xs font-medium shadow-md border border-white/20">
              <FontAwesomeIcon icon={faRainbow} className="text-amber-300 text-xs" />
              <span>Rainbow Bridge</span>
            </div>
          ) : daysUntilBday <= 14 ? (
            <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paw-500/90 backdrop-blur-md text-white text-xs font-bold shadow-md border border-white/25 animate-pulse">
              <FontAwesomeIcon icon={faCakeCandles} className="text-amber-200 text-xs" />
              <span>{daysUntilBday === 0 ? 'Happy Birthday! 🎂' : `In ${daysUntilBday}d`}</span>
            </div>
          ) : null}



          {/* 🏷️ NAME OVERLAY AT BOTTOM OF PHOTO */}
          <div className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent ${compact ? 'pt-10 pb-2.5 px-3.5' : 'pt-16 pb-3.5 px-5'} flex items-end justify-between pointer-events-none`}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className={`font-mitr ${compact ? 'text-xl' : 'text-3xl'} font-medium text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] truncate`}>
                  {pet.name}
                </h2>

                {/* 🚻 Minimal Gender Icon */}
                <FontAwesomeIcon 
                  icon={pet.gender === 'female' ? faVenus : faMars} 
                  className={`${compact ? 'text-xs' : 'text-base'} drop-shadow-md flex-shrink-0 ${
                    pet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'
                  }`} 
                />
              </div>

              <div className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} text-white/85 font-normal mt-0.5 drop-shadow-xs truncate`}>
                <span className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-white/70 text-[9px]" />
                  <span>{formatDate(pet.birthDate, dateFormat)}</span>
                </span>
                {isDeceased && pet.deceasedDate && (
                  <span className="text-amber-200 flex items-center gap-1">
                    <span>—</span>
                    <span>{formatDate(pet.deceasedDate, dateFormat)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 SELF-EXPLANATORY STATS BAR */}
        <div 
          className={`${compact ? 'px-2.5 py-2 rounded-b-2xl' : 'px-5 py-3.5'} relative ${
            isDeceased 
              ? 'bg-white/95 backdrop-blur-md border-t border-sky-100' 
              : 'bg-white'
          }`}
        >
          {/* Subtle Watermark Paw (Brand Gimmick) */}
          <FontAwesomeIcon 
            icon={faPaw} 
            className={`absolute right-24 bottom-2 text-4xl -rotate-12 pointer-events-none opacity-[0.035] ${
              isDeceased ? 'text-sky-900' : 'text-paw-900'
            }`} 
          />

          <div className="flex items-center justify-between gap-1.5 relative z-10">
            {/* Typographic Age Design: e.g. 8y 6m 15d */}
            <div className={`flex items-baseline gap-0.5 sm:gap-1 font-sans font-black tracking-tight select-none flex-shrink-0`}>
              {age.years > 0 && (
                <span className={`${compact ? 'text-base' : 'text-2xl'} text-paw-600 tabular-nums inline-flex items-baseline`}>
                  {age.years}
                  <span className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-paw-400 lowercase font-mono ml-0.5 mr-0.5`}>y</span>
                </span>
              )}
              {age.months > 0 && (
                <span className={`${compact ? 'text-sm' : 'text-xl'} text-slate-800 tabular-nums inline-flex items-baseline`}>
                  {age.months}
                  <span className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-400 lowercase font-mono ml-0.5 mr-0.5`}>m</span>
                </span>
              )}
              <span className={`${compact ? 'text-sm' : 'text-xl'} text-slate-800 tabular-nums inline-flex items-baseline`}>
                {age.days}
                <span className={`${compact ? 'text-[9px]' : 'text-xs'} font-bold text-slate-400 lowercase font-mono ml-0.5`}>d</span>
              </span>
            </div>

            {/* Cat-to-Human Age or Memorial Lifespan Summary Capsule */}
            {!isDeceased ? (
              <div className={`bg-amber-50/90 border border-amber-200/70 rounded-xl ${compact ? 'px-2 py-0.5' : 'px-3 py-1.5'} flex items-center gap-1 shadow-2xs flex-shrink-0`}>
                {!compact && (
                  <FontAwesomeIcon icon={getHumanAgeIcon(humanAge)} className="text-amber-500 text-[10px]" />
                )}
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold text-amber-900 tabular-nums`}>
                  ~{humanAge}<span className="font-semibold text-amber-600/90 text-[10px] font-sans ml-0.5">{compact ? 'y' : ' human yrs'}</span>
                </span>
              </div>
            ) : (
              <div className={`bg-amber-50/90 border border-amber-200/80 rounded-xl ${compact ? 'px-1.5 py-0.5' : 'px-2.5 py-1'} flex items-center gap-1 shadow-2xs flex-shrink-0`}>
                {!compact && (
                  <FontAwesomeIcon icon={faRainbow} className="text-amber-500 text-[10px]" />
                )}
                <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-amber-900 tabular-nums whitespace-nowrap`}>
                  {lifespan ? `${lifespan.years}y ${lifespan.months}m ${lifespan.days}d` : `${age.totalDays.toLocaleString()}d`}
                </span>
              </div>
            )}
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
