import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faCheck, faCakeCandles, faShieldHalved, 
  faSyringe, faStethoscope, faRainbow, faCheckDouble,
  faCircleCheck, faChevronRight, faSliders, faXmark, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
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

export default function NotificationScreen({
  pets = [],
  onUpdatePet,
  onOpenPetDetail,
  onOpenMemorial,
  onOpenHealth,
  onBackToHome,
  isActive = false,
  onScroll
}) {
  const [prefs, setPrefs] = useState(getNotificationPrefs);
  const [filter, setFilter] = useState('all'); // 'all', 'urgent', 'upcoming', 'memorial'
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [webPermission, setWebPermission] = useState(() => 
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  // Refresh notifications whenever pets change (decoupled from isActive to prevent swipe stutter)
  useEffect(() => {
    const currentPrefs = getNotificationPrefs();
    setPrefs(currentPrefs);
    const list = generatePetNotifications(pets, { prefs: currentPrefs });
    setNotifications(list);
  }, [pets]);

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
            origin: { y: 0.75 },
            colors: ['#0ea5e9', '#10b981', '#f59e0b']
          });
        } catch (err) {}
      }
    } else if (item.actionType === 'view_memorial' && onOpenMemorial) {
      onOpenMemorial(targetPet);
    } else if (item.actionType === 'view_health' && onOpenHealth) {
      onOpenHealth(targetPet);
    } else if (onOpenPetDetail) {
      onOpenPetDetail(targetPet);
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
    <div className="w-full h-full flex flex-col bg-slate-50/50">
      {/* Top Bar for Notifications Screen */}
      <div className="px-4 sm:px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform shadow-2xs focus-visible:ring-2 focus-visible:ring-paw-500 outline-none"
              title="กลับหน้าหลัก"
              aria-label="Back to Home"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            </button>
          )}
          <div className="w-9 h-9 rounded-2xl bg-paw-100 text-paw-600 flex items-center justify-center text-sm shadow-2xs">
            <FontAwesomeIcon icon={faBell} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800 text-base">ศูนย์แจ้งเตือน</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500 text-white animate-pulse">
                {unreadCount} ใหม่
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors active:scale-95 border ${
              showSettings 
                ? 'bg-paw-100 text-paw-700 border-paw-300' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-slate-200/80 bg-white'
            }`}
            title="ตั้งค่าการแจ้งเตือน"
            aria-label="ตั้งค่าการแจ้งเตือน"
          >
            <FontAwesomeIcon icon={faSliders} className="text-xs" />
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="bg-white border-b border-slate-200/80 px-4 sm:px-5 py-3.5 animate-fadeIn flex-shrink-0 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">หมวดหมู่ที่เปิดแจ้งเตือน:</span>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-[11px] text-paw-600 font-medium hover:underline flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
              <span>ปิดแผงตั้งค่า</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { key: 'birthday', label: '🎂 วันเกิด' },
              { key: 'flea', label: '💊 หยดยาเห็บหมัด' },
              { key: 'vaccine', label: '💉 วัคซีนประจำปี' },
              { key: 'checkup', label: '🩺 นัดสัตวแพทย์' },
              { key: 'memorial', label: '🌈 วันครบรอบดาวแมว' }
            ].map(cat => (
              <button
                key={cat.key}
                onClick={() => handleToggleCategory(cat.key)}
                className={`px-3 py-2 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                  prefs.categories[cat.key]
                    ? 'border-paw-300 bg-paw-50/50 text-paw-900 shadow-2xs font-medium'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
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
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
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
      <div className="px-4 sm:px-5 py-2.5 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
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
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-slate-500 hover:text-paw-600 font-semibold whitespace-nowrap flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 active:scale-95"
            title="ทำเครื่องหมายอ่านแล้วทั้งหมด"
          >
            <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
            <span>อ่านแล้ว</span>
          </button>
        )}
      </div>

      {/* Notifications List Container */}
      <div 
        id="notif-scroll-container"
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-5 py-4 space-y-3 pb-36 overscroll-y-contain"
      >
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 text-2xl shadow-inner">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่มีการแจ้งเตือนในหมวดนี้</p>
            <p className="text-xs text-slate-400 mt-1">น้องแมวทุกตัวได้รับการดูแลและมีสุขภาพที่ดี 🐾</p>
          </div>
        ) : (
          filteredList.map(item => {
            const isUrgent = item.urgency === 'urgent_today';
            const isMemorial = item.urgency === 'memorial';

            let cardBg = 'bg-white border-slate-200/90 shadow-2xs';
            let badgeColor = 'bg-slate-100 text-slate-700';

            if (isUrgent) {
              cardBg = item.isRead 
                ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs' 
                : 'bg-amber-50/90 border-amber-300 shadow-xs ring-1 ring-amber-300/50';
              badgeColor = 'bg-amber-500 text-white';
            } else if (isMemorial) {
              cardBg = item.isRead 
                ? 'bg-purple-50/40 border-purple-200/80 shadow-2xs' 
                : 'bg-purple-50/80 border-purple-300 shadow-xs';
              badgeColor = 'bg-purple-500 text-white';
            } else if (!item.isRead) {
              cardBg = 'bg-sky-50/50 border-sky-200 shadow-2xs';
            }

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${cardBg}`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Pet Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={getPhotoSrc(item.petAvatar) || '/default-cat.png'}
                      alt={item.petName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/avatars/khaitom.png';
                      }}
                    />
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-xs ${badgeColor}`}>
                      <FontAwesomeIcon icon={getIcon(item.icon)} />
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0 ring-2 ring-white" title="ยังไม่ได้อ่าน" />
                      )}
                    </div>

                    {/* Date with day of week & relative badge: เสาร์ที่ ... (อีกกี่วัน)(เลยกำหนด) */}
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

                    {/* Quick Action Button & SubNote */}
                    {item.actionType && (
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]" title={item.subNote}>
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
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 flex-shrink-0 ${
                            isUrgent
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                              : isMemorial
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
                                : 'bg-paw-600 hover:bg-paw-700 text-white shadow-paw-600/25'
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
  );
}
