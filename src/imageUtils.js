// Utility functions for Image Resizing, Thumbnails, Focus Area, and Memory Optimization

export const MAX_LONG_EDGE = 2048;
export const THUMB_SIZE = 960;

export const getPhotoSrc = (photo) => {
  if (!photo) return '';
  if (typeof photo === 'object' && photo !== null) {
    return photo.src || photo.thumb || '';
  }
  return photo;
};

export const getPhotoThumb = (photo) => {
  if (!photo) return '';
  if (typeof photo === 'object' && photo !== null) {
    return photo.thumb || photo.src || '';
  }
  return photo;
};

export function estimateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return 0;
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function isHeic(fileOrBlob) {
  if (!fileOrBlob) return false;

  // Check magic bytes first to avoid unnecessary conversion or mislabeled files
  if (fileOrBlob.size && fileOrBlob.size > 12 && typeof fileOrBlob.slice === 'function') {
    try {
      const headerSlice = fileOrBlob.slice(0, 12);
      const buf = await headerSlice.arrayBuffer();
      const bytes = new Uint8Array(buf);

      // Already browser-readable standard image formats
      // JPEG: FF D8 FF
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        return false;
      }
      // PNG: 89 50 4E 47
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        return false;
      }
      // GIF: GIF8
      if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return false;
      }
      // WebP: RIFF
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        return false;
      }

      // Check for HEIC/HEIF ftyp box at offset 4
      const ftypStr = String.fromCharCode(...bytes.slice(4, 12));
      if (ftypStr.startsWith('ftyp')) {
        const brand = ftypStr.slice(4).toLowerCase();
        if (['heic', 'heix', 'hevc', 'heim', 'heis', 'mif1', 'msf1', 'avif'].includes(brand)) {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }

  const name = (fileOrBlob.name || '').toLowerCase();
  const type = (fileOrBlob.type || '').toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    type === 'image/heic-sequence' ||
    type === 'image/heif-sequence' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

export async function convertHeicIfNeeded(fileOrBlob) {
  if (!fileOrBlob) return fileOrBlob;
  const needsConvert = await isHeic(fileOrBlob);
  if (!needsConvert) return fileOrBlob;

  try {
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;
    const result = await heic2any({
      blob: fileOrBlob,
      toType: 'image/jpeg',
      quality: 0.92
    });
    const blob = Array.isArray(result) ? result[0] : result;
    const originalName = fileOrBlob.name || 'image.heic';
    const newName = originalName.replace(/\.(heic|heif)$/i, '') + '.jpg';
    if (typeof File !== 'undefined') {
      return new File([blob], newName, {
        type: 'image/jpeg',
        lastModified: fileOrBlob.lastModified || Date.now()
      });
    }
    return blob;
  } catch (err) {
    const msg = err?.message || String(err);
    if (msg.includes('already browser readable') || msg.includes('ERR_USER')) {
      return fileOrBlob;
    }
    console.warn('heic2any conversion error:', err);
    return fileOrBlob;
  }
}

export async function convertDataUrlHeicIfNeeded(src) {
  if (typeof src === 'string' && (src.startsWith('data:image/heic') || src.startsWith('data:image/heif'))) {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const convertedBlob = await convertHeicIfNeeded(blob);
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(convertedBlob);
      });
    } catch (e) {
      console.warn('convertDataUrlHeicIfNeeded error:', e);
      return src;
    }
  }
  return src;
}

export async function fileToDataUrl(file) {
  const converted = await convertHeicIfNeeded(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(converted);
  });
}

export async function loadImage(src) {
  const safeSrc = await convertDataUrlHeicIfNeeded(src);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = safeSrc;
  });
}

/**
 * Process image:
 * 1. Full Image: Preserves full original uncropped photo (keeps original URL if unrotated static asset, or max 2048px)
 * 2. Focused High-DPI Thumbnail: Crisp 1:1 Square image (up to 960x960 at 0.92 quality) based on user's focus area
 */
export async function processImageWithFocus({
  imageSource, // HTMLImageElement or dataUrl or static path
  focusParams = {}, // { panX, panY, zoom, frameSize }
  rotation = 0, // 0, 90, 180, 270
  maxLongEdge = MAX_LONG_EDGE, // 2048px
  thumbSize = THUMB_SIZE // 960px high-DPI square
}) {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  // Normalized rotation (0, 90, 180, 270)
  const normRot = ((rotation % 360) + 360) % 360;
  const isPerpendicular = normRot === 90 || normRot === 270;
  const effectiveWidth = isPerpendicular ? naturalH : naturalW;
  const effectiveHeight = isPerpendicular ? naturalW : naturalH;

  // Only create intermediate rotated canvas if rotation !== 0
  let sourceDrawable = img;
  if (normRot !== 0) {
    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = effectiveWidth;
    rotCanvas.height = effectiveHeight;
    const rotCtx = rotCanvas.getContext('2d');
    rotCtx.imageSmoothingEnabled = true;
    rotCtx.imageSmoothingQuality = 'high';

    rotCtx.translate(effectiveWidth / 2, effectiveHeight / 2);
    rotCtx.rotate((normRot * Math.PI) / 180);
    rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2);
    sourceDrawable = rotCanvas;
  }

  // 📸 1. FULL UNMODIFIED-CROP IMAGE
  const isStaticAssetUrl = typeof imageSource === 'string' && !imageSource.startsWith('data:');
  const longEdge = Math.max(effectiveWidth, effectiveHeight);
  const fullScale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1;
  const fullW = Math.max(1, Math.round(effectiveWidth * fullScale));
  const fullH = Math.max(1, Math.round(effectiveHeight * fullScale));

  let fullDataUrl;
  if (isStaticAssetUrl && normRot === 0 && fullScale === 1) {
    // Preserve original crisp static asset URL without lossy re-encoding
    fullDataUrl = imageSource;
  } else {
    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = fullW;
    fullCanvas.height = fullH;
    const fullCtx = fullCanvas.getContext('2d');
    fullCtx.imageSmoothingEnabled = true;
    fullCtx.imageSmoothingQuality = 'high';
    fullCtx.drawImage(sourceDrawable, 0, 0, fullW, fullH);
    fullDataUrl = fullCanvas.toDataURL('image/jpeg', 0.92);
  }

  // 🎯 2. FOCUSED 1:1 SQUARE CARD IMAGE (High-DPI 960px for crisp Retina/Mobile cards)
  const {
    panX = 0,
    panY = 0,
    zoom = 1,
    frameSize = 300
  } = focusParams;

  const baseScale = Math.max(frameSize / effectiveWidth, frameSize / effectiveHeight);
  const currentScale = Math.max(0.001, baseScale * zoom);

  const cropSide = Math.min(effectiveWidth, effectiveHeight, frameSize / currentScale);

  const centerX = effectiveWidth / 2 - (panX / currentScale);
  const centerY = effectiveHeight / 2 - (panY / currentScale);

  let cropX = centerX - cropSide / 2;
  let cropY = centerY - cropSide / 2;

  // Clamp within image bounds
  cropX = Math.max(0, Math.min(effectiveWidth - cropSide, cropX));
  cropY = Math.max(0, Math.min(effectiveHeight - cropSide, cropY));

  // Output resolution matches source crop resolution up to thumbSize (960px), minimum 600px
  const targetThumbSize = Math.round(Math.min(thumbSize, Math.max(600, cropSide)));

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = targetThumbSize;
  thumbCanvas.height = targetThumbSize;
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = 'high';
  thumbCtx.drawImage(
    sourceDrawable,
    cropX,
    cropY,
    cropSide,
    cropSide,
    0,
    0,
    targetThumbSize,
    targetThumbSize
  );

  const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.92);

  return {
    src: fullDataUrl, // Full uncropped image
    thumb: thumbDataUrl, // Focused 1:1 square high-res card image (up to 960x960 @ 0.92)
    width: fullW,
    height: fullH,
    thumbWidth: targetThumbSize,
    thumbHeight: targetThumbSize,
    sizeBytes: estimateDataUrlBytes(fullDataUrl),
    thumbSizeBytes: estimateDataUrlBytes(thumbDataUrl),
    focus: { panX, panY, zoom, rotation: normRot }
  };
}
