<div align="center">

<img src="public/paw_icon.png" alt="MyPaw Logo" width="96" height="96" />

# 🐾 MyPaw

**สมุดบันทึกอายุขัย สุขภาพ และผังครอบครัวสัตว์เลี้ยง (Modern Pet Companion & Pedigree App)**  
ออกแบบด้วยแนวคิด **Self-Explanatory Zero-Noise UI** เรียบง่าย อบอุ่น และทำงานแบบ Offline-First 100%

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8_(Android)-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![FontAwesome](https://img.shields.io/badge/Icons-Font_Awesome_6-528DD7?logo=fontawesome&logoColor=white)](https://fontawesome.com/)

</div>

---

## ✨ จุดเด่นและเอกลักษณ์ (Key Features)

### 1. 🖼️ การ์ดสัดส่วน 1:1 & Zero-Noise UI
- **1:1 Square Hero Photo (`aspect-square`):** โชว์ภาพสัตว์เลี้ยงเต็มความกว้างของการ์ด พร้อมไล่เฉดสีด้านล่างและแสดงสัญลักษณ์เพศแบบมินิมอล (`♂` / `♀`)
- **Self-Explanatory Stats Bar:** แสดงอายุจริง (`ปี • เดือน • วัน`) คู่กับอายุเทียบคนตามเกณฑ์สัตวแพทย์สากล (`🪄 ~ปีคน`) หรือจำนวนวันแห่งความทรงจำ (`∞ วัน`) โดยไม่มีข้อความกำกับรกตา
- **Dual-Interaction:** แตะที่รูปเพื่อดูภาพขยายเต็มจอ หรือแตะแถบสถิติ / กดค้างที่การ์ด (Long Press) เพื่อเปิดดูโปรไฟล์ฉบับเต็ม

### 2. 🌳 ผังครอบครัวอัจฉริยะ (Interactive Pedigree & Kinship Engine)
- **Auto-Bidirectional Sync:** เมื่อเชื่อมสายสัมพันธ์จากตัวหนึ่ง (เช่น ตั้งให้ *ตังค์ทอน* เป็นลูกของ *ชายน้อย*) ระบบจะสร้างความสัมพันธ์ย้อนกลับให้อีกฝั่งโดยอัตโนมัติ
- **Multi-Generation Inference (`kinshipEngine.js`):** คำนวณลำดับเครือญาติหลายรุ่นอัตโนมัติตามเพศและวันเกิด:
  - **บรรพบุรุษ:** `พ่อ` / `แม่` ➔ `ปู่` / `ย่า` (สายพ่อ) และ `ตา` / `ยาย` (สายแม่) ➔ `ปู่ทวด` / `ย่าทวด` / `ตาทวด` / `ยายทวด`
  - **ทายาท:** `ลูกชาย` / `ลูกสาว` ➔ `หลานชาย` / `หลานสาว` ➔ `เหลนชาย` / `เหลนสาว`
  - **พี่น้องและคู่ครอง:** `แฟน` (จัดวางเคียงข้างกันในระดับรุ่นเดียวกัน), `ฝาแฝด` (เกิดวันเดียวกัน), `พี่ชาย` / `พี่สาว` / `น้องชาย` / `น้องสาว` (เทียบตามวันเกิด), และ `ลุง` / `ป้า` / `น้า` / `อา`
- **Interactive Circular Tree:** แสดงผังครอบครัวด้วยรูปวงกลมและชื่อฟอนต์ `Mitr` เชื่อมด้วยเส้นโครงสร้างตระกูล (Pedigree T-Bracket) สามารถแตะที่รูปน้องตัวใดก็ได้เพื่อสลับไปดูโปรไฟล์ของตัวนั้นทันที

### 3. 🌈 วิมานดาวแมว (Rainbow Bridge Memorial)
- **Heavenly Parallax Card:** การ์ดของน้องที่เดินทางสู่ดาวแมวจะมีพื้นหลังท้องฟ้าและก้อนเมฆเคลื่อนตัวแบบ Parallax
- **Interactive Memorial Candle:** จุดหรือดับเทียนระลึกถึง พร้อมส่งข้อความและจดหมายบันทึกความทรงจำถึงดาวแมว

### 4. 🩺 สมุดสุขภาพ & บันทึกอัตโนมัติ (Auto-Save Health Log)
- บันทึกประวัติการชั่งน้ำหนัก (`กก.`) พร้อมดูรายการย้อนหลัง
- ติดตามวันที่หยอดยาป้องกันเห็บหมัดและวันที่ฉีดวัคซีนประจำปี พร้อมคำนวณจำนวนวันที่ผ่านมาให้อัตโนมัติ
- **Instant Live Save:** ทุกการแก้ไขข้อมูลบันทึกเข้าเครื่องทันทีโดยไม่ต้องกดปุ่มเซฟ และระบบลบข้อมูลมี **2-Step Confirmation** ป้องกันการกดผิด

### 5. 🌍 รองรับระบบปฏิทิน สากล (ค.ศ.) & ไทย (พ.ศ.)
- สลับการแสดงผลวันที่ทั้งแอปได้ทันทีระหว่าง **ค.ศ.** (`30 Nov 2013`) และ **พ.ศ.** (`30 พ.ย. 2556`)

### 6. 📱 สถาปัตยกรรมเพื่อมือถือและการสัมผัส (Mobile-First Touch & Eye-Level Ergonomics)
- **3 ระดับการมองและการควบคุม (Mobile Visual & Thumb Hierarchy):**
  - **Glance Zone (ด้านบน):** สำหรับมองดูบริบท ไม่ใช่สำหรับเอื้อมกด — แสดงชื่อแอป จำนวนสมาชิกที่กำลังกรอง และสลับเมนูอย่างสะอาดตา
  - **Focus & Reading Zone (กึ่งกลางจอ):** จุดรวมสายตาธรรมชาติ — รูปภาพสัดส่วน 1:1 คมชัด พร้อมเอฟเฟกต์ **Scroll-in View Zoom** ที่ค่อยๆ ขยายรูปภาพ 105% อย่างนุ่มนวลเมื่อเลื่อนเข้าสู่กลางสายตา และแสดงอายุสไตล์ **Typography Design (`8y 6m 15d`)**
  - **Thumb Action Zone (ด้านล่าง):** โซนนิ้วโป้งธรรมชาติที่แตะได้ด้วยมือเดียว — แถบ **Floating Capsule Bar** ด้านล่างหน้าจอ รวมปุ่มสลับหมวดหมู่ (`All` / `With Us` / `Memorial`) และปุ่มหลักสำหรับเพิ่มสมาชิกใหม่ (**`+ Add Pet FAB`**) แตะได้ทันทีโดยไม่ต้องเอื้อมมือ
- **การใช้นิ้วสัมผัสระดับ Native (True Touch Interactions):**
  - **Native Bottom Sheets:** ปรับ Modal ทุกหน้าจอ (โปรไฟล์, เพิ่มข้อมูล, สมุดสุขภาพ, ผังครอบครัว, สำรองข้อมูล) ให้เป็นแผ่นชีทเลื่อนขึ้นจากด้านล่างของหน้าจอ พร้อมแถบจับ **Pull Handle Indicator** สำหรับสัมผัสปิดได้ง่าย
  - **Tactile Touch Feedback:** ทุกปุ่มและทุกการ์ดมีแอนิเมชันตอบสนองต่อนิ้วมือ (`active:scale-95` / `active:scale-[0.985]`) ให้ความรู้สึกแน่นเหมือนแอป Native และตัดปัญหา Delay การแตะบนเบราว์เซอร์มือถือ (`touch-manipulation`)
  - **Safe Area Insets:** รองรับขอบจอโค้ง ติ่งกล้อง (Notch / Dynamic Island) และแถบ Home Bar ของสมาร์ตโฟนยุคใหม่ด้วย `env(safe-area-inset-bottom)` เต็มรูปแบบ

---

## 🎨 ระบบการออกแบบ (Design System)

| หมวดหมู่ | รายละเอียด |
| :--- | :--- |
| **Display Font** | `Mitr` — ใช้สำหรับชื่อแอป ชื่อสัตว์เลี้ยง และหัวข้อหลัก ให้ความรู้สึกอบอุ่นเป็นมิตร |
| **UI & Numerals Font** | `Google Sans` (`tabular-nums`) — ใช้สำหรับตัวเลขอายุ วันที่ และปุ่มควบคุม อ่านง่ายชัดเจน |
| **Iconography** | `FontAwesome 6 Solid` — ใช้ไอคอนชุดเดียวกันทั้งแอป 100% |
| **Key Color** | **Warm Paw Orange (`#ff7a1a`)** คู่กับ **Emerald (`#10b981`)** สำหรับสถานะอยู่ด้วยกัน และ **Sky/Indigo** สำหรับดาวแมว |
| **Veterinary Standard** | คำนวณอายุเทียบคนและแบ่ง 6 ช่วงวัย (`วัยเบบี๋`, `วัยซน`, `วัยหนุ่มสาว`, `วัยผู้ใหญ่`, `วัยอาวุโส`, `วัยทวด`) ตามเกณฑ์ AAFP/AAHA |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
mypetsage-modern/
├── android/                        # Capacitor Android Native Project (com.tonwu.pawage)
├── public/
│   ├── avatars/                    # รูปภาพเริ่มต้นของน้องแมวทั้ง 7 ตัว
│   ├── fonts/                      # ฟอนต์ฝังในแอป (Mitr & Google Sans) แบบ Offline 100%
│   └── paw_icon.png                # ไอคอนแอป Transparent Alpha Channel
├── src/
│   ├── components/
│   │   ├── PetCard.jsx             # การ์ดสัตว์เลี้ยงสัดส่วน 1:1 + แถบสถิติ
│   │   ├── PetDetailModal.jsx      # โปรไฟล์รายละเอียด + การ์ดเครือญาติ Interactive
│   │   ├── FamilyTreeModal.jsx     # ผังครอบครัววงกลม + เส้นเชื่อม Pedigree T-Bracket
│   │   ├── PetModal.jsx            # ฟอร์มเพิ่ม/แก้ไขข้อมูลแบบ Auto-Save + ลบ 2 ขั้นตอน
│   │   ├── HealthLogModal.jsx      # สมุดบันทึกน้ำหนัก วัคซีน และยาหยอดเห็บหมัด
│   │   ├── MemorialModal.jsx       # วิมานดาวแมว เทียนระลึกถึง และจดหมายถึงดาวแมว
│   │   ├── HamburgerDrawer.jsx     # เมนูค้นหา กรองสถานะ เรียงลำดับ และสลับ ค.ศ./พ.ศ.
│   │   ├── BackupModal.jsx         # ส่งออก/นำเข้าไฟล์สำรองข้อมูล (.json)
│   │   ├── ImageViewerModal.jsx    # ดูรูปภาพเต็มจอและดาวน์โหลด
│   │   └── SplashScreen.jsx        # หน้าโหลดแอนิเมชันอุ้งเท้าตอนเปิดแอป
│   ├── kinshipEngine.js            # ระบบคำนวณสายสัมพันธ์และลำดับเครือญาติหลายรุ่นอัตโนมัติ
│   ├── utils.js                    # คำนวณอายุ ช่วงวัย และแปลงวันที่ ค.ศ./พ.ศ. (Local Timezone Safe)
│   ├── defaultPets.js              # ข้อมูลตั้งต้นของครอบครัวแมว 7 ตัว
│   ├── App.jsx                     # โครงสร้างหลักและ State Management
│   └── index.css                   # ตั้งค่า @font-face และ Keyframe Animations
└── package.json
```

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. รันบนโหมดพัฒนา (Web Development)
```bash
npm install
npm run dev
```

### 2. บิลด์และซิงก์ลง Android (Capacitor APK)
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```
ไฟล์ APK ที่ได้จะอยู่ที่ `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🐱 สมาชิกครอบครัวเริ่มต้น (Default Family)

1. **ชายน้อย** (`♂` บรรพบุรุษรุ่นที่ 1 • ดาวแมว 🌈)
2. **ตังค์ทอน** (`♀` ลูกสาวของชายน้อย • แฟนของไข่ต้ม) ❤️ **ไข่ต้ม** (`♂` แฟนของตังค์ทอน)
3. **รุ่นลูกทั้ง 4 ตัว:**
   - **พวยพวย** (`♀` ฝาแฝดกับทัศนัยภูวดล)
   - **ทัศนัยภูวดล** (`♂` ฝาแฝดกับพวยพวย)
   - **ทองจิ๋ว** (`♀` น้องสาว)
   - **ก๋วยเตี๋ยว** (`♂` น้องชายคนเล็กสุด)

---

## 🗺️ แผนพัฒนาในอนาคต (Roadmap)

- [ ] **🔔 ระบบแจ้งเตือนสำหรับ Event ต่างๆ (Notification System):**
  - [ ] **Event Engine:** ตรวจจับวันเกิด (🎂), หยดยาเห็บหมัดรอบ 30 วัน (💊), วัคซีนประจำปีรอบ 365 วัน (💉), นัดตรวจสุขภาพ (🩺), และวันครบรอบดาวแมว (🌈)
  - [ ] **In-App Notification Center:** แถบกระดิ่งแจ้งเตือนบน Header พร้อมปุ่ม Quick Actions เช่น "หยดยาวันนี้แล้ว"
  - [ ] **Native & Web Notifications:** แจ้งเตือนผ่าน Web Notifications API บนบราวเซอร์ และ Capacitor Local Notifications บน Android
  - [ ] **Notification Preferences:** แผงสวิตช์เปิด/ปิดแจ้งเตือนแยกตามหมวดหมู่และเลือกเวลาแจ้งเตือนประจำวัน
- [ ] **📷 ระบบสแกนใบนัดและใบเสร็จคลินิกสัตว์แพทย์ด้วย OpenThai 2.0 OCR:**
  - [ ] **เปิดกล้อง/เลือกรูป:** สแกนใบนัด คลินิกสัตว์แพทย์ ใบเสร็จ และสมุดวัคซีนจากกล้องมือถือหรืออัปโหลดรูปภาพ
  - [ ] **NLP & Vet Document Parsing (`vetDocumentParser.js`):** ดึงข้อมูลวัคซีน (ชนิด/วันที่ฉีด), วันนัดตรวจครั้งถัดไป, วันหยดยาเห็บหมัด, น้ำหนักตัว, และบันทึกการรักษา/Follow up อาการป่วย
  - [ ] **Auto-Fill & Review Modal:** แสดงหน้าต่างตรวจสอบข้อมูลที่อ่านได้ แตะบันทึกเข้าสมุดสุขภาพของน้องแมวได้ทันทีแบบ One-Tap
