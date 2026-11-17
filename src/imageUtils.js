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
