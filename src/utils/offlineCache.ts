import { safeStorage } from './safeStorage';

const CACHE_PREFIX = 'noor_offline_json_v1:';
const MAX_STORAGE_BYTES = 3_500_000;

function isBrowserCacheAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

export async function fetchJsonWithOfflineCache<T>(url: string, key: string): Promise<{ data: T; fromCache: boolean }> {
  const storageKey = `${CACHE_PREFIX}${key}`;
  try {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as T;
    try {
      const encoded = JSON.stringify(data);
      if (encoded.length <= MAX_STORAGE_BYTES) safeStorage.setItem(storageKey, encoded);
    } catch {
      // A full or restricted local store must not break the online path.
    }
    return { data, fromCache: false };
  } catch (error) {
    const cached = safeStorage.getItem(storageKey);
    if (!cached) throw error;
    return { data: JSON.parse(cached) as T, fromCache: true };
  }
}

export async function cacheRemoteAsset(url: string): Promise<string> {
  if (!isBrowserCacheAvailable()) return url;
  const cache = await caches.open('noor-offline-assets-v1');
  const existing = await cache.match(url);
  if (existing) return URL.createObjectURL(await existing.blob());
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`تعذر تنزيل المورد (${response.status})`);
  await cache.put(url, response.clone());
  return URL.createObjectURL(await response.blob());
}

export async function getCachedAsset(url: string): Promise<string> {
  if (!isBrowserCacheAvailable()) return url;
  const cache = await caches.open('noor-offline-assets-v1');
  const response = await cache.match(url);
  return response ? URL.createObjectURL(await response.blob()) : url;
}
