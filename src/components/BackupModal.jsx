import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faDownload, faUpload, faDatabase 
} from '@fortawesome/free-solid-svg-icons';
import { useSheetDrag } from '../useSheetDrag';

export default function BackupModal({ isOpen, onClose, pets, onRestore }) {
  const fileInputRef = useRef(null);
  const { isVisible, requestClose, backdropAnimationClass, sheetAnimationClass, handleProps, sheetProps } = useSheetDrag(onClose, isOpen);

  if (!isVisible) return null;

  // Export to JSON file
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mypaw_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import from JSON file
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedPets = JSON.parse(event.target.result);
          if (Array.isArray(importedPets)) {
            onRestore(importedPets);
            onClose();
          }
        } catch (err) {}
      };
      reader.readAsText(file);
    }
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-sm rounded-t-[32px] bg-white shadow-2xl overflow-hidden flex flex-col ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle Grab Zone */}
        <div {...handleProps} className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/50" title="ลากลงเพื่อปิด">
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faDatabase} className="text-sm" />
            </div>
            <h2 className="font-mitr text-lg font-medium text-slate-800">
              Backup & Restore
            </h2>
          </div>
          <button
            onClick={requestClose}
            aria-label="Close"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Self-Explanatory Action Cards */}
        <div className="p-5 space-y-2.5">
          {/* Action 1: Export */}
          <button
            onClick={handleExport}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-paw-300 hover:bg-paw-50/40 flex items-center justify-between text-left transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faDownload} className="text-xs" />
              </div>
              <span className="font-bold text-xs text-slate-800">Export Backup (.json)</span>
            </div>
            <span className="text-[11px] font-bold bg-paw-50 text-paw-700 border border-paw-200 px-2.5 py-0.5 rounded-full">
              {pets.length}
            </span>
          </button>

          {/* Action 2: Import */}
          <div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 flex items-center gap-3 text-left transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUpload} className="text-xs" />
              </div>
              <span className="font-bold text-xs text-slate-800">Import Backup (.json)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              aria-label="Upload backup JSON file"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
