/**
 * ⚡ MyPaw Performance & Caching Engine
 * Provides multi-tier caching (In-Memory + LocalStorage fallback)
 * with automatic invalidation and warm-up during splash/idle time.
 */

import { resolveAllKinships } from './kinshipEngine';
import { generatePetNotifications, getNotificationPrefs } from './notificationEngine';

const KINSHIP_CACHE_PREFIX = 'mypaw_cache_kinship_';
const NOTIF_CACHE_PREFIX = 'mypaw_cache_notif_';
const CACHE_VERSION = 'v3';

// 🚀 Fast in-memory L1 cache (zero serialization cost)
const memoryCache = new Map();

/**
 * Generate a deterministic hash/fingerprint of the pets array
 */
export function getPetsFingerprint(pets = []) {
  if (!Array.isArray(pets) || pets.length === 0) return 'empty';
  // Use id, updatedAt/fleaDate/status/name/birthDate to catch any modification
  return pets.map(p => `${p.id}:${p.birthDate || ''}:${p.status || ''}:${p.fleaDate || ''}:${p.vaccineDate || ''}:${p.name || ''}:${(p.photos || []).length}`).join('|');
}

/**
 * Get cached kinship resolution or compute & cache
 */
export function getCachedKinships(pets = []) {
  if (!Array.isArray(pets) || pets.length === 0) return [];
  const fingerprint = getPetsFingerprint(pets);
  const memKey = `kinship_${CACHE_VERSION}_${fingerprint}`;

  if (memoryCache.has(memKey)) {
    return memoryCache.get(memKey);
  }

  // Check persistent storage fallback
  try {
    const raw = sessionStorage.getItem(KINSHIP_CACHE_PREFIX + CACHE_VERSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.fingerprint === fingerprint && Array.isArray(parsed.data)) {
        memoryCache.set(memKey, parsed.data);
        return parsed.data;
      }
    }
  } catch (e) {}

  // Compute fresh
  const resolved = resolveAllKinships(pets);
  memoryCache.set(memKey, resolved);

  try {
    sessionStorage.setItem(
      KINSHIP_CACHE_PREFIX + CACHE_VERSION,
      JSON.stringify({ fingerprint, data: resolved })
    );
  } catch (e) {}

  return resolved;
}

/**
 * Get cached notifications or compute & cache
 */
export function getCachedNotifications(pets = [], options = {}) {
  if (!Array.isArray(pets) || pets.length === 0) return [];
  const fingerprint = getPetsFingerprint(pets);
  const memKey = `notifs_${CACHE_VERSION}_${fingerprint}`;

  if (memoryCache.has(memKey)) {
    return memoryCache.get(memKey);
  }

  const prefs = options.prefs || getNotificationPrefs();
  const notifs = generatePetNotifications(pets, { prefs });
  memoryCache.set(memKey, notifs);

  try {
    sessionStorage.setItem(
      NOTIF_CACHE_PREFIX + CACHE_VERSION,
      JSON.stringify({ fingerprint, data: notifs })
    );
  } catch (e) {}

  return notifs;
}

/**
 * Preload and decode images into GPU texture memory
 */
export function preDecodeImages(urls = []) {
  if (typeof window === 'undefined') return Promise.resolve();
  const validUrls = urls.filter(u => typeof u === 'string' && u.length > 0);
  
  return Promise.all(
    validUrls.map(url => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = url;
        if ('decode' in img) {
          img.decode().then(() => resolve(url)).catch(() => resolve(url));
        } else {
          img.onload = () => resolve(url);
          img.onerror = () => resolve(url);
        }
      });
    })
  );
}

/**
 * Complete background warm-up: kinships, notifications & hero image decoding
 * Called during SplashScreen to ensure zero jank upon entry.
 */
export function warmupAndPrecache(pets = []) {
  if (!Array.isArray(pets) || pets.length === 0) return Promise.resolve();

  return new Promise(resolve => {
    // 1. Warm up kinship computation
    const resolved = getCachedKinships(pets);

    // 2. Warm up notification computation
    getCachedNotifications(resolved);

    // 3. Collect top visible hero images to pre-decode into GPU VRAM
    const topHeroImages = [];
    resolved.slice(0, 6).forEach(pet => {
      const mainImg = pet.avatarThumb || pet.avatar || pet.photos?.[0];
      if (mainImg) topHeroImages.push(mainImg);
    });

    preDecodeImages(topHeroImages).then(() => {
      resolve({ resolved, heroCount: topHeroImages.length });
    });
  });
}

/**
 * 🔄 Invalidate all caches and trigger fresh re-caching
 * Call whenever a pet is added, edited, or deleted
 */
export function invalidateAndRecache(updatedPets = []) {
  memoryCache.clear();
  try {
    sessionStorage.removeItem(KINSHIP_CACHE_PREFIX + CACHE_VERSION);
    sessionStorage.removeItem(NOTIF_CACHE_PREFIX + CACHE_VERSION);
  } catch (e) {}

  // Automatically pre-cache updated data in idle time
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      warmupAndPrecache(updatedPets);
    });
  } else {
    setTimeout(() => {
      warmupAndPrecache(updatedPets);
    }, 60);
  }
}
