import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';

export default function ImageViewerModal({ pet, onClose }) {
  if (!pet || !pet.avatar) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pet.avatar;
    a.download = `${pet.name}-avatar.png`;
    a.click();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} className="text-lg" />
      </button>

      {/* Main Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center max-w-lg w-full animate-scaleUp"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh] flex items-center justify-center bg-black">
          <img
            src={pet.avatar}
            alt={pet.name}
            className="w-full h-auto object-contain max-h-[75vh] rounded-3xl"
          />
        </div>

        <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
          <h3 className="font-mitr text-xl font-medium">{pet.name}</h3>

          <button
            onClick={handleDownload}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
            title="ดาวน์โหลดรูป"
          >
            <FontAwesomeIcon icon={faDownload} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
