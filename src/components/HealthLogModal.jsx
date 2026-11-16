import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faWeightScale, faShieldHalved, faCalendarDays, faPlus, faCheck, faSyringe 
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils';

export default function HealthLogModal({ pet, isOpen, dateFormat = 'en', onClose, onUpdatePet }) {
  if (!isOpen || !pet) return null;

  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0, 10));
  const [fleaDate, setFleaDate] = useState(pet.fleaDate || '');
  const [vaccineDate, setVaccineDate] = useState(pet.vaccineDate || '');

  // Weight history array
  const weightHistory = pet.weightHistory || (pet.latestWeight ? [{ id: '1', date: new Date().toISOString().slice(0, 10), weight: pet.latestWeight }] : []);

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

  // Save Care Dates
  const handleSaveCare = () => {
    onUpdatePet({
      ...pet,
      fleaDate,
      vaccineDate
    });
    alert('บันทึกข้อมูลการดูแลสุขภาพเรียบร้อยแล้ว!');
  };

  // Calculate days since flea treatment
  const daysSinceFlea = fleaDate ? Math.floor((new Date() - new Date(fleaDate)) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                สมุดสุขภาพ <span className="font-mitr text-paw-600 text-lg font-medium">{pet.name}</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* ⚖️ Section 1: Weight Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faWeightScale} className="text-paw-500 text-xs" />
                <span>น้ำหนักตัว (กก.)</span>
              </h3>
              {pet.latestWeight && (
                <span className="text-xs font-black bg-paw-50 text-paw-700 border border-paw-100 px-2.5 py-0.5 rounded-full">
                  ล่าสุด: {pet.latestWeight} กก.
                </span>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAddWeight} className="flex gap-2">
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="25"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="กก."
                className="w-1/2 rounded-2xl border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                className="w-1/2 rounded-2xl border border-slate-200 px-2 py-2 text-xs focus:ring-2 focus:ring-paw-200 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!weightInput}
                className="px-4 py-2 rounded-2xl bg-paw-500 hover:bg-paw-600 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>บันทึก</span>
              </button>
            </form>

            {/* History List */}
            {weightHistory.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {weightHistory.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400 text-[10px]" />
                      <span>{formatDate(item.date, dateFormat)}</span>
                    </span>
                    <span className="font-bold text-slate-800">{item.weight} กก.</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* 🛡️ Section 2: Flea & Vaccine Care */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-xs" />
              <span>การดูแลสุขภาพ</span>
            </h3>

            {/* Flea Treatment */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">หยอดยาเห็บหมัดล่าสุด</span>
                {daysSinceFlea !== null && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    daysSinceFlea > 30 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {daysSinceFlea} วันที่แล้ว {daysSinceFlea > 30 ? '(ควรหยอดซ้ำ)' : ''}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={fleaDate}
                onChange={(e) => setFleaDate(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
              />
            </div>

            {/* Vaccine */}
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">ฉีดวัคซีนประจำปีล่าสุด</span>
              </div>
              <input
                type="date"
                value={vaccineDate}
                onChange={(e) => setVaccineDate(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleSaveCare}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>บันทึกการดูแล</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
