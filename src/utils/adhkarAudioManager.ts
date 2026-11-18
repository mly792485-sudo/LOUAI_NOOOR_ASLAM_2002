export type AdhkarAudioKind = 'item' | 'category';

export interface AdhkarAudioRecord {
  url: string;
  kind: AdhkarAudioKind;
  verified?: boolean;
  durationSeconds?: number;
}

interface AdhkarAudioCatalog {
  version: number;
  categories?: Record<string, Record<string, AdhkarAudioRecord>>;
  items?: Record<string, AdhkarAudioRecord>;
}

const CATALOG_URL = '/data/adhkar-audio-catalog.json';
const CACHE_NAME = 'noor-adhkar-audio-v1';

export class AdhkarAudioManager {
  private catalog: AdhkarAudioCatalog | null = null;
  private catalogPromise: Promise<AdhkarAudioCatalog> | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  async loadCatalog(): Promise<AdhkarAudioCatalog> {
    if (this.catalog) return this.catalog;
    if (!this.catalogPromise) {
      this.catalogPromise = fetch(CATALOG_URL, { cache: 'no-cache' })
        .then(async (response) => {
          if (!response.ok) throw new Error('تعذر تحميل كتالوج الصوتيات');
          const value = await response.json() as AdhkarAudioCatalog;
          if (!value || typeof value !== 'object' || typeof value.version !== 'number') {
            throw new Error('كتالوج الصوتيات غير صالح');
          }
          this.catalog = value;
          return value;
        })
        .finally(() => { this.catalogPromise = null; });
    }
    return this.catalogPromise;
  }

  async getCategoryRecord(categoryId: string, reciterId: string): Promise<AdhkarAudioRecord | null> {
    const catalog = await this.loadCatalog();
    return catalog.categories?.[categoryId]?.[reciterId] ?? null;
  }

  async getItemRecord(categoryId: string, itemId: number, reciterId: string): Promise<AdhkarAudioRecord | null> {
    const catalog = await this.loadCatalog();
    const record = catalog.items?.[`${categoryId}:${itemId}:${reciterId}`];
    return record?.kind === 'item' ? record : null;
  }

  async validate(record: AdhkarAudioRecord): Promise<boolean> {
    if (!record.verified || !record.url) return false;
    try {
      const response = await fetch(record.url, { method: 'HEAD', cache: 'no-store' });
      const type = response.headers.get('content-type') || '';
      return response.ok && (!type || type.startsWith('audio/') || type.includes('octet-stream'));
    } catch {
      // Local bundled files can still be checked by the media element in WebView.
      return record.url.startsWith('/') || record.url.startsWith('./');
    }
  }

  async resolveCategoryUrl(categoryId: string, reciterId: string): Promise<string | null> {
    const record = await this.getCategoryRecord(categoryId, reciterId);
    if (!record || !(await this.validate(record))) return null;
    return this.getCachedUrl(record.url);
  }

  async resolveItemUrl(categoryId: string, itemId: number, reciterId: string): Promise<string | null> {
    const record = await this.getItemRecord(categoryId, itemId, reciterId);
    if (!record || !(await this.validate(record))) return null;
    return this.getCachedUrl(record.url);
  }

  async download(url: string): Promise<void> {
    if (!('caches' in window)) throw new Error('التنزيل المحلي غير مدعوم على هذا الجهاز');
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('تعذر تنزيل الملف الصوتي');
    await cache.put(url, response.clone());
  }

  async getCachedUrl(url: string): Promise<string> {
    if (!('caches' in window)) return url;
    const cached = await caches.match(url);
    return cached ? URL.createObjectURL(await cached.blob()) : url;
  }

  stop(): void {
    this.currentAudio?.pause();
    this.currentAudio = null;
  }

  async play(url: string, onEnded?: () => void): Promise<HTMLAudioElement> {
    this.stop();
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.onended = () => {
      if (this.currentAudio === audio) this.currentAudio = null;
      onEnded?.();
    };
    this.currentAudio = audio;
    await audio.play();
    return audio;
  }

  async playQueue(urls: string[], onIndexChange?: (index: number) => void): Promise<HTMLAudioElement | null> {
    if (urls.length === 0) return null;
    let index = 0;
    const playNext = async (): Promise<HTMLAudioElement | null> => {
      if (index >= urls.length) return null;
      const currentIndex = index;
      onIndexChange?.(currentIndex);
      index += 1;
      return this.play(urls[currentIndex], () => { void playNext(); });
    };
    return playNext();
  }
}

export const adhkarAudioManager = new AdhkarAudioManager();
