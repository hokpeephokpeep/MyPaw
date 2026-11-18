import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faXmark, faCheck, faCakeCandles, faShieldHalved, 
  faSyringe, faStethoscope, faRainbow, faGear, faCheckDouble,
  faCircleCheck, faChevronRight, faSliders
} from '@fortawesome/free-solid-svg-icons';
import { useSheetDrag } from '../useSheetDrag';
import { 
  generatePetNotifications, 
  getNotificationPrefs, 
  saveNotificationPrefs, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  applyQuickAction,
  requestWebNotificationPermission
} from '../notificationEngine.js';
import { getPhotoSrc } from '../imageUtils';
import confetti from 'canvas-confetti';

export default function NotificationModal({ 
  isOpen, 
  onClose, 
  pets = [], 
  onUpdatePet, 
  onOpenPetDetail, 
  onOpenMemorial, 
  onOpenHealth 
}) {
  const { 
    isVisible, 
    requestClose, 
    backdropAnimationClass, 
    sheetAnimationClass, 
    handleProps, 
    sheetProps,
    scrollRef 
  } = useSheetDrag(onClose, isOpen);

  const [prefs, setPrefs] = useState(getNotificationPrefs);
  const [filter, setFilter] = useState('all'); // 'all', 'urgent', 'upcoming', 'memorial'
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [webPermission, setWebPermission] = useState(() => 
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Refresh notifications whenever pets, prefs, or modal opens
  useEffect(() => {
    if (isOpen) {
      const currentPrefs = getNotificationPrefs();
      setPrefs(currentPrefs);
      const list = generatePetNotifications(pets, { prefs: currentPrefs });
      setNotifications(list);
    }
  }, [isOpen, pets]);

  if (!isVisible) return null;

  // Filtered notifications
  const filteredList = notifications.filter(n => {
    if (filter === 'urgent') return n.urgency === 'urgent_today';
    if (filter === 'upcoming') return n.urgency === 'upcoming_soon';
    if (filter === 'memorial') return n.urgency === 'memorial';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    markAllNotificationsAsRead(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleItemClick = (item) => {
    markNotificationAsRead(item.id);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
  };

  const handleQuickAction = (e, item) => {
    e.stopPropagation();
    handleItemClick(item);

    const targetPet = pets.find(p => p.id === item.petId);
    if (!targetPet) return;

    if (item.actionType === 'flea_today' || item.actionType === 'vaccine_today') {
      const updated = applyQuickAction(item.actionType, targetPet);
      if (updated && onUpdatePet) {
        onUpdatePet(updated);
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#0ea5e9', '#10b981', '#f59e0b']
          });
        } catch (err) {}
      }
    } else if (item.actionType === 'view_memorial' && onOpenMemorial) {
      requestClose();
      setTimeout(() => onOpenMemorial(targetPet), 150);
    } else if (item.actionType === 'view_health' && onOpenHealth) {
      requestClose();
      setTimeout(() => onOpenHealth(targetPet), 150);
    } else if (onOpenPetDetail) {
      requestClose();
      setTimeout(() => onOpenPetDetail(targetPet), 150);
    }
  };

  const handleToggleCategory = (catKey) => {
    const updated = {
      ...prefs,
      categories: {
        ...prefs.categories,
        [catKey]: !prefs.categories[catKey]
      }
    };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    setNotifications(generatePetNotifications(pets, { prefs: updated }));
  };

  const handleRequestWebNotify = async () => {
    const res = await requestWebNotificationPermission();
    setWebPermission(res);
  };

  // Helper for notification icon
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'faCakeCandles': return faCakeCandles;
      case 'faShieldHalved': return faShieldHalved;
      case 'faSyringe': return faSyringe;
      case 'faStethoscope': return faStethoscope;
      case 'faRainbow': return faRainbow;
      default: return faBell;
    }
  };

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md rounded-t-[32px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle */}
        <div {...handleProps} className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/50" title="ลากลงเพื่อปิด">
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center text-sm shadow-2xs">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-base">ศูนย์แจ้งเตือน</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white animate-pulse">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95 ${
                showSettings ? 'bg-paw-100 text-paw-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
              title="ตั้งค่าการแจ้งเตือน"
              aria-label="ตั้งค่าการแจ้งเตือน"
            >
              <FontAwesomeIcon icon={faSliders} className="text-xs" />
            </button>

            {/* Close Button */}
            <button 
              onClick={requestClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors active:scale-95"
              aria-label="ปิด"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>
          </div>
        </div>

        {/* Settings Panel Drawer (Collapsible) */}
        {showSettings && (
          <div className="bg-slate-50 border-b border-slate-200/80 px-5 py-3.5 animate-fadeIn flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">หมวดหมู่ที่เปิดแจ้งเตือน:</span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-[11px] text-paw-600 font-medium hover:underline"
              >
                เรียบร้อย
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'birthday', label: '🎂 วันเกิด', icon: faCakeCandles },
                { key: 'flea', label: '💊 หยดยาเห็บหมัด', icon: faShieldHalved },
                { key: 'vaccine', label: '💉 วัคซีนประจำปี', icon: faSyringe },
                { key: 'checkup', label: '🩺 นัดสัตวแพทย์', icon: faStethoscope },
                { key: 'memorial', label: '🌈 วันครบรอบดาวแมว', icon: faRainbow }
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => handleToggleCategory(cat.key)}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                    prefs.categories[cat.key]
                      ? 'border-paw-300 bg-white text-paw-900 shadow-2xs font-medium'
                      : 'border-slate-200 bg-slate-100/70 text-slate-400'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    prefs.categories[cat.key] ? 'bg-paw-500 text-white' : 'bg-slate-200 text-transparent'
                  }`}>
                    ✓
                  </span>
                </button>
              ))}
            </div>

            {/* Browser notification permission */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500">การแจ้งเตือนบนเบราว์เซอร์:</span>
              {webPermission === 'granted' ? (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-xs" /> เปิดใช้งานแล้ว
                </span>
              ) : webPermission === 'unsupported' ? (
                <span className="text-[11px] text-slate-400">ไม่รองรับในสภาพแวดล้อมนี้</span>
              ) : (
                <button
                  onClick={handleRequestWebNotify}
                  className="px-2.5 py-1 rounded-lg bg-paw-600 hover:bg-paw-700 text-white text-[11px] font-medium transition-colors active:scale-95"
                >
                  อนุญาตการแจ้งเตือน
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter Pills & Mark All Read */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'urgent', label: 'ด่วนวันนี้' },
              { id: 'upcoming', label: 'เร็วๆ นี้' },
              { id: 'memorial', label: 'ดาวแมว' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-slate-500 hover:text-paw-600 font-medium whitespace-nowrap flex items-center gap-1 transition-colors px-1 py-0.5 active:scale-95"
              title="ทำเครื่องหมายอ่านแล้วทั้งหมด"
            >
              <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
              <span>อ่านแล้ว</span>
            </button>
          )}
        </div>

        {/* Notification Items List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 overscroll-contain">
          {filteredList.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <p className="text-sm font-medium text-slate-600">ไม่มีการแจ้งเตือนในหมวดนี้</p>
              <p className="text-xs text-slate-400 mt-1">น้องแมวทุกตัวได้รับการดูแลและมีสุขภาพที่ดี 🐾</p>
            </div>
          ) : (
            filteredList.map(item => {
              const isUrgent = item.urgency === 'urgent_today';
              const isMemorial = item.urgency === 'memorial';

              let cardBg = 'bg-white border-slate-200/90';
              let badgeColor = 'bg-slate-100 text-slate-700';

              if (isUrgent) {
                cardBg = item.isRead 
                  ? 'bg-amber-50/30 border-amber-200/70' 
                  : 'bg-amber-50/80 border-amber-300 shadow-2xs ring-1 ring-amber-300/40';
                badgeColor = 'bg-amber-500 text-white';
              } else if (isMemorial) {
                cardBg = item.isRead 
                  ? 'bg-purple-50/30 border-purple-200/70' 
                  : 'bg-purple-50/70 border-purple-300 shadow-2xs';
                badgeColor = 'bg-purple-500 text-white';
              } else if (!item.isRead) {
                cardBg = 'bg-sky-50/40 border-sky-200';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${cardBg}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Pet Avatar with urgency icon badge */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={getPhotoSrc(item.petAvatar) || '/default-cat.png'}
                        alt={item.petName}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200/80 shadow-2xs"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/avatars/khaitom.png';
                        }}
                      />
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs ${badgeColor}`}>
                        <FontAwesomeIcon icon={getIcon(item.icon)} />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="ยังไม่ได้อ่าน" />
                        )}
                      </div>

                      {/* Date with day of week & relative badge */}
                      <p className="text-xs font-medium text-slate-700 leading-snug">
                        <span>{item.thaiDayDate || item.dateText || item.message}</span>
                        {item.diffLabel && (
                          <span className={`ml-1.5 font-semibold ${
                            item.daysDiff < 0 
                              ? 'text-amber-600' 
                              : item.daysDiff === 0 
                                ? 'text-emerald-600' 
                                : 'text-sky-600'
                          }`}>
                            {item.diffLabel}
                          </span>
                        )}
                      </p>

                      {/* Action Button Row */}
                      {item.actionType && (
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-normal truncate max-w-[170px]" title={item.subNote}>
                            {item.subNote || (
                              item.daysDiff === 0 
                                ? 'วันนี้' 
                                : item.daysDiff > 0 
                                  ? `อีก ${item.daysDiff} วัน` 
                                  : `เลยกำหนด ${Math.abs(item.daysDiff)} วัน`
                            )}
                          </span>

                          <button
                            onClick={(e) => handleQuickAction(e, item)}
                            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 flex-shrink-0 ${
                              isUrgent
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : isMemorial
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-paw-600 hover:bg-paw-700 text-white'
                            }`}
                          >
                            <span>{item.actionLabel}</span>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
