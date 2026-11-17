import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faCamera, faTrashCan, faCheck, faUsers, 
  faVenus, faMars, faLink, faHeart, faScissors,
  faSeedling, faRainbow, faPaw, faPlus, faCalendarDays, faNoteSticky,
  faCropSimple, faShieldCat
} from '@fortawesome/free-solid-svg-icons';
import { toLocalDateString } from '../utils';
import { getPhotoSrc, getPhotoThumb, fileToDataUrl, formatBytes } from '../imageUtils';
import DateField from './DateField';
import ImageCropModal from './ImageCropModal';
import { useSheetDrag } from '../useSheetDrag';

export default function PetModal({ pet, allPets = [], isOpen, onClose, onSave, onDelete, dateFormat = 'th', initialPhotos = [] }) {
  const {
    isVisible,
    requestClose,
    scrollRef,
    backdropAnimationClass,
    sheetAnimationClass,
    handleProps,
    sheetProps
  } = useSheetDrag(onClose, isOpen, pet);
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

  // ✂️ Image Cropper & Focus Area Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropQueue, setCropQueue] = useState([]);
  const [cropQueueIndex, setCropQueueIndex] = useState(0);
  const [croppingPhotoIdx, setCroppingPhotoIdx] = useState(null); // null if queue, index if re-cropping

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
      setAvatar(getPhotoSrc(pet.avatar) || (getPhotoSrc(petPhotos[0]) || ''));
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
      const initPhotos = Array.isArray(initialPhotos) && initialPhotos.length > 0 ? initialPhotos : [];
      setPhotos(initPhotos);
      setAvatar(getPhotoSrc(initPhotos[0]) || '');
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
        avatar: getPhotoSrc(photos[0]) || getPhotoSrc(avatar) || '',
        avatarThumb: getPhotoThumb(photos[0]) || getPhotoThumb(avatar) || '',
        photos: photos.length > 0 ? photos : (avatar ? [avatar] : []),
        relationships
      });
    }, 280);

    return () => clearTimeout(timer);
  }, [name, gender, neutered, birthDate, status, deceasedDate, note, avatar, photos, relationships, isOpen]);

  if (!isVisible) return null;

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const items = await Promise.all(
        files.map(async (file) => ({
          dataUrl: await fileToDataUrl(file),
          file,
          originalSize: file.size
        }))
      );
      setCroppingPhotoIdx(null);
      setCropQueue(items);
      setCropQueueIndex(0);
      setIsCropModalOpen(true);
    } catch (err) {
      console.error('Failed to read image files:', err);
    }
    e.target.value = '';
  };

  const handleOpenCropForExisting = (idx) => {
    if (!photos[idx]) return;
    const item = photos[idx];
    const src = getPhotoSrc(item);
    setCroppingPhotoIdx(idx);
    setCropQueue([{
      dataUrl: src,
      originalSize: item?.sizeBytes || 0,
      focus: item?.focus || null
    }]);
    setCropQueueIndex(0);
    setIsCropModalOpen(true);
  };

  const handleCropConfirm = (processed) => {
    if (croppingPhotoIdx !== null) {
      // Re-cropping an existing photo
      setPhotos(prev => {
        const next = [...prev];
        next[croppingPhotoIdx] = processed;
        if (croppingPhotoIdx === 0) {
          setAvatar(processed.src);
        }
        return next;
      });
      setIsCropModalOpen(false);
      setCroppingPhotoIdx(null);
      setCropQueue([]);
    } else {
      // Adding new photo from queue
      setPhotos(prev => {
        const next = [...prev, processed];
        if (!avatar) setAvatar(processed.src);
        return next;
      });

      if (cropQueueIndex + 1 < cropQueue.length) {
        setCropQueueIndex(prev => prev + 1);
      } else {
        setIsCropModalOpen(false);
        setCropQueue([]);
      }
    }
  };

  const handleCropSkip = () => {
    if (cropQueueIndex + 1 < cropQueue.length) {
      setCropQueueIndex(prev => prev + 1);
    } else {
      setIsCropModalOpen(false);
      setCropQueue([]);
    }
  };

  const handleCropClose = () => {
    setIsCropModalOpen(false);
    setCropQueue([]);
    setCroppingPhotoIdx(null);
  };

  const handleRemovePhoto = (idxToRemove) => {
    setPhotos(prev => {
      const next = prev.filter((_, idx) => idx !== idxToRemove);
      setAvatar(getPhotoSrc(next[0]) || '');
      return next;
    });
  };

  const handleSetPrimaryPhoto = (idx) => {
    setPhotos(prev => {
      if (idx === 0 || !prev[idx]) return prev;
      const target = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      const next = [target, ...rest];
      setAvatar(getPhotoSrc(next[0]));
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
      onClick={requestClose}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md rounded-t-[32px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh] ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle Grab Zone */}
        <div {...handleProps} className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/60" title="ลากลงเพื่อปิด">
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>
        
        {/* Header */}
        <div className="px-[5%] py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
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
            onClick={requestClose}
            aria-label="Close"
            className="w-8 h-8 text-slate-400 hover:text-slate-600 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <div ref={scrollRef} className="px-[5%] py-5 flex-1 min-h-0 overflow-y-auto space-y-4 overscroll-contain touch-pan-y">
          
          {/* Photos Management (Multiple Photos for Fade Slideshow) */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-paw-50 border-2 border-paw-200 shadow-md flex items-center justify-center relative">
                {photos[0] || avatar ? (
                  <>
                    <img 
                      src={getPhotoThumb(photos[0]) || getPhotoSrc(photos[0]) || getPhotoThumb(avatar) || getPhotoSrc(avatar)} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    {/* Tap to Crop Focus Area (Always visible pill + full area tap) */}
                    <button
                      type="button"
                      onClick={() => handleOpenCropForExisting(0)}
                      className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent text-white flex items-end justify-start p-2.5 transition-opacity duration-150 active:bg-black/30"
                      title="ปรับตำแหน่งโฟกัสการ์ด"
                    >
                      <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 shadow-xs">
                        <FontAwesomeIcon icon={faCropSimple} className="text-[10px]" />
                        <span>ปรับโฟกัส</span>
                      </span>
                    </button>
                  </>
                ) : (
                  <FontAwesomeIcon icon={faPaw} className="text-4xl text-paw-300" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-1.5 -right-1.5 w-10 h-10 rounded-full bg-paw-500 text-white shadow-lg cursor-pointer hover:bg-paw-600 flex items-center justify-center active:scale-95 transition-transform transition-colors duration-150 ease-out z-10 border-2 border-white"
                title="เพิ่มรูปภาพ"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
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
            <div className="mt-3.5 flex items-center gap-2.5 flex-wrap justify-center w-full">
              {photos.map((photoItem, idx) => {
                const src = getPhotoSrc(photoItem);
                const thumb = getPhotoThumb(photoItem);
                return (
                  <div 
                    key={idx} 
                    className={`relative group/thumb w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden border shadow-2xs transition-transform duration-150 ease-out active:scale-95 cursor-pointer ${
                      idx === 0 ? 'border-paw-500 ring-2 ring-paw-200' : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                    }`}
                    onClick={() => handleSetPrimaryPhoto(idx)}
                    title={idx === 0 ? 'รูปหลัก' : 'คลิกเพื่อตั้งเป็นรูปหลัก'}
                  >
                    <img 
                      src={thumb || src} 
                      alt={`Thumb ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Action buttons overlay */}
                    <div className="absolute top-1 inset-x-1 flex items-center justify-between pointer-events-none">
                      {/* Crop / Focus button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCropForExisting(idx);
                        }}
                        aria-label="ปรับตำแหน่งโฟกัสการ์ด"
                        className="pointer-events-auto w-5 h-5 rounded-full bg-black/65 hover:bg-paw-500 text-white text-[9px] flex items-center justify-center transition-colors shadow-2xs"
                        title="ปรับโฟกัส"
                      >
                        <FontAwesomeIcon icon={faCropSimple} />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(idx);
                        }}
                        aria-label="ลบรูปภาพนี้"
                        className="pointer-events-auto w-5 h-5 rounded-full bg-black/65 hover:bg-red-500 text-white text-[9px] flex items-center justify-center transition-colors shadow-2xs"
                        title="ลบรูปนี้"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>

                    {/* Badge */}
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-paw-600/90 text-[9px] text-white text-center font-bold py-0.5">
                        รูปหลัก
                      </span>
                    )}
                  </div>
                );
              })}
              <label 
                className="w-16 h-16 flex-shrink-0 rounded-2xl border-2 border-dashed border-slate-300 hover:border-paw-400 bg-slate-50 hover:bg-paw-50/50 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-paw-600 transition-colors transition-transform duration-150 ease-out active:scale-95"
                title="เพิ่มรูปภาพเพิ่มเติม"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
                <span className="text-[10px] font-semibold mt-0.5">+เพิ่มรูป</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <input
              type="text"
              required
              autoComplete="off"
              aria-label="ชื่อน้องแมว"
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
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
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
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
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
              className={`py-2.5 px-2 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
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
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
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
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-colors transition-transform duration-150 ease-out active:scale-97 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
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
            <DateField
              label="วันเกิด"
              value={birthDate}
              onChange={setBirthDate}
              required
              showAgePreview={true}
              title="เลือกวันเกิดน้องแมว"
              dateFormat={dateFormat}
            />

            {status === 'deceased' && (
              <DateField
                label="สู่สายรุ้ง"
                value={deceasedDate}
                onChange={setDeceasedDate}
                title="เลือกวันที่สู่สายรุ้ง"
                dateFormat={dateFormat}
                icon={faRainbow}
                iconColor="text-amber-500"
                minDate={birthDate || undefined}
                allowClear={true}
                className="bg-sky-50/60 border-sky-100"
              />
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
                  className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden truncate"
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
                  className="flex-shrink-0 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-paw-500 focus:outline-hidden"
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

      {/* ✂️ Crop & Focus Area Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageItem={cropQueue[cropQueueIndex]}
        queueIndex={cropQueueIndex}
        queueTotal={cropQueue.length}
        onConfirm={handleCropConfirm}
        onSkip={cropQueue.length > 1 ? handleCropSkip : undefined}
        onClose={handleCropClose}
      />
    </div>
  );
}
