import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
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

  // Vertical Swipe & Touch Tracking State (1:1 with finger, preserves native Android back gesture on horizontal edges)
  const trackRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const startYRef = useRef(0);
  const deltaYRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  // Reset index when active pet changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentPet?.id]);

  // Sync transform when currentIndex changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 280ms cubic-bezier(0.23, 1, 0.32, 1)';
      trackRef.current.style.transform = `translateY(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  // Keyboard navigation (ArrowUp / ArrowDown / ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setCurrentIndex(prev => Math.min(photoList.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        requestClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photoList.length, requestClose]);

  if (!isVisible || !currentPet) return null;

  const currentPhoto = photoList[currentIndex] || getPhotoSrc(currentPet.avatar);

  const handleDownload = (e) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = currentPhoto;
    a.download = `${currentPet.name}-${currentIndex + 1}.png`;
    a.click();
  };

  // Direct 1:1 Vertical Touch & Gesture handlers
  const handlePointerStart = (clientY) => {
    isPointerDownRef.current = true;
    startYRef.current = clientY;
    deltaYRef.current = 0;
    startTimeRef.current = Date.now();

    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (clientY, e) => {
    if (!isPointerDownRef.current) return;
    const currentDeltaY = clientY - startYRef.current;

    // Prevent vertical page scroll while dragging photos
    if (Math.abs(currentDeltaY) > 4 && e?.cancelable) {
      e.preventDefault();
    }

    let effectiveDeltaY = currentDeltaY;
    // Rubber-band resistance at top and bottom boundaries (0.28 factor)
    const isAtTop = currentIndex === 0 && currentDeltaY > 0;
    const isAtBottom = currentIndex === photoList.length - 1 && currentDeltaY < 0;
    if (isAtTop || isAtBottom || photoList.length <= 1) {
      effectiveDeltaY = currentDeltaY * 0.28;
    }

    deltaYRef.current = effectiveDeltaY;

    // 1:1 direct style write for 60fps / 120fps tracking
    if (trackRef.current) {
      const basePercent = -currentIndex * 100;
      trackRef.current.style.transform = `translateY(calc(${basePercent}% + ${effectiveDeltaY}px))`;
    }
  };

  const handlePointerEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const elapsed = Date.now() - startTimeRef.current;
    const dy = deltaYRef.current;

    // Vertical slide transition decision: swipe up = next photo, swipe down = prev photo
    const threshold = Math.min(window.innerHeight * 0.12, 50);
    const isFlick = elapsed < 280 && Math.abs(dy) > 25;

    let targetIndex = currentIndex;
    if ((dy < -threshold || (isFlick && dy < 0)) && currentIndex < photoList.length - 1) {
      targetIndex = currentIndex + 1; // Dragged UP -> Next photo below
    } else if ((dy > threshold || (isFlick && dy > 0)) && currentIndex > 0) {
      targetIndex = currentIndex - 1; // Dragged DOWN -> Prev photo above
    }

    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 260ms cubic-bezier(0.23, 1, 0.32, 1)';
      trackRef.current.style.transform = `translateY(-${targetIndex * 100}%)`;
    }

    if (targetIndex !== currentIndex) {
      setCurrentIndex(targetIndex);
    }
  };

  // Mouse wheel navigation on desktop
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 260) return;
    if (Math.abs(e.deltaY) > 20) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        setCurrentIndex(prev => Math.min(photoList.length - 1, prev + 1));
      } else {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    }
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-between bg-black/95 px-4 pt-[max(2.75rem,calc(var(--safe-top,0px)+1.5rem))] pb-[max(1.5rem,calc(var(--safe-bottom,0px)+1rem))] backdrop-blur-md overscroll-contain select-none ${backdropAnimationClass}`}
    >
      {/* 🛡️ Close Button: Guaranteed Safe-Zone distance from Notification Bar & Status Bar */}
      <button
        onClick={requestClose}
        aria-label="Close"
        style={{
          top: 'max(1.5rem, calc(var(--safe-top, 0px) + 1rem))',
          right: 'max(1.25rem, calc(env(safe-area-inset-right, 0px) + 1rem))'
        }}
        className="absolute w-11 h-11 text-white/80 hover:text-white bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-150 ease-out active:scale-95 border border-white/20 shadow-xl focus-visible:ring-2 focus-visible:ring-white outline-none z-30"
        title="ปิดหน้าต่าง"
      >
        <FontAwesomeIcon icon={faXmark} className="text-lg" />
      </button>

      {/* Main Image Slider Container (Vertical 1:1 Swipe Surface) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`flex-1 flex flex-col items-center justify-center max-w-lg w-full ${sheetAnimationClass} relative overflow-hidden`}
      >
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-[68vh] sm:h-[72vh] w-full flex items-center bg-black cursor-grab active:cursor-grabbing select-none"
          onTouchStart={(e) => handlePointerStart(e.touches[0].clientY)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientY, e)}
          onTouchEnd={handlePointerEnd}
          onTouchCancel={handlePointerEnd}
          onMouseDown={(e) => handlePointerStart(e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientY, e)}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onWheel={handleWheel}
        >
          {/* 1:1 Vertical Multi-Photo Track (Swipe Up/Down) */}
          <div
            ref={trackRef}
            className="flex flex-col w-full h-full will-change-transform"
            style={{
              transform: `translateY(-${currentIndex * 100}%)`,
              transition: 'transform 280ms cubic-bezier(0.23, 1, 0.32, 1)'
            }}
          >
            {photoList.map((photoSrc, idx) => (
              <div 
                key={idx} 
                className="w-full h-full flex-shrink-0 flex items-center justify-center bg-black p-2"
              >
                <img
                  src={photoSrc}
                  alt={`${currentPet.name} - รูปที่ ${idx + 1}`}
                  draggable={false}
                  className="w-full h-full object-contain max-h-[66vh] sm:max-h-[70vh] rounded-2xl pointer-events-none select-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Controls & Pet Title */}
        <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
          <div className="flex items-center gap-2.5">
            <h3 className="font-mitr text-xl font-medium tracking-wide drop-shadow-md">
              {currentPet.name}
            </h3>
            {photoList.length > 1 && (
              <span className="text-xs text-white/70 bg-white/15 px-2.5 py-0.5 rounded-full font-mono font-medium backdrop-blur-xs">
                {currentIndex + 1} / {photoList.length}
              </span>
            )}
          </div>

          {/* Bottom Dots Indicator (Clickable) */}
          {photoList.length > 1 && (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xs">
              {photoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`rounded-full transition-all duration-200 [transition-timing-function:var(--ease-out)] active:scale-90 ${
                    idx === currentIndex
                      ? 'w-4 h-2 bg-white shadow-xs'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                  title={`รูปที่ ${idx + 1}`}
                  aria-label={`ไปที่รูปที่ ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all shadow-xs border border-white/10"
            title="ดาวน์โหลดรูป"
            aria-label="ดาวน์โหลดรูป"
          >
            <FontAwesomeIcon icon={faDownload} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
