import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPlus, faDatabase, faRotateLeft, faMagnifyingGlass, 
  faArrowDownWideShort, faFilter, faHeart, faPaw, faDiagramProject, faGlobe 
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
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto animate-slideInLeft">
        <div>
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-paw-500 to-amber-500 text-white">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                <FontAwesomeIcon icon={faPaw} />
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="text-base" />
              </button>
            </div>
            <h2 className="mt-3 text-xl font-extrabold tracking-tight">MyPaw</h2>

            {/* Quick Stats Pill */}
            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-white/20 text-xs">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-medium">ทั้งหมด {totalPets}</span>
              <span className="bg-emerald-400/30 px-2 py-0.5 rounded-full font-medium">💚 {aliveCount}</span>
              {deceasedCount > 0 && (
                <span className="bg-purple-300/30 px-2 py-0.5 rounded-full font-medium">🌈 {deceasedCount}</span>
              )}
            </div>
          </div>

          {/* Drawer Body Controls */}
          <div className="p-5 space-y-4">
            
            {/* 1. Add Pet Primary Action */}
            <button
              onClick={() => {
                onClose();
                onAddNewPet();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-paw-50 hover:bg-paw-100 text-paw-700 font-bold text-sm transition-all group shadow-xs border border-paw-200"
            >
              <div className="w-8 h-8 rounded-xl bg-paw-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </div>
              <span>เพิ่มสัตว์เลี้ยง</span>
            </button>

            {/* 1.5 Family Tree Button */}
            <button
              onClick={() => {
                onClose();
                onOpenFamily();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-900 font-bold text-sm transition-all border border-amber-200/80 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <FontAwesomeIcon icon={faDiagramProject} className="text-sm" />
              </div>
              <span>ผังครอบครัว</span>
            </button>

            {/* 2. Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-[11px]" />
                <span>ค้นหา</span>
              </label>
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อน้อง..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            {/* 3. Filter Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFilter} className="text-[11px]" />
                <span>สถานะ</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
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
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'alive'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  มีชีวิต
                </button>
                <button
                  onClick={() => setActiveTab('deceased')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    activeTab === 'deceased'
                      ? 'bg-white text-purple-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  สายรุ้ง
                </button>
              </div>
            </div>

            {/* 4. Sort Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faArrowDownWideShort} className="text-[11px]" />
                <span>เรียงลำดับ</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="age_desc">อายุมาก ➔ น้อย</option>
                <option value="age_asc">อายุน้อย ➔ มาก</option>
                <option value="bday_near">วันเกิดใกล้ถึง</option>
              </select>
            </div>

            {/* 4.5 Date Format System (สากล หรือ ไทย) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FontAwesomeIcon icon={faGlobe} className="text-[11px]" />
                <span>ระบบเวลา / ปฏิทิน</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => onSetDateFormat?.('en')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    dateFormat === 'en'
                      ? 'bg-white text-paw-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  สากล (ค.ศ.)
                </button>
                <button
                  type="button"
                  onClick={() => onSetDateFormat?.('th')}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center ${
                    dateFormat === 'th'
                      ? 'bg-white text-paw-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ไทย (พ.ศ.)
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 5. Secondary Actions: Backup & Reset */}
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
                <span>สำรองข้อมูล</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('ต้องการโหลดข้อมูลดั้งเดิมของน้องแมวทั้ง 7 ตัว ใช่หรือไม่?')) {
                    onResetDefault();
                    onClose();
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
                </div>
                <span>โหลดข้อมูลน้องทั้ง 7 ตัวเดิม</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faHeart} className="text-paw-400 text-xs" />
            <span>MyPaw</span>
          </div>
          <span className="text-[11px]">v1.2.0</span>
        </div>
      </div>
    </div>
  );
}
