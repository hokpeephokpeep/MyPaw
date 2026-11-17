import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faCamera, faTrashCan, faCheck, faUsers, 
  faVenus, faMars, faLink, faHeart, faScissors,
  faSeedling, faRainbow, faPaw, faPlus, faCalendarDays, faNoteSticky
} from '@fortawesome/free-solid-svg-icons';
import { toLocalDateString } from '../utils';

export default function PetModal({ pet, allPets = [], isOpen, onClose, onSave, onDelete }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [neutered, setNeutered] = useState(true);
  const [birthDate, setBirthDate] = useState('');
  const [status, setStatus] = useState('alive');
  const [deceasedDate, setDeceasedDate] = useState('');
  const [note, setNote] = useState('');
  const [avatar, setAvatar] = useState('');
  const [photos, setPhotos] = useState([]);
  const [relationships, setRelationships] = useState([]);
  
  // Double-check Delete State (2-step confirmation)
  const [deleteStep, setDeleteStep] = useState(0);

  // New relationship form state
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState('partner');

  // Stable ID for newly created pet during an open modal session
  const sessionPetIdRef = useRef(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (pet) {
      sessionPetIdRef.current = pet.id;
      setName(pet.name || '');
      setGender(pet.gender || 'male');
      setNeutered(pet.neutered !== undefined ? pet.neutered : true);
      setBirthDate(pet.birthDate || '');
      setStatus(pet.status || 'alive');
      setDeceasedDate(pet.deceasedDate || '');
      setNote(pet.note || '');
      const petPhotos = Array.isArray(pet.photos) && pet.photos.length > 0
        ? pet.photos
        : (pet.avatar ? [pet.avatar] : []);
      setPhotos(petPhotos);
      setAvatar(pet.avatar || (petPhotos[0] || ''));
      setRelationships(pet.relationships || []);
    } else {
      sessionPetIdRef.current = `pet-${Date.now()}`;
      setName('');
      setGender('male');
      setNeutered(true);
      setBirthDate(toLocalDateString());
      setStatus('alive');
      setDeceasedDate('');
      setNote('');
      setAvatar('');
      setPhotos([]);
      setRelationships([]);
    }
    setDeleteStep(0);
    const t = setTimeout(() => {
      isLoadedRef.current = true;
    }, 150);

    return () => {
      clearTimeout(t);
      isLoadedRef.current = false;
    };
  }, [pet, isOpen]);

  // 💾 AUTOMATIC LIVE SAVE (Updates the same stable ID without duplicating pets)
  useEffect(() => {
    if (!isOpen || !isLoadedRef.current) return;
    if (!name.trim()) return;

    const timer = setTimeout(() => {
      onSave({
        ...(pet || {}),
        id: sessionPetIdRef.current,
        name: name.trim(),
        gender,
        neutered,
        birthDate: birthDate || toLocalDateString(),
        status,
        deceasedDate: status === 'deceased' ? (deceasedDate || toLocalDateString()) : '',
        note: note.trim(),
        avatar: photos[0] || avatar,
        photos: photos.length > 0 ? photos : (avatar ? [avatar] : []),
        relationships
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [name, gender, neutered, birthDate, status, deceasedDate, note, avatar, photos, relationships, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
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

          setPhotos(prev => {
            const next = [...prev, dataUrl];
            if (!avatar) setAvatar(next[0]);
            return next;
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemovePhoto = (idxToRemove) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== idxToRemove);
      setAvatar(next[0] || '');
      return next;
    });
  };

  const handleSetPrimaryPhoto = (idx) => {
    setPhotos(prev => {
      if (idx === 0 || !prev[idx]) return prev;
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      const next = [target, ...rest];
      setAvatar(next[0]);
      return next;
    });
  };

  const getRelationLabel = (type, targetPet) => {
    const isTargetFemale = targetPet?.gender === 'female';
    switch (type) {
      case 'partner':
        return 'แฟน';
      case 'parent':
        return isTargetFemale ? 'แม่' : 'พ่อ';
      case 'child':
        return isTargetFemale ? 'ลูกสาว' : 'ลูกชาย';
      case 'sibling':
        return isTargetFemale ? 'พี่สาว/น้องสาว' : 'พี่ชาย/น้องชาย';
      case 'twin':
        return 'ฝาแฝด';
      case 'bestie':
        return 'เพื่อนซี้';
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

    const existingIdx = relationships.findIndex(r => r.targetPetId === relTargetId);
    if (existingIdx >= 0) {
      const updated = [...relationships];
      updated[existingIdx] = newRel;
      setRelationships(updated);
    } else {
      setRelationships([...relationships, newRel]);
    }
    setRelTargetId('');
  };

  const handleRemoveRelationship = (targetId) => {
    setRelationships(relationships.filter(r => r.targetPetId !== targetId));
  };

  const currentId = sessionPetIdRef.current;
  const availableTargetPets = allPets.filter(p => p.id !== currentId);

  const relTypeOptions = [
    { value: 'partner', label: 'แฟน', icon: faHeart },
    { value: 'parent', label: 'พ่อ/แม่', icon: faUsers },
    { value: 'child', label: 'ลูก', icon: faPaw },
    { value: 'sibling', label: 'พี่น้อง', icon: faLink },
    { value: 'twin', label: 'แฝด', icon: faUsers },
    { value: 'bestie', label: 'เพื่อนซี้', icon: faHeart },
  ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4 backdrop-blur-xs animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-[32px] sm:rounded-[32px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-slideUpSheet sm:animate-scaleUp pb-[env(safe-area-inset-bottom)]"
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 -mb-1 sm:hidden flex-shrink-0" />
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <h2 className="font-mitr text-lg font-medium text-slate-800">
              {pet ? pet.name : (name.trim() || 'เพิ่มสมาชิกใหม่')}
            </h2>
            {name.trim() && (
              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs" title="บันทึกอัตโนมัติ">
                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
              </span>
            )}
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Photos Management (Multiple Photos for Fade Slideshow) */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-paw-50 border-2 border-paw-200 shadow-sm flex items-center justify-center">
                {photos[0] || avatar ? (
                  <img src={photos[0] || avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FontAwesomeIcon icon={faPaw} className="text-3xl text-paw-300" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-paw-500 text-white shadow-md cursor-pointer hover:bg-paw-600 flex items-center justify-center active:scale-95 transition-all"
                title="เพิ่มรูปภาพ"
              >
                <FontAwesomeIcon icon={faCamera} className="text-xs" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>

            {/* Thumbnail Gallery & Add Photo Trigger */}
            <div className="mt-3 flex items-center gap-2 flex-wrap justify-center max-w-xs">
              {photos.map((src, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSetPrimaryPhoto(idx)}
                  className={`relative group/thumb w-12 h-12 rounded-xl overflow-hidden border cursor-pointer shadow-2xs transition-all ${
                    idx === 0 ? 'border-paw-500 ring-2 ring-paw-200' : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                  }`}
                  title={idx === 0 ? 'รูปหลัก' : 'คลิกเพื่อตั้งเป็นรูปหลัก'}
                >
                  <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(idx);
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[9px] flex items-center justify-center hover:bg-red-500 transition-colors"
                    title="ลบรูปนี้"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-paw-600 text-[8px] text-white text-center font-bold">
                      หลัก
                    </span>
                  )}
                </div>
              ))}
              <label 
                className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 hover:border-paw-400 bg-slate-50 hover:bg-paw-50/50 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-paw-600 transition-all active:scale-95"
                title="เพิ่มรูปภาพเพิ่มเติม"
              >
                <FontAwesomeIcon icon={faCamera} className="text-xs" />
                <span className="text-[8px] font-medium mt-0.5">+รูป</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">ใส่ได้มากกว่า 1 รูปเพื่อเล่น Slideshow บนการ์ด</span>
          </div>

          {/* Name Input */}
          <div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ชื่อน้อง..."
              className="w-full font-mitr font-medium text-center rounded-2xl border border-slate-200 px-4 py-2.5 text-lg text-slate-800 focus:border-paw-500 focus:outline-hidden focus:ring-2 focus:ring-paw-100"
            />
          </div>

          {/* 🚻 Gender & Neutered Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                gender === 'male'
                  ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faMars} className="text-sky-500" />
              <span>ตัวผู้</span>
            </button>

            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                gender === 'female'
                  ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faVenus} className="text-pink-500" />
              <span>ตัวเมีย</span>
            </button>

            <button
              type="button"
              onClick={() => setNeutered(!neutered)}
              className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                neutered 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <FontAwesomeIcon icon={faScissors} className="text-[11px]" />
              <span>ทำหมัน</span>
            </button>
          </div>

          {/* Status (Alive / Deceased) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('alive')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                status === 'alive'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faSeedling} className="text-emerald-500" />
              <span>อยู่ด้วยกัน</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus('deceased')}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                status === 'deceased'
                  ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FontAwesomeIcon icon={faRainbow} className="text-amber-500" />
              <span>ดาวแมว</span>
            </button>
          </div>

          {/* Dates Row */}
          <div className={`grid gap-2 ${status === 'deceased' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 mb-1">
                <FontAwesomeIcon icon={faCalendarDays} className="text-paw-500" />
                <span>วันเกิด</span>
              </div>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-paw-500 focus:outline-hidden"
              />
            </div>

            {status === 'deceased' && (
              <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-100 animate-fadeIn">
                <div className="text-[10px] font-bold text-sky-700 uppercase flex items-center gap-1.5 mb-1">
                  <FontAwesomeIcon icon={faRainbow} className="text-amber-500" />
                  <span>สู่สายรุ้ง</span>
                </div>
                <input
                  type="date"
                  value={deceasedDate}
                  onChange={(e) => setDeceasedDate(e.target.value)}
                  className="w-full rounded-xl border border-sky-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* 🔗 RELATIONSHIPS SECTION */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FontAwesomeIcon icon={faUsers} className="text-paw-500 text-xs" />
                <span>สายสัมพันธ์</span>
              </span>
              {relationships.length > 0 && (
                <span className="text-[10px] font-bold bg-paw-100 text-paw-700 px-2 py-0.5 rounded-full">
                  {relationships.length}
                </span>
              )}
            </div>

            {/* List Existing Relationships */}
            {relationships.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {relationships.map((rel, idx) => {
                  const target = allPets.find(p => p.id === rel.targetPetId);
                  return (
                    <div key={idx} className="inline-flex items-center gap-1.5 bg-white pl-2.5 pr-1.5 py-1 rounded-full border border-slate-200 text-xs shadow-2xs">
                      <span className="text-paw-600 font-bold text-[11px]">{rel.label}:</span>
                      <span className="font-mitr font-medium text-slate-800">{target ? target.name : '-'}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRelationship(rel.targetPetId)}
                        className="w-4 h-4 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Relationship */}
            {availableTargetPets.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1">
                <select
                  value={relTargetId}
                  onChange={(e) => setRelTargetId(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden"
                >
                  <option value="">เลือกสมาชิก...</option>
                  {availableTargetPets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden"
                >
                  {relTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddRelationship}
                  disabled={!relTargetId}
                  className="w-8 h-8 rounded-xl bg-paw-500 hover:bg-paw-600 disabled:opacity-35 text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="relative">
            <FontAwesomeIcon icon={faNoteSticky} className="absolute left-3.5 top-3 text-slate-300 text-xs" />
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="โน้ตบันทึก..."
              className="w-full rounded-2xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-paw-500 focus:outline-hidden focus:ring-2 focus:ring-paw-100"
            />
          </div>

          {/* 🗑️ FAINT SUBTLE DELETE BUTTON WITH 2-STEP CONFIRMATION */}
          {pet && (
            <div className="pt-2 flex flex-col items-center">
              {deleteStep === 0 && (
                <button
                  type="button"
                  onClick={() => setDeleteStep(1)}
                  className="text-[11px] text-slate-300 hover:text-red-400 py-1 px-3 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="text-[10px] opacity-60" />
                  <span>ลบข้อมูล</span>
                </button>
              )}

              {deleteStep === 1 && (
                <div className="w-full p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-amber-800 font-medium pl-1">ลบ {pet.name}?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px]"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteStep(2)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-medium text-[11px]"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              )}

              {deleteStep === 2 && (
                <div className="w-full p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs animate-fadeIn">
                  <span className="text-red-700 font-bold pl-1">ยืนยันลบถาวร?</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-[11px]"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(pet.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold shadow-2xs text-[11px]"
                    >
                      ยืนยัน
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
