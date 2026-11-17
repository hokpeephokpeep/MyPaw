// Utility functions for Image Resizing, Thumbnails, Focus Area, and Memory Optimization

export const MAX_LONG_EDGE = 2048;
export const THUMB_SIZE = 360;

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
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
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

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Process image:
 * 1. Full Image: Preserves full original uncropped photo, resized so longest edge <= 2048px (for viewing large photos)
 * 2. Focused Thumbnail: 1:1 Square thumbnail based on user's focus area (for fast card & list rendering)
 */
export async function processImageWithFocus({
  imageSource, // HTMLImageElement or dataUrl
  focusParams = {}, // { panX, panY, zoom, frameSize }
  rotation = 0, // 0, 90, 180, 270
  maxLongEdge = MAX_LONG_EDGE, // 2048px fixed
  thumbSize = THUMB_SIZE // 360px square
}) {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;

  // Normalized rotation (0, 90, 180, 270)
  const normRot = ((rotation % 360) + 360) % 360;
  const isPerpendicular = normRot === 90 || normRot === 270;
  const effectiveWidth = isPerpendicular ? naturalH : naturalW;
  const effectiveHeight = isPerpendicular ? naturalW : naturalH;

  // Render rotated image to offscreen canvas
  const rotCanvas = document.createElement('canvas');
  rotCanvas.width = effectiveWidth;
  rotCanvas.height = effectiveHeight;
  const rotCtx = rotCanvas.getContext('2d');
  rotCtx.imageSmoothingEnabled = true;
  rotCtx.imageSmoothingQuality = 'high';

  rotCtx.translate(effectiveWidth / 2, effectiveHeight / 2);
  rotCtx.rotate((normRot * Math.PI) / 180);
  rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2);

  // 📸 1. FULL UNMODIFIED-CROP IMAGE (Resized to max 2048px long edge if larger)
  // Keeps 100% of the original photo for full-screen viewing
  const longEdge = Math.max(effectiveWidth, effectiveHeight);
  const fullScale = longEdge > maxLongEdge ? maxLongEdge / longEdge : 1;
  const fullW = Math.max(1, Math.round(effectiveWidth * fullScale));
  const fullH = Math.max(1, Math.round(effectiveHeight * fullScale));

  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = fullW;
  fullCanvas.height = fullH;
  const fullCtx = fullCanvas.getContext('2d');
  fullCtx.imageSmoothingEnabled = true;
  fullCtx.imageSmoothingQuality = 'high';
  fullCtx.drawImage(rotCanvas, 0, 0, fullW, fullH);

  const fullDataUrl = fullCanvas.toDataURL('image/jpeg', 0.86);

  // 🎯 2. FOCUSED 1:1 SQUARE CARD THUMBNAIL (For Cards & List Avatars)
  const {
    panX = 0,
    panY = 0,
    zoom = 1,
    frameSize = 260
  } = focusParams;

  // Focus math: frameSize is square
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

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbSize;
  thumbCanvas.height = thumbSize;
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = 'high';
  thumbCtx.drawImage(rotCanvas, cropX, cropY, cropSide, cropSide, 0, 0, thumbSize, thumbSize);

  const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.80);

  return {
    src: fullDataUrl, // Full uncropped image (max 2048px)
    thumb: thumbDataUrl, // Focused 1:1 square thumbnail (360px)
    width: fullW,
    height: fullH,
    thumbWidth: thumbSize,
    thumbHeight: thumbSize,
    sizeBytes: estimateDataUrlBytes(fullDataUrl),
    thumbSizeBytes: estimateDataUrlBytes(thumbDataUrl),
    focus: { panX, panY, zoom, rotation }
  };
}
