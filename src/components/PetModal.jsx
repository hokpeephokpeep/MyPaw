import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faCamera, faTrashCan, faCheck, faUsers, 
  faVenus, faMars, faLink, faHeart, faScissors 
} from '@fortawesome/free-solid-svg-icons';

export default function PetModal({ pet, allPets = [], isOpen, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [neutered, setNeutered] = useState(true);
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState('alive');
  const [deceasedDate, setDeceasedDate] = useState('');
  const [note, setNote] = useState('');
  const [avatar, setAvatar] = useState('');
  const [relationships, setRelationships] = useState([]);
  
  // Double-check Delete State (2-step confirmation)
  // 0 = idle, 1 = first ask ("แน่ใจหรือไม่ที่จะลบ?"), 2 = second ask ("ยืนยันครั้งสุดท้าย ข้อมูลจะหายถาวร")
  const [deleteStep, setDeleteStep] = useState(0);

  // New relationship form state
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState('partner');

  // Prevent auto-save on initial mount/open
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (pet) {
      setName(pet.name || '');
      setGender(pet.gender || 'male');
      setNeutered(pet.neutered !== undefined ? pet.neutered : true);
      setBirthDate(pet.birthDate || '');
      setStatus(pet.status || 'alive');
      setDeceasedDate(pet.deceasedDate || '');
      setNote(pet.note || '');
      setAvatar(pet.avatar || '');
      setRelationships(pet.relationships || []);
    } else {
      setName('');
      setGender('male');
      setNeutered(true);
      setBirthDate('');
      setStatus('alive');
      setDeceasedDate('');
      setNote('');
      setAvatar('');
      setRelationships([]);
    }
    setDeleteStep(0);
    // Enable auto-save after initial state is populated
    setTimeout(() => {
      isLoadedRef.current = true;
    }, 150);

    return () => {
      isLoadedRef.current = false;
    };
  }, [pet, isOpen]);

  // 💾 AUTOMATIC LIVE SAVE (ไม่ต้องมีปุ่มบันทึก เซฟลงเครื่องอัตโนมัติทันทีที่พิมพ์/เปลี่ยนค่า)
  useEffect(() => {
    if (!isOpen || !isLoadedRef.current) return;
    if (!name.trim()) return;

    const timer = setTimeout(() => {
      onSave({
        ...(pet || {}),
        id: pet ? pet.id : `pet-${Date.now()}`,
        name: name.trim(),
        gender,
        neutered,
        birthDate: birthDate || (pet ? pet.birthDate : new Date().toISOString().split('T')[0]),
        status,
        deceasedDate: status === 'deceased' ? deceasedDate : '',
        note: note.trim(),
        avatar,
        relationships
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [name, gender, neutered, birthDate, status, deceasedDate, note, avatar, relationships, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const getRelationLabel = (type, targetPet) => {
    const isTargetFemale = targetPet?.gender === 'female';
    switch (type) {
      case 'partner':
        return isTargetFemale ? 'แฟน (ตัวเมีย)' : 'แฟน (ตัวผู้)';
      case 'parent':
        return isTargetFemale ? 'แม่' : 'พ่อ';
      case 'child':
        return isTargetFemale ? 'ลูกสาว' : 'ลูกชาย';
      case 'sibling':
        return isTargetFemale ? 'พี่สาว/น้องสาว' : 'พี่ชาย/น้องชาย';
      case 'twin':
        return 'ฝาแฝด';
      case 'bestie':
        return 'เพื่อนสนิท';
      default:
        return 'สายสัมพันธ์';
    }
  };

  const handleAddRelationship = () => {
    if (!relTargetId) return;
    const targetPet = allPets.find(p => p.id === relTargetId);
    if (!targetPet) return;

    const label = getRelationLabel(relType, targetPet);
    const newRel = {
      targetPetId: relTargetId,
      type: relType,
      label
    };

    if (!relationships.some(r => r.targetPetId === relTargetId)) {
      setRelationships([...relationships, newRel]);
    }
    setRelTargetId('');
  };

  const handleRemoveRelationship = (targetId) => {
    setRelationships(relationships.filter(r => r.targetPetId !== targetId));
  };

  const availableTargetPets = allPets.filter(p => !pet || p.id !== pet.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {pet ? `ข้อมูลน้อง: ${pet.name}` : 'เพิ่มสัตว์เลี้ยง'}
            </h2>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              <span>บันทึกอัตโนมัติ</span>
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 border-2 border-paw-200 shadow-sm flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-paw-400">🐱</span>
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-paw-500 text-white shadow-md cursor-pointer hover:bg-paw-600 active:scale-95 transition-all"
              >
                <FontAwesomeIcon icon={faCamera} className="text-xs" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              ชื่อน้อง <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ไข่ต้ม, ชายน้อย..."
              className="w-full font-mitr font-medium rounded-2xl border border-slate-200 px-4 py-2.5 text-base focus:border-paw-500 focus:outline-hidden focus:ring-2 focus:ring-paw-100"
            />
          </div>

          {/* 🚻 Gender Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">เพศ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  gender === 'male'
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-xs ring-2 ring-blue-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faMars} className="text-blue-500" />
                <span>ตัวผู้</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  gender === 'female'
                    ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-xs ring-2 ring-pink-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faVenus} className="text-pink-500" />
                <span>ตัวเมีย</span>
              </button>
            </div>
          </div>

          {/* Neutered Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faScissors} className="text-slate-400 text-xs" />
              <span>ทำหมัน</span>
            </span>
            <button
              type="button"
              onClick={() => setNeutered(!neutered)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                neutered 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {neutered ? '✓ ทำหมันแล้ว' : 'ยังไม่ทำหมัน'}
            </button>
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              วันเกิด <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-paw-500 focus:outline-hidden focus:ring-2 focus:ring-paw-100"
            />
          </div>

          {/* Status (Alive / Deceased) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('alive')}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  status === 'alive'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-xs ring-2 ring-emerald-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🌱 อยู่ด้วยกัน</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('deceased')}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  status === 'deceased'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-xs ring-2 ring-sky-100'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🌈 ดาวแมว</span>
              </button>
            </div>
          </div>

          {/* Deceased Date if applicable */}
          {status === 'deceased' && (
            <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 animate-fadeIn">
              <label className="block text-xs font-semibold text-sky-800 mb-1">
                วันที่ข้ามสะพานสายรุ้ง
              </label>
              <input
                type="date"
                value={deceasedDate}
                onChange={(e) => setDeceasedDate(e.target.value)}
                className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-2 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-100"
              />
            </div>
          )}

          {/* 🔗 RELATIONSHIPS SECTION */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUsers} className="text-paw-500 text-xs" />
                <span>สายสัมพันธ์</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {relationships.length} รายการ
              </span>
            </div>

            {/* List Existing Relationships */}
            {relationships.length > 0 && (
              <div className="space-y-1.5">
                {relationships.map((rel, idx) => {
                  const target = allPets.find(p => p.id === rel.targetPetId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="text-paw-600 font-bold">
                          <FontAwesomeIcon icon={faLink} className="text-[10px] mr-1" />
                          {rel.label}:
                        </span>
                        <span className="font-semibold text-slate-800">{target ? target.name : 'ไม่พบ'}</span>
                        {target && (
                          <span className="text-[10px] text-slate-400">({target.gender === 'female' ? 'ตัวเมีย' : 'ตัวผู้'})</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelationship(rel.targetPetId)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="ลบ"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Relationship */}
            {availableTargetPets.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={relTargetId}
                  onChange={(e) => setRelTargetId(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden"
                >
                  <option value="">-- เลือกน้องในบ้าน --</option>
                  {availableTargetPets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender === 'female' ? 'ตัวเมีย' : 'ตัวผู้'})
                    </option>
                  ))}
                </select>

                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden"
                >
                  <option value="partner">❤️ แฟน</option>
                  <option value="twin">👯 ฝาแฝด</option>
                  <option value="sibling">🐾 พี่น้อง</option>
                  <option value="parent">👨‍👩‍👧 พ่อ / แม่</option>
                  <option value="child">🍼 ลูก</option>
                  <option value="bestie">✨ เพื่อนสนิท</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddRelationship}
                  disabled={!relTargetId}
                  className="px-3 py-1.5 rounded-xl bg-paw-500 hover:bg-paw-600 disabled:opacity-40 text-white text-xs font-bold"
                >
                  เชื่อม
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              โน้ต
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="บันทึกเพิ่มเติม..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-paw-500 focus:outline-hidden focus:ring-2 focus:ring-paw-100"
            />
          </div>

          {/* 🗑️ FAINT SUBTLE DELETE BUTTON WITH 2-STEP CONFIRMATION */}
          {pet && (
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
              {deleteStep === 0 && (
                <button
                  type="button"
                  onClick={() => setDeleteStep(1)}
                  className="text-[11px] text-slate-300 hover:text-red-400 py-1 px-3 rounded-lg transition-colors flex items-center gap-1.5"
                  title="ลบข้อมูลน้อง"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-[10px] opacity-60" />
                  <span>ลบข้อมูลน้อง</span>
                </button>
              )}

              {deleteStep === 1 && (
                <div className="w-full p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-amber-800 font-medium">ต้องการลบ {pet.name}?</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px]"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteStep(2)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 text-[11px]"
                    >
                      ใช่, ต้องการลบ
                    </button>
                  </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="w-full p-3.5 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-2 text-xs animate-fadeIn">
                  <div className="text-red-700 font-bold text-center">
                    ⚠️ ข้อมูลทั้งหมดของ {pet.name} จะถูกลบถาวร
                  </div>
                  <div className="flex justify-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-xs"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(pet.id);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-xs text-xs"
                    >
                      ยืนยันลบถาวร
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
