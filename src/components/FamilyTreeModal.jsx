import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faSitemap, faHeart, faPaw, faVenus, faMars 
} from '@fortawesome/free-solid-svg-icons';
import { getPhotoThumb, getPhotoSrc } from '../imageUtils';

export default function FamilyTreeModal({ isOpen, onClose, pets = [], onSelectPet }) {
  if (!isOpen) return null;

  const petMap = new Map(pets.map(p => [p.id, p]));
  const chainoi = petMap.get('pet-1') || pets.find(p => p.name === 'ชายน้อย');
  const tangthon = petMap.get('pet-2') || pets.find(p => p.name === 'ตังค์ทอน');
  const khaitom = petMap.get('pet-3') || pets.find(p => p.name === 'ไข่ต้ม');
  const phuayphuay = petMap.get('pet-4') || pets.find(p => p.name === 'พวยพวย');
  const tassanai = petMap.get('pet-5') || pets.find(p => p.name === 'ทัศนัยภูวดล');
  const thongjiew = petMap.get('pet-6') || pets.find(p => p.name === 'ทองจิ๋ว');
  const kuaytiew = petMap.get('pet-7') || pets.find(p => p.name === 'ก๋วยเตี๋ยว');

  // Other pets if user added custom pets
  const recognizedIds = new Set(['pet-1', 'pet-2', 'pet-3', 'pet-4', 'pet-5', 'pet-6', 'pet-7']);
  const otherPets = pets.filter(p => !recognizedIds.has(p.id));

  // Reusable Rounded Block Card with Large Photo, Gender badge, and Name only
  const renderPetCard = (pet) => {
    if (!pet) return null;
    const photoSrc = getPhotoThumb(pet.avatarThumb || pet.avatar || pet.photo) || getPhotoSrc(pet.avatar || pet.photo);
    const isDeceased = pet.status === 'deceased';
    const isFemale = pet.gender === 'female';

    return (
      <div 
        key={pet.id}
        onClick={() => onSelectPet && onSelectPet(pet)}
        className={`w-[136px] sm:w-[155px] rounded-3xl bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95 group/card border ${
          isDeceased 
            ? 'border-amber-300 ring-2 ring-sky-100 shadow-amber-50' 
            : 'border-slate-200/80 hover:border-paw-300'
        }`}
      >
        {/* Large 1:1 Photo */}
        <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
          {photoSrc ? (
            <img 
              src={photoSrc} 
              alt={pet.name} 
              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-paw-50 text-paw-400">
              <FontAwesomeIcon icon={faPaw} className="text-3xl" />
            </div>
          )}

          {/* Gender Mini Badge on Photo */}
          <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-white/90 backdrop-blur-xs ${
            isFemale ? 'bg-pink-500 text-white' : 'bg-sky-500 text-white'
          }`}>
            <FontAwesomeIcon icon={isFemale ? faVenus : faMars} />
          </div>

          {/* Deceased Rainbow Memorial Tag */}
          {isDeceased && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-white text-[10px] font-sans font-medium flex items-center gap-1 shadow-2xs">
              <span>🌈</span>
            </div>
          )}
        </div>

        {/* Pet Name */}
        <div className="py-2.5 px-2 text-center bg-white">
          <span className="font-mitr font-medium text-sm text-slate-800 truncate block">
            {pet.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-800 animate-fadeIn overscroll-contain"
    >
      {/* Clean Full-Screen Header */}
      <div className="px-5 py-3.5 sm:py-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shadow-2xs pt-[max(0.875rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-paw-100 flex items-center justify-center text-paw-600 shadow-2xs">
            <FontAwesomeIcon icon={faSitemap} className="text-sm" />
          </div>
          <h2 className="font-mitr font-semibold text-lg text-slate-800">ผังครอบครัว</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faXmark} className="text-sm" />
        </button>
      </div>

      {/* Smooth Scrollable Inverted Pyramid Block Stream */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 pb-16 bg-gradient-to-b from-slate-100 via-paw-50/20 to-slate-100 pb-[max(4rem,env(safe-area-inset-bottom))] overscroll-contain">
        <div className="flex flex-col items-center w-full space-y-6 sm:space-y-7 max-w-lg mx-auto">
          
          {/* 1. ชายน้อย: พ่อตังค์ทอน อยู่ฝั่งตังค์ทอนเท่านั้น */}
          <div className="flex items-center justify-center w-full max-w-[340px] sm:max-w-[380px]">
            <div className="flex-1 flex justify-center">
              {chainoi && renderPetCard(chainoi)}
            </div>
            <div className="w-8 sm:w-10 flex-shrink-0" />
            <div className="flex-1" />
          </div>

          {/* 2. ตังค์ทอน & ไข่ต้ม: แฟนกัน อยู่ข้างกัน */}
          <div className="flex items-center justify-center w-full max-w-[340px] sm:max-w-[380px]">
            <div className="flex-1 flex justify-center">
              {tangthon && renderPetCard(tangthon)}
            </div>
            <div className="w-8 sm:w-10 flex items-center justify-center flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-xs shadow-2xs animate-pulse motion-reduce:animate-none">
                <FontAwesomeIcon icon={faHeart} />
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              {khaitom && renderPetCard(khaitom)}
            </div>
          </div>

          {/* 3. ชุดแรก: พวยพวย กับ ทัศนัยภูวดล (2 ตัวข้างกัน) */}
          <div className="flex items-center justify-center gap-6 sm:gap-8">
            {phuayphuay && renderPetCard(phuayphuay)}
            {tassanai && renderPetCard(tassanai)}
          </div>

          {/* 4. ชุดสอง: ทองจิ๋ว (ตรงกลาง 1 ตัว) */}
          <div className="flex justify-center">
            {thongjiew && renderPetCard(thongjiew)}
          </div>

          {/* 5. ชุดสาม: ก๋วยเตี๋ยว (ตรงกลาง 1 ตัว) */}
          <div className="flex justify-center">
            {kuaytiew && renderPetCard(kuaytiew)}
          </div>

          {/* Other pets if custom added */}
          {otherPets.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-5 pt-6 border-t border-slate-200/60 w-full">
              {otherPets.map(pet => renderPetCard(pet))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
