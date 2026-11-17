import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faChevronLeft, faChevronRight, faCalendarDays, 
  faCheck, faPaw, faRotateLeft, faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import { 
  parseLocalDate, toLocalDateString, getTodayLocal, 
  formatDate, calculateAge 
} from '../utils';

export default function DatePickerModal({
  isOpen,
  onClose,
  value,
  onChange,
  title = 'เลือกวันที่',
  dateFormat = 'th',
  showAgePreview = false,
  maxDate = null,
  minDate = null,
  allowClear = false
}) {
  const today = useMemo(() => getTodayLocal(), []);
  
  // Current temporary selected date while picker is open
  const [selectedDate, setSelectedDate] = useState(() => {
    return parseLocalDate(value) || today;
  });

  // Current month & year in view
  const [viewYear, setViewYear] = useState(() => (parseLocalDate(value) || today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (parseLocalDate(value) || today).getMonth());

  // Mode: 'calendar' or 'year_month_picker'
  const [viewMode, setViewMode] = useState('calendar');

  // Synchronize with value when modal opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseLocalDate(value) || today;
      setSelectedDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setViewMode('calendar');
    }
  }, [isOpen, value, today]);

  if (!isOpen) return null;

  // Month names
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNames = dateFormat === 'th' ? thaiMonths : englishMonths;
  const dayHeaders = dateFormat === 'th' 
    ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Calculate days in view month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const formatted = toLocalDateString(selectedDate);
    onChange(formatted);
    onClose();
  };

  // Quick preset shortcuts
  const handleSetToday = () => {
    setSelectedDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleSetYesterday = () => {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    setSelectedDate(yest);
    setViewYear(yest.getFullYear());
    setViewMonth(yest.getMonth());
  };

  const handleSetApproximateAge = (yearsAgo) => {
    const target = new Date(today);
    target.setFullYear(today.getFullYear() - yearsAgo);
    setSelectedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Real-time Age preview
  const liveAge = showAgePreview && selectedDate ? calculateAge(toLocalDateString(selectedDate)) : null;

  // Selected date formatted string for display
  const selectedDateStr = toLocalDateString(selectedDate);
  const isSelectedToday = selectedDate.toDateString() === today.toDateString();

  // Year choices (last 30 years to next 5 years)
  const currentYear = today.getFullYear();
  const yearsList = [];
  for (let y = currentYear + 3; y >= currentYear - 30; y--) {
    yearsList.push(y);
  }

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-xs animate-fadeIn overscroll-contain"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slideUpSheet sm:animate-scaleUp pb-[env(safe-area-inset-bottom)] overscroll-contain"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 -mb-1 sm:hidden flex-shrink-0" />

        {/* Header with Title & Close */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <h3 className="font-mitr font-medium text-base text-slate-800">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors active:scale-95"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Selected Date Summary & Live Age Display */}
        <div className="px-5 pt-3.5 pb-2 bg-gradient-to-b from-paw-50/40 to-transparent border-b border-slate-100/80">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-slate-400">วันที่เลือก</span>
            {liveAge && (
              <span className="text-[11px] font-bold text-paw-700 bg-paw-100/90 px-2 py-0.5 rounded-full shadow-2xs">
                🐾 อายุ ~{liveAge.years > 0 ? `${liveAge.years} ปี ` : ''}{liveAge.months} เดือน
              </span>
            )}
          </div>
          <div className="text-lg font-mitr font-bold text-slate-900 mt-0.5">
            {formatDate(selectedDateStr, dateFormat)}
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-4 space-y-3 overflow-y-auto">

          {/* Month & Year Navigation Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors active:scale-95"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>

            {/* Fast Month / Year Jump Toggle */}
            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'calendar' ? 'year_month_picker' : 'calendar')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-paw-50 hover:text-paw-700 border border-slate-200/60 font-mitr font-medium text-sm text-slate-800 flex items-center gap-1.5 transition-colors active:scale-95"
              title="คลิกเพื่อเลือกปีหรือเดือนอย่างรวดเร็ว"
            >
              <span>{monthNames[viewMonth]} {dateFormat === 'th' ? viewYear + 543 : viewYear}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors active:scale-95"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>

          {/* MODE 1: Standard Calendar Grid */}
          {viewMode === 'calendar' ? (
            <div>
              {/* Day Headers (อา - ส) */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {dayHeaders.map((dh, i) => (
                  <span 
                    key={dh} 
                    className={`text-[11px] font-bold py-1 ${i === 0 ? 'text-red-500' : 'text-slate-400'}`}
                  >
                    {dh}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Previous month filler days */}
                {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
                  const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
                  return (
                    <span key={`prev-${idx}`} className="w-9 h-9 mx-auto flex items-center justify-center text-xs text-slate-300 pointer-events-none select-none">
                      {dayNum}
                    </span>
                  );
                })}

                {/* Days of current month */}
                {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const isSelected = 
                    selectedDate.getDate() === day && 
                    selectedDate.getMonth() === viewMonth && 
                    selectedDate.getFullYear() === viewYear;

                  const isCurrentToday = 
                    today.getDate() === day && 
                    today.getMonth() === viewMonth && 
                    today.getFullYear() === viewYear;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-9 h-9 mx-auto rounded-full text-xs font-bold transition-all duration-150 active:scale-90 flex items-center justify-center relative ${
                        isSelected 
                          ? 'bg-paw-500 text-white shadow-md shadow-paw-500/35 font-extrabold scale-105' 
                          : isCurrentToday
                            ? 'bg-paw-100 text-paw-700 font-bold border border-paw-300'
                            : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                      {isCurrentToday && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-paw-500 absolute bottom-1 inset-x-0 mx-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* MODE 2: Fast Year & Month Selector Grid */
            <div className="space-y-3 animate-fadeIn">
              {/* Year Scroller */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">เลือกปี (พ.ศ. / ค.ศ.)</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {yearsList.map((y) => {
                    const isYearSelected = viewYear === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => setViewYear(y)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0 ${
                          isYearSelected
                            ? 'bg-paw-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {dateFormat === 'th' ? `${y + 543} (${y})` : y}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month Grid */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1">เลือกเดือน</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {monthNames.map((m, idx) => {
                    const isMonthSelected = viewMonth === idx;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx);
                          setViewMode('calendar');
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
                          isMonthSelected
                            ? 'bg-paw-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Presets / Shortcuts */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block mb-1.5">ตัวเลือกรวดเร็ว (Shortcuts)</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors active:scale-95"
              >
                วันนี้
              </button>
              <button
                type="button"
                onClick={handleSetYesterday}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors active:scale-95"
              >
                เมื่อวาน
              </button>
              {showAgePreview && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSetApproximateAge(1)}
                    className="px-2 py-1 rounded-lg bg-paw-50 hover:bg-paw-100 text-paw-700 text-[11px] font-semibold border border-paw-200/80 transition-colors active:scale-95"
                  >
                    ~1 ขวบ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetApproximateAge(2)}
                    className="px-2 py-1 rounded-lg bg-paw-50 hover:bg-paw-100 text-paw-700 text-[11px] font-semibold border border-paw-200/80 transition-colors active:scale-95"
                  >
                    ~2 ขวบ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetApproximateAge(3)}
                    className="px-2 py-1 rounded-lg bg-paw-50 hover:bg-paw-100 text-paw-700 text-[11px] font-semibold border border-paw-200/80 transition-colors active:scale-95"
                  >
                    ~3 ขวบ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetApproximateAge(5)}
                    className="px-2 py-1 rounded-lg bg-paw-50 hover:bg-paw-100 text-paw-700 text-[11px] font-semibold border border-paw-200/80 transition-colors active:scale-95"
                  >
                    ~5 ขวบ
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2">
          {allowClear && value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                onClose();
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2.5 py-1.5 rounded-xl hover:bg-rose-50 transition-colors active:scale-95"
            >
              ล้างค่า
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors active:scale-95"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-paw-500 hover:bg-paw-600 text-white font-bold text-xs shadow-md shadow-paw-500/25 transition-transform transition-colors duration-150 ease-out active:scale-95 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{isSelectedToday ? 'เลือกวันนี้' : 'ตกลง'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
