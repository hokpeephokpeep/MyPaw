import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export const translations = {
  th: {
    // App & Header
    app_name: 'MyPaw',
    menu: 'เมนู',
    quick_notifications: 'การแจ้งเตือนด่วน',
    scan_ocr: 'สแกนเอกสาร',
    home: 'หน้าหลัก',
    notifications: 'แจ้งเตือน',
    scroll_top_hint: 'แตะเพื่อเลื่อนขึ้นบนสุด',
    
    // Quick Stats & Badges
    stats_total: 'ทั้งหมด',
    stats_alive: 'อยู่ด้วยกัน',
    stats_deceased: 'ดาวแมว',
    
    // Drawer
    add_pet: 'เพิ่มสัตว์เลี้ยง',
    add_pet_sub: 'Add Pet',
    family_tree: 'สาแหรกครอบครัว',
    scan_document: 'สแกนเอกสาร',
    import_photos: 'นำเข้ารูปภาพ',
    notifications_center: 'การแจ้งเตือน',
    display_section: 'การแสดงผล (Display)',
    all: 'ทั้งหมด',
    with_us: 'อยู่ด้วยกัน',
    memorial: 'ดาวแมว',
    sort_oldest: 'อายุมากสุด',
    sort_youngest: 'อายุน้อยสุด',
    sort_bday: 'ใกล้วันเกิด',
    view_1col: '1 คอลัมน์ (รูปใหญ่)',
    view_2col: '2 คอลัมน์ (กริด)',
    view_list: 'มุมมองลิสต์',
    preferences_section: 'การตั้งค่า (Preferences)',
    language_label: 'ภาษา (Language)',
    lang_th: 'ไทย (TH)',
    lang_en: 'English (EN)',
    date_format_label: 'รูปแบบวันที่ (Date Format)',
    date_format_en: 'สากล (En)',
    date_format_th: 'ไทย (Th)',
    backup_restore: 'สำรองและกู้คืนข้อมูล (Backup)',
    all_rights_reserved: 'สงวนลิขสิทธิ์ทั้งหมด',
    
    // Pet Card & List Item
    years_unit: 'y',
    months_unit: 'm',
    days_unit: 'd',
    human_yrs: 'human yrs',
    rainbow_bridge: 'Rainbow Bridge',
    lifespan_label: 'อายุขัย',
    from_us_since: 'จากเราไปสู่ดาวแมวแล้วนานแค่ไหน',
    days_left: 'อีก {n} วัน',
    tomorrow: 'พรุ่งนี้',
    today: 'วันนี้!',
    birthday_today: 'วันเกิดวันนี้',
    birthday_soon: 'วันเกิดอีก {n} วัน',
    birthday_tomorrow: 'วันเกิดพรุ่งนี้',
    checkup_today: 'นัดตรวจสุขภาพวันนี้',
    checkup_soon: 'นัดตรวจอีก {n} วัน',
    checkup_tomorrow: 'นัดตรวจพรุ่งนี้',
    vaccine_overdue: 'ถึงกำหนดวัคซีน',
    vaccine_soon: 'วัคซีนอีก {n} วัน',
    vaccine_tomorrow: 'วัคซีนพรุ่งนี้',
    flea_today: 'ถึงกำหนดหยดยาเห็บหมัด',
    flea_soon: 'หยดยาอีก {n} วัน',
    female: 'เพศเมีย',
    male: 'เพศผู้',
    neutered: 'ทำหมัน',
    unneutered: 'ยังไม่ทำหมัน',
    view_details: 'ดูรายละเอียดของ {name}',
    
    // Empty state
    empty_pets_title: 'ยังไม่มีข้อมูลน้องเหมียว',
    empty_pets_desc: 'เริ่มต้นบันทึกวันเกิด ความทรงจำ และช่วงเวลาดีๆ ของเจ้าตัวโปรดกันเถอะ',
    empty_add_btn: 'เพิ่มน้องแมวตัวแรก',
    
    // Notifications Screen & Modal
    notification_center_title: 'ศูนย์แจ้งเตือน',
    notif_tab_all: 'ทั้งหมด',
    notif_tab_overdue: 'ตกค้าง',
    notif_tab_appointment: 'นัดหมาย',
    notif_tab_anniversary: 'วันครบรอบ',
    mark_all_read: 'อ่านทั้งหมดแล้ว',
    no_notifications: 'ไม่มีการแจ้งเตือนใหม่',
    all_caught_up: 'ทุกอย่างเรียบร้อยดี น้องแมวได้รับการดูแลครบถ้วน!',
    settings_panel_title: 'หมวดหมู่ที่เปิดแจ้งเตือน:',
    settings_panel_done: 'เรียบร้อย',
    close_settings: 'ปิดแผงตั้งค่า',
    cat_birthday: 'วันเกิด',
    cat_flea: 'หยดยาเห็บหมัด',
    cat_vaccine: 'วัคซีนประจำปี',
    cat_checkup: 'นัดสัตวแพทย์',
    cat_memorial: 'วันครบรอบดาวแมว',
    quick_flea_done: 'หยดยาเรียบร้อยวันนี้',
    quick_vaccine_done: 'ฉีดวัคซีนเรียบร้อยวันนี้',
    view_memorial_action: 'ดูบันทึกดาวแมว',
    view_health_action: 'ดูสมุดสุขภาพ',
    browser_notifications: 'การแจ้งเตือนบนเบราว์เซอร์:',
    notification_enabled: 'เปิดใช้งานแล้ว',
    notification_unsupported: 'ไม่รองรับในสภาพแวดล้อมนี้',
    notification_request: 'อนุญาตการแจ้งเตือน',
    
    // Pet Detail
    health_log_tile: 'สมุดสุขภาพ',
    health_log_sub: 'น้ำหนัก • วัคซีน',
    family_tree_tile: 'สาแหรกครอบครัว',
    relatives_count: 'เครือญาติ {n} ตัว',
    memorial_tile: 'ดาวแมว',
    memorial_sub: 'จุดเทียน • จดหมายถึงน้อง',
    tap_full_image: 'แตะเพื่อดูรูปขนาดเต็ม หรือปัดซ้ายขวาเพื่อเปลี่ยนรูป',
    
    // Common Actions
    close: 'ปิด',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    edit: 'แก้ไข',
    delete: 'ลบ',
    notes: 'บันทึกเพิ่มเติม'
  },
  en: {
    // App & Header
    app_name: 'MyPaw',
    menu: 'Menu',
    quick_notifications: 'Quick Notifications',
    scan_ocr: 'Scan Doc',
    home: 'Home',
    notifications: 'Alerts',
    scroll_top_hint: 'Tap to scroll to top',
    
    // Quick Stats & Badges
    stats_total: 'Total',
    stats_alive: 'With Us',
    stats_deceased: 'Memorial',
    
    // Drawer
    add_pet: 'Add Pet',
    add_pet_sub: 'Add New',
    family_tree: 'Family Tree',
    scan_document: 'Scan Document',
    import_photos: 'Import Photos',
    notifications_center: 'Notifications',
    display_section: 'Display & Filter',
    all: 'All',
    with_us: 'With Us',
    memorial: 'Memorial',
    sort_oldest: 'Oldest First',
    sort_youngest: 'Youngest First',
    sort_bday: 'Upcoming Birthday',
    view_1col: '1 Column (Hero)',
    view_2col: '2 Columns (Grid)',
    view_list: 'List View',
    preferences_section: 'Preferences',
    language_label: 'Language',
    lang_th: 'ไทย (TH)',
    lang_en: 'English (EN)',
    date_format_label: 'Date Format',
    date_format_en: 'Default (En)',
    date_format_th: 'Thai (Th)',
    backup_restore: 'Backup & Restore',
    all_rights_reserved: 'All rights reserved',
    
    // Pet Card & List Item
    years_unit: 'y',
    months_unit: 'm',
    days_unit: 'd',
    human_yrs: 'human yrs',
    rainbow_bridge: 'Rainbow Bridge',
    lifespan_label: 'Lifespan',
    from_us_since: 'Time since passing',
    days_left: '{n}d left',
    tomorrow: 'Tomorrow',
    today: 'Today!',
    birthday_today: 'Birthday Today',
    birthday_soon: 'Birthday in {n}d',
    birthday_tomorrow: 'Birthday Tomorrow',
    checkup_today: 'Vet Checkup Today',
    checkup_soon: 'Checkup in {n}d',
    checkup_tomorrow: 'Checkup Tomorrow',
    vaccine_overdue: 'Vaccine Due',
    vaccine_soon: 'Vaccine in {n}d',
    vaccine_tomorrow: 'Vaccine Tomorrow',
    flea_today: 'Flea Treatment Due',
    flea_soon: 'Flea drop in {n}d',
    female: 'Female',
    male: 'Male',
    neutered: 'Neutered',
    unneutered: 'Intact',
    view_details: 'View details for {name}',
    
    // Empty state
    empty_pets_title: 'No Cats Added Yet',
    empty_pets_desc: 'Start recording birthdays, memories, and care milestones for your beloved pets.',
    empty_add_btn: 'Add Your First Cat',
    
    // Notifications Screen & Modal
    notification_center_title: 'Notification Center',
    notif_tab_all: 'All',
    notif_tab_overdue: 'Overdue',
    notif_tab_appointment: 'Appointments',
    notif_tab_anniversary: 'Anniversaries',
    mark_all_read: 'Mark All Read',
    no_notifications: 'No new notifications',
    all_caught_up: 'Everything is up to date. Your pets are well taken care of!',
    settings_panel_title: 'Notification Categories:',
    settings_panel_done: 'Done',
    close_settings: 'Close Settings',
    cat_birthday: 'Birthday',
    cat_flea: 'Flea & Tick',
    cat_vaccine: 'Annual Vaccine',
    cat_checkup: 'Vet Appointment',
    cat_memorial: 'Memorial Anniversary',
    quick_flea_done: 'Treated Today',
    quick_vaccine_done: 'Vaccinated Today',
    view_memorial_action: 'View Memorial',
    view_health_action: 'View Health Log',
    browser_notifications: 'Browser Notifications:',
    notification_enabled: 'Enabled',
    notification_unsupported: 'Unsupported in this environment',
    notification_request: 'Enable Notifications',
    
    // Pet Detail
    health_log_tile: 'Health Log',
    health_log_sub: 'Weight • Vaccine',
    family_tree_tile: 'Family Tree',
    relatives_count: '{n} relatives',
    memorial_tile: 'Memorial',
    memorial_sub: 'Candle • Letters',
    tap_full_image: 'Tap to view full size, or swipe left/right to change photo',
    
    // Common Actions
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    notes: 'Notes'
  }
};

const LanguageContext = createContext({
  language: 'th',
  setLanguage: () => {},
  t: (key) => key
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('mypaw_language');
      if (saved === 'en' || saved === 'th') return saved;
      // Detect browser language
      if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en')) {
        return 'en';
      }
      return 'th';
    } catch (e) {
      return 'th';
    }
  });

  const setLanguage = useCallback((lang) => {
    const validLang = lang === 'en' ? 'en' : 'th';
    setLanguageState(validLang);
    try {
      localStorage.setItem('mypaw_language', validLang);
      document.documentElement.lang = validLang;
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch (e) {}
  }, [language]);

  const t = useCallback((key, params) => {
    const dict = translations[language] || translations.th;
    let text = dict[key] || translations.th[key] || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(pKey => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), params[pKey]);
      });
    }
    return text;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
