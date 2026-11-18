import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPenToSquare, faWeightScale, faFire, faSitemap, 
  faCalendarDays, faVenus, faMars, faLink,
  faPaw, faScissors, faRainbow, faSeedling, faCakeCandles, faInfinity, faExpand
} from '@fortawesome/free-solid-svg-icons';
import { calculateAge, calculateCatToHumanAge, formatDate, getLifeStage, getDaysUntilBirthday, getHumanAgeIcon } from '../utils';
import { getPhotoSrc, getPhotoThumb } from '../imageUtils';
import { useSheetDrag } from '../useSheetDrag';

export default function PetDetailModal({ pet, allPets = [], dateFormat = 'en', isOpen, onClose, onEdit, onOpenMemorial, onOpenHealth, onOpenFamily, onSelectPet, onViewImage }) {
  const {
    isVisible,
    activeData: activePet,
    requestClose,
    scrollRef,
    isDraggingSheet,
    backdropAnimationClass,
    sheetAnimationClass,
    handleProps,
    sheetProps
  } = useSheetDrag(onClose, isOpen, pet);
  const [activePhotoIdx, setActivePhotoIdx] = React.useState(0);
  const touchStartPosRef = React.useRef({ x: 0, y: 0 });
  const isSwipingRef = React.useRef(false);

  const currentPet = pet || activePet;

  React.useEffect(() => {
    setActivePhotoIdx(0);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [currentPet?.id, isOpen]);

  // Multi-photo list (must be declared before early return to satisfy Rules of Hooks)
  const photos = React.useMemo(() => {
    if (!currentPet) return ['/avatars/chainoi.png'];
    const list = [];
    const mainSrc = getPhotoSrc(currentPet.avatar);
    if (mainSrc) list.push(mainSrc);
    if (Array.isArray(currentPet.photos)) {
      currentPet.photos.forEach(p => {
        const src = getPhotoSrc(p);
        if (src && !list.includes(src)) list.push(src);
      });
    }
    return list.length > 0 ? list : ['/avatars/chainoi.png'];
  }, [currentPet]);

  if (!isVisible || !currentPet) return null;

  const isDeceased = currentPet.status === 'deceased';
  // 🐾 Continuous age counting from birthdate until today for all pets
  const age = calculateAge(currentPet.birthDate);
  // 🌈 For deceased pets, summarize their earthly lifespan (how old they were at passing)
  const lifespan = isDeceased && currentPet.deceasedDate 
    ? calculateAge(currentPet.birthDate, currentPet.deceasedDate)
    : null;
  // ⏳ How long they have been gone (from deceasedDate to today)
  const timeSincePassing = isDeceased && currentPet.deceasedDate
    ? calculateAge(currentPet.deceasedDate)
    : null;
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const lifeStage = getLifeStage(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(currentPet.birthDate) : null;

  // Resolved relationships (including multi-generation kinships like ตา ยาย หลาน เหลน ทวด)
  const sourceRels = currentPet.resolvedRelationships || currentPet.relationships || [];
  const relations = sourceRels.map(r => {
    const target = allPets.find(p => p.id === r.targetPetId);
    return target ? { 
      ...r, 
      target, 
      targetName: target.name, 
      targetGender: target.gender, 
      targetAvatar: getPhotoThumb(target.avatarThumb || target.avatar) 
    } : null;
  }).filter(Boolean);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isSwipingRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!e.touches || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - touchStartPosRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartPosRef.current.y;
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    const deltaX = e.changedTouches[0].clientX - touchStartPosRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPosRef.current.y;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      isSwipingRef.current = true;
    }

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (photos.length > 1) {
        if (deltaX < 0) {
          // Swipe Left -> Next
          setActivePhotoIdx(prev => (prev + 1) % photos.length);
        } else {
          // Swipe Right -> Prev
          setActivePhotoIdx(prev => (prev - 1 + photos.length) % photos.length);
        }
      }
    }
  };

  const handleClickHero = () => {
    if (isSwipingRef.current || isDraggingSheet) {
      isSwipingRef.current = false;
      return;
    }
    if (onViewImage) onViewImage(currentPet);
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md rounded-t-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] ${sheetAnimationClass} pb-[var(--safe-bottom)] relative overscroll-contain`}
      >
        {/* Header with Hero preview - Pinned at top of modal, swipe left/right to change photo */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClickHero}
          className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer group select-none"
          title="แตะเพื่อดูรูปขนาดเต็ม หรือปัดซ้ายขวาเพื่อเปลี่ยนรูป"
        >
          {/* Pull Handle Grab Zone (Touch & Mouse draggable to close) */}
          <div
            {...handleProps}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 left-14 right-14 h-10 z-30 flex items-start justify-center pt-2.5 cursor-grab active:cursor-grabbing select-none"
            title="ลากลงเพื่อปิด"
          >
            <div className="w-12 h-1.5 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors" />
          </div>

          {photos.length > 0 ? (
            photos.map((src, idx) => (
              <img 
                key={`${src}-${idx}`}
                src={src} 
                alt={currentPet.name} 
                draggable={false}
                className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform transition-opacity duration-500 ease-out ${
                  idx === activePhotoIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`} 
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-paw-100 text-paw-400">
              <FontAwesomeIcon icon={faPaw} className="text-5xl" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none z-10" />

          {/* Quick expand full image button */}
          <div className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 text-white backdrop-blur-md group-hover:bg-black/60 flex items-center justify-center transition-colors pointer-events-none z-20">
            <FontAwesomeIcon icon={faExpand} className="text-sm" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              requestClose();
            }}
            aria-label="Close details"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none z-30"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>

          {/* Minimal Circle Dots Indicator - ALWAYS VISIBLE, centered at bottom of image */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-2 py-0.5 rounded-full pointer-events-none shadow-xs">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-[width,background-color] duration-200 [transition-timing-function:var(--ease-out)] ${
                    idx === activePhotoIdx
                      ? 'bg-white shadow-xs'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Name overlay */}
          <div 
            className="absolute bottom-3.5 left-5 right-5 z-20 flex items-end justify-between pointer-events-none gap-2"
          >
            <div className="max-w-[80%] min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-mitr text-2xl sm:text-3xl font-medium text-white tracking-wide drop-shadow-md truncate">
                  {currentPet.name}
                </h2>
                <FontAwesomeIcon 
                  icon={currentPet.gender === 'female' ? faVenus : faMars} 
                  className={`text-base sm:text-lg drop-shadow-md flex-shrink-0 ${
                    currentPet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'
                  }`} 
                />
              </div>

              {/* Self-explanatory Icon Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 w-full">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                  isDeceased ? 'bg-sky-500/80 text-white' : 'bg-emerald-500/80 text-white'
                }`}>
                  <FontAwesomeIcon icon={isDeceased ? faRainbow : faSeedling} className="text-[10px]" />
                  <span>{isDeceased ? 'ดาวแมว' : 'อยู่ด้วยกัน'}</span>
                </span>

                {currentPet.neutered && (
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(currentPet);
              }}
              className="w-10 h-10 rounded-full bg-paw-500 hover:bg-paw-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform pointer-events-auto"
              title="แก้ไข"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div
          ref={scrollRef}
          className="p-5 pb-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y"
        >

          {/* 📅 Dates & Age Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-paw-100/80 text-paw-600 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={faCalendarDays} className="text-xs sm:text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">{formatDate(currentPet.birthDate, dateFormat)}</div>
                {!isDeceased ? (
                  <div className="text-[11px] text-paw-600 font-semibold flex items-center gap-1 mt-0.5 truncate">
                    <FontAwesomeIcon icon={faCakeCandles} className="text-[10px] flex-shrink-0" />
                    <span className="truncate">{daysUntilBday === 0 ? 'วันนี้!' : `อีก ${daysUntilBday} วัน`}</span>
                  </div>
                ) : (
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                    <div className="truncate">{formatDate(currentPet.deceasedDate, dateFormat)}</div>
                    {lifespan && (
                      <div className="text-amber-600 font-semibold truncate mt-0.5">
                        อายุขัย {lifespan.years > 0 ? `${lifespan.years}y ` : ''}{lifespan.months > 0 ? `${lifespan.months}m ` : ''}{lifespan.days}d
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon icon={isDeceased ? faRainbow : getHumanAgeIcon(humanAge)} className="text-xs sm:text-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-base font-sans font-bold text-slate-800 truncate inline-flex items-baseline leading-none">
                  {age.years > 0 && (
                    <span className="text-paw-600 font-mitr font-semibold text-xl sm:text-2xl inline-flex items-baseline mr-1">
                      {age.years}<span className="text-[9px] sm:text-[10px] font-sans font-normal text-paw-400 lowercase ml-0.5">y</span>
                    </span>
                  )}
                  <span className="text-slate-800 font-mitr font-semibold inline-flex items-baseline mr-1">
                    {age.months || 0}<span className="text-[9px] sm:text-[10px] font-sans font-normal text-slate-400 lowercase ml-0.5">m</span>
                  </span>
                  <span className="text-slate-800 font-mitr font-semibold inline-flex items-baseline">
                    {age.days}<span className="text-[9px] sm:text-[10px] font-sans font-normal text-slate-400 lowercase ml-0.5">d</span>
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 font-sans font-semibold truncate">
                  {isDeceased && timeSincePassing 
                    ? `🌈 ดาวแมว ${timeSincePassing.years}y ${timeSincePassing.months}m ${timeSincePassing.days}d`
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
                  onOpenHealth(currentPet);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-paw-50/50 border border-slate-200/80 hover:border-paw-200 text-left transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faWeightScale} className="text-sm" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">Health Log</div>
                  <div className="text-[11px] text-paw-600 font-semibold truncate">
                    {currentPet.latestWeight ? `${currentPet.latestWeight} kg` : 'Weight • Vaccine'}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenMemorial(currentPet);
                }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200/80 text-left transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
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
                onOpenFamily();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 text-left transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
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
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectPet && onSelectPet(rel.target)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectPet && onSelectPet(rel.target);
                      }
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 hover:bg-paw-50/40 border border-slate-100 hover:border-paw-200 cursor-pointer transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
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
          {currentPet.note && (
            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-slate-600 leading-relaxed">
              "{currentPet.note}"
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
