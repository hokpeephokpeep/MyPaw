import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faCheck, faForward
} from '@fortawesome/free-solid-svg-icons';
import { processImageWithFocus, formatBytes, estimateDataUrlBytes } from '../imageUtils';

export default function ImageCropModal({
  isOpen,
  imageItem, // { dataUrl, file, originalSize }
  queueIndex = 0,
  queueTotal = 1,
  onConfirm, // (processedResult) => void
  onSkip, // () => void
  onClose // () => void
}) {
  if (!isOpen || !imageItem) return null;

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const zoomStartRef = useRef(1);

  const dataUrl = imageItem.dataUrl || imageItem.src || imageItem;
  const originalBytes = imageItem.file?.size || estimateDataUrlBytes(dataUrl);

  // Focus Frame size (1:1 square matching the PetCard hero)
  const FRAME_SIZE = 250;

  // Load natural dimensions
  useEffect(() => {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      // Reset controls
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = dataUrl;
  }, [dataUrl]);

  // Effective image size based on rotation
  const isPerpendicular = rotation % 180 !== 0;
  const effectiveW = isPerpendicular ? naturalSize.height : naturalSize.width;
  const effectiveH = isPerpendicular ? naturalSize.width : naturalSize.height;

  // Calculate clamp boundaries
  const baseScale = effectiveW && effectiveH 
    ? Math.max(FRAME_SIZE / effectiveW, FRAME_SIZE / effectiveH)
    : 1;
  const currentScale = baseScale * zoom;
  const renderedW = effectiveW * currentScale;
  const renderedH = effectiveH * currentScale;
  const maxPanX = Math.max(0, (renderedW - FRAME_SIZE) / 2);
  const maxPanY = Math.max(0, (renderedH - FRAME_SIZE) / 2);

  // Clamp pan when zoom or dimensions change
  useEffect(() => {
    setPan(prev => ({
      x: Math.max(-maxPanX, Math.min(maxPanX, prev.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, prev.y))
    }));
  }, [maxPanX, maxPanY]);

  // Touch and mouse handlers for dragging focus area
  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    isDraggingRef.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: clientX, y: clientY };
    panStartRef.current = { ...pan };

    if (e.touches && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistRef.current = Math.hypot(dx, dy);
      zoomStartRef.current = zoom;
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    if (e.touches && e.touches.length === 2 && pinchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const scaleMultiplier = currentDist / pinchStartDistRef.current;
      const newZoom = Math.max(1, Math.min(3, zoomStartRef.current * scaleMultiplier));
      setZoom(Number(newZoom.toFixed(2)));
      return;
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    const nextX = Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX));
    const nextY = Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY));
    setPan({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    pinchStartDistRef.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom(prev => Math.max(1, Math.min(3, parseFloat((prev + zoomStep).toFixed(2)))));
  };

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await processImageWithFocus({
        imageSource: dataUrl,
        focusParams: {
          panX: pan.x,
          panY: pan.y,
          zoom,
          frameSize: FRAME_SIZE
        },
        rotation
      });

      onConfirm({
        ...result,
        originalSizeBytes: originalBytes
      });
    } catch (err) {
      console.error('Error processing focus image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn"
      onPointerUp={handlePointerUp}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 font-sans leading-tight">
              เพิ่มรูป
            </h2>
            {queueTotal > 1 && (
              <span className="bg-paw-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full">
                {queueIndex + 1}/{queueTotal}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Viewport Area */}
        <div 
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onWheel={handleWheel}
          className="relative bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing h-[300px]"
          style={{ touchAction: 'none' }}
        >
          {/* Square Focus Frame (Matches Card Viewport) */}
          <div 
            className="relative overflow-hidden shadow-2xl border-2 border-white/95 rounded-3xl z-10 pointer-events-none"
            style={{ width: `${FRAME_SIZE}px`, height: `${FRAME_SIZE}px` }}
          >
            {/* Render Image inside focus frame */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: `${effectiveW}px`,
                height: `${effectiveH}px`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${currentScale})`,
                transformOrigin: 'center center',
                transition: isDraggingRef.current ? 'none' : 'transform 0.08s ease-out'
              }}
            >
              <img
                src={dataUrl}
                alt="Focus preview"
                className="w-full h-full pointer-events-none select-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>

            {/* Rule of Thirds Guide Grid */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Corner guides */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none" />
          </div>

          {/* Dimmed surrounding background */}
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 active:scale-95 transition-transform"
          >
            ยกเลิก
          </button>

          <div className="flex items-center gap-2">
            {queueTotal > 1 && onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-3.5 py-2.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                <span>ข้ามรูปนี้</span>
                <FontAwesomeIcon icon={faForward} className="text-[10px]" />
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isProcessing ? 'กำลังประมวลผล...' : 'ตกลง'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
