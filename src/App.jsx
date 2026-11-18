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
import SharedPhotosModal from './components/SharedPhotosModal';
import NotificationModal from './components/NotificationModal';
import NotificationScreen from './components/NotificationScreen';
import DocumentScannerModal from './components/DocumentScannerModal';
import SplashScreen from './components/SplashScreen';
import { resolveAllKinships } from './kinshipEngine';
import { parseLocalDate, getTodayLocal } from './utils';
import { generatePetNotifications } from './notificationEngine.js';
import { fileToDataUrl, processImageWithFocus, getPhotoSrc, getPhotoThumb } from './imageUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faPlus, faXmark, faPaw, faMagnifyingGlass, 
  faSeedling, faRainbow, faSquare, faTableCellsLarge, faList, faImages, faBell,
  faHouse, faCamera
} from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mypetsage_modern_pets_v2';

export default function App() {
  const [pets, setPets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          return initialPets;
        }
        const defaultMap = Object.fromEntries(initialPets.map(dp => [dp.id, dp]));
        // Data integrity migration: Only pet-2 (ตังค์ทอน) is female, all others are male
        const reconciled = parsed.map(p => {
          const seed = defaultMap[p.id] || {};
          let updated = { ...seed, ...p };
          if (!updated.note && seed.note) updated.note = seed.note;
          if (!updated.weightHistory?.length && seed.weightHistory) updated.weightHistory = seed.weightHistory;
          if (!updated.latestWeight && seed.latestWeight) updated.latestWeight = seed.latestWeight;
          if (!updated.fleaDate && seed.fleaDate) updated.fleaDate = seed.fleaDate;
          if (['2024-05-20', '2024-04-18', '2024-08-10', '2024-07-22', '2024-07-03'].includes(updated.vaccineDate)) {
            delete updated.vaccineDate;
          }
          if (!updated.letters?.length && seed.letters) updated.letters = seed.letters;
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
          // Multi-photo support: populate authentic photos from For Icon/cat
          const defaultPhotoMap = {
            'pet-1': ['/avatars/chainoi.png', '/photos/chainoi/1.jpg', '/photos/chainoi/2.jpg', '/photos/chainoi/3.jpg'],
            'pet-2': ['/avatars/tangthon.png', '/photos/tangthon/1.jpg'],
            'pet-3': ['/avatars/khaitom.png', '/photos/khaitom/1.jpg', '/photos/khaitom/2.jpg', '/photos/khaitom/3.jpg'],
            'pet-4': ['/avatars/phuayphuay.png', '/photos/phuayphuay/1.jpg', '/photos/phuayphuay/2.jpg', '/photos/phuayphuay/3.jpg', '/photos/phuayphuay/4.jpg', '/photos/phuayphuay/5.jpg'],
            'pet-5': ['/avatars/tassanai.png', '/photos/tassanai/1.jpg', '/photos/tassanai/2.jpg', '/photos/tassanai/3.jpg'],
            'pet-6': ['/avatars/thongjiew.png', '/photos/thongjiew/1.jpg', '/photos/thongjiew/2.jpg'],
            'pet-7': ['/avatars/kuaytiew.png', '/photos/kuaytiew/1.jpg']
          };
          if (!updated.photos || updated.photos.length === 0 || updated.photos.some(p => typeof p === 'string' && p.includes('_2.png'))) {
            if (defaultPhotoMap[updated.id]) {
              updated.photos = defaultPhotoMap[updated.id];
            } else if (updated.avatar && (!updated.photos || updated.photos.length === 0)) {
              updated.photos = [updated.avatar];
            }
          } else {
            // Upgrade any legacy 360px low-res cropped thumbnails back to full sharpness
            updated.photos = updated.photos.map((p, idx) => {
              if (typeof p === 'object' && p !== null && p.thumbWidth && p.thumbWidth <= 360) {
                const fallbackUrl = defaultPhotoMap[updated.id]?.[idx] || p.src;
                return fallbackUrl || p;
              }
              return p;
            });
            if (updated.avatarThumb && typeof updated.photos[0] === 'string') {
              updated.avatarThumb = updated.photos[0];
            }
          }
          return updated;
        });

        // Demo scenario migration: 1 overdue by 1 day (ไข่ต้ม), 1 upcoming in 2 days (ตังค์ทอน)
        if (!localStorage.getItem('mypaw_demo_dates_v5')) {
          reconciled.forEach(p => {
            if (defaultMap[p.id]?.fleaDate) {
              p.fleaDate = defaultMap[p.id].fleaDate;
            }
          });
          try {
            localStorage.setItem('mypaw_demo_dates_v5', 'true');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciled));
          } catch (e) {}
        }

        return reconciled;
      }
      return initialPets;
    } catch (e) {
      return initialPets;
    }
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'alive', 'deceased'
  const [activeScreen, setActiveScreen] = useState('home'); // 'home' | 'notifications'
  const [sortBy, setSortBy] = useState('age_desc'); // 'age_desc', 'age_asc', 'bday_near'
  
  // 👆 Horizontal Swipe Gesture Tracking between Home & Notifications
  const screenSwipeStartRef = useRef({ x: 0, y: 0, time: 0 });
  
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerPetId, setScannerPetId] = useState(null);
  const [scannerInitialFile, setScannerInitialFile] = useState(null);
  const cameraInputRef = useRef(null);
  const [showSplash, setShowSplash] = useState(true);

  // 📸 External Shared Photos State (from Gallery / Share Target / Drag & Drop)
  const [incomingSharedPhotos, setIncomingSharedPhotos] = useState(null);
  const [isSharedModalOpen, setIsSharedModalOpen] = useState(false);
  const [initialSharedPhotosForNew, setInitialSharedPhotosForNew] = useState([]);
  const [isDragOverWindow, setIsDragOverWindow] = useState(false);
  const sharedFileInputRef = useRef(null);

  // 🔙 Navigation History Stack & Double-Back-to-Exit Guard
  const navStackRef = useRef([]);
  const [exitToastVisible, setExitToastVisible] = useState(false);
  const exitConfirmUntilRef = useRef(0);
  const exitToastTimerRef = useRef(null);
  const handleBackRef = useRef(null);

  const popNavStack = () => {
    const prev = navStackRef.current.pop();
    if (!prev) return false;
    if (prev.type === 'detail' && prev.pet) {
      setDetailPet(prev.pet);
      return true;
    }
    if (prev.type === 'family') {
      setIsFamilyOpen(true);
      return true;
    }
    return false;
  };

  handleBackRef.current = () => {
    // 1. Topmost nested sub-modals (Image Crop / Date Picker)
    const cropCloseBtn = document.querySelector('[data-back-close="crop"]');
    if (cropCloseBtn) {
      cropCloseBtn.click();
      return 'handled';
    }
    const pickerCloseBtn = document.querySelector('[data-back-close="picker"]');
    if (pickerCloseBtn) {
      pickerCloseBtn.click();
      return 'handled';
    }

    // 2. Full-screen Image Viewer
    if (viewingImagePet) {
      setViewingImagePet(null);
      return 'handled';
    }

    // 2.1 Shared Photos Modal
    if (isSharedModalOpen) {
      setIsSharedModalOpen(false);
      setIncomingSharedPhotos(null);
      return 'handled';
    }

    // 2.2 Notification Center Modal
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
      popNavStack();
      return 'handled';
    }

    // 2.3 Document Scanner Modal
    if (isScannerOpen) {
      setIsScannerOpen(false);
      setScannerPetId(null);
      popNavStack();
      return 'handled';
    }

    // 3. Secondary Modals (Memorial, Health Log, Backup, Add/Edit Pet)
    if (memorialPet) {
      setMemorialPet(null);
      return 'handled';
    }
    if (healthPet) {
      setHealthPet(null);
      return 'handled';
    }
    if (isBackupOpen) {
      setIsBackupOpen(false);
      return 'handled';
    }
    if (isModalOpen) {
      setIsModalOpen(false);
      setEditingPet(null);
      return 'handled';
    }

    // 4. Family Tree Modal
    if (isFamilyOpen) {
      setIsFamilyOpen(false);
      popNavStack();
      return 'handled';
    }

    // 5. Pet Detail Modal (steps back through visited relatives/tree if any, else closes)
    if (detailPet) {
      if (!popNavStack()) {
        setDetailPet(null);
      }
      return 'handled';
    }

    // 6. Hamburger Drawer
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      return 'handled';
    }

    // 6.5 Full-screen Notification Center -> Return to Home
    if (activeScreen === 'notifications') {
      setActiveScreen('home');
      return 'handled';
    }

    // 7. Active Filter Tab -> Reset to 'all'
    if (activeTab !== 'all') {
      setActiveTab('all');
      return 'handled';
    }

    // 8. Root Home Screen: Require Double-Back within 2.2s to exit app
    const now = Date.now();
    if (now < exitConfirmUntilRef.current) {
      exitConfirmUntilRef.current = 0;
      setExitToastVisible(false);
      if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
      return 'exit';
    }

    exitConfirmUntilRef.current = now + 2200;
    setExitToastVisible(true);
    if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
    exitToastTimerRef.current = setTimeout(() => {
      setExitToastVisible(false);
    }, 2200);
    return 'handled';
  };

  useEffect(() => {
    // Expose global callback for Android MainActivity OnBackPressedCallback
    window.__handleAndroidBack = () => {
      return handleBackRef.current ? handleBackRef.current() : 'unhandled';
    };

    // Browser history guard for Web / Mobile Browser back button
    if (!window.history.state || !window.history.state.mypawGuard) {
      window.history.pushState({ mypawGuard: true }, '');
    }

    const onPopState = () => {
      const result = handleBackRef.current ? handleBackRef.current() : 'unhandled';
      if (result === 'handled') {
        window.history.pushState({ mypawGuard: true }, '');
      } else if (result === 'exit') {
        window.history.back();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (handleBackRef.current) {
          handleBackRef.current();
        }
      }
    };

    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
      delete window.__handleAndroidBack;
    };
  }, []);

  // 📸 Handle Incoming Shared Photos (Android Intent + Local File Input + Drag & Drop)
  const handleProcessIncomingPhotos = async (filesOrDataUrls) => {
    if (!filesOrDataUrls || filesOrDataUrls.length === 0) return;
    try {
      const processed = await Promise.all(
        Array.from(filesOrDataUrls).map(async (item) => {
          let dataUrl = typeof item === 'string' ? item : await fileToDataUrl(item);
          return await processImageWithFocus({
            imageSource: dataUrl,
            focusParams: { panX: 0, panY: 0, zoom: 1 }
          });
        })
      );
      setIncomingSharedPhotos(processed);
      setIsSharedModalOpen(true);
    } catch (err) {
      console.error('Failed to process incoming shared photos:', err);
    }
  };

  const handleAddNewPetWithSharedPhotos = (photos) => {
    setInitialSharedPhotosForNew(photos);
    setEditingPet(null);
    setIsModalOpen(true);
  };

  const handleAddPhotosToExistingPet = async (petId, newPhotos) => {
    setPets(prev => {
      const target = prev.find(p => p.id === petId);
      if (!target) return prev;
      const existingPhotos = Array.isArray(target.photos) && target.photos.length > 0
        ? target.photos
        : (target.avatar ? [target.avatar] : []);
      const mergedPhotos = [...existingPhotos, ...newPhotos];
      const updatedPet = {
        ...target,
        photos: mergedPhotos,
        avatar: target.avatar || getPhotoSrc(mergedPhotos[0]),
        avatarThumb: target.avatarThumb || getPhotoThumb(mergedPhotos[0])
      };
      confetti({ particleCount: 35, spread: 70, origin: { y: 0.8 } });
      return prev.map(p => p.id === petId ? updatedPet : p);
    });
  };

  useEffect(() => {
    // 📸 Support external shared photos from Android Gallery Share Intent
    window.__handleIncomingSharedPhotos = (photos) => {
      handleProcessIncomingPhotos(photos);
    };

    // Check if any shared photos were queued before React mounted
    if (window.__pendingSharedPhotos && Array.isArray(window.__pendingSharedPhotos)) {
      handleProcessIncomingPhotos(window.__pendingSharedPhotos);
      delete window.__pendingSharedPhotos;
    }

    // 🌐 Local Drag & Drop support (batch or single images)
    const handleDragOver = (e) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsDragOverWindow(true);
      }
    };

    const handleDragLeave = (e) => {
      if (e.relatedTarget === null || e.clientX <= 0 || e.clientY <= 0) {
        setIsDragOverWindow(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragOverWindow(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          handleProcessIncomingPhotos(imageFiles);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      delete window.__handleIncomingSharedPhotos;
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

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

  const scrollToTopInstant = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    lastScrollYRef.current = 0;
    setIsBottomNavVisible(true);
    resetIdleTimer(3200);
  };

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('mypaw_view_mode', mode);
    } catch (e) {}
    scrollToTopInstant();
  };

  // 📱 Interactive Bottom Navigation Bar Visibility with Directional Scroll & Timeout (Original UX)
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const idleTimerRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipedRef = useRef(false);
  const lastNotifScrollYRef = useRef(0);

  const resetIdleTimer = (duration = 3200) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsBottomNavVisible(false);
    }, duration);
  };

  const handleNotificationScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const diff = currentScrollY - lastNotifScrollYRef.current;

    // When near top, keep bottom nav visible with timeout
    if (currentScrollY <= 20) {
      setIsBottomNavVisible(true);
      resetIdleTimer(3200);
      lastNotifScrollYRef.current = currentScrollY;
      return;
    }

    // Ignore tiny jitter
    if (Math.abs(diff) < 6) return;

    if (diff > 0) {
      // User scrolling DOWN -> hide bottom nav immediately so full card feed is visible!
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      setIsBottomNavVisible(false);
    } else {
      // User scrolling UP -> reveal bottom nav + start idle timer
      setIsBottomNavVisible(true);
      resetIdleTimer(3200);
    }

    lastNotifScrollYRef.current = currentScrollY;
  };

  // When switching to notifications, ensure window is at top so header aligns perfectly
  useEffect(() => {
    if (activeScreen === 'notifications') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setIsBottomNavVisible(true);
      resetIdleTimer(3200);
    }
  }, [activeScreen]);

  // 🔝 Auto Scroll to Top when viewMode, activeTab, or sortBy changes
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    scrollToTopInstant();
    const rafId = requestAnimationFrame(scrollToTopInstant);
    return () => cancelAnimationFrame(rafId);
  }, [viewMode, activeTab, sortBy]);

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
    // If just finished a swipe/drag, do not toggle
    if (isSwipedRef.current) {
      isSwipedRef.current = false;
      return;
    }
    // If any modal or drawer is open, don't toggle
    if (
      isModalOpen || isDrawerOpen || detailPet || memorialPet || healthPet || 
      isFamilyOpen || isBackupOpen || viewingImagePet || isScannerOpen || isSharedModalOpen
    ) {
      return;
    }
    // If clicking an interactive button or control, ignore
    if (e.target.closest('button, a, input, select, textarea, [role="button"]')) {
      return;
    }
    toggleBottomNav();
  };

  // 📱 Screen ViewPager Scroll Synchronization (Home <-> Notifications)
  const screenScrollRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const isUserTouchingRef = useRef(false);
  const viewPagerStartXRef = useRef(0);
  const viewPagerStartYRef = useRef(0);
  const viewPagerStartTimeRef = useRef(0);

  useEffect(() => {
    if (!screenScrollRef.current) return;
    if (isUserTouchingRef.current) return;
    const width = screenScrollRef.current.clientWidth;
    if (width <= 0) return;
    const targetLeft = activeScreen === 'home' ? 0 : width;
    if (Math.abs(screenScrollRef.current.scrollLeft - targetLeft) > 2) {
      isProgrammaticScrollRef.current = true;
      screenScrollRef.current.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 350);
    }
  }, [activeScreen]);

  const handleScreenScroll = (e) => {
    if (isProgrammaticScrollRef.current) return;
    // Don't flip activeScreen state mid-drag to prevent re-render jank
    if (isUserTouchingRef.current) return;
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const pageIndex = Math.round(scrollLeft / width);
      const targetScreen = pageIndex === 0 ? 'home' : 'notifications';
      if (targetScreen !== activeScreen) {
        setActiveScreen(targetScreen);
        setIsBottomNavVisible(true);
        resetIdleTimer(3200);
      }
    }
  };

  const handleScreenScrollEnd = (e) => {
    if (isUserTouchingRef.current || isProgrammaticScrollRef.current) return;
    const container = e.target;
    const width = container.clientWidth;
    if (width <= 0) return;
    const currentScrollLeft = container.scrollLeft;
    const targetIndex = Math.round(currentScrollLeft / width);
    const targetLeft = targetIndex === 0 ? 0 : width;
    if (Math.abs(currentScrollLeft - targetLeft) > 2) {
      isProgrammaticScrollRef.current = true;
      container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 320);
    }
  };

  const handleViewPagerTouchStart = (e) => {
    isUserTouchingRef.current = true;
    if (e.touches && e.touches[0]) {
      viewPagerStartXRef.current = e.touches[0].clientX;
      viewPagerStartYRef.current = e.touches[0].clientY;
      viewPagerStartTimeRef.current = Date.now();
    }
  };

  const handleViewPagerTouchEnd = (e) => {
    if (!screenScrollRef.current) {
      isUserTouchingRef.current = false;
      return;
    }
    const container = screenScrollRef.current;
    const width = container.clientWidth;
    if (width <= 0) {
      isUserTouchingRef.current = false;
      return;
    }

    let deltaX = 0;
    let deltaY = 0;
    if (e.changedTouches && e.changedTouches[0]) {
      deltaX = viewPagerStartXRef.current - e.changedTouches[0].clientX; // >0: dragged left (to notif), <0: dragged right (to home)
      deltaY = viewPagerStartYRef.current - e.changedTouches[0].clientY;
    }
    const elapsedTime = Math.max(1, Date.now() - viewPagerStartTimeRef.current);
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 0.8;
    const currentScrollLeft = container.scrollLeft;

    let targetIndex;
    if (isHorizontalSwipe && elapsedTime < 320 && Math.abs(deltaX) > 35) {
      // Quick flick detection
      targetIndex = deltaX > 0 ? 1 : 0;
    } else {
      // Position-based snap threshold (if user dragged > 35% towards next screen, proceed; else snap back)
      const ratio = currentScrollLeft / width;
      if (activeScreen === 'home') {
        targetIndex = ratio > 0.35 ? 1 : 0;
      } else {
        targetIndex = ratio < 0.65 ? 0 : 1;
      }
    }

    const targetLeft = targetIndex === 0 ? 0 : width;
    const targetScreen = targetIndex === 0 ? 'home' : 'notifications';

    isProgrammaticScrollRef.current = true;
    container.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });

    if (activeScreen !== targetScreen) {
      setActiveScreen(targetScreen);
      setIsBottomNavVisible(true);
      resetIdleTimer(3200);
    }

    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      isUserTouchingRef.current = false;
    }, 320);
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

  // 🔔 Generate notifications & unread badge counters
  const petNotifications = generatePetNotifications(pets);
  const unreadNotificationsCount = petNotifications.filter(n => !n.isRead).length;
  const urgentNotificationsCount = petNotifications.filter(n => n.urgency === 'urgent_today').length;

  return (
    <div 
      onClick={handleScreenClick}
      className="w-full max-w-[100vw] h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-100 text-slate-800 flex flex-col items-center select-none"
    >
      {/* App Container */}
      <div className="w-full max-w-lg md:max-w-3xl h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 shadow-2xl flex flex-col relative pb-0">
        
        {/* Clean Sticky App Bar (Glance Zone) */}
        <header className="sticky top-0 z-30 flex-shrink-0 bg-white/95 backdrop-blur-md px-4 sm:px-5 py-3 border-b border-slate-200/60 flex items-center justify-between pt-[max(0.75rem,calc(var(--safe-top,0px)+0.5rem))]">
          {/* Left: Hamburger Button (slides in from left) + Brand Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform transition-colors duration-150 ease-out shadow-2xs -ml-0.5 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              title="Menu"
              aria-label="Menu"
            >
              <FontAwesomeIcon icon={faBars} className="text-sm" />
            </button>

            <h1 
              onClick={() => {
                if (activeScreen === 'notifications') {
                  const notifContainer = document.getElementById('notif-scroll-container');
                  if (notifContainer) notifContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setIsBottomNavVisible(true);
                resetIdleTimer(3200);
              }}
              className="font-mitr text-2xl font-semibold text-slate-900 tracking-wide flex items-center gap-1.5 cursor-pointer active:scale-98 transition-transform"
              title="แตะเพื่อเลื่อนขึ้นบนสุด"
            >
              <span>MyPaw</span>
              <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-base" />
            </h1>
          </div>

          {/* Right: Notification Bell + View Mode Switcher (Capsule with sliding indicator per animate/SKILL.md) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveScreen(activeScreen === 'home' ? 'notifications' : 'home')}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-transform transition-colors duration-150 ease-out shadow-2xs border focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                activeScreen === 'notifications'
                  ? 'bg-paw-100 text-paw-700 border-paw-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/60'
              }`}
              title={activeScreen === 'notifications' ? 'กลับหน้าหลัก' : 'ศูนย์แจ้งเตือน'}
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} className="text-sm" />
              {unreadNotificationsCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-xs border-2 border-white ${
                  urgentNotificationsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-paw-500'
                }`}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <div className="relative inline-grid grid-cols-3 items-center bg-slate-100/95 p-1 rounded-full border border-slate-200/70 shadow-2xs">
              {/* Sliding Active Circle Indicator */}
              <span
                aria-hidden="true"
                style={{
                  transform:
                    viewMode === '1col'
                      ? 'translateX(0%)'
                      : viewMode === '2col'
                        ? 'translateX(100%)'
                        : 'translateX(200%)',
                  transition: 'transform 220ms var(--ease-out)'
                }}
                className="pointer-events-none absolute top-1 bottom-1 left-1 w-[34px] rounded-full bg-white shadow-xs"
              />

              <button
                onClick={() => handleSetViewMode('1col')}
                className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-[color,transform] duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                  viewMode === '1col'
                    ? 'text-paw-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="1 Column (Large Hero)"
                aria-label="1 Column"
              >
                <FontAwesomeIcon icon={faSquare} className="text-[13px]" />
              </button>

              <button
                onClick={() => handleSetViewMode('2col')}
                className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-[color,transform] duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                  viewMode === '2col'
                    ? 'text-paw-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="2 Columns (Grid)"
                aria-label="2 Columns"
              >
                <FontAwesomeIcon icon={faTableCellsLarge} className="text-[13px]" />
              </button>

              <button
                onClick={() => handleSetViewMode('list')}
                className={`relative z-10 w-[34px] h-[34px] rounded-full flex items-center justify-center transition-[color,transform] duration-150 [transition-timing-function:var(--ease-out)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-paw-500 outline-none ${
                  viewMode === 'list'
                    ? 'text-paw-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Card List View"
                aria-label="Card List View"
              >
                <FontAwesomeIcon icon={faList} className="text-[13px]" />
              </button>
            </div>
          </div>
        </header>

        {/* 📱 Horizontal Swipeable Surface (Home <-> Notifications) */}
        <div 
          ref={screenScrollRef}
          onScroll={handleScreenScroll}
          onScrollEnd={handleScreenScrollEnd}
          onTouchStart={handleViewPagerTouchStart}
          onTouchEnd={handleViewPagerTouchEnd}
          onTouchCancel={() => {
            isUserTouchingRef.current = false;
            if (screenScrollRef.current) {
              const w = screenScrollRef.current.clientWidth;
              const idx = Math.round(screenScrollRef.current.scrollLeft / w);
              screenScrollRef.current.scrollTo({ left: idx === 0 ? 0 : w, behavior: 'smooth' });
            }
          }}
          className={`flex-1 min-h-0 w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory ${
            isModalOpen || isDrawerOpen || detailPet || memorialPet || healthPet || 
            isFamilyOpen || isBackupOpen || viewingImagePet || isScannerOpen || isSharedModalOpen
              ? 'pointer-events-none'
              : ''
          }`}
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Screen 1: Home (Main Pet Cards Feed) */}
          <div 
            id="home-scroll-container"
            className="w-full min-w-full flex-shrink-0 snap-start snap-always h-full flex flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain"
          >
            {/* Pure Pet Cards Feed */}
            <main className="px-4 sm:px-5 py-3 flex-1 w-full pb-28 overflow-x-hidden" style={{ overflowAnchor: 'none' }}>
              {filteredPets.length > 0 ? (
                viewMode === 'list' ? (
                  /* 3. Card List View */
                  <div className="flex flex-col gap-2.5 w-full max-w-lg mx-auto animate-fadeIn">
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
                  <div className="grid grid-cols-2 gap-3 w-full max-w-3xl mx-auto animate-fadeIn">
                    {filteredPets.map(pet => (
                      <div key={pet.id} className="min-w-0 w-full">
                        <PetCard
                          pet={pet}
                          compact={true}
                          allPets={pets}
                          dateFormat={dateFormat}
                          onOpenMore={(p) => setDetailPet(p)}
                          onToggleBottomNav={toggleBottomNav}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* 1. One Column Full Hero Card */
                  <div className="grid grid-cols-1 gap-4 w-full max-w-lg mx-auto animate-fadeIn">
                    {filteredPets.map(pet => (
                      <div key={pet.id} className="min-w-0 w-full">
                        <PetCard
                          pet={pet}
                          compact={false}
                          allPets={pets}
                          dateFormat={dateFormat}
                          onOpenMore={(p) => setDetailPet(p)}
                          onToggleBottomNav={toggleBottomNav}
                        />
                      </div>
                    ))}
                  </div>
                )
              ) : pets.length === 0 ? (
                /* Empty State: เริ่มต้นที่ 0 ตัวสำหรับผู้ใช้ใหม่ */
                <div className="py-24 px-6 text-center max-w-sm mx-auto">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-paw-100 to-amber-100 text-paw-500 flex items-center justify-center text-3xl shadow-inner mb-4">
                    <FontAwesomeIcon icon={faPaw} />
                  </div>
                  <h2 className="font-mitr text-xl font-medium text-slate-800 mb-1.5">
                    ยังไม่มีข้อมูลน้องเหมียว
                  </h2>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    เริ่มต้นบันทึกวันเกิด ความทรงจำ และช่วงเวลาดีๆ ของเจ้าตัวโปรดกันเถอะ
                  </p>
                  <button
                    onClick={() => {
                      setEditingPet(null);
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-paw-500 hover:bg-paw-600 text-white font-bold text-sm shadow-lg shadow-paw-500/25 transition-transform transition-colors duration-150 ease-out inline-flex items-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>เพิ่มน้องแมวตัวแรก</span>
                  </button>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="text-3xl text-slate-300 block mx-auto mb-3" />
                  <button
                    onClick={() => setActiveTab('all')}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors duration-150 ease-out active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
                  >
                    Show All
                  </button>
                </div>
              )}
            </main>
          </div>

          {/* Screen 2: Notifications Screen (Full Screen View) */}
          <div className="w-full min-w-full flex-shrink-0 snap-start snap-always h-full min-h-0 flex flex-col overflow-hidden">
            <NotificationScreen
              pets={resolvedPets}
              onUpdatePet={handleSavePet}
              onOpenPetDetail={(p) => setDetailPet(p)}
              onOpenMemorial={(p) => setMemorialPet(p)}
              onOpenHealth={(p) => setHealthPet(p)}
              onBackToHome={() => setActiveScreen('home')}
              isActive={activeScreen === 'notifications'}
              onScroll={handleNotificationScroll}
            />
          </div>
        </div>

        {/* 📱 Mobile Floating Bottom Navigation Bar (Home | Notifications | Camera OCR FAB) */}
        {/* 📱 Mobile Floating Thumb Bar (Percentage-fitted for all phone widths) */}
        <nav 
          aria-label="Mobile Bottom Navigation"
          className={`fixed bottom-4 inset-x-0 mx-auto w-[92%] max-w-sm z-40 spring-bounce-bottom pb-[var(--safe-bottom)] ${
            isBottomNavVisible 
              ? 'translate-y-0 opacity-100 pointer-events-auto scale-100' 
              : 'translate-y-28 opacity-0 pointer-events-none scale-95'
          }`}
        >
          <div className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 rounded-full p-1.5 flex items-center justify-between gap-1.5 w-full">
            
            {/* Quick Segmented Navigation Pills */}
            <div className="flex-1 min-w-0 grid grid-cols-2 bg-slate-100/90 p-1 rounded-full text-xs font-bold text-slate-600">
              <button
                onClick={() => {
                  setActiveScreen('home');
                  resetIdleTimer(3200);
                }}
                className={`py-1.5 px-2 rounded-full transition-colors duration-150 ease-out flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none truncate ${
                  activeScreen === 'home'
                    ? 'bg-white text-paw-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="หน้าหลัก"
              >
                <FontAwesomeIcon icon={faHouse} className="text-xs flex-shrink-0" />
                <span className="truncate">หน้าหลัก</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('notifications');
                  resetIdleTimer(3200);
                }}
                className={`py-1.5 px-2 rounded-full transition-colors duration-150 ease-out flex items-center justify-center gap-1.5 active:scale-95 focus-visible:ring-2 focus-visible:ring-paw-500 outline-none truncate ${
                  activeScreen === 'notifications'
                    ? 'bg-white text-paw-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="หน้าแจ้งเตือน"
              >
                <FontAwesomeIcon icon={faBell} className="text-xs flex-shrink-0" />
                <span className="truncate">แจ้งเตือน</span>
                {unreadNotificationsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white leading-none ${
                    urgentNotificationsCount > 0 ? 'bg-amber-500' : 'bg-paw-500'
                  }`}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Primary Actions in Easy Thumb Reach (Camera OCR FAB) */}
            <div className="flex items-center gap-1 pr-0.5">
              <button
                onClick={() => {
                  resetIdleTimer(3200);
                  cameraInputRef.current?.click();
                }}
                className="w-10 h-10 rounded-full bg-paw-500 hover:bg-paw-600 text-white flex items-center justify-center shadow-md shadow-paw-500/35 active:scale-95 transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
                title="เปิดกล้องสแกนเอกสาร (OCR)"
                aria-label="Scan Document OCR"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
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
        onOpenNotifications={() => {
          setIsDrawerOpen(false);
          setActiveScreen('notifications');
        }}
        onOpenScanner={(petId) => {
          setScannerPetId(petId || null);
          cameraInputRef.current?.click();
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenSharedImport={() => sharedFileInputRef.current?.click()}
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

      {/* Hidden File Picker for Batch/Single Shared Image Import */}
      <input
        ref={sharedFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            handleProcessIncomingPhotos(files);
          }
          e.target.value = '';
        }}
      />

      {/* Hidden Camera Input for Instant Native/Mobile Capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setScannerInitialFile(file);
            setIsScannerOpen(true);
          }
          e.target.value = '';
        }}
      />

      {/* Modals */}
      <PetModal
        pet={editingPet ? pets.find(p => p.id === editingPet.id) || editingPet : null}
        allPets={pets}
        isOpen={isModalOpen}
        dateFormat={dateFormat}
        initialPhotos={initialSharedPhotosForNew}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPet(null);
          setInitialSharedPhotosForNew([]);
        }}
        onSave={handleSavePet}
        onDelete={(id) => {
          navStackRef.current = [];
          if (detailPet?.id === id) setDetailPet(null);
          handleDeletePet(id);
        }}
      />

      {/* 📸 Shared Photos External Import Modal */}
      <SharedPhotosModal
        isOpen={isSharedModalOpen}
        incomingPhotos={incomingSharedPhotos || []}
        pets={pets}
        onClose={() => {
          setIsSharedModalOpen(false);
          setIncomingSharedPhotos(null);
        }}
        onAddNewPetWithPhotos={handleAddNewPetWithSharedPhotos}
        onAddPhotosToExistingPet={handleAddPhotosToExistingPet}
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
        onClose={() => {
          setMemorialPet(null);
        }}
        onUpdatePet={handleSavePet}
      />

      {/* 🩺 Health & Weight Log Modal */}
      <HealthLogModal
        pet={healthPet ? resolvedPets.find(p => p.id === healthPet.id) || healthPet : null}
        isOpen={!!healthPet}
        dateFormat={dateFormat}
        onClose={() => {
          setHealthPet(null);
        }}
        onUpdatePet={handleSavePet}
        onOpenScanner={(petId) => {
          setScannerPetId(petId || null);
          cameraInputRef.current?.click();
        }}
      />

      {/* 📷 Vet Document & Clinic OCR Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        initialFile={scannerInitialFile}
        onClose={() => {
          setIsScannerOpen(false);
          setScannerInitialFile(null);
          setScannerPetId(null);
          popNavStack();
        }}
        pets={resolvedPets}
        selectedPetId={scannerPetId}
        onUpdatePet={handleSavePet}
      />

      {/* 🔔 In-App Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
          popNavStack();
        }}
        pets={resolvedPets}
        onUpdatePet={handleSavePet}
        onOpenPetDetail={(p) => {
          setIsNotificationOpen(false);
          setDetailPet(p);
        }}
        onOpenMemorial={(p) => {
          setIsNotificationOpen(false);
          setMemorialPet(p);
        }}
        onOpenHealth={(p) => {
          setIsNotificationOpen(false);
          setHealthPet(p);
        }}
      />

      {/* 🌳 Family Tree Modal (Interactive: tap any pet node to open its detail modal!) */}
      <FamilyTreeModal
        isOpen={isFamilyOpen}
        onClose={() => {
          setIsFamilyOpen(false);
          popNavStack();
        }}
        pets={resolvedPets}
        onSelectPet={(selectedPet) => {
          navStackRef.current.push({ type: 'family' });
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
        onClose={() => {
          if (!popNavStack()) {
            setDetailPet(null);
          }
        }}
        onEdit={(p) => {
          setEditingPet(p);
          setIsModalOpen(true);
        }}
        onOpenMemorial={(p) => {
          setMemorialPet(p);
        }}
        onOpenHealth={(p) => {
          setHealthPet(p);
        }}
        onOpenFamily={() => {
          if (detailPet) {
            navStackRef.current.push({ type: 'detail', pet: detailPet });
          }
          setDetailPet(null);
          setIsFamilyOpen(true);
        }}
        onSelectPet={(targetPet) => {
          if (detailPet && detailPet.id !== targetPet?.id) {
            navStackRef.current.push({ type: 'detail', pet: detailPet });
          }
          setDetailPet(targetPet);
        }}
        onViewImage={(p) => setViewingImagePet(p)}
      />

      {/* 🔙 Double-Back to Exit Confirmation Toast */}
      <div
        aria-live="polite"
        className={`fixed bottom-20 inset-x-0 z-[120] flex justify-center px-4 pointer-events-none transition-[transform,opacity] duration-200 [transition-timing-function:var(--ease-out)] ${
          exitToastVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-3 scale-95'
        }`}
      >
        <div className="bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-white/15 text-xs font-medium flex items-center gap-2">
          <FontAwesomeIcon icon={faPaw} className="text-paw-400 text-xs" />
          <span>กดย้อนกลับอีกครั้งเพื่อออกจากแอป</span>
        </div>
      </div>

      {/* 🐾 Animated Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* 📁 Drag & Drop Window Dropzone Overlay for Local Testing */}
      {isDragOverWindow && (
        <div className="fixed inset-0 z-[150] bg-paw-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white pointer-events-none animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-4xl mb-3 shadow-inner animate-bounce">
            <FontAwesomeIcon icon={faImages} />
          </div>
          <h2 className="font-mitr text-2xl font-medium">ปล่อยรูปเพื่อแชร์เข้า MyPaw</h2>
          <p className="text-sm text-white/80 mt-1 font-sans">
            รองรับทั้งรูปเดียวและหลายรูปพร้อมกัน (Batch)
          </p>
        </div>
      )}
    </div>
  );
}
