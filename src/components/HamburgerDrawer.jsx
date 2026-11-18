import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faDatabase, 
  faArrowDownWideShort, faFilter, faHeart, faPaw, faSitemap, faGlobe,
  faSeedling, faRainbow, faImages, faBell, faCamera,
  faSquare, faTableCellsLarge, faList, faChevronRight, faLanguage
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../i18n.jsx';

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
  const { language, setLanguage, t } = useLanguage();
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

      {/* Drawer Panel */}
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
          {/* 🛡️ Native Status Bar Protection in Drawer */}
          <div 
            className="w-full bg-slate-950 flex-shrink-0 select-none pointer-events-none"
            style={{ height: 'var(--safe-top, 0px)' }}
            aria-hidden="true"
          />

          {/* Header with Title and Unified Badges */}
          <div className="px-5 pt-4 pb-3.5 bg-gradient-to-br from-paw-500 to-amber-500 text-white">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-mitr text-2xl font-semibold tracking-normal flex items-center leading-none">
                <span>MyP</span>
                <FontAwesomeIcon icon={faPaw} className="text-white text-[0.70em] ml-[1px] mr-0 -translate-y-[0.5px]" />
                <span>w</span>
              </h2>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="bg-black/15 text-white/95 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" title={t('stats_total')}>
                  <FontAwesomeIcon icon={faPaw} className="text-[10px]" />
                  <span>{totalPets}</span>
                </span>
                <span className="bg-black/15 text-white/95 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" title={t('stats_alive')}>
                  <FontAwesomeIcon icon={faSeedling} className="text-[10px]" />
                  <span>{aliveCount}</span>
                </span>
                {deceasedCount > 0 && (
                  <span className="bg-black/15 text-white/95 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1" title={t('stats_deceased')}>
                    <FontAwesomeIcon icon={faRainbow} className="text-[10px]" />
                    <span>{deceasedCount}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Drawer Body - Organized into Clear UX Sections */}
          <div className="p-4 sm:p-5 space-y-4">
            
            {/* SECTION 1: Primary Action & Tools */}
            <div className="space-y-2">
              {/* Primary Call-To-Action: Add Pet */}
              <button
                type="button"
                onClick={() => requestClose(onAddNewPet)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-paw-500 to-amber-500 hover:from-paw-600 hover:to-amber-600 text-white font-semibold text-xs shadow-xs active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>{t('add_pet')}</span>
              </button>

              {/* 4 Feature Tools in Cohesive 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => requestClose(onOpenFamily)}
                  className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11.5px] sm:text-xs tracking-tight border border-slate-200/70 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faSitemap} className="text-xs" />
                  </div>
                  <span className="truncate">{t('family_tree')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestClose(onOpenScanner)}
                  className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11.5px] sm:text-xs tracking-tight border border-slate-200/70 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCamera} className="text-xs" />
                  </div>
                  <span className="truncate">{t('scan_document')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestClose(onOpenSharedImport)}
                  className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11.5px] sm:text-xs tracking-tight border border-slate-200/70 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-paw-500/10 text-paw-600 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faImages} className="text-xs" />
                  </div>
                  <span className="truncate">{t('import_photos')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestClose(onOpenNotifications)}
                  className="flex items-center justify-between gap-1 p-2 sm:p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11.5px] sm:text-xs tracking-tight border border-slate-200/70 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faBell} className="text-xs" />
                    </div>
                    <span className="truncate">{t('notifications')}</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] bg-amber-500 px-1.5 py-0.5 rounded-full text-white font-bold flex-shrink-0">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* SECTION 2: Display & Filter */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {t('display_section')}
              </div>

              {/* Status Filter Tab */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-semibold transition-all text-center active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('all')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('alive')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'alive'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faSeedling} className="text-[10px]" />
                  <span>{t('with_us')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deceased')}
                  className={`py-1.5 px-1 rounded-xl text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                    activeTab === 'deceased'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faRainbow} className="text-[10px]" />
                  <span>{t('memorial')}</span>
                </button>
              </div>

              {/* Sort By & View Mode in Harmonious Row */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <FontAwesomeIcon icon={faArrowDownWideShort} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full py-2 pl-8 pr-3 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="age_desc">{t('sort_oldest')}</option>
                    <option value="age_asc">{t('sort_youngest')}</option>
                    <option value="bday_near">{t('sort_bday')}</option>
                  </select>
                </div>

                {/* View Mode Switcher Capsule */}
                <div className="relative inline-grid grid-cols-3 items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70 shadow-2xs flex-shrink-0">
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
                    className="pointer-events-none absolute top-1 bottom-1 left-1 w-[30px] rounded-xl bg-white shadow-xs"
                  />

                  <button
                    type="button"
                    onClick={() => onSetViewMode?.('1col')}
                    className={`relative z-10 w-[30px] h-[28px] rounded-xl flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                      viewMode === '1col' ? 'text-paw-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t('view_1col')}
                    aria-label="1 Column"
                  >
                    <FontAwesomeIcon icon={faSquare} className="text-xs" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetViewMode?.('2col')}
                    className={`relative z-10 w-[30px] h-[28px] rounded-xl flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                      viewMode === '2col' ? 'text-paw-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t('view_2col')}
                    aria-label="2 Columns"
                  >
                    <FontAwesomeIcon icon={faTableCellsLarge} className="text-xs" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetViewMode?.('list')}
                    className={`relative z-10 w-[30px] h-[28px] rounded-xl flex items-center justify-center transition-colors duration-150 active:scale-95 outline-none ${
                      viewMode === 'list' ? 'text-paw-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={t('view_list')}
                    aria-label="Card List View"
                  >
                    <FontAwesomeIcon icon={faList} className="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* SECTION 3: Preferences & Data */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                {t('preferences_section')}
              </div>

              {/* 🌐 Language Switcher (Thai vs English) */}
              <div className="space-y-1">
                <div className="flex items-center text-xs font-semibold text-slate-700 px-1">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faLanguage} className="text-paw-500 text-xs" />
                    <span>{t('language_label')}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('th');
                      onSetDateFormat?.('th');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                      language === 'th'
                        ? 'bg-white text-paw-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>ไทย</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      onSetDateFormat?.('en');
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                      language === 'en'
                        ? 'bg-white text-paw-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Date Format Toggle */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-700 px-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faGlobe} className="text-slate-400 text-xs" />
                  <span>{t('date_format_label')}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => onSetDateFormat?.('en')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                      dateFormat === 'en'
                        ? 'bg-white text-paw-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{t('date_format_en')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetDateFormat?.('th')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                      dateFormat === 'th'
                        ? 'bg-white text-paw-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>{t('date_format_th')}</span>
                  </button>
                </div>
              </div>

              {/* Backup & Restore Action Row */}
              <button
                type="button"
                onClick={() => requestClose(onOpenBackup)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/70 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={faDatabase} className="text-xs" />
                  </div>
                  <span>{t('backup_restore')}</span>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="text-slate-400 text-[10px]" />
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
                <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-[0.70em] ml-[1px] mr-0 -translate-y-[0.5px]" />
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
            <span>{t('all_rights_reserved')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
