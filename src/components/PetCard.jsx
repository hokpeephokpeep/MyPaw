import React, { useRef } from 'react';
import { calculateAge, calculateCatToHumanAge, formatDate, getDaysUntilBirthday, getLifeStage } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faWandMagicSparkles, faVenus, faMars, faRainbow } from '@fortawesome/free-solid-svg-icons';

export default function PetCard({ pet, allPets = [], dateFormat = 'en', onOpenMore, onViewImage }) {
  const isDeceased = pet.status === 'deceased';
  const age = calculateAge(pet.birthDate, isDeceased ? pet.deceasedDate : null);
  const humanAge = calculateCatToHumanAge(age.years, age.months);

  // Long press handling (mobile touch & desktop mouse hold)
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const startPress = () => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (window.navigator?.vibrate) {
        try { window.navigator.vibrate(40); } catch(e) {}
      }
      onOpenMore(pet);
    }, 450); // 450ms hold trigger
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClickPhoto = (e) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onViewImage(pet);
  };

  return (
    <div 
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMore(pet);
      }}
      className={`relative overflow-hidden rounded-[32px] shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer select-none active:scale-[0.99] ${
        isDeceased
          ? 'border-2 border-sky-200/90 shadow-sky-100'
          : 'bg-white border border-slate-200/70 hover:border-paw-300 shadow-slate-100'
      }`}
    >
      
      {/* 🌈 Heavenly Sky & Cloud Parallax Background (ONLY FOR DECEASED PETS) */}
      {isDeceased && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-b from-sky-400 via-sky-200 to-indigo-100">
          <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full opacity-40 blur-xs animate-rainbow pointer-events-none bg-gradient-to-tr from-transparent via-red-300 via-amber-200 via-emerald-200 via-sky-300 to-purple-400" />
          <div className="absolute top-5 left-10 text-amber-200 text-xs animate-star-1">✦</div>
          <div className="absolute top-12 right-16 text-white text-xs animate-star-2">✨</div>
          <div className="absolute top-28 left-6 text-sky-100 text-[10px] animate-star-3">✦</div>
          <div className="absolute bottom-16 right-8 text-amber-100 text-[10px] animate-star-1">✨</div>

          {/* Cloud Layer 1 */}
          <div className="absolute -bottom-8 -left-10 w-[120%] opacity-40 animate-cloud-1">
            <svg viewBox="0 0 500 150" className="w-full h-auto fill-white">
              <path d="M0,100 C150,140 350,60 500,100 L500,150 L0,150 Z" />
              <circle cx="120" cy="90" r="55" />
              <circle cx="210" cy="75" r="70" />
              <circle cx="330" cy="85" r="60" />
              <circle cx="430" cy="95" r="50" />
            </svg>
          </div>

          {/* Cloud Layer 2 */}
          <div className="absolute -bottom-10 -right-10 w-[125%] opacity-65 animate-cloud-2">
            <svg viewBox="0 0 500 150" className="w-full h-auto fill-white/80">
              <circle cx="60" cy="110" r="65" />
              <circle cx="170" cy="95" r="75" />
              <circle cx="290" cy="100" r="70" />
              <circle cx="410" cy="105" r="60" />
              <path d="M0,120 L500,120 L500,150 L0,150 Z" />
            </svg>
          </div>

          {/* Cloud Layer 3 */}
          <div className="absolute -bottom-6 left-0 w-full opacity-90 animate-cloud-3">
            <svg viewBox="0 0 500 120" className="w-full h-auto fill-white">
              <circle cx="100" cy="90" r="55" />
              <circle cx="240" cy="80" r="65" />
              <circle cx="390" cy="85" r="55" />
              <rect x="0" y="90" width="500" height="30" />
            </svg>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10">

        {/* 📸 HERO PHOTO with NAME OVERLAY AT BOTTOM - 1:1 SQUARE ASPECT RATIO */}
        <div 
          onClick={handleClickPhoto}
          className="relative w-full aspect-square overflow-hidden bg-slate-900 group"
        >
          {pet.avatar ? (
            <img
              src={pet.avatar}
              alt={pet.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-paw-100 to-amber-100 text-paw-600">
              <span className="text-6xl">🐱</span>
            </div>
          )}

          {/* Top-Left Rainbow Bridge Tag */}
          {isDeceased && (
            <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-xs font-medium shadow-md border border-white/20">
              <FontAwesomeIcon icon={faRainbow} className="text-amber-300 text-xs" />
              <span>ดาวแมว</span>
            </div>
          )}

          {/* 🏷️ NAME OVERLAY AT BOTTOM OF PHOTO */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent pt-16 pb-3.5 px-5 flex items-end justify-between pointer-events-none">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mitr text-3xl font-semibold text-white tracking-wide drop-shadow-md">
                  {pet.name}
                </h2>

                {/* 🚻 Minimal Gender Icon */}
                <FontAwesomeIcon 
                  icon={pet.gender === 'female' ? faVenus : faMars} 
                  className={`text-base drop-shadow-md ${
                    pet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'
                  }`} 
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-white/80 font-normal mt-0.5 drop-shadow-xs">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarDays} className="text-white/70 text-[10px]" />
                  <span>เกิด: {formatDate(pet.birthDate, dateFormat)}</span>
                </span>
                {isDeceased && pet.deceasedDate && (
                  <span className="text-amber-200 flex items-center gap-1">
                    <span>•</span>
                    <span>สู่สายรุ้ง: {formatDate(pet.deceasedDate, dateFormat)}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 📊 PURE ESSENTIAL STATS BAR */}
        <div className={`p-4 ${
          isDeceased 
            ? 'bg-white/95 backdrop-blur-md border-t border-sky-100 rounded-b-[30px]' 
            : 'bg-white'
        }`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {isDeceased ? 'อายุขัย' : 'อายุ'}
              </div>
              <div className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {age.years > 0 && <span className="text-paw-600">{age.years} <span className="text-xs font-normal text-slate-500 mr-1.5">ปี</span></span>}
                {age.months > 0 && <span>{age.months} <span className="text-xs font-normal text-slate-500 mr-1.5">เดือน</span></span>}
                <span>{age.days} <span className="text-xs font-normal text-slate-500">วัน</span></span>
              </div>
            </div>

            {/* Cat-to-Human Age or Memorial Bond */}
            {!isDeceased ? (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl px-3 py-1.5 text-right shadow-2xs">
                <div className="text-[10px] text-amber-700 font-medium flex items-center justify-end gap-1">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[9px]" />
                  <span>เทียบคน</span>
                </div>
                <div className="text-sm font-bold text-amber-900 leading-tight">
                  ~{humanAge} <span className="text-[11px] font-normal">ปี</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-50 to-sky-50 border border-purple-200/70 rounded-2xl px-3.5 py-1.5 text-right shadow-2xs">
                <div className="text-[10px] text-purple-700 font-medium">ความทรงจำ</div>
                <div className="text-sm font-bold text-purple-900 leading-tight">
                  {age.totalDays.toLocaleString()} <span className="text-[11px] font-normal">วัน</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
