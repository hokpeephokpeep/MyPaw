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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xl" />
      </button>

      {/* Main Image Container */}
      <div className="flex flex-col items-center max-w-lg w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-h-[75vh] flex items-center justify-center bg-black">
          <img
            src={pet.avatar}
            alt={pet.name}
            className="w-full h-auto object-contain max-h-[75vh] rounded-3xl"
          />
        </div>

        <div className="mt-4 flex items-center justify-between w-full px-2 text-white">
          <div>
            <h3 className="font-mitr text-lg font-bold">{pet.name}</h3>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs" />
            <span>ดาวน์โหลดรูป</span>
          </button>
        </div>
      </div>
    </div>
  );
}
