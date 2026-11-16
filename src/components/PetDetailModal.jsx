import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPenToSquare, faWeightScale, faFire, faUsers, 
  faCalendarDays, faWandMagicSparkles, faHeart, faVenus, faMars, faLink 
} from '@fortawesome/free-solid-svg-icons';
import { calculateAge, calculateCatToHumanAge, formatDate, getLifeStage, getDaysUntilBirthday } from '../utils';

export default function PetDetailModal({ pet, allPets = [], dateFormat = 'en', isOpen, onClose, onEdit, onOpenMemorial, onOpenHealth, onOpenFamily }) {
  if (!isOpen || !pet) return null;

  const isDeceased = pet.status === 'deceased';
  const age = calculateAge(pet.birthDate, isDeceased ? pet.deceasedDate : null);
  const humanAge = calculateCatToHumanAge(age.years, age.months);
  const lifeStage = getLifeStage(age.years, age.months);
  const daysUntilBday = !isDeceased ? getDaysUntilBirthday(pet.birthDate) : null;

  // Resolved relationships (including multi-generation kinships like ตา ยาย หลาน เหลน ทวด)
  const sourceRels = pet.resolvedRelationships || pet.relationships || [];
  const relations = sourceRels.map(r => {
    const target = allPets.find(p => p.id === r.targetPetId);
    return target ? { ...r, targetName: target.name, targetGender: target.gender, targetAvatar: target.avatar } : null;
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-white text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header with Hero preview */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 flex-shrink-0">
          {pet.avatar ? (
            <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-paw-100">🐱</div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>

          {/* Name overlay */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mitr text-3xl font-bold text-white tracking-wide drop-shadow-md">
                  {pet.name}
                </h2>
                <FontAwesomeIcon 
                  icon={pet.gender === 'female' ? faVenus : faMars} 
                  className={`text-lg drop-shadow-md ${
                    pet.gender === 'female' ? 'text-pink-300' : 'text-sky-300'
                  }`} 
                />
              </div>
              <div className="text-xs text-white/90 mt-0.5 font-medium flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isDeceased ? 'bg-sky-500/80 text-white' : 'bg-emerald-500/80 text-white'
                }`}>
                  {isDeceased ? 'ดาวแมว' : 'อยู่ด้วยกัน'}
                </span>
                <span>•</span>
                <span>{pet.neutered ? 'ทำหมันแล้ว' : 'ยังไม่ทำหมัน'}</span>
                <span>•</span>
                <span>{lifeStage.label}</span>
              </div>
            </div>

            {/* Quick Edit button */}
            <button
              onClick={() => {
                onClose();
                onEdit(pet);
              }}
              className="p-2.5 rounded-full bg-paw-500 hover:bg-paw-600 text-white shadow-lg active:scale-95 transition-transform"
              title="แก้ไข"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">

          {/* 📅 Status & Dates Overview Card */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">วันเกิด</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{formatDate(pet.birthDate, dateFormat)}</div>
              {!isDeceased && (
                <div className="text-[11px] text-paw-600 font-medium mt-0.5">
                  {daysUntilBday === 0 ? '🎉 วันเกิดวันนี้!' : `อีก ${daysUntilBday} วัน`}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {isDeceased ? 'สู่วิมานดาวแมว' : 'เทียบคน'}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {isDeceased ? (pet.deceasedDate ? formatDate(pet.deceasedDate, dateFormat) : '-') : `~${humanAge} ปี`}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isDeceased ? `${age.totalDays.toLocaleString()} วัน` : 'วัยสมบูรณ์'}
              </div>
            </div>
          </div>

          {/* Quick Actions Hub */}
          <div className="grid grid-cols-2 gap-2.5">
            {!isDeceased ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenHealth(pet);
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWeightScale} className="text-sm" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">สมุดสุขภาพ</div>
                  <div className="text-[11px] text-slate-400">
                    {pet.latestWeight ? `${pet.latestWeight} กก.` : 'บันทึกน้ำหนัก'}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenMemorial(pet);
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200 text-left transition-colors col-span-2"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <FontAwesomeIcon icon={faFire} className="text-sm" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">วิมานดาวแมว</div>
                  <div className="text-[11px] text-slate-400">ระลึกถึง</div>
                </div>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenFamily();
              }}
              className={`flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors ${
                isDeceased ? 'col-span-2' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-sm" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">ผังครอบครัว</div>
                <div className="text-[11px] text-slate-400">{relations.length} สายสัมพันธ์</div>
              </div>
            </button>
          </div>

          {/* 🔗 Relationships List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>สายสัมพันธ์</span>
              <button
                onClick={() => {
                  onClose();
                  onEdit(pet);
                }}
                className="text-[11px] text-paw-600 font-semibold hover:underline"
              >
                + แก้ไข
              </button>
            </div>

            {relations.length > 0 ? (
              <div className="space-y-1.5">
                {relations.map((rel, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                        {rel.targetAvatar ? (
                          <img src={rel.targetAvatar} alt={rel.targetName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">🐱</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="text-paw-600 font-medium">
                            <FontAwesomeIcon icon={faLink} className="text-[10px] mr-1" />
                            {rel.label}:
                          </span>
                          <span className="font-mitr font-medium text-sm">{rel.targetName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={rel.targetGender === 'female' ? faVenus : faMars} className="text-[10px]" />
                      <span>{rel.targetGender === 'female' ? 'ตัวเมีย' : 'ตัวผู้'}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
                ยังไม่มีสายสัมพันธ์
              </div>
            )}
          </div>

          {/* Note */}
          {pet.note && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">บันทึก</div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs italic text-slate-600">
                "{pet.note}"
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
