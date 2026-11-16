// Date calculation utilities

export function calculateAge(birthDateStr, endDateStr = null) {
  if (!birthDateStr) return { years: 0, months: 0, days: 0, totalDays: 0 };
  
  const birth = new Date(birthDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  
  if (isNaN(birth.getTime()) || isNaN(end.getTime())) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  // Calculate total days
  const diffTime = Math.abs(end - birth);
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // get days in previous month
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), totalDays };
}

// Cat to human years conversion (standard veterinary formula)
export function calculateCatToHumanAge(years, months) {
  const age = years + (months / 12);
  if (age <= 0) return 0;
  if (age <= 1) return Math.round(age * 15);
  if (age <= 2) return Math.round(15 + (age - 1) * 9);
  return Math.round(24 + (age - 2) * 4);
}

// Life stage categorization based on international veterinary standards
export function getLifeStage(years, months) {
  const totalMonths = years * 12 + months;
  if (totalMonths <= 6) {
    return { stage: 'Kitten', label: 'ลูกแมววัยซน', emoji: '🍼', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' };
  }
  if (totalMonths <= 24) {
    return { stage: 'Junior', label: 'วัยรุ่นพลังล้น', emoji: '⚡️', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  }
  if (years <= 6) {
    return { stage: 'Prime', label: 'วัยหนุ่มสาวสดใส', emoji: '🌟', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  }
  if (years <= 10) {
    return { stage: 'Mature', label: 'ผู้ใหญ่สุขุม', emoji: '👑', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
  }
  if (years <= 14) {
    return { stage: 'Senior', label: 'รุ่นใหญ่ใจดี', emoji: '🦉', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
  }
  return { stage: 'Super Senior', label: 'คุณทวดระดับตำนาน', emoji: '💎', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
}

// Days until next birthday
export function getDaysUntilBirthday(birthDateStr) {
  if (!birthDateStr) return 999;
  const today = new Date();
  const birth = new Date(birthDateStr);
  
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < today) {
    nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
  }
  
  const diff = nextBirthday - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format date to English: e.g. "30 Nov 2013"
export function formatDateEn(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Format date to Thai: e.g. "30 พ.ย. 2556"
export function formatDateTh(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${thMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// Configurable Date Formatter (locale: 'en' for สากล ค.ศ., 'th' for ไทย พ.ศ.)
export function formatDate(dateStr, locale = 'en') {
  if (locale === 'th') return formatDateTh(dateStr);
  return formatDateEn(dateStr);
}
