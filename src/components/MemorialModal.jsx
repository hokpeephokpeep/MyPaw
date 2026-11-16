import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faHeart, faPaperPlane, faCalendarDays, faRainbow, faDove, faStar 
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, toLocalDateString } from '../utils';

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
      date: toLocalDateString(),
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
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[32px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-sky-400/20 animate-scaleUp"
      >
        
        {/* Header with Close */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faRainbow} className="text-amber-300 text-base" />
            <h2 className="font-mitr text-lg font-medium text-amber-200 tracking-wide">
              {pet.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-white/60 hover:text-white rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* 🕯️ Virtual Interactive Candle (Self-explanatory) */}
          <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Stars background */}
            <FontAwesomeIcon icon={faStar} className="absolute top-3 left-7 text-amber-200 text-[10px] animate-star-1" />
            <FontAwesomeIcon icon={faStar} className="absolute top-8 right-10 text-white text-xs animate-star-2" />
            <FontAwesomeIcon icon={faStar} className="absolute bottom-5 left-9 text-sky-200 text-[9px] animate-star-3" />

            {/* Candle Graphic */}
            <div 
              onClick={() => setCandleLit(!candleLit)}
              className="cursor-pointer group flex flex-col items-center my-1 select-none active:scale-95 transition-transform"
            >
              {candleLit ? (
                <div className="w-8 h-12 relative flex items-center justify-center animate-flame">
                  <div className="w-8 h-12 rounded-full bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-100 blur-[2px] opacity-90" />
                  <div className="absolute bottom-1 w-3 h-6 rounded-full bg-white/90" />
                </div>
              ) : (
                <div className="w-1 h-5 bg-stone-500 rounded-t-sm mb-7" />
              )}

              {/* Candle Body */}
              <div className="w-14 h-16 rounded-t-xl rounded-b-md bg-gradient-to-r from-amber-100 via-white to-amber-100 shadow-lg border border-amber-200/40 relative">
                <div className="w-full h-2 rounded-t-xl bg-amber-200/50" />
                <div className="w-2 h-4 bg-white/90 rounded-b-full ml-2 -mt-1 shadow-xs" />
              </div>

              {/* Candle Plate */}
              <div className="w-24 h-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full shadow-md -mt-1 border border-amber-500/40" />
            </div>

            {pet.deceasedDate && (
              <p className="text-xs text-amber-200/80 mt-3 font-medium">
                {formatDate(pet.deceasedDate, dateFormat)}
              </p>
            )}
          </div>

          {/* 💌 Letters to Heaven */}
          <div className="space-y-3">
            <form onSubmit={handleAddLetter} className="flex gap-2">
              <input
                type="text"
                value={newLetter}
                onChange={(e) => setNewLetter(e.target.value)}
                placeholder={`เขียนถึง ${pet.name}...`}
                className="flex-1 rounded-2xl bg-white/10 border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={!newLetter.trim()}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-35 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center flex-shrink-0"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
              </button>
            </form>

            {/* List of Letters */}
            <div className="space-y-2 pt-1">
              {letters.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-sky-200/60">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-[9px]" />
                      <span>{formatDate(item.date, dateFormat)}</span>
                    </span>
                    <FontAwesomeIcon icon={faDove} className="text-[10px] text-sky-300/60" />
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
