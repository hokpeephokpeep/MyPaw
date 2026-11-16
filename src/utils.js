// Date & Life Stage calculation utilities (Local Timezone Safe)
import { 
  faBaby, faBolt, faSun, faCrown, faFeather, faGem 
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

// Life stage categorization based on AAFP / AAHA Feline Life Stage Guidelines
export function getLifeStage(years, months) {
  const totalMonths = years * 12 + months;
  if (totalMonths <= 6) {
    return { 
      stage: 'Kitten', 
      label: 'วัยเบบี๋', 
      icon: faBaby, 
      bg: 'bg-pink-50', 
      text: 'text-pink-600', 
      border: 'border-pink-200' 
    };
  }
  if (totalMonths <= 24) {
    return { 
      stage: 'Junior', 
      label: 'วัยซน', 
      icon: faBolt, 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      border: 'border-amber-200' 
    };
  }
  if (years <= 6) {
    return { 
      stage: 'Prime', 
      label: 'วัยหนุ่มสาว', 
      icon: faSun, 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      border: 'border-emerald-200' 
    };
  }
  if (years <= 10) {
    return { 
      stage: 'Mature', 
      label: 'วัยผู้ใหญ่', 
      icon: faCrown, 
      bg: 'bg-sky-50', 
      text: 'text-sky-600', 
      border: 'border-sky-200' 
    };
  }
  if (years <= 14) {
    return { 
      stage: 'Senior', 
      label: 'วัยอาวุโส', 
      icon: faFeather, 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      border: 'border-indigo-200' 
    };
  }
  return { 
    stage: 'Super Senior', 
    label: 'วัยทวด', 
    icon: faGem, 
    bg: 'bg-purple-50', 
    text: 'text-purple-600', 
    border: 'border-purple-200' 
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

// Configurable Date Formatter (locale: 'en' for สากล ค.ศ., 'th' for ไทย พ.ศ.)
export function formatDate(dateStr, locale = 'en') {
  if (locale === 'th') return formatDateTh(dateStr);
  return formatDateEn(dateStr);
}
