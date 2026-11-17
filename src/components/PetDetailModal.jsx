import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPenToSquare, faWeightScale, faFire, faSitemap, 
  faCalendarDays, faWandMagicSparkles, faVenus, faMars, faLink,
  faPaw, faScissors, faRainbow, faSeedling, faCakeCandles, faInfinity, faExpand
} from '@fortawesome/free-solid-svg-icons';
import { calculateAge, calculateCatToHumanAge, formatDate, getLifeStage, getDaysUntilBirthday } from '../utils';

export default function PetDetailModal({ pet, allPets = [], dateFormat = 'en', isOpen, onClose, onEdit, onOpenMemorial, onOpenHealth, onOpenFamily, onSelectPet, onViewImage }) {
  if (!isOpen || !pet) return null;

  const isDeceased = pet.status === 'deceased';
  // 🐾 Continuous age counting from birthdate until today for all pets
  const age = calculateAge(pet.birthDate);
  // 🌈 For deceased pets, summarize their earthly lifespan (how old they were at passing)
  const lifespan = isDeceased && pet.deceasedDate 
    ? calculateAge(pet.birthDate, pet.deceasedDate)
    : null;
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const lifeStage = getLifeStage(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : null;

  // Resolved relationships (including multi-generation kinships like ตา ยาย หลาน เหลน ทวด)
  const sourceRels = pet.resolvedRelationships || pet.relationships || [];
  const relations = sourceRels.map(r => {
    const target = allPets.find(p => p.id === r.targetPetId);
    return target ? { ...r, target, targetName: target.name, targetGender: target.gender, targetAvatar: target.avatar } : null;
  }).filter(Boolean);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slideUpSheet sm:animate-scaleUp pb-[env(safe-area-inset-bottom)] relative"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-white/60 rounded-full mx-auto my-2.5 sm:hidden absolute top-0 inset-x-0 z-30 pointer-events-none" />
        
        {/* Header with Hero preview */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 flex-shrink-0">
          {pet.avatar ? (
            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-paw-100 text-paw-400">
              <FontAwesomeIcon icon={faPaw} className="text-5xl" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mitr text-3xl font-medium text-white tracking-wide drop-shadow-md">
                  {pet.name}
                </h2>
                <FontAwesomeIcon 
                  icon={pet.gender === 'female' ? faVenus : faMars} 
                  className={`text-lg drop-shadow-md ${
                    pet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'
                  }`} 
                />
              </div>

              {/* Self-explanatory Icon Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                  isDeceased ? 'bg-sky-500/80 text-white' : 'bg-emerald-500/80 text-white'
                }`}>
                  <FontAwesomeIcon icon={isDeceased ? faRainbow : faSeedling} className="text-[10px]" />
                  <span>{isDeceased ? 'ดาวแมว' : 'อยู่ด้วยกัน'}</span>
                </span>

                {pet.neutered && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium inline-flex items-center gap-1">
                    <FontAwesomeIcon icon={faScissors} className="text-[9px]" />
                    <span>ทำหมัน</span>
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium inline-flex items-center gap-1">
                  <FontAwesomeIcon icon={lifeStage.icon} className="text-[9px]" />
                  <span>{lifeStage.label}</span>
                </span>
              </div>
            </div>

            {/* Quick Edit button */}
            <button
              onClick={() => {
                onClose();
                onEdit(pet);
              }}
              className="w-10 h-10 rounded-full bg-paw-500 hover:bg-paw-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
              title="แก้ไข"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* 📅 Dates & Age Metrics Grid (Icon-led, Zero Redundant Labels) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-paw-100/80 text-paw-600 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">{formatDate(pet.birthDate, dateFormat)}</div>
                {!isDeceased ? (
                  <div className="text-[11px] text-paw-600 font-semibold flex items-center gap-1 mt-0.5">
                    <FontAwesomeIcon icon={faCakeCandles} className="text-[10px]" />
                    <span>{daysUntilBday === 0 ? 'วันนี้!' : `อีก ${daysUntilBday} วัน`}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {formatDate(pet.deceasedDate, dateFormat)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDeceased ? 'bg-amber-100 text-amber-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <FontAwesomeIcon icon={isDeceased ? faRainbow : faWandMagicSparkles} className="text-sm" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 truncate">
                  {age.years > 0 ? `${age.years}y ` : ''}{age.months > 0 ? `${age.months}m ` : ''}{age.days}d
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono font-semibold tracking-tight truncate">
                  {isDeceased && lifespan 
                    ? `ช่วงชีวิต ${lifespan.years}y ${lifespan.months}m ${lifespan.days}d`
                    : `~${humanAge}y human`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Hub */}
          <div className="grid grid-cols-2 gap-2.5">
            {!isDeceased ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenHealth(pet);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-paw-50/50 border border-slate-200/80 hover:border-paw-200 text-left transition-all active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faWeightScale} className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Health Log</div>
                  <div className="text-[11px] text-paw-600 font-semibold truncate">
                    {pet.latestWeight ? `${pet.latestWeight} kg` : 'Weight • Vaccine'}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenMemorial(pet);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200/80 text-left transition-all active:scale-98"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <FontAwesomeIcon icon={faFire} className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Memorial</div>
                  <div className="text-[11px] text-amber-700 font-medium truncate">Candle • Letters</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenFamily();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 text-left transition-all active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faSitemap} className="text-sm" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800">Family Tree</div>
                <div className="text-[11px] text-blue-600 font-semibold">{relations.length} relatives</div>
              </div>
            </button>
          </div>

          {/* 🔗 Relationships Pill Grid (Tap any relative to switch to their profile) */}
          {relations.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {relations.map((rel, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => onSelectPet && onSelectPet(rel.target)}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-paw-50/40 border border-slate-100 hover:border-paw-200 cursor-pointer transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-paw-50 border border-paw-200 flex-shrink-0 flex items-center justify-center">
                      {rel.targetAvatar ? (
                        <img src={rel.targetAvatar} alt={rel.targetName} className="w-full h-full object-cover" />
                      ) : (
                        <FontAwesomeIcon icon={faPaw} className="text-paw-400 text-xs" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-mitr font-medium text-xs text-slate-800 truncate">{rel.targetName}</span>
                        <FontAwesomeIcon 
                          icon={rel.targetGender === 'female' ? faVenus : faMars} 
                          className={`text-[10px] flex-shrink-0 ${
                            rel.targetGender === 'female' ? 'text-pink-400' : 'text-sky-400'
                          }`} 
                        />
                      </div>
                      <div className="text-[10px] text-paw-600 font-semibold truncate">
                        {rel.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {pet.note && (
            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-slate-600 leading-relaxed">
              "{pet.note}"
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
