// OHT Service Worker — Network First, Auto-Update on Deploy
//
// CARA KERJA ANTI-BANDEL:
// - CACHE_VERSION di-inject otomatis saat deploy (lihat build step di bawah)
// - Setiap deploy baru = nama cache baru = cache lama dihapus otomatis di activate
// - skipWaiting() → SW baru langsung aktif tanpa tunggu tab ditutup
// - clients.claim() → SW langsung kontrol semua tab yang terbuka
// - Setelah activate, SW baru broadcast ke semua tab → tab auto reload 1x
// - Network First: selalu ambil fresh dari network, cache hanya fallback offline

// ── GANTI NILAI INI SETIAP DEPLOY ──────────────────────────
// Bisa otomatis via build script: sed -i "s/BUILD_TS/$(date +%s)/" sw.js
const CACHE_VERSION = 'oht-1781070350';
// ────────────────────────────────────────────────────────────

// Install: langsung aktif, tidak pre-cache apapun
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate: hapus SEMUA cache lama, claim semua tab, lalu minta reload
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[OHT SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
      .then(() => {
        // Broadcast ke semua tab: SW baru aktif, silakan reload
        return self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED' });
          });
        });
      })
  );
});

// Fetch: Network First
// Online  → ambil dari network, simpan ke cache sebagai fallback
// Offline → ambil dari cache, kalau tidak ada return 503
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip cross-origin (Google Fonts, CDN, dll) — biarkan browser handle
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request, { cache: 'no-store' })  // no-store: paksa network, jangan pakai HTTP cache
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
      )
  );
});
