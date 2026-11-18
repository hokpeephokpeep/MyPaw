import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPlus, faDatabase, 
  faArrowDownWideShort, faFilter, faHeart, faPaw, faSitemap, faGlobe,
  faSeedling, faRainbow, faImages, faBell, faCamera,
  faSquare, faTableCellsLarge, faList
} from '@fortawesome/free-solid-svg-icons';

export default function HamburgerDrawer({ 
  isOpen, 
  onClose, 
  onAddNewPet, 
  onOpenBackup,
  onOpenFamily,
  onOpenSharedImport,
  onOpenNotifications,
  onOpenScanner,
  unreadNotificationsCount = 0,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  totalPets,
  aliveCount,
  deceasedCount,
  dateFormat = 'en',
  onSetDateFormat,
  viewMode = '1col',
  onSetViewMode
}) {
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen));
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setShouldRender(false);
          setIsClosing(false);
        }, 220);
      }
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const requestClose = useCallback((afterClose) => {
    if (timerRef.current) return;
    setIsClosing(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setShouldRender(false);
      setIsClosing(false);
      if (onCloseRef.current) onCloseRef.current();
      if (typeof afterClose === 'function') afterClose();
    }, 220);
  }, []);

  const isVisible = Boolean(isOpen || shouldRender);
  const isExiting = Boolean(isClosing || (!isOpen && shouldRender));

  const drawerTouchStartXRef = useRef(0);
  const handleDrawerTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      drawerTouchStartXRef.current = e.touches[0].clientX;
    }
  };
  const handleDrawerTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const deltaX = e.changedTouches[0].clientX - drawerTouchStartXRef.current;
      if (deltaX < -45) {
        requestClose();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex overscroll-contain">
      {/* Backdrop */}
      <div 
        onClick={() => requestClose()} 
        className={`fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-200 overscroll-contain ${
          isExiting ? 'opacity-0 pointer-events-none' : 'animate-fadeIn opacity-100'
        }`}
      />

      {/* Drawer Panel (Slides in from left -> Slides back out to left on close) */}
      <div
        onTouchStart={handleDrawerTouchStart}
        onTouchEnd={handleDrawerTouchEnd}
        style={
          isExiting
            ? { transform: 'translateX(-100%)', transition: 'transform 220ms cubic-bezier(0.32, 0, 0.67, 0)' }
            : undefined
        }
        className={`relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto ${
          isExiting ? '' : 'animate-slideInLeft'
        } overscroll-contain`}
      >
        <div>
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-paw-500 to-amber-500 text-white">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                <FontAwesomeIcon icon={faPaw} />
              </div>
              <button 
                onClick={() => requestClose()}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-white outline-none"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>
            <h2 className="mt-3 font-mitr text-2xl font-semibold tracking-wide flex items-center">
              <span>MyP</span>
              <FontAwesomeIcon icon={faPaw} className="text-white text-[0.78em] mx-[1px] -translate-y-[1px]" />
              <span>w</span>
            </h2>

            {/* Quick Stats Pill (FontAwesome Unified) */}
            <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-white/20 text-xs">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPaw} className="text-[10px]" />
                <span>{totalPets}</span>
              </span>
              <span className="bg-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faSeedling} className="text-[10px] text-emerald-100" />
                <span>{aliveCount}</span>
              </span>
              {deceasedCount > 0 && (
                <span className="bg-sky-400/30 px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faRainbow} className="text-[10px] text-amber-200" />
                  <span>{deceasedCount}</span>
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body Controls */}
          <div className="p-5 space-y-4">
            
            {/* 1. Primary Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => requestClose(onAddNewPet)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-paw-50 hover:bg-paw-100 text-paw-700 font-bold text-xs transition-colors transition-transform duration-150 ease-out border border-paw-200/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-paw-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                </div>
                <span>Add Pet</span>
              </button>

              <button
                onClick={() => requestClose(onOpenFamily)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors transition-transform duration-150 ease-out border border-amber-200/80 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faSitemap} className="text-sm" />
                </div>
                <span>Family Tree</span>
              </button>
            </div>

            {/* Quick Action: Notification Center */}
            <button
              type="button"
              onClick={() => requestClose(onOpenNotifications)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 text-slate-800 font-bold text-xs transition-colors transition-transform duration-150 ease-out border border-amber-200/80 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-amber-500 outline-none shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faBell} className="text-xs" />
                </div>
                <span className="font-bold text-xs text-slate-800">ศูนย์แจ้งเตือน</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="text-[10px] bg-amber-500 px-2 py-0.5 rounded-full text-white font-semibold shadow-2xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick Share / Import Photos Button */}
            <button
              type="button"
              onClick={() => requestClose(onOpenSharedImport)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-paw-50 to-orange-50 hover:from-paw-100/70 hover:to-orange-100/70 text-slate-800 font-bold text-xs transition-colors transition-transform duration-150 ease-out border border-paw-200/80 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-paw-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faImages} className="text-xs" />
                </div>
                <span className="font-bold text-xs text-slate-800">นำเข้ารูปภาพ</span>
              </div>
            </button>

            {/* Quick Action: Document Scanner (OCR) */}
            <button
              type="button"
              onClick={() => requestClose(onOpenScanner)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100/70 hover:to-teal-100/70 text-slate-800 font-bold text-xs transition-colors transition-transform duration-150 ease-out border border-emerald-200/80 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faCamera} className="text-xs" />
                </div>
                <span className="font-bold text-xs text-slate-800">สแกนเอกสาร</span>
              </div>
            </button>

            {/* 2. Filter Options */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 ease-out text-center active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('alive')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 ease-out text-center flex items-center justify-center gap-1 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'alive'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faSeedling} className="text-[10px]" />
                  <span>With Us</span>
                </button>
                <button
                  onClick={() => setActiveTab('deceased')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors duration-150 ease-out text-center flex items-center justify-center gap-1 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'deceased'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faRainbow} className="text-[10px]" />
                  <span>Memorial</span>
                </button>
              </div>
            </div>

            {/* 4. Sort Options */}
            <div className="relative">
              <FontAwesomeIcon icon={faArrowDownWideShort} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="age_desc">Oldest First</option>
                <option value="age_asc">Youngest First</option>
                <option value="bday_near">Upcoming Birthday</option>
              </select>
            </div>

            {/* 4.5 Clean Minimalist View Mode Switcher Capsule (Exact Pill Design) */}
            <div className="flex justify-center pt-0.5 pb-0.5">
              <div className="relative inline-grid grid-cols-3 items-center bg-slate-100/95 p-1 rounded-full border border-slate-200/70 shadow-2xs">
                {/* Sliding Active Circle Indicator */}
                <span
                  aria-hidden="true"
                  style={{
                    transform:
                      viewMode === '1col'
                        ? 'translateX(0%)'
                        : viewMode === '2col'
                          ? 'translateX(100%)'
                          : 'translateX(200%)',
                    transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="pointer-events-none absolute top-1 bottom-1 left-1 w-[36px] rounded-full bg-white shadow-xs"
                />

                <button
                  type="button"
                  onClick={() => onSetViewMode?.('1col')}
                  className={`relative z-10 w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                    viewMode === '1col'
                      ? 'text-paw-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="1 Column (Large Hero)"
                  aria-label="1 Column"
                >
                  <FontAwesomeIcon icon={faSquare} className="text-sm" />
                </button>

                <button
                  type="button"
                  onClick={() => onSetViewMode?.('2col')}
                  className={`relative z-10 w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                    viewMode === '2col'
                      ? 'text-paw-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="2 Columns (Grid)"
                  aria-label="2 Columns"
                >
                  <FontAwesomeIcon icon={faTableCellsLarge} className="text-sm" />
                </button>

                <button
                  type="button"
                  onClick={() => onSetViewMode?.('list')}
                  className={`relative z-10 w-[36px] h-[36px] rounded-full flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                    viewMode === 'list'
                      ? 'text-paw-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Card List View"
                  aria-label="Card List View"
                >
                  <FontAwesomeIcon icon={faList} className="text-sm" />
                </button>
              </div>
            </div>

            {/* 5. Date Format System (Default or Thai Format) */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => onSetDateFormat?.('en')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-colors duration-150 ease-out flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                  dateFormat === 'en'
                    ? 'bg-white text-paw-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                <span>Default</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDateFormat?.('th')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-colors duration-150 ease-out flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                  dateFormat === 'th'
                    ? 'bg-white text-paw-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                <span>Thai Format</span>
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* 6. Secondary Actions: Backup */}
            <div className="space-y-1">
              <button
                onClick={() => requestClose(onOpenBackup)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors transition-transform duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDatabase} className="text-xs" />
                </div>
                <span>Backup & Restore</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer info & Credit */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-1.5 font-mitr font-medium text-slate-800">
              <span className="flex items-center">
                <span>MyP</span>
                <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-[0.78em] mx-[0.5px] -translate-y-[0.5px]" />
                <span>w</span>
              </span>
              <span className="text-[10px] font-sans text-slate-400 font-normal">v1.3.0</span>
            </div>

            <a
              href="https://github.com/tonwtch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-[11px] transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 font-sans">
            <span>© tonwtch</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
