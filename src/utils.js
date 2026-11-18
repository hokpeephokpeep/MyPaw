// Date & Life Stage calculation utilities (Local Timezone Safe)
import { 
  faBaby, faChild, faPerson, faPersonCane, faBolt, faSun, faCrown, faFeather, faGem,
  faRainbow, faCakeCandles, faStethoscope, faSyringe
} from '@fortawesome/free-solid-svg-icons';

/**
 * Parse YYYY-MM-DD safely in local timezone (prevents UTC midnight drift)
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export function getTodayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateAge(birthDateStr, endDateStr = null) {
  const birth = parseLocalDate(birthDateStr);
  const end = endDateStr ? parseLocalDate(endDateStr) : getTodayLocal();
  
  if (!birth || !end || end < birth) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  // Calculate total days accurately
  const diffTime = end.getTime() - birth.getTime();
  const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { 
    years: Math.max(0, years), 
    months: Math.max(0, months), 
    days: Math.max(0, days), 
    totalDays: Math.max(0, totalDays) 
  };
}

// Cat to human years conversion (AAFP / AAHA international veterinary standard)
export function calculateCatToHumanAge(years, months) {
  const age = years + (months / 12);
  if (age <= 0) return 0;
  if (age <= 1) return Math.max(1, Math.round(age * 15));
  if (age <= 2) return Math.round(15 + (age - 1) * 9);
  return Math.round(24 + (age - 2) * 4);
}

/**
 * Human age stage icon from FontAwesome:
 * - เด็กแรกเกิด (Newborn/Infant): humanAge <= 2 -> faBaby
 * - เด็ก (Child/Kid): humanAge < 18 -> faChild
 * - วัยกลางคน (Adult/Middle-aged): humanAge < 60 -> faPerson
 * - คนแก่ (Senior/Elderly): humanAge >= 60 -> faPersonCane
 */
export function getHumanAgeIcon(humanAge) {
  if (humanAge <= 2) return faBaby;
  if (humanAge < 18) return faChild;
  if (humanAge < 60) return faPerson;
  return faPersonCane;
}

// Life stage categorization based on AAFP / AAHA Feline Life Stage Guidelines
export function getLifeStage(years, months, lang = 'th') {
  const totalMonths = years * 12 + months;
  const isEn = lang === 'en';
  if (totalMonths <= 6) {
    return { 
      stage: 'Kitten', 
      label: isEn ? 'Kitten' : 'วัยเบบี๋', 
      icon: faBaby, 
      bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
      text: 'text-stone-700 dark:text-stone-300', 
      border: 'border-stone-200/80 dark:border-stone-700' 
    };
  }
  if (totalMonths <= 24) {
    return { 
      stage: 'Junior', 
      label: isEn ? 'Junior' : 'วัยซน', 
      icon: faBolt, 
      bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
      text: 'text-stone-700 dark:text-stone-300', 
      border: 'border-stone-200/80 dark:border-stone-700' 
    };
  }
  if (years <= 6) {
    return { 
      stage: 'Prime', 
      label: isEn ? 'Prime Adult' : 'วัยหนุ่มสาว', 
      icon: faSun, 
      bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
      text: 'text-stone-700 dark:text-stone-300', 
      border: 'border-stone-200/80 dark:border-stone-700' 
    };
  }
  if (years <= 10) {
    return { 
      stage: 'Mature', 
      label: isEn ? 'Mature' : 'วัยผู้ใหญ่', 
      icon: faCrown, 
      bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
      text: 'text-stone-700 dark:text-stone-300', 
      border: 'border-stone-200/80 dark:border-stone-700' 
    };
  }
  if (years <= 14) {
    return { 
      stage: 'Senior', 
      label: isEn ? 'Senior' : 'วัยอาวุโส', 
      icon: faFeather, 
      bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
      text: 'text-stone-700 dark:text-stone-300', 
      border: 'border-stone-200/80 dark:border-stone-700' 
    };
  }
  return { 
    stage: 'Super Senior', 
    label: isEn ? 'Geriatric' : 'วัยทวด', 
    icon: faGem, 
    bg: 'bg-stone-100/90 dark:bg-stone-800/80', 
    text: 'text-stone-700 dark:text-stone-300', 
    border: 'border-stone-200/80 dark:border-stone-700' 
  };
}

// Days until next birthday (Local timezone accurate)
export function getDaysUntilBirthday(birthDateStr) {
  const birth = parseLocalDate(birthDateStr);
  if (!birth) return 999;
  const today = getTodayLocal();
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  
  const diff = nextBirthday.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// Format date to English: e.g. "30 Nov 2013"
export function formatDateEn(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${enMonths[d.getMonth()]} ${d.getFullYear()}`;
}

// Format date to Thai: e.g. "30 พ.ย. 2556"
export function formatDateTh(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '';
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${thMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/**
 * Format Date to Thai or English with day-of-week prefix: e.g. "เสาร์ที่ 11 พ.ย. 2565" or "Saturday, 11 Nov 2022"
 */
export function getThaiDayAndDate(dateObj, lang = 'th') {
  if (!dateObj) return '';
  const d = typeof dateObj === 'string' ? parseLocalDate(dateObj) : dateObj;
  if (!d || isNaN(d.getTime())) return '';

  if (lang === 'en') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${enMonths[d.getMonth()]} ${d.getFullYear()}`;
  }

  const dayNames = [
    'อาทิตย์ที่',
    'จันทร์ที่',
    'อังคารที่',
    'พุธที่',
    'พฤหัสฯที่',
    'ศุกร์ที่',
    'เสาร์ที่'
  ];

  const thMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${dayNames[d.getDay()]} ${d.getDate()} ${thMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export const getLocalizedDayAndDate = getThaiDayAndDate;

/**
 * Format relative difference in days: e.g. "(วันนี้)", "(อีก 3 วัน)", "(เลยกำหนด 737 วัน)" or "(Today)", "(in 3 days)", "(737 days overdue)"
 */
export function formatRelativeDiff(daysDiff, lang = 'th') {
  if (lang === 'en') {
    if (daysDiff === 0) return '(Today)';
    if (daysDiff > 0) return `(in ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'})`;
    return `(${Math.abs(daysDiff)} ${Math.abs(daysDiff) === 1 ? 'day' : 'days'} overdue)`;
  }
  if (daysDiff === 0) return '(วันนี้)';
  if (daysDiff > 0) return `(อีก ${daysDiff} วัน)`;
  return `(เลยกำหนด ${Math.abs(daysDiff)} วัน)`;
}

/**
 * Combined day, date, and relative diff: e.g. "เสาร์ที่ 11 พ.ย. 2565 (เลยกำหนด 737 วัน)"
 */
export function formatThaiDayDateWithDiff(dateObj, daysDiff, lang = 'th') {
  const dayDate = getThaiDayAndDate(dateObj, lang);
  if (!dayDate) return '';
  const diff = formatRelativeDiff(daysDiff, lang);
  return `${dayDate} ${diff}`;
}

// Configurable Date Formatter (locale: 'en' for สากล ค.ศ., 'th' for ไทย พ.ศ.)
export function formatDate(dateStr, locale = 'en') {
  if (locale === 'th') return formatDateTh(dateStr);
  return formatDateEn(dateStr);
}

/**
 * Special Event Evaluator for Pet Cards & List Items
 * Priority Order:
 * 1. Rainbow Bridge (แมวที่อยู่ดาวแมวแล้ว)
 * 2. Birthday Today (วันเกิดวันนี้ 🎂)
 * 3. Health Checkup Today / Soon (คิวนัดตรวจสุขภาพ 🩺)
 * 4. Annual Vaccine Overdue / Due Soon (ใกล้ครบรอบปีทำวัคซีน 💉)
 * 5. Birthday Countdown (ใกล้วันเกิด นับถอยหลัง 1-14 วัน 🎂)
 */
export function getPetSpecialEvents(pet, lang = 'th') {
  if (!pet) return [];
  const events = [];
  const today = getTodayLocal();
  const isDeceased = pet.status === 'deceased';
  const isEn = lang === 'en';

  // 1. Rainbow Bridge
  if (isDeceased) {
    events.push({
      type: 'deceased',
      label: isEn ? 'Rainbow Bridge' : 'สะพานสายรุ้ง',
      icon: faRainbow,
      bgClass: 'bg-black/55 backdrop-blur-md text-white border-white/20',
      iconClass: 'text-amber-300'
    });
    return events; // Deceased cats stay dedicated to the Rainbow Bridge memorial
  }

  // 2. Birthday Today!
  const daysUntilBday = getDaysUntilBirthday(pet.birthDate);
  if (daysUntilBday === 0) {
    events.push({
      type: 'birthday_today',
      label: isEn ? 'Birthday Today' : 'วันเกิดวันนี้',
      icon: faCakeCandles,
      bgClass: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold border-white/30 shadow-sm',
      iconClass: 'text-amber-200'
    });
  }

  // 3. Health Checkup Appointment (คิวนัดตรวจสุขภาพ)
  if (pet.checkupDate) {
    const checkupParsed = parseLocalDate(pet.checkupDate);
    if (checkupParsed) {
      const daysUntilCheckup = Math.round((checkupParsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilCheckup === 0) {
        events.push({
          type: 'checkup_today',
          label: isEn ? 'Vet Checkup Today' : 'นัดตรวจสุขภาพวันนี้',
          icon: faStethoscope,
          bgClass: 'bg-emerald-600/95 backdrop-blur-md text-white border-white/25 shadow-sm',
          iconClass: 'text-emerald-200'
        });
      } else if (daysUntilCheckup > 0 && daysUntilCheckup <= 14) {
        events.push({
          type: 'checkup_soon',
          label: isEn 
            ? (daysUntilCheckup === 1 ? 'Checkup Tomorrow' : `Checkup in ${daysUntilCheckup}d`)
            : (daysUntilCheckup === 1 ? 'นัดตรวจพรุ่งนี้' : `นัดตรวจอีก ${daysUntilCheckup} วัน`),
          icon: faStethoscope,
          bgClass: 'bg-sky-600/90 backdrop-blur-md text-white border-white/25 shadow-sm',
          iconClass: 'text-sky-200'
        });
      }
    }
  }

  // 4. Annual Vaccine Care (ใกล้ครบรอบปีทำวัคซีน - รอบ 365 วัน)
  if (pet.vaccineDate) {
    const vaccineParsed = parseLocalDate(pet.vaccineDate);
    if (vaccineParsed) {
      const daysSinceVaccine = Math.round((today.getTime() - vaccineParsed.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceVaccine >= 365) {
        events.push({
          type: 'vaccine_overdue',
          label: isEn ? 'Vaccine Due' : 'ถึงกำหนดวัคซีน',
          icon: faSyringe,
          bgClass: 'bg-rose-600/95 backdrop-blur-md text-white border-white/25 shadow-sm',
          iconClass: 'text-rose-200'
        });
      } else if (daysSinceVaccine >= 335) { // ภายใน 30 วันก่อนครบรอบ
        const daysLeft = 365 - daysSinceVaccine;
        events.push({
          type: 'vaccine_soon',
          label: isEn
            ? (daysLeft === 1 ? 'Vaccine Tomorrow' : `Vaccine in ${daysLeft}d`)
            : (daysLeft === 1 ? 'วัคซีนพรุ่งนี้' : `วัคซีนอีก ${daysLeft} วัน`),
          icon: faSyringe,
          bgClass: 'bg-amber-600/90 backdrop-blur-md text-white border-white/25 shadow-sm',
          iconClass: 'text-amber-200'
        });
      }
    }
  }

  // 5. Birthday Countdown (ใกล้วันเกิด นับถอยหลัง 1-14 วัน)
  if (daysUntilBday > 0 && daysUntilBday <= 14) {
    events.push({
      type: 'birthday_soon',
      label: isEn
        ? (daysUntilBday === 1 ? 'Birthday Tomorrow' : `Birthday in ${daysUntilBday}d`)
        : (daysUntilBday === 1 ? 'วันเกิดพรุ่งนี้' : `วันเกิดอีก ${daysUntilBday} วัน`),
      icon: faCakeCandles,
      bgClass: 'bg-stone-800/90 backdrop-blur-md text-white border-white/25 shadow-sm',
      iconClass: 'text-amber-200'
    });
  }

  return events;
}
