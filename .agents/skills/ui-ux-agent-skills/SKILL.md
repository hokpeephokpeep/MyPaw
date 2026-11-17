---
name: ui-ux-agent-skills
description: Comprehensive guide, reference catalog, and practical workflows for 21 Agent Skills and MCP tools for UX/UI design and frontend engineering (curated by xiengperm). Use this skill when designing or auditing user interfaces, eliminating "AI-generated" generic design slop, crafting design systems (DESIGN.md), tuning animation easing and micro-interactions, running accessibility (a11y) audits, or integrating component registries (shadcn, 21st.dev) and Figma MCP.
metadata:
  author: xiengperm (curated by Xaypanya Phongsa)
  source: https://xiengperm.dev/posts/agent-skills-for-ui-ux-th/
  last-updated: '2026-11-17'
  keywords:
    - ui
    - ux
    - design-systems
    - anti-slop
    - taste
    - animation
    - accessibility
    - vercel
    - anthropic
    - shadcn
    - figma-mcp
---

# มัดรวม Agent Skills สำหรับงาน UX/UI (Curated by xiengperm)

คู่มือและคลังรวบรวม **21 Agent Skills & MCP** สำหรับงาน Frontend / UX / UI ที่ช่วยแก้ปัญหาคลาสสิกของ AI: *"โค้ดทำงานได้ แต่หน้าตาดูเป็น AI"* (ฟอนต์ซ้ำ, gradient ม่วงโหลๆ, จัดทุกอย่างไว้กึ่งกลางจอ, ไม่มี focus state, กุตัวเลข social proof ปลอม)

---

## สารบัญ 6 สายงาน UX/UI Agent Skills

1. [สายรสนิยม: กำจัดดีไซน์หน้าตา AI (Anti-Slop & Taste)](#1-สายรสนิยม-กำจัดดีไซน์หน้าตา-ai-anti-slop--taste)
2. [สาย DESIGN.md + ระบบดีไซน์ (Design Systems)](#2-สาย-designmd--ระบบดีไซน์-design-systems)
3. [สาย Motion & Animation: ขยับอย่างมีจังหวะ (Motion & Interaction)](#3-สาย-motion--animation-ขยับอย่างมีจังหวะ)
4. [สายตรวจคุณภาพ + Accessibility (QA & a11y)](#4-สายตรวจคุณภาพ--accessibility-qa--a11y)
5. [สาย Component + สร้าง UI: คลังสำเร็จรูป (Component Registries & Generators)](#5-สาย-component--สร้าง-ui-คลังสำเร็จรูป)
6. [สาย Figma + Design Tools: เชื่อมต่อเครื่องมือภายนอก (Figma & Tool MCP)](#6-สาย-figma--design-tools-เชื่อมต่อเครื่องมือภายนอก)
7. [ชุดเริ่มต้นแนะนำ (Quick Starter Pack)](#7-ชุดเริ่มต้นแนะนำ-quick-starter-pack)
8. [ข้อควรระวังด้านความปลอดภัย (Security Audit Notice)](#8-ข้อควรระวังด้านความปลอดภัย-security-audit-notice)

---

## 1. สายรสนิยม: กำจัดดีไซน์หน้าตา AI (Anti-Slop & Taste)

สอนให้ AI มี "ตา" และ "รสนิยม" ก่อนลงมือเขียนโค้ด

### 1.1 Anthropic Frontend-Design (ทางการจาก Anthropic)
- **จุดเด่น:** ทำหน้าที่เหมือน Art Director วางแผนเลือกทิศทางความสวย โทนสี ฟอนต์ และ "Signature Element" ที่ผูกกับตัวโปรดักต์จริงก่อนเริ่มโค้ด
- **กฎสำคัญ:** ห้ามใช้ฟอนต์ที่ AI ชอบใช้ซ้ำ (Inter, Roboto ทื่อๆ) และแบน Gradient ม่วงโหลๆ
- **การติดตั้ง:**
  ```bash
  # ใน Claude Code / Agent Plugins
  /plugin marketplace add anthropics/skills
  /plugin install example-skills@anthropic-agent-skills
  ```

### 1.2 ui-ux-pro-max
- **จุดเด่น:** คลังสูตรดีไซน์สำเร็จรูป มี 67 สไตล์ UI, 161 Color Palettes, 57 คู่ฟอนต์แนะนำ, กราฟิก 25 แบบ รองรับทั้ง React, Next.js, Vue, SwiftUI, Flutter
- **วิธีค้นหาสูตร:** สามารถรัน `search.py --design-system` ด้วยคีย์เวิร์ดบริบทของแอปได้
- **การติดตั้ง:**
  ```bash
  # แบบ CLI
  npx ui-ux-pro-max-cli init --ai claude
  # หรือเพิ่มผ่าน Plugin Marketplace
  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
  /plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  ```

### 1.3 Taste Skill (The Anti-Slop Frontend Framework)
- **แหล่งข้อมูล:** tasteskill.dev / `Leonxlnx/taste-skill`
- **จุดเด่น:** "จูนรสนิยมด้วยตัวเลข" ผ่าน 3 ค่า Parameter หลัก:
  1. `DESIGN_VARIANCE` (1 - 10)
  2. `MOTION_INTENSITY` (1 - 10)
  3. `VISUAL_DENSITY` (1 - 10)
- **กฎสำคัญ:**
  - *Anti-center bias:* ห้ามจัดกึ่งกลางจอ (Center-aligned) หาก Variance > 4
  - ห้ามใช้ screenshot ปลอมที่วาดด้วย `div` ต้องใช้รูปจริง
  - ห้ามใช้ฟอนต์ Inter ซ้ำซาก
- **การติดตั้ง:**
  ```bash
  npx skills add https://github.com/Leonxlnx/taste-skill
  # หรือเจาะจงเฉพาะ variant
  npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
  ```

### 1.4 Impeccable (โดย Paul Bakaus)
- **จุดเด่น:** ให้ "ชุดคำศัพท์ดีไซน์" 23 คำสั่งเฉพาะทาง เช่น `/impeccable polish` (ขัดเกลาความเนี้ยบ), `/impeccable colorize` (จัดระบบสี), `/impeccable delight` (เติม micro-interaction)
- **Slop Detector:** มีกฎ 45 ข้อไว้ดักตรวจจับ UI หน้าตา AI ตั้งแต่ตอนรีวิวโค้ด / PR
- **Reflex-reject font list:** มีบัญชีดำห้ามฟอนต์ที่ AI ชอบหยิบ (Inter, Lora, Space Grotesk, Playfair)
- **การติดตั้ง:**
  ```bash
  npx impeccable install
  ```

### 1.5 Hallmark (โดย nutlope)
- **จุดเด่น:** "Make your AI agent a designer" มี 4 โหมดการทำงาน (Build, Study, Audit, Redesign) มาพร้อม 20 ธีม และด่านตรวจคุณภาพ 57 ข้อก่อนปล่อยงาน
- **กฎเหล็ก:**
  - ห้ามกุตัวเลข Social Proof ปลอม (เช่น "Loved by 10,000+ developers")
  - แบน Hero Gradient สีม่วง และตัวหนังสือเอียงฟุ่มเฟือย
  - ช่อง Input ต้องใช้งานได้จริง ไม่ใช่วาดหลอกด้วย `div`
- **การติดตั้ง:**
  ```bash
  npx skills add nutlope/hallmark
  ```

---

## 2. สาย DESIGN.md + ระบบดีไซน์ (Design Systems)

สร้างคู่มือมาตรฐานการออกแบบ (Design Spec) ประจำโปรเจกต์ เพื่อให้ Agent อ่านก่อนสร้างหน้าใหม่ทุกครั้ง ได้ภาษาภาพ (Visual Language) เดียวกันทั้งแอป

### 2.1 getdesign.md (โดย VoltAgent)
- **จุดเด่น:** แคตตาล็อกไฟล์ `DESIGN.md` ที่แกะจาก Design System ของแบรนด์ระดับโลกกว่า 300 แบรนด์ (Apple, Stripe, Figma, Tesla, Linear)
- **การใช้งาน:** เข้าไปที่เว็บ getdesign.md แล้วคัดลอกไฟล์ `DESIGN.md` ของแบรนด์ที่เข้ากับสไตล์โปรเจกต์ มาวางไว้ที่ Root ของโปรเจกต์ให้ Agent ศึกษา

### 2.2 extract-design-system
- **จุดเด่น:** ให้ URL หน้าเว็บจริง ตัวสคริปต์จะทำการแกะ Design Tokens (สี, Typography, Spacing, Border Radius, Shadow) ออกมาเป็นไฟล์ JSON ตามสเปก W3C และ CSS Custom Properties พร้อมใช้งานทันที
- **การติดตั้ง:**
  ```bash
  npx skills add arvindrk/extract-design-system
  ```

### 2.3 Brand Guidelines (Anthropic)
- **จุดเด่น:** บันทึกและบังคับใช้ Brand Identity (สีหลัก, สีรอง, กฎการใช้ฟอนต์, น้ำเสียง/Tone of Voice) ในทุก Artifact ที่ Agent สร้าง

---

## 3. สาย Motion & Animation: ขยับอย่างมีจังหวะ

แก้ปัญหา AI เลือก Easing Curve ผิดจังหวะ หรือใส่ลูกเล่นกระตุกกระตักพร้อมกันจนตาลาย

### 3.1 Skills for Design Engineers (โดย Emil Kowalski - ผู้สร้าง animations.dev)
ชุด 3 Skills ระดับมืออาชีพจากอดีต Design Engineer ของ Vercel และ Linear:
1. `emil-design-eng`: หลักคิด Motion & Micro-interaction เชิงลึก หลีกเลี่ยง Easing ที่ไม่เป็นธรรมชาติ
2. `review-animations`: ตรวจสอบโค้ด Transition และ Animation แบบเข้มงวดเหมือนมี Senior Design Engineer รีวิวให้
3. `animation-vocabulary`: สอนคลังคำศัพท์เฉพาะทางด้าน Motion ทำให้ Prompt สั่ง AI ได้ตรงจุด
- **การติดตั้ง:**
  ```bash
  npx skills@latest add emilkowalski/skills
  ```

---

## 4. สายตรวจคุณภาพ + Accessibility (QA & a11y)

ด่านตรวจความถูกต้องตามหลักมาตรฐานสากล (Web Interface Guidelines & WCAG)

### 4.1 Vercel Web Design Guidelines
- **จุดเด่น:** ตรวจสอบโค้ด UI เทียบกับ Web Interface Guidelines กว่า 100 ข้อ
- **ครอบคลุม:**
  - Visible Focus States (ขอบโฟกัสชัดเจนเมื่อกด Tab)
  - Accessibility Labels & ARIA attributes
  - Touch Target Size (ขนาดปุ่มขั้นต่ำสำหรับนิ้วสัมผัส 44x44px หรือ 48x48px)
  - รองรับ `prefers-reduced-motion`
  - Semantic HTML และ Full Keyboard Navigation
- **การติดตั้งชุดรวมของ Vercel:**
  ```bash
  npx skills add vercel-labs/agent-skills
  ```
  *(คำสั่งเดียวได้รับทั้ง Web Design Guidelines, React Best Practices, และ Composition Patterns)*

### 4.2 AccessLint
- **จุดเด่น:** สแกนตรวจสอบมาตรฐาน WCAG 2.2 ระดับ A และ AA ทั้งในหน้าเว็บจริงและในการเปรียบเทียบ Code Diff
- **การติดตั้ง:**
  ```bash
  npx skills add AccessLint/skills
  ```

### 4.3 Anthropic Webapp-Testing
- **จุดเด่น:** เปิดเบราว์เซอร์อัตโนมัติผ่าน Playwright เข้าไปคลิก ทดสอบการทำงานจริงบน UI ถ่ายภาพ Screenshot ตรวจสอบผลงานตัวเอง และวนลูปแก้ไขจนถูกต้องสมบูรณ์

---

## 5. สาย Component + สร้าง UI: คลังสำเร็จรูป

เชื่อมต่อ Agent เข้ากับคลัง Component คุณภาพสูง ไม่ต้องเขียนเองตั้งแต่ศูนย์

### 5.1 shadcn/ui Skill + MCP
- **จุดเด่น:** อ่านไฟล์ `components.json` ของโปรเจกต์ รู้ทันทีว่าใช้ Framework ใด, Theme สีอะไร, Icon ชุดไหน แล้วประกอบ Form / Dashboard ตามแบบแผนอย่างถูกต้อง
- **การติดตั้ง:**
  ```bash
  pnpm dlx skills add shadcn/ui
  ```

### 5.2 Magic MCP โดย 21st.dev
- **จุดเด่น:** ค้นหาและดึง Component พร้อมลูกเล่นระดับเทพจาก Community บน 21st.dev ออกมาเป็นโค้ด TypeScript พร้อมใช้งาน
- **การติดตั้ง:**
  ```bash
  npx @21st-dev/cli@latest init --client claude
  ```

### 5.3 Superdesign
- **จุดเด่น:** Design Agent สำหรับสร้าง Mockup, Wireframe และ Component จาก Prompt พร้อมฟังก์ชัน Recreate จาก Screenshot และ Import จากเว็บไซต์ต้นแบบ

### 5.4 Sleek design-mobile-apps
- **จุดเด่น:** ออกแบบหน้าจอ Mobile App (iOS / Android) สำหรับทีมที่ใช้บริการ Sleek

---

## 6. สาย Figma + Design Tools: เชื่อมต่อเครื่องมือภายนอก

### 6.1 Figma MCP (ทางการจาก Figma)
- **จุดเด่น:** สะพานเชื่อมระหว่าง Figma Canvas กับ Coding Agent สามารถดึง Node และ Layout จาก Figma มาแปลงเป็นโค้ด UI หรือส่งผลลัพธ์โค้ดกลับไปสร้าง Layer บน Figma
- **การเชื่อมต่อ:**
  ```bash
  claude mcp add --transport http figma https://mcp.figma.com/mcp
  ```

---

## 7. ชุดเริ่มต้นแนะนำ (Quick Starter Pack)

หากต้องการติดตั้งชุดที่มีประโยชน์สูงสุดสำหรับโปรเจกต์ทั่วไป แนะนำ 3 ตัวนี้:

```bash
# 1. ป้องกันดีไซน์หน้าตา AI (Art Director จาก Anthropic)
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills

# 2. ป้องกัน Accessibility หลุด และคุม React Performance (Vercel)
npx skills add vercel-labs/agent-skills

# 3. คลังสไตล์และชุดสีสำเร็จรูป (UI-UX Pro Max)
npx ui-ux-pro-max-cli init --ai claude
```

---

## 8. ข้อควรระวังด้านความปลอดภัย (Security Audit Notice)

> [!WARNING]
> จากงานวิจัย **ToxicSkills ของ Snyk** ที่สแกน Agent Skills เกือบ 4,000 ตัวในตลาด พบว่า **36.8% มีช่องโหว่ด้านความปลอดภัยอย่างน้อย 1 จุด** และ **13.4% อยู่ในระดับวิกฤต**

**แนวทางปฏิบัติที่ปลอดภัย:**
1. ติดตั้งเฉพาะ Skill จากผู้พัฒนาหรือองค์กรทางการที่เชื่อถือได้ (Anthropic, Vercel, shadcn, Emil Kowalski)
2. เปิดอ่านเนื้อหาใน `SKILL.md` และ Script ทุกครั้งก่อนสั่งรันคำสั่งภายนอก
3. ไม่รันคำสั่งแปลกปลอมที่ขอสิทธิ์เข้าถึง Secret Keys หรือ Environment Variables เกินความจำเป็น
