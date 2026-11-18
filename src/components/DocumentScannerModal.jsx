import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCamera, faUpload, faFileLines, faWandMagicSparkles, 
  faCheck, faXmark, faWeightScale, faStethoscope, faSyringe, 
  faShieldHalved, faHospital, faChevronRight, faSpinner, faPaw
} from '@fortawesome/free-solid-svg-icons';
import { useSheetDrag } from '../useSheetDrag';
import { parseVetDocumentText, SAMPLE_VET_DOCUMENTS } from '../vetDocumentParser';
import { getPhotoSrc, convertHeicIfNeeded } from '../imageUtils';
import confetti from 'canvas-confetti';

export default function DocumentScannerModal({ 
  isOpen, 
  onClose, 
  pets = [], 
  selectedPetId = null,
  initialFile = null,
  onUpdatePet 
}) {
  const {
    isVisible,
    requestClose,
    backdropAnimationClass,
    sheetAnimationClass,
    handleProps,
    sheetProps,
    scrollRef
  } = useSheetDrag(onClose, isOpen);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Target pet selection: default to first living cat if available
  const defaultPet = pets.find(p => p.status !== 'deceased') || pets[0];
  const [targetPetId, setTargetPetId] = useState(selectedPetId || defaultPet?.id || '');
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  
  // Extracted & Editable Fields
  const [detectedWeight, setDetectedWeight] = useState('');
  const [detectedCheckupDate, setDetectedCheckupDate] = useState('');
  const [detectedVaccineDate, setDetectedVaccineDate] = useState('');
  const [detectedVaccineName, setDetectedVaccineName] = useState('');
  const [detectedFleaDate, setDetectedFleaDate] = useState('');
  const [detectedClinic, setDetectedClinic] = useState('');
  const [detectedDiagnosis, setDetectedDiagnosis] = useState('');
  const [isSuccessSaved, setIsSuccessSaved] = useState(false);
  const [ocrEngineUsed, setOcrEngineUsed] = useState('');

  useEffect(() => {
    if (selectedPetId) {
      setTargetPetId(selectedPetId);
    } else if (pets.length > 0) {
      const alivePet = pets.find(p => p.status !== 'deceased') || pets[0];
      setTargetPetId(alivePet?.id || '');
    }
  }, [selectedPetId, pets, isOpen]);

  // Reset state or process initial file on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccessSaved(false);
      setRawOcrText('');
      setDetectedWeight('');
      setDetectedCheckupDate('');
      setDetectedVaccineDate('');
      setDetectedVaccineName('');
      setDetectedFleaDate('');
      setDetectedClinic('');
      setDetectedDiagnosis('');

      if (initialFile) {
        handleProcessFile(initialFile);
      } else {
        setImagePreview(null);
        setIsProcessing(false);
      }
    }
  }, [isOpen, initialFile]);

  if (!isVisible) return null;

  const currentPet = pets.find(p => p.id === targetPetId) || pets[0];

  // Apply parsed results to state
  const applyParsedResults = (parsed) => {
    setRawOcrText(parsed.rawText || '');
    if (parsed.weight) setDetectedWeight(String(parsed.weight));
    if (parsed.checkupDate) setDetectedCheckupDate(parsed.checkupDate);
    if (parsed.vaccineDate) setDetectedVaccineDate(parsed.vaccineDate);
    if (parsed.vaccineName) setDetectedVaccineName(parsed.vaccineName);
    if (parsed.fleaDate) setDetectedFleaDate(parsed.fleaDate);
    if (parsed.clinicName) setDetectedClinic(parsed.clinicName);
    if (parsed.diagnosis) setDetectedDiagnosis(parsed.diagnosis);
  };

  // Handle preset sample selection for fast testing
  const handleSelectSample = (sample) => {
    setIsProcessing(true);
    setProcessStep('กำลังวิเคราะห์เอกสารตัวอย่าง...');
    setTimeout(() => {
      const parsed = parseVetDocumentText(sample.text);
      applyParsedResults(parsed);
      setIsProcessing(false);
      setProcessStep('');
    }, 350);
  };

  // Process selected image file with OCR
  const handleProcessFile = async (file) => {
    if (!file) return;

    setIsProcessing(true);
    setProcessStep('กำลังเตรียมไฟล์รูปภาพ...');
    setOcrEngineUsed('');

    try {
      const processedFile = await convertHeicIfNeeded(file);
      const previewUrl = URL.createObjectURL(processedFile);
      setImagePreview(previewUrl);
      setProcessStep('กำลังอ่านตัวอักษรด้วย OpenThai 2.0 OCR...');

      let extractedText = '';
      let usedEngine = '';

      // 1. Primary: High-accuracy OpenThai 2.0 / 2.1 OCR
      try {
        const formData = new FormData();
        formData.append('file', processedFile);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('http://localhost:8000/api/ocr', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (data && data.text) {
            extractedText = data.text;
            usedEngine = 'OpenThai 2.0 OCR';
          }
        }
      } catch (openThaiErr) {
        console.warn('OpenThai OCR endpoint unavailable, fallback to offline engine:', openThaiErr);
      }

      // 2. Secondary Fallback: Tesseract.js (Offline in browser)
      if (!extractedText) {
        setProcessStep('กำลังอ่านตัวอักษรสำรอง (Tesseract)...');
        try {
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('tha+eng');
          const ret = await worker.recognize(processedFile);
          await worker.terminate();
          extractedText = ret.data.text;
          usedEngine = 'Tesseract';
        } catch (tessErr) {
          console.warn('Tesseract fallback error:', tessErr);
          extractedText = file.name;
        }
      }

      setOcrEngineUsed(usedEngine);
      const parsed = parseVetDocumentText(extractedText);
      applyParsedResults(parsed);

      // Auto-match pet if name was detected in document
      if (parsed.petName && Array.isArray(pets) && pets.length > 0) {
        const pNameLower = parsed.petName.toLowerCase();
        const matched = pets.find(p => 
          p.name.toLowerCase().includes(pNameLower) || 
          pNameLower.includes(p.name.toLowerCase())
        );
        if (matched) {
          setTargetPetId(matched.id);
        }
      }
    } catch (err) {
      console.warn('OCR error, fallback to smart parser:', err);
      const parsed = parseVetDocumentText(file.name);
      applyParsedResults(parsed);
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  // Save parsed data to Pet
  const handleSaveToPet = () => {
    if (!currentPet) return;

    let updated = { ...currentPet };

    // 1. Weight
    const w = parseFloat(detectedWeight);
    if (!isNaN(w) && w > 0) {
      const history = Array.isArray(updated.weightHistory) ? [...updated.weightHistory] : [];
      const newEntry = {
        id: `w-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        weight: w
      };
      updated.latestWeight = w;
      updated.weightHistory = [newEntry, ...history];
    }

    // 2. Checkup Date
    if (detectedCheckupDate) {
      updated.checkupDate = detectedCheckupDate;
    }

    // 3. Vaccine Date
    if (detectedVaccineDate) {
      updated.vaccineDate = detectedVaccineDate;
    }

    // 4. Flea Date
    if (detectedFleaDate) {
      updated.fleaDate = detectedFleaDate;
    }

    // 5. Notes / Clinic
    const additions = [];
    if (detectedClinic) additions.push(`🏥 ${detectedClinic}`);
    if (detectedDiagnosis) additions.push(`📋 ${detectedDiagnosis}`);
    if (detectedVaccineName) additions.push(`💉 ${detectedVaccineName}`);

    if (additions.length > 0) {
      const notePrefix = updated.note ? `${updated.note}\n` : '';
      updated.note = `${notePrefix}[สแกน ${new Date().toLocaleDateString('th-TH')}]: ${additions.join(' | ')}`;
    }

    if (onUpdatePet) {
      onUpdatePet(updated);
    }

    setIsSuccessSaved(true);
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#0ea5e9', '#10b981', '#f59e0b']
      });
    } catch (e) {}

    setTimeout(() => {
      requestClose();
    }, 1200);
  };

  const hasDetectedData = Boolean(
    detectedWeight || detectedCheckupDate || detectedVaccineDate || 
    detectedFleaDate || detectedClinic || detectedDiagnosis
  );

  return (
    <div 
      onClick={requestClose}
      className={`fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:px-4 backdrop-blur-xs overscroll-contain ${backdropAnimationClass}`}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        {...sheetProps}
        className={`w-full max-w-md rounded-t-[32px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh] ${sheetAnimationClass} pb-[var(--safe-bottom)] overscroll-contain`}
      >
        {/* Pull Handle */}
        <div {...handleProps} className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing flex-shrink-0 select-none bg-slate-50/50" title="ลากลงเพื่อปิด">
          <div className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-paw-500 to-amber-500 text-white flex items-center justify-center text-base shadow-xs">
              <FontAwesomeIcon icon={faCamera} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base flex items-center gap-1.5">
                <span>สแกนเอกสารคลินิก</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  ocrEngineUsed === 'OpenThai 2.0 OCR' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-paw-100 text-paw-700'
                }`}>
                  {ocrEngineUsed || 'OpenThai 2.0'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">แปลงใบนัด สมุดวัคซีน และใบเสร็จ อัตโนมัติ</p>
            </div>
          </div>

          <button 
            onClick={requestClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-colors active:scale-95"
            aria-label="ปิด"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>

        {/* Hidden Camera & File Inputs */}
        <input 
          ref={cameraInputRef}
          type="file" 
          accept="image/*,.heic,.heif" 
          capture="environment" 
          className="hidden" 
          onChange={(e) => handleProcessFile(e.target.files?.[0])}
        />
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*,.heic,.heif" 
          className="hidden" 
          onChange={(e) => handleProcessFile(e.target.files?.[0])}
        />

        {/* Scrollable Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 overscroll-contain">
          
          {/* A. Image Captured: Show Image Preview prominently at the top */}
          {imagePreview ? (
            <div className="space-y-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-52 shadow-2xs">
                <img 
                  src={imagePreview} 
                  alt="ภาพเอกสารที่ถ่าย" 
                  className="w-full h-full object-contain max-h-52"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-transform"
                    title="ถ่ายภาพใหม่"
                  >
                    <FontAwesomeIcon icon={faCamera} className="text-[10px]" />
                    <span>ถ่ายใหม่</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-transform"
                    title="เลือกรูปภาพอื่น"
                  >
                    <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                    <span>เปลี่ยนรูป</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setRawOcrText('');
                      setDetectedWeight('');
                      setDetectedCheckupDate('');
                      setDetectedVaccineDate('');
                      setDetectedVaccineName('');
                      setDetectedFleaDate('');
                      setDetectedClinic('');
                      setDetectedDiagnosis('');
                    }}
                    className="w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-[10px] active:scale-95 transition-transform"
                    title="ลบรูปภาพ"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* B. No Image Yet: Show Capture / Upload Actions & Demo Presets */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-paw-500 to-amber-500 hover:from-paw-600 hover:to-amber-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-transform"
                >
                  <FontAwesomeIcon icon={faCamera} className="text-sm" />
                  <span>เปิดกล้องถ่ายภาพ</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 active:scale-95 transition-transform"
                >
                  <FontAwesomeIcon icon={faUpload} className="text-sm text-slate-500" />
                  <span>เลือกจากอัลบั้ม</span>
                </button>
              </div>

              {/* Fast Demo Test Presets */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-500" />
                    <span>ทดลองด้วยเอกสารตัวอย่าง:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">แตะเพื่อทดสอบ OCR</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SAMPLE_VET_DOCUMENTS.map(sample => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="px-2 py-2 rounded-xl bg-white border border-slate-200 hover:border-paw-400 text-left transition-all active:scale-95 shadow-2xs group"
                    >
                      <div className="text-[10px] font-semibold text-slate-800 group-hover:text-paw-600 truncate">
                        {sample.badge}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {sample.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="py-6 px-4 bg-paw-50/70 border border-paw-200 rounded-2xl flex flex-col items-center justify-center gap-2 animate-fadeIn text-center">
              <FontAwesomeIcon icon={faSpinner} className="text-2xl text-paw-500 animate-spin" />
              <span className="text-xs font-semibold text-paw-800">{processStep}</span>
              <span className="text-[10px] text-slate-400">กำลังตรวจจับวันนัดหมาย น้ำหนัก และข้อมูลวัคซีนจากภาพ</span>
            </div>
          )}

          {/* Target Pet Selector: Show who to save to */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <FontAwesomeIcon icon={faPaw} className="text-paw-500 text-[10px]" />
              <span>บันทึกข้อมูลเข้าประวัติของ:</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {pets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTargetPetId(p.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all active:scale-95 whitespace-nowrap flex-shrink-0 ${
                    targetPetId === p.id
                      ? 'border-paw-500 bg-paw-50 text-paw-900 shadow-2xs font-semibold ring-1 ring-paw-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={getPhotoSrc(p.avatarThumb || p.avatar || p.photos?.[0]) || '/default-cat.png'}
                    alt={p.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted & Editable Fields: Always available once an image is loaded or data is detected */}
          {(hasDetectedData || imagePreview) && !isProcessing && (
            <div className="space-y-3 bg-white border border-paw-200 rounded-2xl p-4 shadow-2xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>ข้อมูลที่ได้จากเอกสาร (ตรวจสอบ/แก้ไขได้):</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">ตรวจพบอัตโนมัติ ✓</span>
              </div>

              {/* Weight */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faWeightScale} className="text-paw-500 text-xs" />
                  <span>น้ำหนักตัว (กก.):</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={detectedWeight}
                  onChange={(e) => setDetectedWeight(e.target.value)}
                  placeholder="เช่น 4.35"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                />
              </div>

              {/* Next Appointment Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faStethoscope} className="text-amber-500 text-xs" />
                  <span>วันนัดพบสัตวแพทย์ครั้งถัดไป:</span>
                </label>
                <input
                  type="date"
                  value={detectedCheckupDate}
                  onChange={(e) => setDetectedCheckupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                />
              </div>

              {/* Vaccine Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faSyringe} className="text-sky-500 text-xs" />
                  <span>วันฉีดวัคซีนล่าสุด:</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="date"
                    value={detectedVaccineDate}
                    onChange={(e) => setDetectedVaccineDate(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={detectedVaccineName}
                    onChange={(e) => setDetectedVaccineName(e.target.value)}
                    placeholder="ชื่อวัคซีน (เช่น FVRCP)"
                    className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Flea Date */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-indigo-500 text-xs" />
                  <span>วันหยดยาเห็บหมัดล่าสุด:</span>
                </label>
                <input
                  type="date"
                  value={detectedFleaDate}
                  onChange={(e) => setDetectedFleaDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                />
              </div>

              {/* Clinic Name */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <FontAwesomeIcon icon={faHospital} className="text-slate-500 text-xs" />
                  <span>สถานพยาบาล / คลินิก:</span>
                </label>
                <input
                  type="text"
                  value={detectedClinic}
                  onChange={(e) => setDetectedClinic(e.target.value)}
                  placeholder="เช่น โรงพยาบาลสัตว์..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-paw-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccessSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs animate-bounce">
              <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
              <span>บันทึกข้อมูลเข้าสมุดสุขภาพของ {currentPet?.name} เรียบร้อยแล้ว!</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={requestClose}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-colors active:scale-95"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={!hasDetectedData || isProcessing}
            onClick={handleSaveToPet}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs ${
              hasDetectedData && !isProcessing
                ? 'bg-paw-600 hover:bg-paw-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faCheck} className="text-xs" />
            <span>บันทึกเข้าสมุดสุขภาพ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
