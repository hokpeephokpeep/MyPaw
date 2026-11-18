import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faCheck, faForward, faMagnifyingGlassMinus, faMagnifyingGlassPlus, faRotateRight
} from '@fortawesome/free-solid-svg-icons';
import { processImageWithFocus, estimateDataUrlBytes } from '../imageUtils';
import { useSheetDrag } from '../useSheetDrag';

export default function ImageCropModal({
  isOpen,
  imageItem, // { dataUrl, file, originalSize }
  queueIndex = 0,
  queueTotal = 1,
  onConfirm, // (processedResult) => void
  onSkip, // () => void
  onClose // () => void
}) {
  const {
    isVisible,
    activeData: activeImageItem,
    requestClose,
    backdropAnimationClass,
    sheetAnimationClass,
    sheetProps
  } = useSheetDrag(onClose, Boolean(isOpen && imageItem), imageItem);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(null);
  const pinchStartMidRef = useRef({ x: 0, y: 0 });
  const zoomStartRef = useRef(1);

  const currentItem = imageItem || activeImageItem;
  const dataUrl = currentItem ? (currentItem.dataUrl || currentItem.src || currentItem) : '';
  const originalBytes = currentItem?.file?.size || estimateDataUrlBytes(dataUrl);

  // Larger 1:1 Focus Frame so the preview is big and clear on mobile & desktop
  const FRAME_SIZE = 300;

  // Load natural dimensions & restore previous focus if re-editing
  useEffect(() => {
    if (!isOpen || !dataUrl) return;
    const savedFocus = currentItem?.focus;
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(savedFocus?.zoom || 1);
      setPan({ x: savedFocus?.panX || 0, y: savedFocus?.panY || 0 });
      setRotation(savedFocus?.rotation || 0);
    };
    img.src = dataUrl;
  }, [isOpen, dataUrl]);

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

  if (!isVisible || !currentItem) return null;

  // 🖐️ Touch Handlers (1-finger pan + 2-finger pinch-to-zoom)
  const handleTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    e.stopPropagation();
    setIsInteracting(true);

    if (e.touches.length >= 2) {
      isDraggingRef.current = true;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      pinchStartDistRef.current = Math.max(10, Math.hypot(dx, dy));
      pinchStartMidRef.current = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2
      };
      zoomStartRef.current = zoom;
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 1) {
      isDraggingRef.current = true;
      pinchStartDistRef.current = null;
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();

    if (e.touches.length >= 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      const currentDist = Math.max(10, Math.hypot(dx, dy));
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;

      if (!pinchStartDistRef.current) {
        pinchStartDistRef.current = currentDist;
        pinchStartMidRef.current = { x: midX, y: midY };
        zoomStartRef.current = zoom;
        panStartRef.current = { ...pan };
        return;
      }

      const scaleMultiplier = currentDist / pinchStartDistRef.current;
      const newZoom = Math.max(1, Math.min(3.5, zoomStartRef.current * scaleMultiplier));
      const nextScale = baseScale * newZoom;
      const nextMaxPanX = Math.max(0, (effectiveW * nextScale - FRAME_SIZE) / 2);
      const nextMaxPanY = Math.max(0, (effectiveH * nextScale - FRAME_SIZE) / 2);

      const moveX = midX - pinchStartMidRef.current.x;
      const moveY = midY - pinchStartMidRef.current.y;

      setZoom(Number(newZoom.toFixed(2)));
      setPan({
        x: Math.max(-nextMaxPanX, Math.min(nextMaxPanX, panStartRef.current.x + moveX)),
        y: Math.max(-nextMaxPanY, Math.min(nextMaxPanY, panStartRef.current.y + moveY))
      });
      return;
    }

    if (e.touches.length === 1 && !pinchStartDistRef.current) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const nextX = Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX));
      const nextY = Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY));
      setPan({ x: nextX, y: nextY });
    }
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    if (e.touches && e.touches.length === 1) {
      // Transition smoothly from 2-finger pinch back to 1-finger pan without jumping
      pinchStartDistRef.current = null;
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
      panStartRef.current = { ...pan };
    } else if (!e.touches || e.touches.length === 0) {
      isDraggingRef.current = false;
      pinchStartDistRef.current = null;
      setIsInteracting(false);
    }
  };

  // 🖱️ Mouse Handlers for Desktop
  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('input')) return;
    isDraggingRef.current = true;
    setIsInteracting(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX));
    const nextY = Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY));
    setPan({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsInteracting(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom(prev => Math.max(1, Math.min(3.5, parseFloat((prev + zoomStep).toFixed(2)))));
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
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 backdrop-blur-md overscroll-contain ${backdropAnimationClass}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={requestClose}
    >
      <div 
        {...sheetProps}
        className={`w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] border border-slate-200/80 ${sheetAnimationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 font-sans leading-tight">
              ปรับจุดโฟกัสรูปภาพ
            </h2>
            {queueTotal > 1 && (
              <span className="bg-paw-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                {queueIndex + 1}/{queueTotal}
              </span>
            )}
          </div>
          <button
            type="button"
            data-back-close="crop"
            onClick={requestClose}
            aria-label="ปิดหน้าต่าง"
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Viewport Area (Supports 2-Finger Pinch-to-Zoom & 1-Finger Drag) */}
        <div 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          className="relative bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing h-[340px]"
          style={{ touchAction: 'none' }}
        >
          {/* Square Focus Frame (Matches Card Viewport) */}
          <div 
            className="relative overflow-hidden shadow-2xl border-2 border-white/95 rounded-3xl z-10 pointer-events-none"
            style={{ width: `${FRAME_SIZE}px`, height: `${FRAME_SIZE}px` }}
          >
            {/* Render Image inside focus frame at exact target dimensions (prevents blurry CSS scale() rasterization) */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                width: `${renderedW}px`,
                height: `${renderedH}px`,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`
              }}
            >
              <img
                src={dataUrl}
                alt="Focus preview"
                className=" pointer-events-none select-none max-w-none"
                style={{
                  width: `${isPerpendicular ? renderedH : renderedW}px`,
                  height: `${isPerpendicular ? renderedW : renderedH}px`,
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

        {/* Zoom Slider & Rotate Bar */}
        <div className="px-5 py-2.5 bg-slate-900 text-white flex items-center gap-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(1, Number((prev - 0.25).toFixed(2))))}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs active:scale-90 transition-transform"
            aria-label="Zoom out"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          </button>

          <input
            type="range"
            min="1"
            max="3.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            aria-label="Zoom level"
            className="flex-1 accent-paw-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
          />

          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(3.5, Number((prev + 0.25).toFixed(2))))}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs active:scale-90 transition-transform"
            aria-label="Zoom in"
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
          </button>

          <span className="text-[11px] font-mono text-white/80 w-9 text-right tabular-nums">
            {zoom.toFixed(1)}x
          </span>

          <button
            type="button"
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs active:scale-90 transition-transform ml-1"
            title="หมุนรูป 90°"
            aria-label="Rotate image"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 pb-[max(0.875rem,var(--safe-bottom))]">
          <button
            type="button"
            onClick={requestClose}
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
              className="px-5 py-2.5 rounded-xl bg-paw-500 hover:bg-paw-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
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
