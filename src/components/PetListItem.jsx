import React, { useRef } from 'react';
import { calculateAge, calculateCatToHumanAge, formatDate, getDaysUntilBirthday, getHumanAgeIcon, getPetSpecialEvents } from '../utils';
import { getPhotoThumb } from '../imageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVenus, faMars, faRainbow, faCakeCandles, faPaw, 
  faChevronRight, faInfinity 
} from '@fortawesome/free-solid-svg-icons';

export default function PetListItem({ pet, dateFormat = 'en', onOpenMore, onToggleBottomNav }) {
  const isDeceased = pet.status === 'deceased';
  const age = calculateAge(pet.birthDate);
  const lifespan = isDeceased && pet.deceasedDate 
    ? calculateAge(pet.birthDate, pet.deceasedDate)
    : null;
  const timeSincePassing = isDeceased && pet.deceasedDate
    ? calculateAge(pet.deceasedDate)
    : null;
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : 999;
  const specialEvents = getPetSpecialEvents(pet);

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
    }, 380);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClickItem = (e) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onOpenMore) {
      e.stopPropagation();
      onOpenMore(pet);
    } else if (onToggleBottomNav) {
      e.stopPropagation();
      onToggleBottomNav();
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onClick={handleClickItem}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenMore?.(pet);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMore(pet);
      }}
      className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.985] shadow-2xs focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
        isDeceased
          ? 'card-deceased-transition bg-gradient-to-r from-sky-50/90 via-indigo-50/40 to-slate-50 border border-sky-200/80 shadow-[0_2px_12px_rgba(56,189,248,0.1)]'
          : 'card-alive-transition bg-white border border-slate-200/80 hover:border-paw-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar thumbnail */}
        <div className={`relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-xs group ${
          isDeceased ? 'ring-2 ring-sky-200/80 shadow-[0_0_12px_rgba(186,230,253,0.35)]' : ''
        }`}>
          {(pet.avatarThumb || pet.avatar) ? (
            <img 
              src={getPhotoThumb(pet.avatarThumb || pet.avatar)} 
              alt={pet.name} 
              loading="lazy"
              decoding="async"
              className={`w-full h-full object-cover transition-transform ${
                isDeceased
                  ? 'duration-700 ease-out group-hover:scale-103 brightness-[1.02]'
                  : 'duration-200 ease-out group-hover:scale-106'
              }`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-paw-100 text-paw-400">
              <FontAwesomeIcon icon={faPaw} className="text-xl" />
            </div>
          )}

          {/* Gender Indicator Dot */}
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-[9px] text-white">
            <FontAwesomeIcon 
              icon={pet.gender === 'female' ? faVenus : faMars} 
              className={pet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'} 
            />
          </div>
        </div>

        {/* Pet Name & Typographic Age */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="font-mitr font-medium text-base text-slate-900 truncate">
              {pet.name}
            </h2>
            {specialEvents.length > 0 && (
              <span
                title={specialEvents[0].label}
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full border shadow-2xs flex-shrink-0 ${specialEvents[0].bgClass}`}
              >
                <FontAwesomeIcon icon={specialEvents[0].icon} className={`text-[9px] ${specialEvents[0].iconClass}`} />
              </span>
            )}
          </div>

          {/* Typo Age: 8y 6m 15d */}
          <div className="flex items-baseline gap-1 font-mitr font-semibold tracking-tight text-xs text-slate-700 mt-0.5">
            {age.years > 0 && (
              <span className={isDeceased ? 'text-sky-800' : 'text-paw-600'}>
                {age.years}<span className={`text-[10px] font-sans font-normal lowercase ${isDeceased ? 'text-sky-400' : 'text-paw-400'}`}>y</span>
              </span>
            )}
            <span>
              {age.months || 0}<span className="text-[10px] font-sans font-normal text-slate-400 lowercase">m</span>
            </span>
            <span>
              {age.days}<span className="text-[10px] font-sans font-normal text-slate-400 lowercase">d</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Single-line Human Equivalent / Memorial Lifespan Pill */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isDeceased ? (
          <div className="bg-amber-50/90 border border-amber-200/70 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
            <FontAwesomeIcon icon={getHumanAgeIcon(humanAge)} className="text-amber-500 text-[10px]" />
            <span className="text-xs font-bold text-amber-900 tabular-nums">
              ~{humanAge} <span className="font-semibold text-amber-700/90 text-[11px] font-sans">human yrs</span>
            </span>
          </div>
        ) : (
          <div 
            title="จากเราไปสู่ดาวแมวแล้วนานแค่ไหน"
            className="bg-gradient-to-r from-sky-50 via-amber-50/70 to-indigo-50/80 border border-sky-200/80 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faRainbow} className="text-amber-500 text-[10px]" />
            <span className="text-xs font-bold text-slate-700 tabular-nums">
              {timeSincePassing ? `${timeSincePassing.years}y ${timeSincePassing.months}m ${timeSincePassing.days}d` : ''}
            </span>
          </div>
        )}

        <FontAwesomeIcon icon={faChevronRight} className="text-slate-300 text-xs" />
      </div>
    </div>
  );
}
