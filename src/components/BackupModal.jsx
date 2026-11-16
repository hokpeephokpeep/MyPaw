import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faDownload, faUpload, faRotateLeft, faDatabase 
} from '@fortawesome/free-solid-svg-icons';
import { initialPets } from '../defaultPets';

export default function BackupModal({ isOpen, onClose, pets, onRestore }) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

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

  // Reset to default 7 pets
  const handleResetToDefault = () => {
    if (window.confirm('รีเซ็ตข้อมูลกลับเป็นน้องแมวทั้ง 7 ตัวดั้งเดิม?')) {
      onRestore(initialPets);
      onClose();
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[32px] bg-white shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faDatabase} className="text-sm" />
            </div>
            <h2 className="font-mitr text-lg font-medium text-slate-800">
              ข้อมูล
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Self-Explanatory Action Cards */}
        <div className="p-5 space-y-2.5">
          {/* Action 1: Export */}
          <button
            onClick={handleExport}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-paw-300 hover:bg-paw-50/40 flex items-center justify-between text-left transition-all group active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faDownload} className="text-xs" />
              </div>
              <span className="font-bold text-xs text-slate-800">ส่งออกไฟล์ (.json)</span>
            </div>
            <span className="text-[11px] font-bold bg-paw-50 text-paw-700 border border-paw-200 px-2.5 py-0.5 rounded-full">
              {pets.length}
            </span>
          </button>

          {/* Action 2: Import */}
          <div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 flex items-center gap-3 text-left transition-all group active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUpload} className="text-xs" />
              </div>
              <span className="font-bold text-xs text-slate-800">นำเข้าไฟล์ (.json)</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Action 3: Reset to Default 7 Pets */}
          <button
            onClick={handleResetToDefault}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 flex items-center gap-3 text-left transition-all group active:scale-98"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
            </div>
            <span className="font-bold text-xs text-slate-800">ค่าเริ่มต้น (7 ตัว)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
