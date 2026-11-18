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
├── imageUtils.js               # ระบบประมวลผลภาพ: ย่อ Long Edge ไม่เกิน 2048px, สร้าง High-DPI Square 960px
├── notificationEngine.js       # ระบบประมวลผลการแจ้งเตือน วันเกิด, วัคซีน 365 วัน, เห็บหมัด 30 วัน, นัดหมอ, ดาวแมว
├── vetDocumentParser.js        # เอนจินวิเคราะห์ข้อมูลใบนัด สมุดวัคซีน และใบเสร็จคลินิกสัตว์แพทย์ (OCR / NLP)
├── useSheetDrag.js             # ระบบจัดการ Gesture ลากปิด Bottom Sheet และ Directional Exit Animation
├── index.css                   # Custom Animations, Keyframes, Font-face, และ Photo Cross-Fade Rules
└── components/
    ├── PetCard.jsx             # การ์ดสัตว์เลี้ยง 1 คอลัมน์ / 2 คอลัมน์, Slideshow รูป 1:1, สรุปอายุ (🌈 6y+)
    ├── PetModal.jsx            # หน้าฟอร์มเพิ่ม/แก้ไขข้อมูลสัตว์เลี้ยง, สมุดวัคซีน, หยอดยา, น้ำหนัก
    ├── PetDetailModal.jsx      # หน้าต่างแสดงรายละเอียดโปรไฟล์, ประวัติ, คลังรูป, ผังครอบครัว
    ├── FamilyTreeModal.jsx     # แสดงแผนผังสาแหรกครอบครัวแบบ Interactive Hierarchy
    ├── ImageCropModal.jsx      # โมดัลเลือกจุดโฟกัส 1:1 (Center Focus) แบบมินิมอล ไม่ตัดทอนรูปจริง
    ├── ImageViewerModal.jsx    # ตัวดูรูปขยายเต็มหน้าจอแบบเลื่อนแนวตั้ง (Vertical Swipe 1:1)
    ├── MemorialModal.jsx       # หน้าระลึกถึงดาวแมว (จุดเทียน, จดหมายความทรงจำ)
    ├── NotificationModal.jsx   # ศูนย์แจ้งเตือนในแอป (In-App Notification Center) พร้อม Quick Actions
    ├── DocumentScannerModal.jsx# ระบบสแกนเอกสารคลินิกสัตว์แพทย์ด้วย OCR และบันทึกอัตโนมัติ
    └── SharedPhotosModal.jsx   # ระบบแชร์และนำเข้ารูปภาพจากภายนอกทั้งเดี่ยวและเป็นกลุ่ม (Batch)
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
   - โฟกัสสำหรับแสดงบนการ์ดถูกสร้างเป็น **High-DPI Square 960px (คุณภาพ 0.92)** คมชัดบนจอ Retina/Mobile
   - ภาพต้นฉบับความละเอียดสูงยังคงเปิดดูได้เต็มจอผ่าน ImageViewerModal
4. **Zero-Noise UI & Motion Refinement (Emil Kowalski Design Engineering):**
   - เอาปุ่มและข้อความอธิบายส่วนเกินออกจากหน้าต่างเพิ่มรูปและแก้ไขโปรไฟล์ทั้งหมด เน้นใช้งานง่ายและเข้าใจได้ด้วยตัวเอง (Self-explanatory)
   - ปรับปรุง Motion ทั้งระบบ: ป้องกัน Mobile Sticky Hover ด้วย `@media (hover: hover) and (pointer: fine)`, ลดเวลา Floating Nav Bar เหลือ 280ms (`--ease-drawer`), ทุกปุ่มมี `:active` scale (0.97–0.98), และแยกการ animate ไปยัง GPU compositor
5. **ระบบแชร์และนำเข้ารูปภาพจากภายนอกทั้งรูปเดียวและ Batch (`src/components/SharedPhotosModal.jsx`):**
   - รองรับ Android Native Share Intent (`ACTION_SEND` & `ACTION_SEND_MULTIPLE`) จาก Gallery ส่งตรงเข้าแอป
   - รองรับ Local Drag & Drop และปุ่มนำเข้ารูปภาพผ่านเมนู Drawer
   - มีหน้าต่างเลือกปลายทางอัจฉริยะ: เลือกระหว่าง **"สร้างน้องแมวใหม่ (New Pet)"** หรือ **"เพิ่มให้น้องแมวที่มีอยู่แล้ว (Existing Pet)"** พร้อมอัปเดตและแสดงพลุฉลองทันที

---

## 📋 แผนพัฒนาระบบแจ้งเตือนสำหรับ Event ต่างๆ (Notification System Roadmap)

ระบบแจ้งเตือนได้รับการบรรจุลงในแผนงานพัฒนาหลัก โดยแบ่งโครงสร้างและการทำงานออกเป็น 3 ส่วน:

### 1. รายการ Event ที่รองรับ (Event Catalog)
- 🎂 **วันเกิด (Birthday):** แจ้งเตือนล่วงหน้า 7 วัน, 3 วัน, 1 วัน และในวันเกิด พร้อมคำนวณอายุขวบปีใหม่
- 💊 **หยดยาป้องกันเห็บหมัด (Flea & Tick):** แจ้งเตือนรอบ 30 วันนับจากวันที่หยอดล่าสุด และแจ้งเตือนเมื่อเกินกำหนด (Overdue)
- 💉 **วัคซีนประจำปี (Annual Vaccine):** แจ้งเตือนล่วงหน้า 30 วันก่อนครบ 365 วัน และเมื่อถึงกำหนดฉีดเข็มกระตุ้น
- 🩺 **นัดพบสัตวแพทย์ / ตรวจสุขภาพ (Vet Health Checkup):** แจ้งเตือนล่วงหน้า 7 วัน, 1 วัน และในวันนัดหมาย
- 🌈 **วันครบรอบดาวแมว (Memorial Anniversaries):** แจ้งเตือนในวันครบรอบ 100 วัน และครบรอบปีแห่งความทรงจำ

### 2. โมดูลและสถาปัตยกรรม (Architecture)
- **`src/notificationEngine.js`:** คำนวณและประมวลผลวันสำคัญของน้องแมวทุกคน คัดกรองระดับความเร่งด่วน (`urgent_today`, `upcoming_soon`, `memorial`)
- **`src/components/NotificationModal.jsx`:** ศูนย์แจ้งเตือนในแอป (In-App Notification Center) ออกแบบด้วย `useSheetDrag`:
  - ไอคอนกระดิ่ง 🔔 พร้อมตัวเลข Badge สีส้มบน Header
  - Quick Actions อัจฉริยะ (เช่น กดปุ่ม "หยดยาวันนี้แล้ว" ➔ อัปเดต `fleaDate` ให้ทันที)
- **System Push & Native Notifications:**
  - บน Browser / Local: เชื่อมต่อ Web Notifications API พร้อมปุ่มขอสิทธิ์ (Permission Request)
  - บน Android: เชื่อมต่อ `@capacitor/local-notifications` เพื่อตั้งเวลาแจ้งเตือนล่วงหน้าแม้ผู้ใช้ปิดแอป

### 3. การตั้งค่าการแจ้งเตือน (Preferences)
- สวิตช์เปิด/ปิดแยกหมวดหมู่อิสระ (วันเกิด / หยดยา / วัคซีน / นัดหมอ / ดาวแมว)
- เลือกช่วงเวลาแจ้งเตือนประจำวัน (เช่น 09:00 น.)

---

## 📷 แผนพัฒนาระบบสแกนเอกสารคลินิกสัตว์แพทย์ด้วย OpenThai 2.0 OCR

### 1. วัตถุประสงค์
อำนวยความสะดวกให้ผู้ใช้งานสามารถเปิดกล้องถ่ายรูปหรือเลือกรูปภาพใบนัด ใบเสร็จ และสมุดวัคซีนจากคลินิกหรือโรงพยาบาลสัตว์ เพื่อแปลงข้อมูลเข้าสู่สมุดสุขภาพของน้องแมวโดยอัตโนมัติ ไม่ต้องพิมพ์เอง

### 2. โครงสร้างและการวิเคราะห์ข้อมูล (`vetDocumentParser.js`)
- **การตรวจจับข้อมูลวัคซีน:** ดึงชื่อวัคซีน (Rabies, หวัดแมว, FVRCP, ลิวคิเมีย FeLV, วัคซีนรวม) และวันที่รับการฉีด
- **การตรวจจับวันนัดตรวจครั้งถัดไป:** ค้นหาคำสำคัญ เช่น "วันนัดครั้งต่อไป", "นัดฉีดวัคซีน", "นัดตัดไหม", "นัดดูอาการ" เพื่อนำไปตั้งเตือนในระบบแจ้งเตือน 🔔
- **การบันทึกการรักษาและ Follow-up อาการ:** ดึงประวัติอาการป่วย, การทำแผล, ยาที่ได้รับกลับบ้าน, และชื่อสถานพยาบาล
- **น้ำหนักตัว:** สกัดค่าน้ำหนัก (`กก.` / `kg`) เพื่ออัปเดตลงกราฟน้ำหนัก

### 3. ส่วนต่อประสานผู้ใช้ (`DocumentScannerModal.jsx`)
- เปิดกล้องถ่ายภาพบนมือถือทันทีด้วย `capture="environment"` หรือลากไฟล์ภาพมาวางในโหมดเว็บ
- หน้าต่างแสดงภาพตัวอย่างพร้อมกรอบข้อมูลที่ตรวจจับได้ ให้ผู้ใช้ตรวจสอบและแก้ไขได้ก่อนกดยืนยัน
- บันทึกตรงเข้าสู่น้องแมวที่เลือกแบบ One-Tap Update

---

## 📲 การทดสอบและ Build สำหรับ Android

1. ตรวจสอบว่ามี Android Studio พร้อม Android SDK ติดตั้งบนเครื่อง
2. ตรวจสอบ Android Manifest และ Config:
   - รหัสแอป: `com.tonwu.pawage`
   - โฟลเดอร์โปรเจกต์ Android: `android/`
3. คำสั่งสร้าง Release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   ไฟล์ APK จะอยู่ที่ `android/app/build/outputs/apk/release/`
