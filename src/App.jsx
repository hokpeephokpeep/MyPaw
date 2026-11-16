import React, { useState, useEffect } from 'react';
import { initialPets } from './defaultPets';
import PetCard from './components/PetCard';
import PetModal from './components/PetModal';
import ImageViewerModal from './components/ImageViewerModal';
import BackupModal from './components/BackupModal';
import HamburgerDrawer from './components/HamburgerDrawer';
import MemorialModal from './components/MemorialModal';
import HealthLogModal from './components/HealthLogModal';
import FamilyTreeModal from './components/FamilyTreeModal';
import PetDetailModal from './components/PetDetailModal';
import SplashScreen from './components/SplashScreen';
import { resolveAllKinships } from './kinshipEngine';
import { parseLocalDate, getTodayLocal } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faXmark, faPaw, faMagnifyingGlass, faSitemap } from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mypetsage_modern_pets_v2';

export default function App() {
  const [pets, setPets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialPets;
    } catch (e) {
      return initialPets;
    }
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'alive', 'deceased'
  const [sortBy, setSortBy] = useState('age_desc'); // 'age_desc', 'age_asc', 'bday_near'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingImagePet, setViewingImagePet] = useState(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [memorialPet, setMemorialPet] = useState(null);
  const [healthPet, setHealthPet] = useState(null);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [detailPet, setDetailPet] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  // 🌍 International vs Thai Date System ('en' | 'th')
  const [dateFormat, setDateFormat] = useState(() => {
    try {
      return localStorage.getItem('mypaw_date_format') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const handleSetDateFormat = (fmt) => {
    setDateFormat(fmt);
    try {
      localStorage.setItem('mypaw_date_format', fmt);
    } catch(e) {}
  };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [pets]);

  // Check for today's birthday (Local Timezone Safe)
  useEffect(() => {
    const today = getTodayLocal();
    const hasBirthdayToday = pets.some(p => {
      if (p.status === 'deceased' || !p.birthDate) return false;
      const bday = parseLocalDate(p.birthDate);
      return bday && bday.getDate() === today.getDate() && bday.getMonth() === today.getMonth();
    });

    if (hasBirthdayToday) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [pets]);

  // Handlers
  const handleSavePet = (savedPet) => {
    setPets(prev => {
      let updated = [...prev];
      const index = updated.findIndex(p => p.id === savedPet.id);
      if (index >= 0) {
        updated[index] = savedPet;
      } else {
        updated = [savedPet, ...updated];
      }

      // 🔄 AUTOMATIC BIDIRECTIONAL RELATIONSHIP SYNC
      const getInverseLabel = (type, currentPet) => {
        const isCurrentFemale = currentPet?.gender === 'female';
        switch (type) {
          case 'partner':
            return 'แฟน';
          case 'parent':
            return isCurrentFemale ? 'ลูกสาว' : 'ลูกชาย';
          case 'child':
            return isCurrentFemale ? 'แม่' : 'พ่อ';
          case 'sibling':
            return isCurrentFemale ? 'พี่สาว/น้องสาว' : 'พี่ชาย/น้องชาย';
          case 'twin':
            return 'ฝาแฝด';
          case 'bestie':
            return 'เพื่อนซี้';
          default:
            return 'สายสัมพันธ์';
        }
      };

      const getInverseType = (type) => {
        if (type === 'parent') return 'child';
        if (type === 'child') return 'parent';
        return type;
      };

      (savedPet.relationships || []).forEach(rel => {
        const targetIdx = updated.findIndex(p => p.id === rel.targetPetId);
        if (targetIdx >= 0) {
          const target = updated[targetIdx];
          const targetRels = target.relationships ? [...target.relationships] : [];
          const existingIdx = targetRels.findIndex(r => r.targetPetId === savedPet.id);

          const reverseItem = {
            targetPetId: savedPet.id,
            type: getInverseType(rel.type),
            label: getInverseLabel(rel.type, savedPet)
          };

          if (existingIdx >= 0) {
            targetRels[existingIdx] = reverseItem;
          } else {
            targetRels.push(reverseItem);
          }

          updated[targetIdx] = {
            ...target,
            relationships: targetRels
          };
        }
      });

      const currentTargetIds = new Set((savedPet.relationships || []).map(r => r.targetPetId));
      updated = updated.map(p => {
        if (p.id !== savedPet.id && p.relationships) {
          if (!currentTargetIds.has(p.id) && p.relationships.some(r => r.targetPetId === savedPet.id)) {
            return {
              ...p,
              relationships: p.relationships.filter(r => r.targetPetId !== savedPet.id)
            };
          }
        }
        return p;
      });

      return updated;
    });

    if (memorialPet && memorialPet.id === savedPet.id) {
      setMemorialPet(savedPet);
    }
    if (healthPet && healthPet.id === savedPet.id) {
      setHealthPet(savedPet);
    }
  };

  // Full Cascade Delete (removes deleted pet ID from all remaining pets' relationships)
  const handleDeletePet = (id) => {
    setPets(prev => 
      prev
        .filter(p => p.id !== id)
        .map(p => ({
          ...p,
          relationships: (p.relationships || []).filter(r => r.targetPetId !== id)
        }))
    );
  };

  // 🌳 Infer all generations and kinships (ปู่ ย่า ตา ยาย หลาน เหลน ทวด แฟน ลุง ป้า น้า อา)
  const resolvedPets = resolveAllKinships(pets);

  // Filter & Sort
  const filteredPets = resolvedPets
    .filter(p => {
      if (activeTab === 'alive') return p.status !== 'deceased';
      if (activeTab === 'deceased') return p.status === 'deceased';
      return true;
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             (p.note && p.note.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortBy === 'age_desc') {
        return (parseLocalDate(a.birthDate) || 0) - (parseLocalDate(b.birthDate) || 0);
      }
      if (sortBy === 'age_asc') {
        return (parseLocalDate(b.birthDate) || 0) - (parseLocalDate(a.birthDate) || 0);
      }
      if (sortBy === 'bday_near') {
        const getBdayScore = (p) => {
          if (p.status === 'deceased') return 999999999999;
          const today = getTodayLocal();
          const birth = parseLocalDate(p.birthDate);
          if (!birth) return 999999999999;
          let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
          if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
          return next - today;
        };
        return getBdayScore(a) - getBdayScore(b);
      }
      return 0;
    });

  const aliveCount = pets.filter(p => p.status !== 'deceased').length;
  const deceasedCount = pets.filter(p => p.status === 'deceased').length;
  const isFiltered = activeTab !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center">
      {/* App Container */}
      <div className="w-full max-w-lg min-h-screen bg-slate-50 shadow-2xl flex flex-col relative pb-8">
        
        {/* Clean Sticky App Bar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 -ml-1 rounded-2xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-2xs"
              title="เมนู"
            >
              <FontAwesomeIcon icon={faBars} className="text-base" />
            </button>

            {/* Brand Title in Mitr */}
            <h1 className="font-mitr text-2xl font-semibold text-slate-900 tracking-wide flex items-center gap-1.5">
              <span>MyPaw</span>
              <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-base" />
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Filter Pill */}
            {isFiltered && (
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-paw-50 border border-paw-200 text-[11px] font-bold text-paw-700 hover:bg-paw-100 transition-colors animate-fadeIn"
              >
                <span>{activeTab === 'alive' ? 'อยู่ด้วยกัน' : activeTab === 'deceased' ? 'ดาวแมว' : searchQuery}</span>
                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              </button>
            )}

            {/* Quick Family Tree Access Button */}
            <button
              onClick={() => setIsFamilyOpen(true)}
              className="w-10 h-10 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200/60 flex items-center justify-center active:scale-95 transition-all shadow-2xs"
              title="ผังครอบครัว"
            >
              <FontAwesomeIcon icon={faSitemap} className="text-sm" />
            </button>
          </div>
        </header>

        {/* Pure Pet Cards Feed */}
        <main className="px-5 py-4 flex-1 space-y-4">
          {filteredPets.length > 0 ? (
            filteredPets.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                allPets={pets}
                dateFormat={dateFormat}
                onOpenMore={(p) => setDetailPet(p)}
                onViewImage={(p) => setViewingImagePet(p)}
              />
            ))
          ) : pets.length === 0 ? (
            /* Empty State */
            <div className="py-28 px-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-paw-100 text-paw-600 flex items-center justify-center text-3xl shadow-inner mb-4">
                <FontAwesomeIcon icon={faPaw} />
              </div>
              <button
                onClick={() => {
                  setEditingPet(null);
                  setIsModalOpen(true);
                }}
                className="mt-2 px-6 py-3 rounded-2xl bg-paw-500 hover:bg-paw-600 text-white font-bold text-sm shadow-lg shadow-paw-500/25 transition-all inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>เพิ่มสมาชิก</span>
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl text-slate-300 block mx-auto mb-3" />
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors"
              >
                แสดงทั้งหมด
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Hamburger Drawer Menu */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddNewPet={() => {
          setEditingPet(null);
          setIsModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenFamily={() => setIsFamilyOpen(true)}
        onResetDefault={() => setPets(initialPets)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalPets={pets.length}
        aliveCount={aliveCount}
        deceasedCount={deceasedCount}
        dateFormat={dateFormat}
        onSetDateFormat={handleSetDateFormat}
      />

      {/* Modals */}
      <PetModal
        pet={editingPet ? pets.find(p => p.id === editingPet.id) || editingPet : null}
        allPets={pets}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPet(null);
        }}
        onSave={handleSavePet}
        onDelete={handleDeletePet}
      />

      <ImageViewerModal
        pet={viewingImagePet}
        onClose={() => setViewingImagePet(null)}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        pets={pets}
        onRestore={(restoredPets) => setPets(restoredPets)}
      />

      {/* 🌈 Memorial Modal */}
      <MemorialModal
        pet={memorialPet ? resolvedPets.find(p => p.id === memorialPet.id) || memorialPet : null}
        isOpen={!!memorialPet}
        dateFormat={dateFormat}
        onClose={() => setMemorialPet(null)}
        onUpdatePet={handleSavePet}
      />

      {/* 🩺 Health & Weight Log Modal */}
      <HealthLogModal
        pet={healthPet ? resolvedPets.find(p => p.id === healthPet.id) || healthPet : null}
        isOpen={!!healthPet}
        dateFormat={dateFormat}
        onClose={() => setHealthPet(null)}
        onUpdatePet={handleSavePet}
      />

      {/* 🌳 Family Tree Modal (Interactive: tap any pet node to open its detail modal!) */}
      <FamilyTreeModal
        isOpen={isFamilyOpen}
        onClose={() => setIsFamilyOpen(false)}
        pets={resolvedPets}
        onSelectPet={(selectedPet) => {
          setIsFamilyOpen(false);
          setDetailPet(selectedPet);
        }}
      />

      {/* 🔍 Pet Detail Modal (Interactive: tap any relative to jump to their detail modal!) */}
      <PetDetailModal
        pet={detailPet ? resolvedPets.find(p => p.id === detailPet.id) || detailPet : null}
        allPets={resolvedPets}
        dateFormat={dateFormat}
        isOpen={!!detailPet}
        onClose={() => setDetailPet(null)}
        onEdit={(p) => {
          setEditingPet(p);
          setIsModalOpen(true);
        }}
        onOpenMemorial={(p) => setMemorialPet(p)}
        onOpenHealth={(p) => setHealthPet(p)}
        onOpenFamily={() => setIsFamilyOpen(true)}
        onSelectPet={(targetPet) => setDetailPet(targetPet)}
      />

      {/* 🐾 Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}
