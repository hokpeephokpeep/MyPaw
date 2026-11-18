import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faXmark, faCheck, faCakeCandles, faShieldHalved, 
  faSyringe, faStethoscope, faRainbow, faCheckDouble,
  faChevronRight, faCircleCheck, faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { 
  generatePetNotifications, 
  getNotificationPrefs, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  applyQuickAction 
} from '../notificationEngine.js';
import { getPhotoSrc } from '../imageUtils';
import confetti from 'canvas-confetti';

export default function QuickNotificationDropdown({
  isOpen,
  onClose,
  pets = [],
  onUpdatePet,
  onOpenPetDetail,
  onOpenMemorial,
  onOpenHealth,
  onViewAllNotifications
}) {
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // Refresh notifications when open or pets change
  useEffect(() => {
    if (isOpen) {
      const prefs = getNotificationPrefs();
      const list = generatePetNotifications(pets, { prefs });
      setNotifications(list);
    }
  }, [isOpen, pets]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;
  // Limit to top 4 most urgent/recent items for quick glance
  const quickList = notifications.slice(0, 4);

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    markAllNotificationsAsRead(allIds);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleItemClick = (item) => {
    markNotificationAsRead(item.id);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));

    const targetPet = pets.find(p => p.id === item.petId);
    if (!targetPet) return;

    if (item.type === 'memorial' && onOpenMemorial) {
      onClose();
      onOpenMemorial(targetPet);
    } else if ((item.type === 'flea' || item.type === 'vaccine' || item.type === 'checkup') && onOpenHealth) {
      onClose();
      onOpenHealth(targetPet);
    } else if (onOpenPetDetail) {
      onClose();
      onOpenPetDetail(targetPet);
    }
  };

  const handleQuickAction = (e, item) => {
    e.stopPropagation();
    markNotificationAsRead(item.id);
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));

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
            origin: { y: 0.3, x: 0.8 },
            colors: ['#0ea5e9', '#10b981', '#f59e0b']
          });
        } catch (err) {}
      }
    } else if (item.actionType === 'view_memorial' && onOpenMemorial) {
      onClose();
      onOpenMemorial(targetPet);
    } else if (item.actionType === 'view_health' && onOpenHealth) {
      onClose();
      onOpenHealth(targetPet);
    }
  };

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
    <>
      {/* 🌫️ Light Transparent Backdrop to capture outside clicks */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 📦 Momentary Dropdown Card (Anchored cleanly under top header) */}
      <div 
        ref={dropdownRef}
        role="dialog"
        aria-label="การแจ้งเตือนด่วน"
        className="fixed right-3 top-[max(4.25rem,calc(var(--safe-top,0px)+4rem))] w-[calc(100vw-1.5rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 ease-out"
        style={{
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 1px 1px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-paw-100 text-paw-600 flex items-center justify-center text-xs shadow-2xs">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">การแจ้งเตือนด่วน</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 hover:text-paw-600 hover:bg-paw-50 flex items-center gap-1 transition-colors active:scale-95"
                title="ทำเครื่องหมายว่าอ่านทั้งหมด"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                <span>อ่านแล้ว</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-95 ml-1"
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        </div>

        {/* Quick List (Up to 4 items) */}
        <div className="max-h-[340px] overflow-y-auto px-3 py-2 space-y-2 divide-y divide-slate-100/60 overscroll-contain">
          {quickList.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 text-xl">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">ไม่มีการแจ้งเตือนใหม่</p>
              <p className="text-[11px] text-slate-400 mt-0.5">น้องแมวทุกตัวได้รับการดูแลเป็นอย่างดี 🐾</p>
            </div>
          ) : (
            quickList.map(item => {
              const isUrgent = item.urgency === 'urgent_today';
              const isMemorial = item.urgency === 'memorial';

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`pt-2 first:pt-0 cursor-pointer group transition-all rounded-2xl p-2.5 ${
                    item.isRead 
                      ? 'bg-slate-50/70 hover:bg-slate-100/80 opacity-75' 
                      : isUrgent 
                        ? 'bg-amber-50/60 border border-amber-200/70 hover:bg-amber-50' 
                        : isMemorial
                          ? 'bg-indigo-50/50 border border-indigo-200/60 hover:bg-indigo-50'
                          : 'bg-white border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Pet Avatar */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
                        {item.petAvatar ? (
                          <img 
                            src={getPhotoSrc(item.petAvatar)} 
                            alt={item.petName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            🐾
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white shadow-2xs border border-white ${
                        isUrgent ? 'bg-amber-500' : isMemorial ? 'bg-indigo-500' : 'bg-paw-500'
                      }`}>
                        <FontAwesomeIcon icon={getIcon(item.icon)} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">
                          {item.title}
                        </h4>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] mb-1">
                        <span className={`font-semibold ${
                          isUrgent ? 'text-amber-600' : isMemorial ? 'text-indigo-600' : 'text-paw-600'
                        }`}>
                          {item.diffLabel}
                        </span>
                        {item.dateText && (
                          <span className="text-slate-400 text-[10px]">
                            • {item.dateText.split('(')[0].trim()}
                          </span>
                        )}
                      </div>

                      {/* Quick Action Button */}
                      {(item.actionType === 'flea_today' || item.actionType === 'vaccine_today') && (
                        <div className="mt-1 flex items-center justify-end">
                          <button
                            onClick={(e) => handleQuickAction(e, item)}
                            className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-paw-500 to-amber-500 hover:from-paw-600 hover:to-amber-600 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-transform flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                            <span>{item.actionLabel}</span>
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

        {/* Footer: View All Full Screen Button (คนละหน้ากับแบบปัดข้าง) */}
        <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onViewAllNotifications) {
                onViewAllNotifications();
              }
            }}
            className="w-full py-2 px-3 rounded-2xl bg-white hover:bg-paw-50 hover:text-paw-700 text-slate-700 text-xs font-bold border border-slate-200/90 shadow-2xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>ดูทั้งหมดในศูนย์แจ้งเตือน</span>
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="text-[11px] text-slate-400 group-hover:text-paw-600 group-hover:translate-x-0.5 transition-all" 
            />
          </button>
        </div>
      </div>
    </>
  );
}
