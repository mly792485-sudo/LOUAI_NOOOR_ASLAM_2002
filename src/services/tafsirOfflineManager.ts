import { safeStorage } from '../utils/safeStorage';

export type TafsirSourceId = 'saadi' | 'ibn-kathir';

export const TAFSIR_SOURCES: Record<TafsirSourceId, { label: string; slug: string; reference: string }> = {
  saadi: {
    label: 'تفسير السعدي',
    slug: 'ar-tafseer-al-saddi',
    reference: 'تيسير الكريم الرحمن في تفسير كلام المنان — عبد الرحمن بن ناصر السعدي',
  },
  'ibn-kathir': {
    label: 'تفسير ابن كثير',
    slug: 'ar-tafsir-ibn-kathir',
    reference: 'تفسير القرآن العظيم — إسماعيل بن عمر ابن كثير',
  },
};

const API_ROOT = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';
const DB_NAME = 'noor-islam-content-v1';
const STORE_NAME = 'tafsir';
const META_PREFIX = 'noor_tafsir_download_meta_';

export interface TafsirDownloadStatus {
  source: TafsirSourceId;
  completed: number;
  total: number;
  downloaded: boolean;
  lastError?: string;
}

const emptyStatus = (source: TafsirSourceId): TafsirDownloadStatus => ({
  source,
  completed: 0,
  total: 114,
  downloaded: false,
});

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error('التخزين المحلي غير متاح على هذا الجهاز'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('تعذر فتح قاعدة المحتوى المحلي'));
  });
}

function sourceKey(source: TafsirSourceId, surah: number): string {
  return `${source}:${surah}`;
}

async function putTafsir(source: TafsirSourceId, surah: number, data: unknown): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key: sourceKey(source, surah), source, surah, data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('تعذر حفظ التفسير محلياً'));
  });
  db.close();
}

export async function cacheTafsirData(source: TafsirSourceId, surah: number, data: unknown): Promise<void> {
  if (Array.isArray(data)) await putTafsir(source, surah, data);
}

export async function getCachedTafsir(source: TafsirSourceId, surah: number): Promise<unknown[] | null> {
  if (!isIndexedDbAvailable()) return null;
  const db = await openDb();
  const result = await new Promise<any>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(sourceKey(source, surah));
    request.onsuccess = () => resolve(request.result?.data ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return Array.isArray(result) ? result : null;
}

export function tafsirUrl(source: TafsirSourceId, surah: number, ayah?: number): string {
  const base = `${API_ROOT}/${TAFSIR_SOURCES[source].slug}/${surah}`;
  return `${base}${ayah ? `/${ayah}` : ''}.json`;
}

export async function loadTafsirSurah(source: TafsirSourceId, surah: number): Promise<unknown[]> {
  const cached = await getCachedTafsir(source, surah);
  if (cached) return cached;
  const response = await fetch(tafsirUrl(source, surah), { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('صيغة التفسير غير صحيحة');
  await cacheTafsirData(source, surah, data);
  return data;
}

export async function getTafsirStatus(source: TafsirSourceId): Promise<TafsirDownloadStatus> {
  const stored = safeStorage.getItem(`${META_PREFIX}${source}`);
  if (!stored) return emptyStatus(source);
  try {
    return { ...emptyStatus(source), ...JSON.parse(stored) };
  } catch {
    return emptyStatus(source);
  }
}

async function saveStatus(status: TafsirDownloadStatus): Promise<void> {
  safeStorage.setItem(`${META_PREFIX}${status.source}`, JSON.stringify(status));
}

export async function downloadTafsir(
  source: TafsirSourceId,
  onProgress?: (status: TafsirDownloadStatus) => void,
): Promise<TafsirDownloadStatus> {
  let status = await getTafsirStatus(source);
  status.lastError = undefined;
  await saveStatus(status);
  onProgress?.(status);

  for (let surah = 1; surah <= 114; surah += 1) {
    try {
      const existing = await getCachedTafsir(source, surah);
      if (!existing) {
        const response = await fetch(tafsirUrl(source, surah), { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('صيغة التفسير غير صحيحة');
        await putTafsir(source, surah, data);
      }
      status = { ...status, completed: surah, downloaded: surah === 114, lastError: undefined };
      await saveStatus(status);
      onProgress?.(status);
    } catch (error) {
      status = { ...status, downloaded: false, lastError: `تعذر تنزيل سورة ${surah}` };
      await saveStatus(status);
      onProgress?.(status);
      throw error;
    }
  }
  return status;
}

export async function removeDownloadedTafsir(source: TafsirSourceId): Promise<void> {
  if (isIndexedDbAvailable()) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        if (cursor.value?.source === source) cursor.delete();
        cursor.continue();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }
  safeStorage.removeItem(`${META_PREFIX}${source}`);
}
