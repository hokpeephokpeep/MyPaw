import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { getPhotoSrc } from '../imageUtils';
import { useSheetDrag } from '../useSheetDrag';

export default function ImageViewerModal({ pet, onClose }) {
  const isOpen = Boolean(pet && (pet.avatar || (pet.photos && pet.photos.length > 0)));
  const {
    isVisible,
    activeData: activePet,
    requestClose,
    backdropAnimationClass,
    sheetAnimationClass,
    sheetProps
  } = useSheetDrag(onClose, isOpen, pet);

  const currentPet = pet || activePet;

  const photoList = React.useMemo(() => {
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

  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isVisible || !currentPet) return null;

  const currentPhoto = photoList[currentIndex] || getPhotoSrc(currentPet.avatar);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = currentPhoto;
    a.download = `${currentPet.name}-${currentIndex + 1}.png`;
    a.click();
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + photoList.length) % photoList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % photoList.length);
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overscroll-contain ${backdropAnimationClass}`}
    >
      {/* Close button */}
      <button
        onClick={requestClose}
        aria-label="Close"
        className="absolute top-5 right-5 w-10 h-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none z-20"
      >
        <FontAwesomeIcon icon={faXmark} className="text-lg" />
      </button>

      {/* Main Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`flex flex-col items-center max-w-lg w-full ${sheetAnimationClass} relative`}
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh] w-full flex items-center justify-center bg-black">
          <img
            src={currentPhoto}
            alt={currentPet.name}
            className="w-full h-auto object-contain max-h-[75vh] rounded-3xl"
          />

          {/* Navigation Arrows for multi-photo */}
          {photoList.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors transition-transform duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none"
                title="รูปก่อนหน้า"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors transition-transform duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none"
                title="รูปถัดไป"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
              </button>
            </>
          )}
        </div>

        {/* Footer controls & Title */}
        <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
          <div className="flex items-center gap-2.5">
            <h3 className="font-mitr text-xl font-medium">{currentPet.name}</h3>
            {photoList.length > 1 && (
              <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full font-mono">
                {currentIndex + 1} / {photoList.length}
              </span>
            )}
          </div>

          {/* Circle Dots Indicator */}
          {photoList.length > 1 && (
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {photoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-[background-color,transform] duration-200 [transition-timing-function:var(--ease-out)] active:scale-90 ${
                    idx === currentIndex
                      ? 'bg-white shadow-xs'
                      : 'bg-white/35 hover:bg-white/60'
                  }`}
                  title={`รูปที่ ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            title="ดาวน์โหลดรูป"
          >
            <FontAwesomeIcon icon={faDownload} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
