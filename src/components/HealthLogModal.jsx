import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faWeightScale, faShieldHalved, faCalendarDays, 
  faPlus, faCheck, faSyringe, faDroplet, faArrowTrendUp 
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, toLocalDateString, parseLocalDate, getTodayLocal } from '../utils';

export default function HealthLogModal({ pet, isOpen, dateFormat = 'en', onClose, onUpdatePet }) {
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(toLocalDateString());
  const [fleaDate, setFleaDate] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (pet) {
      setFleaDate(pet.fleaDate || '');
      setVaccineDate(pet.vaccineDate || '');
      setWeightDate(toLocalDateString());
    }
    const t = setTimeout(() => {
      isLoadedRef.current = true;
    }, 150);
    return () => {
      clearTimeout(t);
      isLoadedRef.current = false;
    };
  }, [pet, isOpen]);

  // Auto-save care dates whenever fleaDate or vaccineDate changes
  useEffect(() => {
    if (!isOpen || !pet || !isLoadedRef.current) return;
    const t = setTimeout(() => {
      onUpdatePet({
        ...pet,
        fleaDate,
        vaccineDate
      });
    }, 250);
    return () => clearTimeout(t);
  }, [fleaDate, vaccineDate, isOpen]);

  if (!isOpen || !pet) return null;

  // Weight history array
  const weightHistory = pet.weightHistory || (pet.latestWeight ? [{ id: '1', date: toLocalDateString(), weight: pet.latestWeight }] : []);

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
      ...pet,
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

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scaleUp"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="font-mitr text-lg font-medium text-slate-800">
                {pet.name}
              </h2>
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* ⚖️ Section 1: Weight Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faWeightScale} className="text-paw-500 text-xs" />
                <span>น้ำหนัก (กก.)</span>
              </div>
              {pet.latestWeight && (
                <span className="text-xs font-bold bg-paw-50 text-paw-700 border border-paw-200 px-2.5 py-0.5 rounded-full tabular-nums">
                  {pet.latestWeight} กก.
                </span>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddWeight} className="flex gap-2">
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="30"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.00"
                className="w-28 rounded-2xl border border-slate-200 px-3.5 py-2 text-xs font-bold tabular-nums focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!weightInput}
                className="w-10 h-10 rounded-2xl bg-paw-500 hover:bg-paw-600 disabled:opacity-35 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center flex-shrink-0"
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
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faDroplet} className="text-sky-500 text-xs" />
                  <span>หยอดยาป้องกัน</span>
                </span>
                {daysSinceFlea !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                    daysSinceFlea > 30 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {daysSinceFlea === 0 ? 'วันนี้' : `${daysSinceFlea} วันก่อน`}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={fleaDate}
                onChange={(e) => setFleaDate(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-paw-400 focus:outline-hidden"
              />
            </div>

            {/* Vaccine */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faSyringe} className="text-emerald-500 text-xs" />
                  <span>วัคซีนประจำปี</span>
                </span>
                {daysSinceVaccine !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                    daysSinceVaccine > 365 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {daysSinceVaccine === 0 ? 'วันนี้' : `${daysSinceVaccine} วันก่อน`}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={vaccineDate}
                onChange={(e) => setVaccineDate(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
