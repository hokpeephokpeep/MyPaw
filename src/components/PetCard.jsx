import React, { useRef, useState, useEffect } from 'react';
import { calculateAge, calculateCatToHumanAge, formatDate, getDaysUntilBirthday, getHumanAgeIcon, getPetSpecialEvents } from '../utils';
import { getPhotoThumb, getPhotoSrc } from '../imageUtils';
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
  // ⏳ How long they have been gone (from deceasedDate to today)
  const timeSincePassing = isDeceased && pet.deceasedDate
    ? calculateAge(pet.deceasedDate)
    : null;
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : 999;
  const specialEvents = getPetSpecialEvents(pet);

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

  // Normalize photos list for fast thumbnail rendering (prevents memory bloat & UI jank)
  const photos = React.useMemo(() => {
    const list = [];
    const mainThumb = getPhotoThumb(pet.avatarThumb || pet.avatar);
    if (mainThumb) list.push(mainThumb);
    if (Array.isArray(pet.photos)) {
      pet.photos.forEach(p => {
        const thumb = getPhotoThumb(p);
        if (thumb && !list.includes(thumb)) {
          list.push(thumb);
        }
      });
    }
    return list;
  }, [pet.avatar, pet.avatarThumb, pet.photos]);

  const hasMultiplePhotos = photos.length > 1;

  useEffect(() => {
    // 🛑 Zero CPU usage when:
    // 1. Not in focal view (!isInView)
    // 2. Only 1 photo or no photos
    if (!isInView || !hasMultiplePhotos) return;

    let timer = null;
    let isCancelled = false;

    // Staggered interval:
    // Alive: 4.2s - 7.0s (energetic, lively)
    // Deceased: 8.0s - 12.0s (calm, contemplative, peaceful reminiscing with smooth 2.5s slow cross-fade)
    const minDelay = isDeceased ? 8000 : 4200;
    const variance = isDeceased ? 4000 : 2800;

    const scheduleNext = (delay) => {
      timer = setTimeout(() => {
        if (isCancelled) return;
        setPhotoIndex(prev => (prev + 1) % photos.length);
        const nextDelay = minDelay + Math.floor(Math.random() * variance);
        scheduleNext(nextDelay);
      }, delay);
    };

    // Initial stagger delay so cards loaded simultaneously don't fade at the same second
    const initialDelay = isDeceased
      ? 3500 + Math.floor(Math.random() * 3200)
      : 2200 + Math.floor(Math.random() * 2600);
    scheduleNext(initialDelay);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    };
  }, [isInView, hasMultiplePhotos, photos.length, isDeceased]);

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
      role="button"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={handleClickCard}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(pet);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMore(pet);
      }}
      className={`relative ${isDeceased ? 'overflow-visible' : 'overflow-hidden'} ${
        compact ? 'rounded-2xl' : 'rounded-[32px]'
      } select-none touch-manipulation cursor-pointer group/card focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
        isDeceased ? 'card-deceased-transition' : 'card-alive-transition'
      }`}
    >
      {/* ☁️ OVERSHOOT CLOUDS GRAPHIC (3 CLOUDS: 1 LEFT, 2 RIGHT STAGGERED) - Middle zone, 100% Opacity (No alpha blending to save CPU/GPU) */}
      {isDeceased && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible select-none">
          {/* 1. Left Cloud (1 ก้อนซ้าย: ขยับออกไปทางซ้ายตามลูกศร) */}
          <div className={`absolute ${compact ? '-left-5 top-[34%] w-[68px]' : '-left-14 sm:-left-18 top-[34%] sm:top-[36%] w-40 sm:w-44'}`}>
            <img
              src="/clouds/C3.svg"
              alt=""
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-1'} motion-reduce:animate-none select-none pointer-events-none`}
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
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-3'} motion-reduce:animate-none select-none pointer-events-none`}
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
              className={`w-full h-auto ${compact ? 'animate-cloud-float-subtle' : 'animate-cloud-float-2'} motion-reduce:animate-none select-none pointer-events-none`}
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
        className={`relative overflow-hidden ${compact ? 'rounded-2xl' : 'rounded-[32px]'} shadow-xs transition-colors transition-shadow duration-500 ${
          isDeceased
            ? 'border-2 border-sky-200/90 shadow-[0_6px_24px_-4px_rgba(56,189,248,0.22)]'
            : 'bg-white border border-slate-200/70 hover:border-paw-300'
        }`}
      >
        
        {/* 🌈 Heavenly Sky Background (ONLY FOR DECEASED PETS: Feel good คิดถึง ปนเหงา) */}
        {isDeceased && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-sky-400 via-sky-200 to-indigo-100">
            <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full opacity-40 blur-xs animate-rainbow pointer-events-none bg-gradient-to-tr from-transparent via-red-300 via-amber-200 via-emerald-200 via-sky-300 to-purple-400" />
            {/* 🌟 Delicate starlight twinkle in memorial sky */}
            <div className="absolute top-4 left-6 w-1.5 h-1.5 rounded-full bg-white animate-star-1 opacity-70 pointer-events-none" />
            <div className="absolute top-10 right-14 w-2 h-2 rounded-full bg-amber-100 animate-star-2 opacity-80 pointer-events-none" />
            <div className="absolute top-20 left-16 w-1 h-1 rounded-full bg-white animate-star-3 opacity-60 pointer-events-none" />
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
                  className={`pet-photo-slide ${
                    isCurrent ? 'is-active' : ''
                  } ${
                    isDeceased ? 'pet-photo-deceased' : 'pet-photo-alive'
                  } ${
                    isInView 
                      ? (isDeceased ? 'scale-[1.025]' : 'scale-105') 
                      : (isDeceased ? 'scale-100 group-hover:scale-[1.025]' : 'scale-100 group-hover:scale-105')
                  }`}
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
            <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-none transition-transform transition-opacity duration-300 ease-out ${
              showIndicator ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}>
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ease-out ${
                    idx === photoIndex
                      ? 'bg-white shadow-xs'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 🌟 Top-Left Special Event Badges (Rainbow Bridge, Birthday, Checkup, Vaccine) */}
          {specialEvents.length > 0 && (
            <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5 items-start max-w-[85%] pointer-events-none">
              {specialEvents.slice(0, compact ? 1 : 2).map((ev, idx) => (
                <div 
                  key={idx}
                  className={`inline-flex items-center gap-1.5 ${compact ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'} rounded-full font-semibold shadow-md border ${ev.bgClass}`}
                >
                  <FontAwesomeIcon icon={ev.icon} className={`${compact ? 'text-[10px]' : 'text-xs'} ${ev.iconClass}`} />
                  <span className="truncate">{ev.label}</span>
                </div>
              ))}
            </div>
          )}



          {/* 🏷️ NAME OVERLAY AT BOTTOM OF PHOTO */}
          <div className={`absolute inset-x-0 bottom-0 z-20 ${
            isDeceased 
              ? 'bg-gradient-to-t from-slate-950/90 via-sky-950/50 to-transparent' 
              : 'bg-gradient-to-t from-black/85 via-black/45 to-transparent'
          } ${compact ? 'pt-10 pb-2.5 px-3.5' : 'pt-16 pb-3.5 px-5'} flex items-end justify-between pointer-events-none`}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className={`font-mitr ${compact ? 'text-xl' : 'text-3xl'} font-medium text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] truncate flex items-center gap-1.5`}>
                  <span>{pet.name}</span>
                  {isDeceased && (
                    <span className="text-amber-200/90 text-xs sm:text-sm font-normal drop-shadow-xs">✨</span>
                  )}
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
                  <span className="text-amber-200/90 flex items-center gap-1">
                    <span>—</span>
                    <span>{formatDate(pet.deceasedDate, dateFormat)}</span>
                    {!compact && lifespan && (
                      <span className="text-amber-100 font-medium">
                        ({lifespan.years > 0 ? `${lifespan.years}y ` : ''}{lifespan.months > 0 ? `${lifespan.months}m ` : ''}{lifespan.days}d)
                      </span>
                    )}
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
              ? 'bg-gradient-to-r from-sky-50/95 via-white/95 to-indigo-50/90 backdrop-blur-md border-t border-sky-200/60' 
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
            {/* Typographic Age Design: Bold Google Sans numbers with subtle unit indicators */}
            <div className="flex items-baseline gap-0.5 sm:gap-1 select-none flex-shrink-0">
              {age.years > 0 && (
                <span className={`${compact ? 'text-lg' : 'text-2xl'} font-sans font-bold tracking-tight tabular-nums inline-flex items-baseline leading-none ${
                  isDeceased ? 'text-sky-800' : 'text-paw-600'
                }`}>
                  {age.years}
                  <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-sans font-normal lowercase ml-0.5 mr-1 select-none ${
                    isDeceased ? 'text-sky-400' : 'text-paw-400'
                  }`}>y</span>
                </span>
              )}
              {age.months > 0 && (
                <span className={`${compact ? 'text-base' : 'text-xl'} font-sans font-bold tracking-tight text-slate-800 tabular-nums inline-flex items-baseline leading-none`}>
                  {age.months}
                  <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-sans font-normal text-slate-400 lowercase ml-0.5 mr-1 select-none`}>m</span>
                </span>
              )}
              <span className={`${compact ? 'text-base' : 'text-xl'} font-sans font-bold tracking-tight text-slate-800 tabular-nums inline-flex items-baseline leading-none`}>
                {age.days}
                <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-sans font-normal text-slate-400 lowercase ml-0.5 select-none`}>d</span>
              </span>
            </div>

            {/* Cat-to-Human Age or Memorial Lifespan Summary Capsule */}
            {!isDeceased ? (
              <div className={`bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl ${compact ? 'px-2 py-0.5' : 'px-3 py-1.5'} flex items-center gap-1 shadow-2xs flex-shrink-0 hover:border-amber-300 transition-colors`}>
                {!compact && (
                  <FontAwesomeIcon icon={getHumanAgeIcon(humanAge)} className="text-amber-500 text-[10px]" />
                )}
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold text-amber-900 tabular-nums`}>
                  ~{humanAge}<span className="font-semibold text-amber-600/90 text-[10px] font-sans ml-0.5">{compact ? 'y' : ' human yrs'}</span>
                </span>
              </div>
            ) : (
              <div 
                title="จากเราไปสู่ดาวแมวแล้วนานแค่ไหน"
                className={`bg-gradient-to-r from-sky-50 via-amber-50/70 to-indigo-50/80 border border-sky-200/90 rounded-xl ${compact ? 'px-2 py-0.5' : 'px-2.5 py-1'} flex items-center gap-1 shadow-2xs flex-shrink-0`}
              >
                <FontAwesomeIcon icon={faRainbow} className="text-amber-500 text-[10px]" />
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold text-slate-700 tabular-nums whitespace-nowrap`}>
                  {compact ? (
                    timeSincePassing 
                      ? `${timeSincePassing.years > 0 ? `${timeSincePassing.years}y+` : (timeSincePassing.months > 0 ? `${timeSincePassing.months}m+` : `${timeSincePassing.days}d`)}`
                      : (lifespan ? `${lifespan.years}y+` : `${age.totalDays.toLocaleString()}d`)
                  ) : (
                    timeSincePassing 
                      ? `${timeSincePassing.years}y ${timeSincePassing.months}m ${timeSincePassing.days}d` 
                      : (lifespan ? `${lifespan.years}y ${lifespan.months}m ${lifespan.days}d` : `${age.totalDays.toLocaleString()}d`)
                  )}
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
