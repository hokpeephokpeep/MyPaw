import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faWeightScale, faShieldHalved, faCalendarDays, 
  faPlus, faCheck, faSyringe, faDroplet, faArrowTrendUp, faStethoscope, faCamera 
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, toLocalDateString, parseLocalDate, getTodayLocal } from '../utils';
import DateField from './DateField';
import { useSheetDrag } from '../useSheetDrag';

export default function HealthLogModal({ pet, isOpen, dateFormat = 'th', onClose, onUpdatePet, onOpenScanner }) {
  const {
    isVisible,
    activeData: activePet,
    requestClose,
    scrollRef,
    backdropAnimationClass,
    sheetAnimationClass,
    handleProps,
    sheetProps
  } = useSheetDrag(onClose, isOpen, pet);
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(toLocalDateString());
  const [fleaDate, setFleaDate] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const [checkupDate, setCheckupDate] = useState('');
  const isLoadedRef = useRef(false);

  const currentPet = pet || activePet;

  useEffect(() => {
    if (currentPet) {
      setFleaDate(currentPet.fleaDate || '');
      setVaccineDate(currentPet.vaccineDate || '');
      setCheckupDate(currentPet.checkupDate || '');
      setWeightDate(toLocalDateString());
    }
    const t = setTimeout(() => {
      isLoadedRef.current = true;
    }, 150);
    return () => {
      clearTimeout(t);
      isLoadedRef.current = false;
    };
  }, [currentPet?.id, isOpen]);

  // Auto-save care dates whenever fleaDate, vaccineDate, or checkupDate changes
  useEffect(() => {
    if (!isOpen || !currentPet || !isLoadedRef.current) return;
    const t = setTimeout(() => {
      onUpdatePet({
        ...currentPet,
        fleaDate,
        vaccineDate,
        checkupDate
      });
    }, 250);
    return () => clearTimeout(t);
  }, [fleaDate, vaccineDate, checkupDate, isOpen]);

  if (!isVisible || !currentPet) return null;

  // Weight history array
  const weightHistory = currentPet.weightHistory || (currentPet.latestWeight ? [{ id: '1', date: toLocalDateString(), weight: currentPet.latestWeight }] : []);

  // Add weight
  const handleAddWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;

    const newEntry = {
      id: `weight-${Date.now()}`,
      date: weightDate,
      weight: w
    };

    const updatedHistory = [newEntry, ...weightHistory];
    onUpdatePet({
      ...currentPet,
      latestWeight: w,
      weightHistory: updatedHistory
    });

    setWeightInput('');
  };

  // Calculate days since flea treatment & vaccine
  const today = getTodayLocal();
  const fleaParsed = parseLocalDate(fleaDate);
  const daysSinceFlea = fleaParsed ? Math.floor((today - fleaParsed) / (1000 * 60 * 60 * 24)) : null;

  const vaccineParsed = parseLocalDate(vaccineDate);
  const daysSinceVaccine = vaccineParsed ? Math.floor((today - vaccineParsed) / (1000 * 60 * 60 * 24)) : null;

  const checkupParsed = parseLocalDate(checkupDate);
  const daysUntilCheckup = checkupParsed ? Math.round((checkupParsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md rounded-t-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle Grab Zone */}
        <div {...handleProps} className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/50" title="ลากลงเพื่อปิด">
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>
        
        {/* Header */}
        <div className="px-[5%] py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-mitr text-lg font-medium text-slate-800">
                {currentPet.name}
              </h2>
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              </span>
            </div>
          </div>
          <button
            onClick={requestClose}
            aria-label="Close"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div ref={scrollRef} className="px-[5%] py-5 flex-1 min-h-0 overflow-y-auto space-y-5 overscroll-contain touch-pan-y">
          
          {/* Quick Scan Action Button */}
          {onOpenScanner && (
            <button
              type="button"
              onClick={() => {
                requestClose();
                setTimeout(() => onOpenScanner(currentPet.id), 150);
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100/70 hover:to-teal-100/70 text-slate-800 font-bold text-xs transition-colors transition-transform duration-150 border border-emerald-200/80 active:scale-[0.98] shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <FontAwesomeIcon icon={faCamera} className="text-xs" />
                </div>
                <div className="text-left">
                  <div>สแกนใบนัด / ใบเสร็จคลินิก</div>
                  <div className="text-[10px] text-slate-500 font-normal">อ่านข้อมูลและอัปเดตอัตโนมัติ (OCR)</div>
                </div>
              </div>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-700 font-semibold shadow-2xs">
                สแกนเลย
              </span>
            </button>
          )}
          
          {/* ⚖️ Section 1: Weight Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faWeightScale} className="text-paw-500 text-xs" />
                <span>น้ำหนัก (กก.)</span>
              </div>
              {currentPet.latestWeight && (
                <span className="text-xs font-bold bg-paw-50 text-paw-700 border border-paw-200 px-2.5 py-0.5 rounded-full tabular-nums">
                  {currentPet.latestWeight} กก.
                </span>
              )}
            </div>

            {/* Input Form (Percentage widths) */}
            <form onSubmit={handleAddWeight} className="flex gap-2 items-center w-full">
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="30"
                autoComplete="off"
                aria-label="น้ำหนัก"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.00"
                className="w-[26%] min-w-0 rounded-2xl border border-slate-200 px-2.5 py-2 text-xs font-bold tabular-nums focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              <div className="flex-1 min-w-0">
                <DateField
                  compact={true}
                  value={weightDate}
                  onChange={setWeightDate}
                  dateFormat={dateFormat}
                  title="เลือกวันที่ชั่งน้ำหนัก"
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                disabled={!weightInput}
                aria-label="Add weight"
                className="w-10 h-10 rounded-2xl bg-paw-500 hover:bg-paw-600 disabled:opacity-35 text-white font-bold text-xs shadow-xs transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none flex items-center justify-center flex-shrink-0"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </form>

            {/* History List */}
            {weightHistory.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {weightHistory.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400 text-[10px]" />
                      <span>{formatDate(item.date, dateFormat)}</span>
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">{item.weight} กก.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* 🛡️ Section 2: Flea & Vaccine Care (Auto-Saved) */}
          <div className="grid grid-cols-1 gap-3">
            {/* Flea Treatment */}
            <DateField
              label="หยอดยาป้องกันเห็บหมัด"
              icon={faDroplet}
              iconColor="text-sky-500"
              value={fleaDate}
              onChange={setFleaDate}
              dateFormat={dateFormat}
              title="เลือกวันที่หยอดยาป้องกัน"
              allowClear={true}
              badge={daysSinceFlea !== null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                  daysSinceFlea > 30 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {daysSinceFlea === 0 ? 'วันนี้' : `${daysSinceFlea} วันก่อน`}
                </span>
              ) : null}
            />

            {/* Vaccine */}
            <DateField
              label="วัคซีนประจำปี"
              icon={faSyringe}
              iconColor="text-emerald-500"
              value={vaccineDate}
              onChange={setVaccineDate}
              dateFormat={dateFormat}
              title="เลือกวันที่ฉีดวัคซีนประจำปี"
              allowClear={true}
              badge={daysSinceVaccine !== null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                  daysSinceVaccine > 365 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {daysSinceVaccine === 0 ? 'วันนี้' : `${daysSinceVaccine} วันก่อน`}
                </span>
              ) : null}
            />

            {/* Health Checkup Appointment (คิวนัดตรวจสุขภาพ) */}
            <DateField
              label="คิวนัดตรวจสุขภาพ / นัดหมอ"
              icon={faStethoscope}
              iconColor="text-sky-500"
              value={checkupDate}
              onChange={setCheckupDate}
              dateFormat={dateFormat}
              title="เลือกวันนัดตรวจสุขภาพ"
              allowClear={true}
              badge={daysUntilCheckup !== null ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                  daysUntilCheckup === 0 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse'
                    : daysUntilCheckup > 0 && daysUntilCheckup <= 14 
                      ? 'bg-sky-100 text-sky-700 border border-sky-200'
                      : daysUntilCheckup > 14 
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                  {daysUntilCheckup === 0 
                    ? 'นัดวันนี้' 
                    : daysUntilCheckup > 0 
                      ? `อีก ${daysUntilCheckup} วัน` 
                      : `เลยกำหนด ${Math.abs(daysUntilCheckup)} วัน`}
                </span>
              ) : null}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
