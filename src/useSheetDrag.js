import { useState, useRef, useEffect, useCallback } from 'react';

const SHEET_DURATION_MS = 340;
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';

/**
 * Vaul-inspired Bottom Sheet Lifecycle & Gesture Hook (follows .agents/skills/gestures & animate).
 * - TRACK phase: writes `transform` directly to `sheetRef.current` and linked `opacity` to
 *   `backdropRef.current` with ZERO React re-renders per pointermove (1:1 finger tracking).
 * - RELEASE / ENTER / EXIT phase: uses `--ease-drawer` (`cubic-bezier(0.32, 0.72, 0, 1)`) CSS
 *   transitions (never ease-in, never uninterruptible keyframes), so opening, closing, and
 *   mid-flight interruptions are always smooth.
 * - Dismisses on distance (>= 65px) OR flick velocity (> 0.11 px/ms).
 */
export function useSheetDrag(onClose, isOpen = true, data = null) {
  const sheetRef = useRef(null);
  const backdropRef = useRef(null);
  const scrollRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));
  const [isEntered, setIsEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const closingTimerRef = useRef(null);
  const enterRafRef = useRef(null);
  const cachedDataRef = useRef(data);
  if (data) {
    cachedDataRef.current = data;
  }

  const stateRef = useRef({
    active: false,
    startY: 0,
    startTime: 0,
    currentDragY: 0
  });

  // Synchronize open / external-close state transitions
  useEffect(() => {
    if (isOpen) {
      if (closingTimerRef.current) {
        clearTimeout(closingTimerRef.current);
        closingTimerRef.current = null;
      }
      setShouldRender(true);
      setIsClosing(false);
      // Trigger transition from translateY(100%) -> translateY(0) on next frame
      enterRafRef.current = requestAnimationFrame(() => {
        enterRafRef.current = requestAnimationFrame(() => {
          setIsEntered(true);
        });
      });
    } else if (shouldRender) {
      // External close (e.g. Back button set isOpen=false directly)
      setIsClosing(true);
      setIsEntered(false);
      if (!closingTimerRef.current) {
        closingTimerRef.current = setTimeout(() => {
          closingTimerRef.current = null;
          setShouldRender(false);
          setIsClosing(false);
        }, SHEET_DURATION_MS);
      }
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
      if (enterRafRef.current) cancelAnimationFrame(enterRafRef.current);
    };
  }, []);

  // Trigger smooth slide-down exit animation, then invoke onClose()
  const requestClose = useCallback(() => {
    if (closingTimerRef.current) return;
    stateRef.current.active = false;
    stateRef.current.currentDragY = 0;

    if (sheetRef.current) {
      sheetRef.current.style.transition = `transform ${SHEET_DURATION_MS}ms ${EASE_DRAWER}`;
      sheetRef.current.style.transform = 'translateY(100%)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = `opacity ${SHEET_DURATION_MS}ms ${EASE_DRAWER}`;
      backdropRef.current.style.opacity = '0';
    }

    setIsClosing(true);
    setIsEntered(false);
    closingTimerRef.current = setTimeout(() => {
      closingTimerRef.current = null;
      setShouldRender(false);
      setIsClosing(false);
      if (onCloseRef.current) onCloseRef.current();
    }, SHEET_DURATION_MS);
  }, []);

  // TRACK PHASE: 1:1 direct DOM writes, no React state re-renders
  const startDrag = useCallback((clientY) => {
    if (isClosing || stateRef.current.active) return;
    stateRef.current = {
      active: true,
      startY: clientY,
      startTime: Date.now(),
      currentDragY: 0
    };
    if (sheetRef.current) {
      sheetRef.current.style.transition = 'none';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = 'none';
    }
  }, [isClosing]);

  const moveDrag = useCallback((clientY) => {
    const st = stateRef.current;
    if (!st.active) return;
    const rawDelta = clientY - st.startY;
    // Rubber-band damping if dragging upward (< 0) or past 200px downward
    const offset = rawDelta < 0
      ? rawDelta * 0.15
      : rawDelta <= 200
        ? rawDelta
        : 200 + (rawDelta - 200) * 0.45;

    st.currentDragY = offset;

    if (sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${offset}px)`;
    }
    if (backdropRef.current && offset >= 0) {
      const sheetHeight = sheetRef.current?.offsetHeight || 500;
      const progress = Math.min(1, offset / sheetHeight);
      backdropRef.current.style.opacity = String(Math.max(0, 1 - progress * 0.85));
    }
  }, []);

  // RELEASE PHASE: velocity-aware dismiss or fast snap-back with --ease-drawer
  const endDrag = useCallback(() => {
    const st = stateRef.current;
    if (!st.active) return;
    st.active = false;

    const elapsed = Math.max(1, Date.now() - st.startTime);
    const velocity = st.currentDragY / elapsed; // px/ms

    if (st.currentDragY >= 65 || (st.currentDragY > 18 && velocity > 0.11)) {
      st.currentDragY = 0;
      requestClose();
      return;
    }

    st.currentDragY = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = `transform 260ms ${EASE_DRAWER}`;
      sheetRef.current.style.transform = 'translateY(0)';
    }
    if (backdropRef.current) {
      backdropRef.current.style.transition = `opacity 260ms ${EASE_DRAWER}`;
      backdropRef.current.style.opacity = '1';
    }
  }, [requestClose]);

  const onHandleTouchStart = useCallback((e) => {
    if (!e.touches || e.touches.length !== 1) return;
    if (stateRef.current.active) return; // multi-touch protection
    e.stopPropagation();
    startDrag(e.touches[0].clientY);
  }, [startDrag]);

  const onHandleTouchMove = useCallback((e) => {
    if (!e.touches || e.touches.length !== 1) return;
    if (!stateRef.current.active) return;
    e.stopPropagation();
    moveDrag(e.touches[0].clientY);
  }, [moveDrag]);

  const onHandleTouchEnd = useCallback((e) => {
    if (!stateRef.current.active) return;
    e.stopPropagation();
    endDrag();
  }, [endDrag]);

  const onHandleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    startDrag(e.clientY);

    const onMouseMove = (moveEvent) => {
      moveDrag(moveEvent.clientY);
    };
    const onMouseUp = () => {
      endDrag();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [startDrag, moveDrag, endDrag]);

  const isVisible = Boolean(isOpen || shouldRender);
  const isExiting = Boolean(isClosing || (!isOpen && shouldRender));
  const showOpenState = Boolean(isEntered && !isExiting);

  const sheetStyle = {
    transform: showOpenState ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${SHEET_DURATION_MS}ms ${EASE_DRAWER}`
  };

  const backdropAnimationClass = `transition-opacity duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${
    showOpenState ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;

  return {
    isVisible,
    isExiting,
    activeData: data || cachedDataRef.current,
    requestClose,
    sheetRef,
    backdropRef,
    scrollRef,
    isDraggingSheet: stateRef.current.active || isExiting,
    backdropAnimationClass,
    sheetAnimationClass: '',
    handleProps: {
      'data-sheet-handle': 'true',
      onTouchStart: onHandleTouchStart,
      onTouchMove: onHandleTouchMove,
      onTouchEnd: onHandleTouchEnd,
      onTouchCancel: onHandleTouchEnd,
      onMouseDown: onHandleMouseDown,
      style: { touchAction: 'none' }
    },
    sheetProps: {
      ref: sheetRef,
      style: sheetStyle
    }
  };
}
