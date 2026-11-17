import React from 'react';
import { calculateAge, calculateCatToHumanAge, formatDate, getDaysUntilBirthday } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faVenus, faMars, faRainbow, faCakeCandles, faPaw, 
  faChevronRight, faWandMagicSparkles, faInfinity 
} from '@fortawesome/free-solid-svg-icons';

export default function PetListItem({ pet, dateFormat = 'en', onOpenMore, onViewImage }) {
  const isDeceased = pet.status === 'deceased';
  const age = calculateAge(pet.birthDate, isDeceased ? pet.deceasedDate : null);
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : 999;

  return (
    <div 
      onClick={() => onOpenMore(pet)}
      className={`p-3 rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer select-none active:scale-[0.985] shadow-2xs ${
        isDeceased
          ? 'bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-200/80'
          : 'bg-white border border-slate-200/80 hover:border-paw-300'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar thumbnail */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onViewImage(pet);
          }}
          className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-xs group"
        >
          {pet.avatar ? (
            <img 
              src={pet.avatar} 
              alt={pet.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
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
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-mitr font-medium text-base text-slate-900 truncate">
              {pet.name}
            </h2>
            {isDeceased ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">
                <FontAwesomeIcon icon={faRainbow} className="text-[9px]" />
                <span>Memorial</span>
              </span>
            ) : daysUntilBday <= 14 ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-paw-100 text-paw-700 text-[10px] font-bold animate-pulse">
                <FontAwesomeIcon icon={faCakeCandles} className="text-[9px]" />
                <span>{daysUntilBday === 0 ? 'Today!' : `${daysUntilBday}d`}</span>
              </span>
            ) : null}
          </div>

          {/* Typo Age: 8y 6m 15d */}
          <div className="flex items-baseline gap-1 font-sans font-bold tracking-tight text-xs text-slate-600 mt-0.5">
            {age.years > 0 && (
              <span className="text-paw-600">
                {age.years}<span className="text-[10px] text-paw-400 lowercase font-mono">y</span>
              </span>
            )}
            {age.months > 0 && (
              <span>
                {age.months}<span className="text-[10px] text-slate-400 lowercase font-mono">m</span>
              </span>
            )}
            <span>
              {age.days}<span className="text-[10px] text-slate-400 lowercase font-mono">d</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Single-line Human Equivalent / Memorial Days Pill */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isDeceased ? (
          <div className="bg-amber-50/90 border border-amber-200/70 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-500 text-[10px]" />
            <span className="text-xs font-bold text-amber-900 tabular-nums">
              ~{humanAge} <span className="font-semibold text-amber-700/90 text-[11px] font-sans">human yrs</span>
            </span>
          </div>
        ) : (
          <div className="bg-purple-50/90 border border-purple-200/70 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
            <FontAwesomeIcon icon={faInfinity} className="text-purple-500 text-[10px]" />
            <span className="text-xs font-bold text-purple-900 tabular-nums">
              {age.totalDays.toLocaleString()} <span className="font-semibold text-purple-700/90 text-[11px] font-sans">days</span>
            </span>
          </div>
        )}

        <FontAwesomeIcon icon={faChevronRight} className="text-slate-300 text-xs" />
      </div>
    </div>
  );
}
