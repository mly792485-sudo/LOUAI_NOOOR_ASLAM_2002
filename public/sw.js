const CACHE_NAME = 'noor-app-shell-v2';
const ASSET_CACHE = 'noor-offline-assets-v2';

function appPath(name = '') {
  return new URL(name, self.registration.scope).pathname;
}

const APP_SHELL = [
  appPath(),
  appPath('index.html'),
  appPath('app-icon.png'),
  appPath('apple-touch-icon.png'),
  appPath('favicon.png'),
  appPath('audio/adhan.mp3'),
  appPath('audio/adhkar_morning.mp3'),
  appPath('audio/adhkar_evening.mp3'),
  appPath('audio/adhkar_sleep.mp3'),
  appPath('audio/adhkar_witr.mp3'),
  appPath('audio/ruqyah_mishary_alafasy.mp3'),
  appPath('data/adhkar-audio-catalog.json'),
];

async function cacheBuildAssets(cache) {
  const response = await fetch(appPath('index.html'), { cache: 'no-cache' });
  if (!response.ok) return;
  const html = await response.text();
  const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+\/assets\/[^"#?]+)"/g)]
    .map((match) => new URL(match[1], self.registration.scope).pathname);
  await cache.addAll([...new Set(assetUrls)]);
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await cacheBuildAssets(cache);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE_NAME && name !== ASSET_CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const copy = response.clone();
        void caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    } catch {
      if (event.request.mode === 'navigate') return caches.match(appPath('index.html'));
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
