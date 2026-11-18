import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPlus, faPaw, faImages, faLayerGroup, 
  faCheck, faVenus, faMars, faCloudArrowUp, faTrashCan
} from '@fortawesome/free-solid-svg-icons';
import { getPhotoThumb, getPhotoSrc } from '../imageUtils';
import { useSheetDrag } from '../useSheetDrag';

export default function SharedPhotosModal({
  isOpen,
  onClose,
  incomingPhotos = [],
  pets = [],
  onAddNewPetWithPhotos,
  onAddPhotosToExistingPet
}) {
  const {
    isVisible,
    requestClose,
    scrollRef,
    backdropAnimationClass,
    sheetAnimationClass,
    handleProps,
    sheetProps
  } = useSheetDrag(onClose, isOpen);

  const [photosList, setPhotosList] = useState(incomingPhotos);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Sync incoming photos when prop changes
  React.useEffect(() => {
    if (incomingPhotos && incomingPhotos.length > 0) {
      setPhotosList(incomingPhotos);
      setSelectedPetId(null);
      setIsAdding(false);
    }
  }, [incomingPhotos]);

  if (!isVisible || photosList.length === 0) return null;

  const handleRemovePhoto = (idxToRemove) => {
    const updated = photosList.filter((_, idx) => idx !== idxToRemove);
    if (updated.length === 0) {
      requestClose();
    } else {
      setPhotosList(updated);
    }
  };

  const handleCreateNew = () => {
    requestClose();
    if (onAddNewPetWithPhotos) {
      onAddNewPetWithPhotos(photosList);
    }
  };

  const handleAddToPet = async (pet) => {
    if (isAdding) return;
    setIsAdding(true);
    setSelectedPetId(pet.id);
    
    // Add photos to the selected pet
    if (onAddPhotosToExistingPet) {
      await onAddPhotosToExistingPet(pet.id, photosList);
    }
    
    setTimeout(() => {
      setIsAdding(false);
      requestClose();
    }, 280);
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md max-h-[92dvh] sm:max-h-[88vh] rounded-t-[32px] bg-white shadow-2xl overflow-hidden flex flex-col ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle Grab Zone */}
        <div 
          {...handleProps} 
          className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/70"
          title="ลากลงเพื่อปิด"
        >
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-paw-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <FontAwesomeIcon icon={faImages} className="text-sm" />
            </div>
            <div>
              <h2 className="font-mitr text-lg font-medium text-slate-800 leading-tight">
                นำเข้ารูปภาพใหม่
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                พบรูปภาพ {photosList.length} รูป
              </p>
            </div>
          </div>

          <button
            onClick={requestClose}
            aria-label="Close"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150 [transition-timing-function:var(--ease-out)] active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          ref={scrollRef}
          className="p-5 space-y-4 overflow-y-auto overscroll-y-contain touch-pan-y flex-1"
        >
          {/* 🖼️ 1. Incoming Photos Preview Strip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-0.5">
              <span>รูปที่เลือก ({photosList.length} รูป)</span>
              <span className="text-[11px] text-slate-400 font-normal">แตะกากบาทเพื่อลบออก</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar touch-pan-x">
              {photosList.map((photo, idx) => {
                const thumbSrc = getPhotoThumb(photo) || getPhotoSrc(photo);
                return (
                  <div 
                    key={idx}
                    className="relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-paw-200/90 shadow-2xs group bg-slate-100"
                  >
                    <img 
                      src={thumbSrc} 
                      alt={`Shared photo ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px] active:scale-90 transition-transform shadow-xs"
                      title="ลบรูปนี้"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-paw-600/90 text-white text-[9px] font-bold rounded-md shadow-2xs">
                        ปก
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200/80"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              เลือกปลายทาง
            </span>
            <div className="flex-grow border-t border-slate-200/80"></div>
          </div>

          {/* 🐾 Option A: Create New Pet Profile */}
          <button
            type="button"
            onClick={handleCreateNew}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-paw-50 to-amber-50 hover:from-paw-100/70 hover:to-amber-100/70 border-2 border-paw-300/80 flex items-center justify-between transition-colors transition-transform duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none text-left shadow-xs group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-paw-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-paw-500/25 group-hover:scale-105 transition-transform duration-150">
                <FontAwesomeIcon icon={faPlus} className="text-base" />
              </div>
              <div className="min-w-0">
                <div className="font-mitr font-medium text-sm text-slate-900 leading-tight">
                  สร้างเป็นน้องแมวตัวใหม่ (New Pet)
                </div>
                <div className="text-[11px] text-paw-700 mt-0.5 truncate">
                  สร้างโปรไฟล์ใหม่โดยใช้รูปนี้เป็นภาพหลัก
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-paw-600 bg-white/90 px-2.5 py-1 rounded-full border border-paw-200/80 shadow-2xs flex-shrink-0">
              สร้างใหม่
            </span>
          </button>

          {/* 🐱 Option B: Add to Existing Pet */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-0.5">
              <span>เพิ่มให้น้องแมวที่มีอยู่แล้ว ({pets.length} ตัว):</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {pets.map((pet) => {
                const avatarSrc = getPhotoThumb(pet.avatarThumb || pet.avatar) || getPhotoSrc(pet.avatar);
                const currentCount = Array.isArray(pet.photos) ? pet.photos.length : (pet.avatar ? 1 : 0);
                const isSelected = selectedPetId === pet.id;
                const isDeceased = pet.status === 'deceased';

                return (
                  <button
                    key={pet.id}
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddToPet(pet)}
                    className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition-colors transition-transform duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none text-left ${
                      isSelected
                        ? 'bg-paw-100 border-paw-500 shadow-xs'
                        : isDeceased
                          ? 'bg-sky-50/50 hover:bg-sky-50 border-sky-200/80'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-paw-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/80 relative">
                        {avatarSrc ? (
                          <img 
                            src={avatarSrc} 
                            alt={pet.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-paw-50 text-paw-400">
                            <FontAwesomeIcon icon={faPaw} className="text-sm" />
                          </div>
                        )}
                        {/* Status tag */}
                        {isDeceased && (
                          <div className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded-full bg-black/50 text-[8px] text-white">
                            🌈
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mitr font-medium text-sm text-slate-800 truncate">
                            {pet.name}
                          </span>
                          <FontAwesomeIcon 
                            icon={pet.gender === 'female' ? faVenus : faMars} 
                            className={`text-xs flex-shrink-0 ${
                              pet.gender === 'female' ? 'text-pink-400' : 'text-sky-400'
                            }`} 
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                          มีอยู่แล้ว {currentCount} รูป • เพิ่มอีก {photosList.length} รูป
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Pill */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-paw-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-paw-50 hover:text-paw-700'
                    }`}>
                      {isSelected ? (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
                          <span>กำลังบันทึก...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                          <span>เพิ่มรูป</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
