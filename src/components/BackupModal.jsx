import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faDownload, faUpload, faRotateLeft, faShieldHalved, faDatabase 
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
    downloadAnchor.setAttribute("download", `mypetsage_backup_${new Date().toISOString().slice(0, 10)}.json`);
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
            alert(`กู้คืนข้อมูลสำเร็จ! นำเข้าข้อมูลน้องแมว ${importedPets.length} ตัวเรียบร้อยแล้ว`);
            onClose();
          } else {
            alert('รูปแบบไฟล์สำรองไม่ถูกต้อง');
          }
        } catch (err) {
          alert('เกิดข้อผิดพลาดในการอ่านไฟล์สำรอง: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to default 7 pets
  const handleResetToDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลกลับไปเป็นน้องแมวทั้ง 7 ตัวดั้งเดิม (พร้อมรูปภาพ HD) ใช่หรือไม่?')) {
      onRestore(initialPets);
      alert('รีเซ็ตข้อมูลกลับเป็นน้องแมวทั้ง 7 ตัวเรียบร้อยแล้ว!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center">
              <FontAwesomeIcon icon={faDatabase} className="text-sm" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              สำรองข้อมูล
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-amber-50/60 p-3.5 border border-amber-100 text-xs text-amber-800 flex items-center gap-2.5">
            <FontAwesomeIcon icon={faShieldHalved} className="text-amber-600 flex-shrink-0" />
            <p className="font-semibold">ข้อมูลจัดเก็บในเครื่องของคุณแบบออฟไลน์ 100%</p>
          </div>

          {/* Action 1: Export */}
          <button
            onClick={handleExport}
            className="w-full p-4 rounded-2xl border border-slate-200 hover:border-paw-300 hover:bg-paw-50/30 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-paw-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                <span>ส่งออกข้อมูล (Export)</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                บันทึกไฟล์ JSON ลงเครื่อง
              </div>
            </div>
            <span className="text-xs font-semibold bg-paw-100 text-paw-700 px-2 py-1 rounded-lg">
              {pets.length} ตัว
            </span>
          </button>

          {/* Action 2: Import */}
          <div>
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 flex items-center justify-between text-left transition-all group"
            >
              <div>
                <div className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUpload} className="text-xs" />
                  <span>นำเข้าข้อมูล (Import)</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  กู้คืนข้อมูลจากไฟล์สำรอง
                </div>
              </div>
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
            className="w-full p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 flex items-center justify-between text-left transition-all group"
          >
            <div>
              <div className="font-bold text-sm text-slate-800 group-hover:text-purple-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faRotateLeft} className="text-xs" />
                <span>โหลดข้อมูลเริ่มต้น</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                รีเซ็ตข้อมูลตัวอย่างน้องแมวทั้ง 7 ตัว
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
