// Vet Document & Clinic OCR Parser for MyPaw
// Parses Thai & English veterinary appointment cards, vaccination books, and clinic invoices

/**
 * Thai Month map to 0-indexed month (0 = Jan, 11 = Dec)
 */
const THAI_MONTHS = {
  'มกราคม': 0, 'ม.ค.': 0, 'ม.ค': 0,
  'กุมภาพันธ์': 1, 'ก.พ.': 1, 'ก.พ': 1,
  'มีนาคม': 2, 'มี.ค.': 2, 'มี.ค': 2,
  'เมษายน': 3, 'เม.ย.': 3, 'เม.ย': 3,
  'พฤษภาคม': 4, 'พ.ค.': 4, 'พ.ค': 4,
  'มิถุนายน': 5, 'มิ.ย.': 5, 'มิ.ย': 5,
  'กรกฎาคม': 6, 'ก.ค.': 6, 'ก.ค': 6,
  'สิงหาคม': 7, 'ส.ค.': 7, 'ส.ค': 7,
  'กันยายน': 8, 'ก.ย.': 8, 'ก.ย': 8,
  'ตุลาคม': 9, 'ต.ค.': 9, 'ต.ค': 9,
  'พฤศจิกายน': 10, 'พ.ย.': 10, 'พ.ย': 10,
  'ธันวาคม': 11, 'ธ.ค.': 11, 'ธ.ค': 11,
};

const ENG_MONTHS = {
  'jan': 0, 'january': 0,
  'feb': 1, 'february': 1,
  'mar': 2, 'march': 2,
  'apr': 3, 'april': 3,
  'may': 4,
  'jun': 5, 'june': 5,
  'jul': 6, 'july': 6,
  'aug': 7, 'august': 7,
  'sep': 8, 'september': 8,
  'oct': 9, 'october': 9,
  'nov': 10, 'november': 10,
  'dec': 11, 'december': 11
};

/**
 * Normalize Thai Buddhist Era (พ.ศ.) to Common Era (ค.ศ.)
 */
export function normalizeYear(year) {
  const y = parseInt(year, 10);
  if (isNaN(y)) return null;
  // If year is in BE range (e.g. 2567 -> 2024, 2568 -> 2025)
  if (y >= 2400 && y <= 2700) {
    return y - 543;
  }
  // Short year (e.g. 67 -> 2024, 68 -> 2025, 24 -> 2024)
  if (y >= 50 && y <= 99) {
    return 1900 + y + 543 <= 2100 ? (2500 + y) - 543 : y + 2000;
  }
  return y;
}

/**
 * Format year, month, date to YYYY-MM-DD
 */
export function formatToDateString(year, monthIndex, day) {
  const y = normalizeYear(year);
  if (!y) return null;
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extract date from text string
 * Returns YYYY-MM-DD or null
 */
export function extractDateFromText(text) {
  if (!text) return null;

  // 1. Check DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const slashMatch = text.match(/(\b\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10) - 1;
    const y = parseInt(slashMatch[3], 10);
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      return formatToDateString(y, m, d);
    }
  }

  // 2. Check Thai Text date e.g. "15 พ.ย. 2567" or "20 ตุลาคม 2568"
  const thaiMonthsPattern = Object.keys(THAI_MONTHS)
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace('.', '\\.'))
    .join('|');
  const thaiRegex = new RegExp(`(\\b\\d{1,2})\\s*(${thaiMonthsPattern})\\s*(\\d{2,4})`, 'i');
  const thaiMatch = text.match(thaiRegex);
  if (thaiMatch) {
    const d = parseInt(thaiMatch[1], 10);
    const monthKey = thaiMatch[2].trim();
    const monthIndex = THAI_MONTHS[monthKey];
    const y = parseInt(thaiMatch[3], 10);
    if (monthIndex !== undefined && d >= 1 && d <= 31) {
      return formatToDateString(y, monthIndex, d);
    }
  }

  // 3. Check English Text date e.g. "15 Nov 2026", "20 October 2025"
  const engMonthsPattern = Object.keys(ENG_MONTHS).join('|');
  const engRegex = new RegExp(`(\\b\\d{1,2})\\s*(${engMonthsPattern})[a-z]*\\s*(\\d{2,4})`, 'i');
  const engMatch = text.match(engRegex);
  if (engMatch) {
    const d = parseInt(engMatch[1], 10);
    const monthKey = engMatch[2].toLowerCase().slice(0, 3);
    const monthIndex = ENG_MONTHS[monthKey];
    const y = parseInt(engMatch[3], 10);
    if (monthIndex !== undefined && d >= 1 && d <= 31) {
      return formatToDateString(y, monthIndex, d);
    }
  }

  // 4. Check ISO YYYY-MM-DD
  const isoMatch = text.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  return null;
}

/**
 * Main Vet Document OCR & Natural Language Parser
 * @param {string} rawText - Raw OCR text extracted from image
 * @returns {Object} Structured data with detected fields
 */
export function parseVetDocumentText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      rawText: '',
      weight: null,
      checkupDate: null,
      vaccineDate: null,
      vaccineName: null,
      fleaDate: null,
      fleaProduct: null,
      clinicName: null,
      diagnosis: null,
      confidenceScore: 0,
      detectedItems: []
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const cleanText = lines.join(' ');
  const result = {
    rawText,
    weight: null,
    checkupDate: null,
    vaccineDate: null,
    vaccineName: null,
    fleaDate: null,
    fleaProduct: null,
    clinicName: null,
    diagnosis: null,
    confidenceScore: 0,
    detectedItems: []
  };

  // ----------------------------------------------------
  // 1. ⚖️ Weight Detection (น้ำหนักตัว กก. / kg)
  // ----------------------------------------------------
  // Patterns: "น้ำหนัก: 4.3 กก.", "Wt 4.25 kg", "BW: 5.1", "4.30 kg"
  const weightRegexes = [
    /(?:น้ำหนัก|น\.น\.|weight|wt|bw)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:กก|กิโลกรัม|kg|kilos)?/i,
    /([0-9]+(?:\.[0-9]+)?)\s*(?:กก\.?|กิโลกรัม|kg)\b/i
  ];

  for (const regex of weightRegexes) {
    const match = cleanText.match(regex);
    if (match) {
      const val = parseFloat(match[1]);
      // Realistic weight range for cats: 0.3kg to 16kg
      if (val >= 0.3 && val <= 16.0) {
        result.weight = Math.round(val * 100) / 100;
        result.detectedItems.push({
          type: 'weight',
          label: 'น้ำหนักตัว',
          value: `${result.weight} กก.`
        });
        break;
      }
    }
  }

  // ----------------------------------------------------
  // 2. 🩺 Next Appointment Date (วันนัดตรวจ / นัดครั้งต่อไป)
  // ----------------------------------------------------
  const appointmentKeywords = [
    'วันนัดครั้งต่อไป', 'วันนัดครั้งถัดไป', 'วันนัดถัดไป', 'วันนัด', 
    'นัดตรวจ', 'นัดครั้งต่อไป', 'นัดดูอาการ', 'นัดตัดไหม', 'นัดฉีดวัคซีน', 
    'next visit', 'next appointment', 'appointment', 'next appt'
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const hasKeyword = appointmentKeywords.some(kw => lowerLine.includes(kw.toLowerCase()));
    if (hasKeyword) {
      const extractedDate = extractDateFromText(line);
      if (extractedDate) {
        result.checkupDate = extractedDate;
        result.detectedItems.push({
          type: 'checkupDate',
          label: 'วันนัดพบสัตวแพทย์',
          value: extractedDate
        });
        break;
      }
    }
  }

  // Fallback: search surrounding 60 characters around appointment keyword in full text
  if (!result.checkupDate) {
    for (const kw of appointmentKeywords) {
      const idx = cleanText.toLowerCase().indexOf(kw.toLowerCase());
      if (idx !== -1) {
        const snippet = cleanText.slice(idx, idx + 80);
        const extracted = extractDateFromText(snippet);
        if (extracted) {
          result.checkupDate = extracted;
          result.detectedItems.push({
            type: 'checkupDate',
            label: 'วันนัดพบสัตวแพทย์',
            value: extracted
          });
          break;
        }
      }
    }
  }

  // ----------------------------------------------------
  // 3. 💉 Vaccine Name & Vaccination Date (วัคซีน)
  // ----------------------------------------------------
  const vaccinePatterns = [
    { name: 'วัคซีนรวมแมว (FVRCP)', regex: /fvrcp|วัคซีนรวม|ไข้หัด.?หวัดแมว|core vaccine/i },
    { name: 'วัคซีนพิษสุนัขบ้า (Rabies)', regex: /rabies|พิษสุนัขบ้า|เรบีส์/i },
    { name: 'วัคซีนลิวคิเมีย (FeLV)', regex: /felv|ลิวคิเมีย/i },
    { name: 'วัคซีนเยื่อบุช่องท้องอักเสบ (FIP)', regex: /fip/i }
  ];

  for (const v of vaccinePatterns) {
    if (v.regex.test(cleanText)) {
      result.vaccineName = v.name;
      break;
    }
  }

  // Look for date in vaccine lines
  for (const line of lines) {
    if (/วัคซีน|vaccine|fvrcp|rabies|felv/i.test(line)) {
      const vDate = extractDateFromText(line);
      if (vDate) {
        result.vaccineDate = vDate;
        break;
      }
    }
  }

  // If vaccine detected but no specific line date, check any general date in document
  if (result.vaccineName && !result.vaccineDate) {
    // Find first date that is not appointment date
    for (const line of lines) {
      const d = extractDateFromText(line);
      if (d && d !== result.checkupDate) {
        result.vaccineDate = d;
        break;
      }
    }
  }

  if (result.vaccineDate || result.vaccineName) {
    result.detectedItems.push({
      type: 'vaccine',
      label: 'วัคซีน',
      value: `${result.vaccineName || 'วัคซีนประจำปี'}${result.vaccineDate ? ` (${result.vaccineDate})` : ''}`
    });
  }

  // ----------------------------------------------------
  // 4. 💊 Flea & Parasite Prevention (หยดยาเห็บหมัด)
  // ----------------------------------------------------
  const fleaBrands = [
    'Revolution', 'Revolution Plus', 'Frontline', 'Frontline Plus', 
    'Advocate', 'Nexgard', 'Broadline', 'Bravecto', 'ยาหยดเห็บหมัด', 
    'หยดยาเห็บ', 'กำจัดเห็บหมัด', 'ยาป้องกันพยาธิ'
  ];

  for (const brand of fleaBrands) {
    if (cleanText.toLowerCase().includes(brand.toLowerCase())) {
      result.fleaProduct = brand;
      break;
    }
  }

  if (result.fleaProduct) {
    for (const line of lines) {
      if (line.toLowerCase().includes(result.fleaProduct.toLowerCase()) || /หยดยา|เห็บหมัด|flea|tick/i.test(line)) {
        const fDate = extractDateFromText(line);
        if (fDate) {
          result.fleaDate = fDate;
          break;
        }
      }
    }
    // Fallback date: first date in doc if not appointment
    if (!result.fleaDate) {
      const firstDate = extractDateFromText(cleanText);
      if (firstDate && firstDate !== result.checkupDate) {
        result.fleaDate = firstDate;
      }
    }

    result.detectedItems.push({
      type: 'flea',
      label: 'หยดยาเห็บหมัด',
      value: `${result.fleaProduct}${result.fleaDate ? ` (${result.fleaDate})` : ''}`
    });
  }

  // ----------------------------------------------------
  // 5. 🏥 Clinic / Hospital Name (สถานพยาบาล)
  // ----------------------------------------------------
  for (const line of lines.slice(0, 5)) {
    if (/โรงพยาบาลสัตว์|คลินิก|สัตวแพทย์|animal hospital|vet clinic|vet hospital/i.test(line)) {
      result.clinicName = line.replace(/^(?:บัตรนัด|ใบเสร็จ|ใบเสร็จรับเงิน|receipt)\s*/i, '').replace(/[:\-#]/g, '').trim();
      result.detectedItems.push({
        type: 'clinic',
        label: 'สถานพยาบาล',
        value: result.clinicName
      });
      break;
    }
  }

  // ----------------------------------------------------
  // 6. 🐾 Pet Name (ชื่อสัตว์เลี้ยง)
  // ----------------------------------------------------
  for (const line of lines) {
    const petMatch = line.match(/(?:ชื่อสัตว์|Animal Name|ชื่อคนไข้|อสัตว[์่]|ลูกศ่า|คนไข้)\s*[:：]?\s*(?:[A-Za-z0-9\s\.\(\)]*?[Ff]\.|\([Ff]\.)?\s*([ก-๙a-zA-Z0-9]+)/);
    if (petMatch && petMatch[1]) {
      const candidate = petMatch[1].trim();
      if (candidate.length >= 2 && !['คุณ', 'นาย', 'นาง', 'โรงพยาบาล', 'สัตว์'].includes(candidate)) {
        result.petName = candidate;
        result.detectedItems.push({
          type: 'pet',
          label: 'ชื่อสัตว์เลี้ยง',
          value: candidate
        });
        break;
      }
    }
  }

  // ----------------------------------------------------
  // 7. 📝 Treatment / Diagnosis / Follow-up Notes
  // ----------------------------------------------------
  const treatmentKeywords = ['การรักษา', 'อาการ', 'วินิจฉัย', 'follow up', 'diagnosis', 'rx', 'treatment'];
  for (const line of lines) {
    const hasDiag = treatmentKeywords.some(kw => line.toLowerCase().includes(kw));
    if (hasDiag) {
      result.diagnosis = line;
      break;
    }
  }

  // Calculate confidence score (0 to 100)
  let score = 0;
  if (result.weight) score += 25;
  if (result.checkupDate) score += 30;
  if (result.vaccineDate || result.vaccineName) score += 25;
  if (result.fleaProduct || result.fleaDate) score += 20;
  if (result.clinicName) score += 10;
  if (result.petName) score += 15;
  result.confidenceScore = Math.min(100, score);

  return result;
}

/**
 * Pre-defined test sample clinic documents for quick demo & testing
 */
export const SAMPLE_VET_DOCUMENTS = [
  {
    id: 'sample-appointment',
    title: 'ใบนัดตรวจคลินิกสัตว์แพทย์',
    badge: 'ใบนัดหมาย',
    text: `โรงพยาบาลสัตว์ทองหล่อ
ใบนัดหมายตรวจสุขภาพและติดตามอาการ
ชื่อสัตว์เลี้ยง: ตังค์ทอน (แมว)
น้ำหนัก: 4.35 กก.
อาการ: สุขภาพแข็งแรงดี ขนสวยเงางาม
วันนัดครั้งต่อไป: 25 ธ.ค. 2569 (2026-12-25)
นัดตรวจ: ตรวจเลือดประจำปี และเช็คสุขภาพช่องปาก
โทร: 02-712-6300`
  },
  {
    id: 'sample-vaccine',
    title: 'สมุดบันทึกวัคซีนประจำปี',
    badge: 'สมุดวัคซีน',
    text: `คลินิกรักษาสัตว์หมอต้น
สมุดบันทึกการฉีดวัคซีนและยาป้องกันพยาธิ
ชื่อแมว: ไข่ต้ม (พันธุ์ไทย)
น้ำหนักตัว: 5.10 kg
วันที่ฉีด: 18/11/2026
รายการ: วัคซีนรวมแมว (FVRCP) + วัคซีนพิษสุนัขบ้า (Rabies)
ยาหยดกำจัดเห็บหมัด: Revolution Plus (หยดวันที่ 18/11/2026)
วันนัดครั้งถัดไป: 18 พ.ย. 2570 เพื่อฉีดกระตุ้นประจำปี`
  },
  {
    id: 'sample-treatment',
    title: 'ใบเสร็จค่ารักษาและค่ายา',
    badge: 'ใบเสร็จคลินิก',
    text: `กัลปพฤกษ์สัตวแพทย์ คลินิก
ใบแจ้งค่ารักษาพยาบาล
วันที่รับบริการ: 18 พฤศจิกายน 2569
คนไข้: ก๋วยเตี๋ยว
น.น. 4.60 กก.
การรักษา: ทำแผล ล้างหู และให้ยาปฏิชีวนะ
วันนัดตัดไหม / ติดตามอาการ: 25/11/2026`
  }
];
