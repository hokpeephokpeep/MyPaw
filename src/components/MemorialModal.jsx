import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faHeart, faFire, faPaperPlane, faWandMagicSparkles, faCalendarDays, faRainbow 
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../utils';

export default function MemorialModal({ pet, isOpen, dateFormat = 'en', onClose, onUpdatePet }) {
  if (!isOpen || !pet) return null;

  const [candleLit, setCandleLit] = useState(true);
  const [newLetter, setNewLetter] = useState('');

  // Letters array stored in pet.letters
  const letters = pet.letters || (pet.note ? [{ id: '1', date: pet.deceasedDate || '2020-10-04', text: pet.note }] : []);

  const handleAddLetter = (e) => {
    e.preventDefault();
    if (!newLetter.trim()) return;

    const letterItem = {
      id: `letter-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      text: newLetter.trim()
    };

    const updatedLetters = [letterItem, ...letters];
    onUpdatePet({
      ...pet,
      letters: updatedLetters
    });
    setNewLetter('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-sky-400/20">
        
        {/* Header with Close */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faRainbow} className="text-amber-300 text-lg" />
            <h2 className="text-base font-bold text-white tracking-tight">
              วิมานดาวแมว <span className="font-mitr text-amber-200 text-lg font-medium">{pet.name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* 🕯️ Virtual Candle Section */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-5 flex flex-col items-center text-center relative overflow-hidden">
            {/* Stars background */}
            <div className="absolute top-2 left-6 text-amber-200 text-xs animate-star-1">✦</div>
            <div className="absolute top-8 right-10 text-white text-xs animate-star-2">✨</div>
            <div className="absolute bottom-4 left-8 text-sky-200 text-[10px] animate-star-3">✦</div>

            {/* Candle Graphic */}
            <div 
              onClick={() => setCandleLit(!candleLit)}
              className="cursor-pointer group flex flex-col items-center my-2 select-none"
              title="แตะเพื่อจุดหรือดับเทียน"
            >
              {candleLit ? (
                /* Lit Flame with animation */
                <div className="w-8 h-12 relative flex items-center justify-center animate-flame">
                  {/* Outer Flame Glow */}
                  <div className="w-8 h-12 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 blur-[2px] opacity-90" />
                  {/* Inner Core */}
                  <div className="absolute bottom-1 w-3 h-6 rounded-full bg-white/90" />
                </div>
              ) : (
                /* Unlit Wick */
                <div className="w-1 h-5 bg-stone-500 rounded-t-sm mb-1" />
              )}

              {/* Candle Body */}
              <div className="w-14 h-16 rounded-t-xl rounded-b-md bg-gradient-to-r from-amber-100 via-white to-amber-100 shadow-lg border border-amber-200/40 relative">
                <div className="w-full h-2 rounded-t-xl bg-amber-200/50" />
                {/* Wax Drip */}
                <div className="w-2 h-4 bg-white/90 rounded-b-full ml-2 -mt-1 shadow-xs" />
              </div>

              {/* Candle Plate */}
              <div className="w-24 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full shadow-md -mt-1 border border-amber-500/40" />
            </div>

            <p className="text-xs font-semibold text-amber-200 mt-2 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
              <span>{candleLit ? 'เทียนระลึกถึงสว่างไสว' : 'แตะที่เทียนเพื่อจุดไฟ'}</span>
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              สู่สายรุ้ง: {formatDate(pet.deceasedDate, dateFormat)}
            </p>
          </div>

          {/* 💌 Letters to Heaven (จดหมายถึงดาวแมว) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faHeart} className="text-pink-400 text-xs" />
                <span>ข้อความถึง {pet.name}</span>
              </h3>
              <span className="text-[10px] text-white/50">{letters.length} ข้อความ</span>
            </div>

            {/* Input to write letter */}
            <form onSubmit={handleAddLetter} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={newLetter}
                  onChange={(e) => setNewLetter(e.target.value)}
                  placeholder={`เขียนข้อความถึง${pet.name}...`}
                  className="w-full rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>
              <button
                type="submit"
                disabled={!newLetter.trim()}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                <span>ส่งข้อความ</span>
              </button>
            </form>

            {/* List of Letters */}
            <div className="space-y-2.5 pt-1">
              {letters.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-sky-200/60">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-[9px]" />
                      <span>{formatDate(item.date, dateFormat)}</span>
                    </span>
                    <span>🕊️</span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
