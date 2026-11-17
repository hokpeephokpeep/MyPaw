# 🛠️ คู่มือนักพัฒนาและการทำงานต่อบนเครื่องอื่น (MyPaw Development Guide)

เอกสารนี้รวบรวมข้อมูลทางเทคนิค โครงสร้างโปรเจกต์ สถาปัตยกรรม คำสั่งพัฒนา และ**รายการไฟล์/โฟลเดอร์ที่อยู่ใน `.gitignore`** เพื่อให้นักพัฒนาสามารถ Clone ไปเปิดและพัฒนาต่อบนเครื่องอื่นได้ทันทีอย่างไร้รอยต่อ

---

## 🚀 สรุปคำสั่งเริ่มพัฒนา (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development (Web)
```bash
npm run dev
```
แอปจะทำงานที่ `http://localhost:5173/`

### 3. Build Web Production & Sync เข้า Android
```bash
npm run build
npx cap sync android
```

### 4. เปิดโปรเจกต์ Android ใน Android Studio
```bash
npx cap open android
```
หรือรันบนอุปกรณ์/Emulator โดยตรง:
```bash
npx cap run android
```

---

## 📁 สิ่งที่อยู่ใน `.gitignore` และการจัดการเมื่อย้ายเครื่อง

ในไฟล์ [`.gitignore`](file:///g:/GitHub/MyPaw/.gitignore) มีการยกเว้นไฟล์และโฟลเดอร์เหล่านี้ไว้ เพื่อความปลอดภัยและไม่ให้ Repository มีขนาดใหญ่เกินไป:

| โฟลเดอร์ / ไฟล์ใน `.gitignore` | หน้าที่ / คำอธิบาย | วิธีจัดการเมื่อนำไปรันบนเครื่องใหม่ |
| :--- | :--- | :--- |
| `node_modules/` | ไลบรารี JavaScript/TypeScript ทั้งหมด | รัน `npm install` บนเครื่องใหม่ |
| `dist/`, `dist-ssr/` | ไฟล์ผลลัพธ์จากการ Build Web Bundle | รัน `npm run build` ระบบจะสร้างขึ้นใหม่อัตโนมัติ |
| `android/app/src/main/assets/public/` | เว็บบันเดิลที่ Sync เข้าไปในแอป Android | รัน `npx cap sync android` หรือ `npm run build && npx cap sync android` |
| `android/app/src/main/res/xml/config.xml` | การตั้งค่า Cordova/Capacitor ใน Android | สร้างอัตโนมัติเมื่อสั่ง `npx cap sync android` |
| `android/capacitor-cordova-android-plugins/` | ปลั๊กอินเสริมของ Capacitor | สร้างอัตโนมัติเมื่อสั่ง `npx cap sync android` |
| `.agents/skills/` | เอกสารคู่มือทักษะของ Agent/AI (50+ ทักษะ เช่น Compose, Animation, Car App ฯลฯ) | ติดตั้งตามความต้องการผ่านระบบ Agent / หรือติดตั้งผ่าน CLI |
| `_Temp/` | โฟลเดอร์พักภาพดิบและภาพ SVG สำรอง (ไฟล์ไอคอนต้นฉบับ/ภาพแมวความละเอียดสูง) | เก็บไว้เป็น Local Archive บนเครื่องเดิม |
| `For Icon/` | วัตถุดิบกราฟิกสำหรับการทำไอคอนแอป | สำหรับงานออกแบบไอคอน |
| `.env`, `.env.local`, `*.local` | ค่า Environment Variable เฉพาะเครื่อง | โปรเจกต์นี้ทำงานแบบ Client-Only Offline-First ยังไม่มีคีย์ลับภายนอก หากมีในอนาคตให้สร้างตามตัวอย่าง `.env.example` |
| `.cache/`, `.vite/`, `*.tsbuildinfo` | แคชความเร็วของคอมไพเลอร์และ Vite | สร้างใหม่ให้อัตโนมัติเมื่อรัน `npm run dev` |
| `.vscode/*`, `.idea/`, `.DS_Store`, `Thumbs.db` | ไฟล์การตั้งค่า Editor & OS | เครื่องใหม่จะใช้การตั้งค่าของ Editor เครื่องนั้นๆ |

---

## 🏗️ โครงสร้างสถาปัตยกรรมและเทคโนโลยี (Tech Stack)

### Core Technologies
- **UI Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS 3.4 + Custom Animation Transitions
- **Icons:** FontAwesome 6 Free Solid (`@fortawesome/free-solid-svg-icons`)
- **Native Wrapper:** Capacitor 8 (Android Platform)
- **Local Assets & Fonts:**
  - `Mitr` (`Regular`, `Medium`, `SemiBold`, `Bold`) สำหรับชื่อสัตว์เลี้ยงและหัวข้อ
  - `Google Sans` สำหรับตัวเลขอายุ สถิติ และ UI Body

### โมดูลสำคัญในโค้ด (`src/`)

```
src/
├── App.jsx                     # Component หลัก จัดการ Navigation, Modals, State กรองและจัดเรียง
├── defaultPets.js              # ข้อมูลสัตว์เลี้ยงเริ่มต้น 7 ตัว (Mock / Fallback) พร้อมรูปและความสัมพันธ์
├── kinshipEngine.js            # อัลกอริทึมวิเคราะห์เครือญาติ 4 รุ่น (ปู่ย่าตายาย -> พ่อแม่ -> ลูกหลานเหลน)
├── utils.js                    # ฟังก์ชันคำนวณอายุ, เทียบปีคน, ระยะเวลาหลังเสียชีวิต, วันเกิด, สเตตัส
├── imageUtils.js               # ระบบประมวลผลภาพ: ย่อ Long Edge ไม่เกิน 2048px, สร้าง Thumbnail 360px
├── index.css                   # Custom Animations, Keyframes, Font-face, และ Photo Cross-Fade Rules
└── components/
    ├── PetCard.jsx             # การ์ดสัตว์เลี้ยง 1 คอลัมน์ / 2 คอลัมน์, Slideshow รูป 1:1, สรุปอายุ (🌈 6y+)
    ├── PetModal.jsx            # หน้าฟอร์มเพิ่ม/แก้ไขข้อมูลสัตว์เลี้ยง, สมุดวัคซีน, หยอดยา, น้ำหนัก
    ├── PetDetailModal.jsx      # หน้าต่างแสดงรายละเอียดโปรไฟล์, ประวัติ, คลังรูป, ผังครอบครัว
    ├── FamilyTreeModal.jsx     # แสดงแผนผังสาแหรกครอบครัวแบบ Interactive Hierarchy
    ├── ImageCropModal.jsx      # โมดัลเลือกจุดโฟกัส 1:1 (Center Focus) แบบมินิมอล ไม่ตัดทอนรูปจริง
    ├── ImageViewerModal.jsx    # ตัวดูรูปขยายเต็มหน้าจอ
    ├── MemorialModal.jsx       # หน้าระลึกถึงดาวแมว (จุดเทียน, จดหมายความทรงจำ)
    └── WeightChartModal.jsx    # กราฟบันทึกประวัติน้ำหนัก
```

---

## 🎨 รายละเอียดฟีเจอร์สำคัญที่เพิ่งอัปเดตล่าสุด

1. **ระบบแสดงอายุสัตว์เลี้ยงที่จากไปในโหมด 2 คอลัมน์:**
   - แสดงเป็น **`🌈 6y+`** (หรือ `<time>+` ตามจำนวนปีที่จากไป)
   - แคปซูลจัดวางพอดีขอบเขต (~54px) ไม่ล้นกล่องและไม่ขึ้นบรรทัดใหม่
2. **ระบบภาพสไลด์และ Cross-Fade Transition (`src/index.css` & `src/components/PetCard.jsx`):**
   - **แมวที่จากไป:** ภาพจะค่อยๆ จางสลับหากันอย่างนุ่มนวลและสงบด้วยเวลา **2.5 วินาที** (`.pet-photo-deceased`) พร้อมช่วงเวลาสลับภาพ 8–12 วินาที
   - **แมวที่มีชีวิต:** เปลี่ยนภาพลื่นไหลรวดเร็ว **0.7 วินาที** (`.pet-photo-alive`)
3. **ระบบจัดการรูปภาพป้องกันแอปบวม (`src/imageUtils.js`):**
   - รูปเต็มถูกควบคุม Maximum Long Edge ไว้ที่ **2048px** โดยอัตโนมัติ
   - โฟกัสสำหรับแสดงบนการ์ดถูกสร้างเป็น **Square Thumbnail 360px**
   - ภาพต้นฉบับความละเอียดสูงยังคงเปิดดูได้เต็มจอผ่าน ImageViewerModal
4. **Zero-Noise UI:**
   - เอาปุ่มและข้อความอธิบายส่วนเกินออกจากหน้าต่างเพิ่มรูปและแก้ไขโปรไฟล์ทั้งหมด เน้นใช้งานง่ายและเข้าใจได้ด้วยตัวเอง (Self-explanatory)

---

## 📲 การทดสอบและ Build สำหรับ Android

1. ตรวจสอบว่ามี Android Studio พร้อม Android SDK ติดตั้งบนเครื่อง
2. ตรวจสอบ Android Manifest และ Config:
   - รหัสแอป: `com.mypaw.app`
   - โฟลเดอร์โปรเจกต์ Android: `android/`
3. คำสั่งสร้าง Release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   ไฟล์ APK จะอยู่ที่ `android/app/build/outputs/apk/release/`
