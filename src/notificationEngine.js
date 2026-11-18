// Notification Engine for MyPaw
// Calculates upcoming events, urgent health reminders, and memorial anniversaries
import { 
  parseLocalDate, 
  getTodayLocal, 
  toLocalDateString, 
  calculateAge,
  getThaiDayAndDate,
  formatRelativeDiff,
  formatThaiDayDateWithDiff
} from './utils.js';

export const NOTIFICATION_PREFS_KEY = 'mypaw_notification_prefs';
export const NOTIFICATION_READ_KEY = 'mypaw_read_notification_ids';

export const DEFAULT_NOTIFICATION_PREFS = {
  categories: {
    birthday: true,
    flea: true,
    vaccine: true,
    checkup: true,
    memorial: true,
  },
  dailyReminderTime: '09:00',
  browserNotifications: false,
};

/**
 * Load user notification preferences from localStorage
 */
export function getNotificationPrefs() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...parsed,
        categories: {
          ...DEFAULT_NOTIFICATION_PREFS.categories,
          ...(parsed.categories || {})
        }
      };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_NOTIFICATION_PREFS;
}

/**
 * Save user notification preferences to localStorage
 */
export function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save notification preferences', e);
  }
}

/**
 * Get list of read notification IDs
 */
export function getReadNotificationIds() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_READ_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Mark a notification ID as read
 */
export function markNotificationAsRead(id) {
  try {
    const current = getReadNotificationIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (e) {
    return [];
  }
}

/**
 * Mark all notification IDs as read
 */
export function markAllNotificationsAsRead(ids) {
  try {
    const current = getReadNotificationIds();
    const updated = Array.from(new Set([...current, ...ids]));
    localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Main evaluation function: calculate all notifications from pet list
 * @param {Array} pets - list of pet objects
 * @param {Object} options - { customDate: Date, prefs: Object }
 * @returns {Array} list of notification items sorted by urgency & priority
 */
export function generatePetNotifications(pets = [], options = {}) {
  if (!Array.isArray(pets) || pets.length === 0) return [];

  const lang = options.lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('mypaw_language') : 'th') || 'th';
  const isEn = lang === 'en';
  const today = options.customDate || getTodayLocal();
  const currentYear = today.getFullYear();
  const prefs = options.prefs || getNotificationPrefs();
  const readIds = getReadNotificationIds();

  const notifications = [];

  pets.forEach(pet => {
    const isAlive = pet.status !== 'deceased';
    const petAvatar = pet.avatarThumb || pet.avatar || pet.photos?.[0] || '';

    // ==========================================
    // 1. 🎂 Birthday (วันเกิด)
    // ==========================================
    if (isAlive && prefs.categories.birthday && pet.birthDate) {
      const birth = parseLocalDate(pet.birthDate);
      if (birth) {
        // Next birthday this year
        let nextBday = new Date(currentYear, birth.getMonth(), birth.getDate());
        // If already passed this year, check next year
        if (nextBday < today) {
          nextBday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
        }

        const daysUntilBday = Math.round((nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const newAgeYears = nextBday.getFullYear() - birth.getFullYear();
        const thaiDayDate = getThaiDayAndDate(nextBday, lang);
        const diffLabel = formatRelativeDiff(daysUntilBday, lang);
        const dateText = `${thaiDayDate} ${diffLabel}`;

        if (daysUntilBday === 0) {
          notifications.push({
            id: `bday-${pet.id}-${nextBday.getFullYear()}`,
            petId: pet.id,
            petName: pet.name,
            petAvatar,
            type: 'birthday',
            urgency: 'urgent_today',
            priority: 10,
            icon: 'faCakeCandles',
            title: isEn ? `${pet.name} (Birthday)` : `${pet.name} (วันเกิด)`,
            thaiDayDate,
            diffLabel,
            dateText,
            message: dateText,
            subNote: isEn ? `Turns ${newAgeYears} years old today! 🎉` : `อายุครบ ${newAgeYears} ปี วันนี้ 🎉`,
            daysDiff: 0,
            actionType: 'view_pet',
            actionLabel: isEn ? 'View Profile' : 'ดูข้อมูลน้อง',
            timestamp: today.toISOString()
          });
        } else if (daysUntilBday > 0 && daysUntilBday <= 7) {
          notifications.push({
            id: `bday-near-${pet.id}-${nextBday.getFullYear()}-${daysUntilBday}`,
            petId: pet.id,
            petName: pet.name,
            petAvatar,
            type: 'birthday',
            urgency: 'upcoming_soon',
            priority: 6,
            icon: 'faCakeCandles',
            title: isEn ? `${pet.name} (Upcoming Birthday)` : `${pet.name} (ใกล้ถึงวันเกิด)`,
            thaiDayDate,
            diffLabel,
            dateText,
            message: dateText,
            subNote: isEn ? `Turning ${newAgeYears} soon` : `จะครบ ${newAgeYears} ปี`,
            daysDiff: daysUntilBday,
            actionType: 'view_pet',
            actionLabel: isEn ? 'View Profile' : 'ดูข้อมูลน้อง',
            timestamp: today.toISOString()
          });
        }
      }
    }

    // ==========================================
    // 2. 💊 Flea & Tick (หยดยาเห็บหมัดรอบ 30 วัน)
    // ==========================================
    if (isAlive && prefs.categories.flea) {
      if (pet.fleaDate) {
        const fleaDate = parseLocalDate(pet.fleaDate);
        if (fleaDate) {
          const daysSinceFlea = Math.floor((today.getTime() - fleaDate.getTime()) / (1000 * 60 * 60 * 24));
          const remainingDays = 30 - daysSinceFlea;
          const dueDate = new Date(fleaDate.getFullYear(), fleaDate.getMonth(), fleaDate.getDate() + 30);
          const thaiDayDate = getThaiDayAndDate(dueDate, lang);
          const diffLabel = formatRelativeDiff(remainingDays, lang);
          const dateText = `${thaiDayDate} ${diffLabel}`;

          if (remainingDays < 0) {
            notifications.push({
              id: `flea-overdue-${pet.id}-${pet.fleaDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'flea',
              urgency: 'urgent_today',
              priority: 9,
              icon: 'faShieldHalved',
              title: isEn ? `${pet.name} (Flea & Tick Due)` : `${pet.name} (หยดยาเห็บหมัด)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Last treated ${daysSinceFlea} days ago` : `หยอดล่าสุดเมื่อ ${daysSinceFlea} วันก่อน`,
              daysDiff: remainingDays,
              actionType: 'flea_today',
              actionLabel: isEn ? 'Treated Today' : 'หยดยาวันนี้แล้ว',
              timestamp: today.toISOString()
            });
          } else if (remainingDays === 0) {
            notifications.push({
              id: `flea-today-${pet.id}-${pet.fleaDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'flea',
              urgency: 'urgent_today',
              priority: 8,
              icon: 'faShieldHalved',
              title: isEn ? `${pet.name} (Flea & Tick Due)` : `${pet.name} (หยดยาเห็บหมัด)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `30-day cycle due today` : `ครบกำหนดรอบ 30 วันแล้ว`,
              daysDiff: 0,
              actionType: 'flea_today',
              actionLabel: isEn ? 'Treated Today' : 'หยดยาวันนี้แล้ว',
              timestamp: today.toISOString()
            });
          } else if (remainingDays > 0 && remainingDays <= 3) {
            notifications.push({
              id: `flea-soon-${pet.id}-${pet.fleaDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'flea',
              urgency: 'upcoming_soon',
              priority: 5,
              icon: 'faShieldHalved',
              title: isEn ? `${pet.name} (Flea & Tick Due)` : `${pet.name} (หยดยาเห็บหมัด)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Last treated ${daysSinceFlea} days ago` : `หยอดล่าสุดเมื่อ ${daysSinceFlea} วันก่อน`,
              daysDiff: remainingDays,
              actionType: 'flea_today',
              actionLabel: isEn ? 'Treated Today' : 'หยดยาวันนี้แล้ว',
              timestamp: today.toISOString()
            });
          }
        }
      }
    }

    // ==========================================
    // 3. 💉 Annual Vaccine (วัคซีนประจำปี 365 วัน)
    // ==========================================
    if (isAlive && prefs.categories.vaccine) {
      if (pet.vaccineDate) {
        const vaccineDate = parseLocalDate(pet.vaccineDate);
        if (vaccineDate) {
          const daysSinceVaccine = Math.floor((today.getTime() - vaccineDate.getTime()) / (1000 * 60 * 60 * 24));
          const remainingDays = 365 - daysSinceVaccine;
          const dueDate = new Date(vaccineDate.getFullYear(), vaccineDate.getMonth(), vaccineDate.getDate() + 365);
          const thaiDayDate = getThaiDayAndDate(dueDate, lang);
          const diffLabel = formatRelativeDiff(remainingDays, lang);
          const dateText = `${thaiDayDate} ${diffLabel}`;

          if (remainingDays <= 0) {
            notifications.push({
              id: `vaccine-due-${pet.id}-${pet.vaccineDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'vaccine',
              urgency: 'urgent_today',
              priority: 8,
              icon: 'faSyringe',
              title: isEn ? `${pet.name} (Annual Vaccine)` : `${pet.name} (วัคซีนประจำปี)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Last shot ${daysSinceVaccine} days ago` : `ฉีดล่าสุดเมื่อ ${daysSinceVaccine} วันก่อน`,
              daysDiff: remainingDays,
              actionType: 'vaccine_today',
              actionLabel: isEn ? 'Vaccinated Today' : 'ฉีดวัคซีนวันนี้แล้ว',
              timestamp: today.toISOString()
            });
          } else if (remainingDays > 0 && remainingDays <= 30) {
            notifications.push({
              id: `vaccine-soon-${pet.id}-${pet.vaccineDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'vaccine',
              urgency: 'upcoming_soon',
              priority: 4,
              icon: 'faSyringe',
              title: isEn ? `${pet.name} (Annual Vaccine)` : `${pet.name} (วัคซีนประจำปี)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Last shot ${daysSinceVaccine} days ago` : `ฉีดล่าสุดเมื่อ ${daysSinceVaccine} วันก่อน`,
              daysDiff: remainingDays,
              actionType: 'vaccine_today',
              actionLabel: isEn ? 'Vaccinated Today' : 'ฉีดวัคซีนวันนี้แล้ว',
              timestamp: today.toISOString()
            });
          }
        }
      }
    }

    // ==========================================
    // 4. 🩺 Vet Checkup Appointment (นัดหมายสัตวแพทย์)
    // ==========================================
    if (isAlive && prefs.categories.checkup) {
      if (pet.checkupDate) {
        const checkupDate = parseLocalDate(pet.checkupDate);
        if (checkupDate) {
          const daysUntilCheckup = Math.round((checkupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const thaiDayDate = getThaiDayAndDate(checkupDate, lang);
          const diffLabel = formatRelativeDiff(daysUntilCheckup, lang);
          const dateText = `${thaiDayDate} ${diffLabel}`;

          if (daysUntilCheckup === 0) {
            notifications.push({
              id: `checkup-today-${pet.id}-${pet.checkupDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'checkup',
              urgency: 'urgent_today',
              priority: 9,
              icon: 'faStethoscope',
              title: isEn ? `${pet.name} (Vet Checkup)` : `${pet.name} (นัดสัตวแพทย์)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Scheduled checkup or follow-up today` : `มีนัดตรวจสุขภาพหรือติดตามอาการวันนี้`,
              daysDiff: 0,
              actionType: 'view_health',
              actionLabel: isEn ? 'View Health Log' : 'ดูสมุดสุขภาพ',
              timestamp: today.toISOString()
            });
          } else if (daysUntilCheckup > 0 && daysUntilCheckup <= 7) {
            notifications.push({
              id: `checkup-soon-${pet.id}-${pet.checkupDate}`,
              petId: pet.id,
              petName: pet.name,
              petAvatar,
              type: 'checkup',
              urgency: 'upcoming_soon',
              priority: 5,
              icon: 'faStethoscope',
              title: isEn ? `${pet.name} (Vet Checkup)` : `${pet.name} (นัดสัตวแพทย์)`,
              thaiDayDate,
              diffLabel,
              dateText,
              message: dateText,
              subNote: isEn ? `Annual health checkup` : `ตรวจสุขภาพประจำปี`,
              daysDiff: daysUntilCheckup,
              actionType: 'view_health',
              actionLabel: isEn ? 'View Health Log' : 'ดูสมุดสุขภาพ',
              timestamp: today.toISOString()
            });
          }
        }
      }
    }

    // ==========================================
    // 5. 🌈 Memorial Anniversaries (วันครบรอบดาวแมว)
    // ==========================================
    if (!isAlive && prefs.categories.memorial && pet.deceasedDate) {
      const deceased = parseLocalDate(pet.deceasedDate);
      if (deceased) {
        const daysSinceDeceased = Math.floor((today.getTime() - deceased.getTime()) / (1000 * 60 * 60 * 24));

        // 100 days anniversary
        if (daysSinceDeceased === 100) {
          const memorial100Date = new Date(deceased.getFullYear(), deceased.getMonth(), deceased.getDate() + 100);
          const thaiDayDate = getThaiDayAndDate(memorial100Date, lang);
          const diffLabel = isEn ? `(100 Days Memorial)` : `(ครบรอบ 100 วัน)`;
          const dateText = `${thaiDayDate} ${diffLabel}`;
          notifications.push({
            id: `memorial-100d-${pet.id}`,
            petId: pet.id,
            petName: pet.name,
            petAvatar,
            type: 'memorial',
            urgency: 'memorial',
            priority: 7,
            icon: 'faRainbow',
            title: isEn ? `${pet.name} (100 Days Memorial)` : `${pet.name} (ครบรอบ 100 วัน)`,
            thaiDayDate,
            diffLabel,
            dateText,
            message: dateText,
            subNote: isEn ? `Always in our hearts ✨` : `อยู่ในความทรงจำเสมอ ✨`,
            daysDiff: 0,
            actionType: 'view_memorial',
            actionLabel: isEn ? 'View Memorial' : 'ดูหน้าแห่งความทรงจำ',
            timestamp: today.toISOString()
          });
        }

        // Annual memorial anniversary
        const isSameMonthAndDay = (today.getMonth() === deceased.getMonth()) && (today.getDate() === deceased.getDate());
        const yearsPassed = today.getFullYear() - deceased.getFullYear();
        if (isSameMonthAndDay && yearsPassed >= 1) {
          const memorialYearDate = new Date(today.getFullYear(), deceased.getMonth(), deceased.getDate());
          const thaiDayDate = getThaiDayAndDate(memorialYearDate, lang);
          const diffLabel = isEn ? `(${yearsPassed} Year Memorial)` : `(ครบรอบ ${yearsPassed} ปี)`;
          const dateText = `${thaiDayDate} ${diffLabel}`;
          notifications.push({
            id: `memorial-year-${pet.id}-${yearsPassed}`,
            petId: pet.id,
            petName: pet.name,
            petAvatar,
            type: 'memorial',
            urgency: 'memorial',
            priority: 7,
            icon: 'faRainbow',
            title: isEn ? `${pet.name} (${yearsPassed} Year Memorial)` : `${pet.name} (ครบรอบ ${yearsPassed} ปี)`,
            thaiDayDate,
            diffLabel,
            dateText,
            message: dateText,
            subNote: isEn ? `Forever remembered ✨` : `คิดถึงเสมอ ✨`,
            daysDiff: 0,
            actionType: 'view_memorial',
            actionLabel: isEn ? 'View Memorial' : 'ดูหน้าแห่งความทรงจำ',
            timestamp: today.toISOString()
          });
        }
      }
    }
  });

  // Sort: High priority first, then urgent_today > upcoming_soon > memorial
  const sorted = notifications.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return Math.abs(a.daysDiff) - Math.abs(b.daysDiff);
  });

  // Mark isRead flag
  return sorted.map(item => ({
    ...item,
    isRead: readIds.includes(item.id)
  }));
}

/**
 * Quick action handler to apply directly to pet object
 * @param {string} actionType 
 * @param {Object} pet 
 * @returns {Object} updated pet
 */
export function applyQuickAction(actionType, pet) {
  if (!pet) return null;
  const todayStr = toLocalDateString();

  if (actionType === 'flea_today') {
    return {
      ...pet,
      fleaDate: todayStr
    };
  }

  if (actionType === 'vaccine_today') {
    return {
      ...pet,
      vaccineDate: todayStr
    };
  }

  return pet;
}

/**
 * Request Web Notification permission
 */
export async function requestWebNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
}

/**
 * Trigger browser notification if permitted
 */
export function sendWebNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  try {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  } catch (e) {
    console.error('Web notification error', e);
    return null;
  }
}
