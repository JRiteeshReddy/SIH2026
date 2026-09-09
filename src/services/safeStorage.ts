/**
 * Safe local storage utility with automatic QuotaExceededError protection,
 * cache eviction, and lightweight image compression to prevent React crashes.
 */

export const safeStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: unknown) {
    console.warn(`[SafeStorage] QuotaExceeded or write error for key "${key}":`, err);
    try {
      // Clear non-critical caches to recover storage quota
      localStorage.removeItem('ecodex_discovery_history');
      localStorage.removeItem('ecodex_expedition_history');
      localStorage.setItem(key, value);
      return true;
    } catch {
      // If still fails, try removing large base64 image strings from catalog
      try {
        if (key === 'ecodex_species_catalog') {
          const parsed = JSON.parse(value);
          const sanitized = parsed.map((item: Record<string, unknown>) => ({
            ...item,
            discoveryPhoto: undefined // drop embedded photo to preserve quota
          }));
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        }
      } catch {
        // ignore
      }
      console.warn(`[SafeStorage] Could not recover quota for key "${key}". Proceeding safely in-memory.`);
      return false;
    }
  }
};

export const safeStorageGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/**
 * Downscales an input canvas/video to a compact thumbnail (max 320x320, JPEG quality 0.6)
 * to prevent storing multi-megabyte base64 strings that crash mobile browsers with QuotaExceededError.
 */
export const compressCanvasToThumbnail = (
  sourceCanvas: HTMLCanvasElement | HTMLVideoElement,
  maxDimension: number = 320,
  quality: number = 0.6
): string => {
  try {
    const srcW = 'videoWidth' in sourceCanvas ? (sourceCanvas.videoWidth || 640) : sourceCanvas.width;
    const srcH = 'videoHeight' in sourceCanvas ? (sourceCanvas.videoHeight || 480) : sourceCanvas.height;

    if (!srcW || !srcH) return '';

    const scale = Math.min(1, maxDimension / Math.max(srcW, srcH));
    const targetW = Math.max(64, Math.round(srcW * scale));
    const targetH = Math.max(64, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(sourceCanvas, 0, 0, targetW, targetH);
      return canvas.toDataURL('image/jpeg', quality);
    }
  } catch (e) {
    console.warn('[SafeStorage] Image compression error:', e);
  }

  return '';
};
