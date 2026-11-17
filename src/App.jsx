import React, { useState, useEffect, useRef } from 'react';
import { initialPets } from './defaultPets';
import PetCard from './components/PetCard';
import PetListItem from './components/PetListItem';
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
import { 
  faBars, faPlus, faXmark, faPaw, faMagnifyingGlass, 
  faSeedling, faRainbow, faSquare, faTableCellsLarge, faList 
} from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mypetsage_modern_pets_v2';

export default function App() {
  const [pets, setPets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Data integrity migration: Only pet-2 (ตังค์ทอน) is female, all others are male
        const reconciled = parsed.map(p => {
          let updated = { ...p };
          if (p.id === 'pet-2') {
            updated.gender = 'female';
          } else if (['pet-1', 'pet-3', 'pet-4', 'pet-5', 'pet-6', 'pet-7'].includes(p.id)) {
            updated.gender = 'male';
            if (p.id === 'pet-6' && updated.note?.includes('สาวน้อย')) {
              updated.note = updated.note.replace('สาวน้อย', 'หนุ่มน้อย');
            }
          }
          if (p.id === 'pet-2' || p.id === 'pet-3') {
            const updatedRels = (p.relationships || []).map(r => {
              if (['pet-4', 'pet-5', 'pet-6', 'pet-7'].includes(r.targetPetId)) {
                return { ...r, label: 'ลูกชาย' };
              }
              return r;
            });
            updated.relationships = updatedRels;
          }
          return updated;
        });
        return reconciled;
      }
      return initialPets;
    } catch (e) {
      return initialPets;
    }
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'alive', 'deceased'
  const [sortBy, setSortBy] = useState('age_desc'); // 'age_desc', 'age_asc', 'bday_near'
  
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

  // 🔲 View Mode: '1col' (1-col Hero) | '2col' (2-col Grid) | 'list' (Card List)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('mypaw_view_mode') || '1col';
    } catch (e) {
      return '1col';
    }
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('mypaw_view_mode', mode);
    } catch (e) {}
  };

  // 📱 Interactive Bottom Navigation Bar Visibility with Directional Scroll & Timeout
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const idleTimerRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const touchStartYRef = useRef(0);

  const resetIdleTimer = (duration = 3200) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsBottomNavVisible(false);
    }, duration);
  };

  useEffect(() => {
    // Initial display timeout on load
    resetIdleTimer(3500);

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const diff = currentScrollY - lastScrollYRef.current;

      // When near the top, keep visible with timeout
      if (currentScrollY <= 20) {
        setIsBottomNavVisible(true);
        resetIdleTimer(3200);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      // Ignore micro jitters (< 6px)
      if (Math.abs(diff) < 6) return;

      if (diff > 0) {
        // User scrolling DOWN to view cards -> hide immediately!
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
        setIsBottomNavVisible(false);
      } else {
        // User scrolling UP -> bounce menu back up, then timeout!
        setIsBottomNavVisible(true);
        resetIdleTimer(3200);
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      const currentY = e.touches[0].clientY;
      const diff = touchStartYRef.current - currentY; // > 0 means dragging finger up (page scrolls down)

      if (Math.abs(diff) > 10) {
        if (diff > 0) {
          // Scrolling down -> hide immediately
          if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
          }
          setIsBottomNavVisible(false);
        } else {
          // Scrolling up -> bounce menu up + timeout
          setIsBottomNavVisible(true);
          resetIdleTimer(3200);
        }
        touchStartYRef.current = currentY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const toggleBottomNav = () => {
    setIsBottomNavVisible(prev => {
      const next = !prev;
      if (next) {
        resetIdleTimer(3200);
      } else if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      return next;
    });
  };

  const handleScreenClick = (e) => {
    // If any modal or drawer is open, don't toggle
    if (
      isModalOpen || isDrawerOpen || detailPet || memorialPet || healthPet || 
      isFamilyOpen || isBackupOpen || viewingImagePet
    ) {
      return;
    }
    // If clicking an interactive button or control, ignore
    if (e.target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }
    toggleBottomNav();
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
  const isFiltered = activeTab !== 'all';

  return (
    <div 
      onClick={handleScreenClick}
      className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center select-none"
    >
      {/* App Container */}
      <div className="w-full max-w-lg md:max-w-3xl min-h-screen bg-slate-50 shadow-2xl flex flex-col relative pb-28">
        
        {/* Clean Sticky App Bar (Glance Zone) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-3 border-b border-slate-200/60 flex items-center justify-between pt-[max(0.75rem,env(safe-area-inset-top))]">
          {/* Left: Hamburger Button (slides in from left) + Brand Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-90 transition-all shadow-2xs -ml-0.5"
              title="Menu"
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm" />
            </button>

            <h1 className="font-mitr text-2xl font-semibold text-slate-900 tracking-wide flex items-center gap-1.5">
              <span>MyPaw</span>
              <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-base" />
            </h1>
          </div>

          {/* Right: View Mode Switcher (1cal / 2cal / 3card list) */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher: 1col (1cal), 2col (2cal), list (3card list) */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
              <button
                onClick={() => handleSetViewMode('1col')}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  viewMode === '1col'
                    ? 'bg-white text-paw-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="1 Column (Large Hero)"
                aria-label="1 Column"
              >
                <FontAwesomeIcon icon={faSquare} className="text-xs" />
              </button>

              <button
                onClick={() => handleSetViewMode('2col')}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  viewMode === '2col'
                    ? 'bg-white text-paw-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="2 Columns (Grid)"
                aria-label="2 Columns"
              >
                <FontAwesomeIcon icon={faTableCellsLarge} className="text-xs" />
              </button>

              <button
                onClick={() => handleSetViewMode('list')}
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  viewMode === 'list'
                    ? 'bg-white text-paw-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Card List View"
                aria-label="Card List View"
              >
                <FontAwesomeIcon icon={faList} className="text-xs" />
              </button>
            </div>
          </div>
        </header>

        {/* Pure Pet Cards Feed (Responsive according to viewMode) */}
        <main className="px-4 sm:px-5 py-4 flex-1">
          {filteredPets.length > 0 ? (
            viewMode === 'list' ? (
              /* 3. Card List View */
              <div className="flex flex-col gap-2.5 max-w-lg mx-auto animate-fadeIn">
                {filteredPets.map(pet => (
                  <PetListItem
                    key={pet.id}
                    pet={pet}
                    dateFormat={dateFormat}
                    onOpenMore={(p) => setDetailPet(p)}
                    onToggleBottomNav={toggleBottomNav}
                  />
                ))}
              </div>
            ) : viewMode === '2col' ? (
              /* 2. Two Columns Grid */
              <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto animate-fadeIn">
                {filteredPets.map(pet => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    compact={true}
                    allPets={pets}
                    dateFormat={dateFormat}
                    onOpenMore={(p) => setDetailPet(p)}
                    onToggleBottomNav={toggleBottomNav}
                  />
                ))}
              </div>
            ) : (
              /* 1. One Column Full Hero Card */
              <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto animate-fadeIn">
                {filteredPets.map(pet => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    compact={false}
                    allPets={pets}
                    dateFormat={dateFormat}
                    onOpenMore={(p) => setDetailPet(p)}
                    onToggleBottomNav={toggleBottomNav}
                  />
                ))}
              </div>
            )
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
                className="mt-2 px-6 py-3 rounded-2xl bg-paw-500 hover:bg-paw-600 text-white font-bold text-sm shadow-lg shadow-paw-500/25 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Pet</span>
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl text-slate-300 block mx-auto mb-3" />
              <button
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors active:scale-95"
              >
                Show All
              </button>
            </div>
          )}
        </main>

        {/* 📱 Mobile Floating Thumb Bar (Optimal Thumb Zone Ergonomics with Soft Spring Bounce) */}
        <nav 
          aria-label="Mobile Bottom Navigation"
          className={`fixed bottom-4 inset-x-0 mx-auto max-w-sm px-3 z-40 spring-bounce-bottom pb-[env(safe-area-inset-bottom)] ${
            isBottomNavVisible 
              ? 'translate-y-0 opacity-100 pointer-events-auto scale-100' 
              : 'translate-y-28 opacity-0 pointer-events-none scale-95'
          }`}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 rounded-full p-1.5 flex items-center justify-between gap-1.5 transition-all">
            
            {/* Quick Segmented Filter Pills */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-full text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('alive')}
                className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 active:scale-95 ${
                  activeTab === 'alive'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faSeedling} className="text-[10px]" />
                <span>With Us</span>
              </button>
              <button
                onClick={() => setActiveTab('deceased')}
                className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 active:scale-95 ${
                  activeTab === 'deceased'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FontAwesomeIcon icon={faRainbow} className="text-[10px]" />
                <span>Memorial</span>
              </button>
            </div>

            {/* Quick Primary Actions in Easy Thumb Reach */}
            <div className="flex items-center gap-1 pr-0.5">
              {/* Add Pet Primary FAB */}
              <button
                onClick={() => {
                  setEditingPet(null);
                  setIsModalOpen(true);
                }}
                className="w-10 h-10 rounded-full bg-paw-500 hover:bg-paw-600 text-white flex items-center justify-center shadow-md shadow-paw-500/35 active:scale-90 transition-transform"
                title="Add Pet"
                aria-label="Add Pet"
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </button>
            </div>

          </div>
        </nav>

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
        onViewImage={(p) => setViewingImagePet(p)}
      />

      {/* 🐾 Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
}
