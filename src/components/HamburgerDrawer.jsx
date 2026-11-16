import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPlus, faDatabase, faRotateLeft, faMagnifyingGlass, 
  faArrowDownWideShort, faFilter, faHeart, faPaw, faSitemap, faGlobe,
  faSeedling, faRainbow
} from '@fortawesome/free-solid-svg-icons';

export default function HamburgerDrawer({ 
  isOpen, 
  onClose, 
  onAddNewPet, 
  onOpenBackup,
  onOpenFamily,
  onResetDefault,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  totalPets,
  aliveCount,
  deceasedCount,
  dateFormat = 'en',
  onSetDateFormat
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slideInLeft">
        <div>
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-paw-500 to-amber-500 text-white">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                <FontAwesomeIcon icon={faPaw} />
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>
            <h2 className="mt-3 font-mitr text-2xl font-semibold tracking-wide">MyPaw</h2>

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
                onClick={() => {
                  onClose();
                  onAddNewPet();
                }}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-paw-50 hover:bg-paw-100 text-paw-700 font-bold text-xs transition-all border border-paw-200/80 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-paw-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faPlus} className="text-sm" />
                </div>
                <span>เพิ่มสมาชิก</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenFamily();
                }}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all border border-amber-200/80 active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faSitemap} className="text-sm" />
                </div>
                <span>ผังครอบครัว</span>
              </button>
            </div>

            {/* 2. Search Input */}
            <div className="relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ..."
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              )}
            </div>

            {/* 3. Filter Options */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setActiveTab('alive')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                    activeTab === 'alive'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faSeedling} className="text-[10px]" />
                  <span>อยู่ด้วยกัน</span>
                </button>
                <button
                  onClick={() => setActiveTab('deceased')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                    activeTab === 'deceased'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FontAwesomeIcon icon={faRainbow} className="text-[10px]" />
                  <span>ดาวแมว</span>
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
                <option value="age_desc">พี่ใหญ่ ➔ น้องเล็ก</option>
                <option value="age_asc">น้องเล็ก ➔ พี่ใหญ่</option>
                <option value="bday_near">วันเกิดใกล้ถึง</option>
              </select>
            </div>

            {/* 5. Date Format System (สากล หรือ ไทย) */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => onSetDateFormat?.('en')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  dateFormat === 'en'
                    ? 'bg-white text-paw-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                <span>ค.ศ. (2026)</span>
              </button>
              <button
                type="button"
                onClick={() => onSetDateFormat?.('th')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  dateFormat === 'th'
                    ? 'bg-white text-paw-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faGlobe} className="text-[10px]" />
                <span>พ.ศ. (2569)</span>
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* 6. Secondary Actions: Backup & Reset */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenBackup();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDatabase} className="text-xs" />
                </div>
                <span>สำรอง / กู้คืนข้อมูล</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('รีเซ็ตข้อมูลกลับเป็นน้องแมวทั้ง 7 ตัวดั้งเดิม?')) {
                    onResetDefault();
                    onClose();
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
                </div>
                <span>รีเซ็ตค่าเริ่มต้น (7 ตัว)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mitr">
            <FontAwesomeIcon icon={faPaw} className="text-paw-400 text-xs" />
            <span>MyPaw</span>
          </div>
          <span className="text-[11px] font-sans">v1.3.0</span>
        </div>
      </div>
    </div>
  );
}
