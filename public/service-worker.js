// SmileCare24 Service Worker
const CACHE_NAME = 'smilecare24-cache-v1';

// Files to cache
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/impressum.html',
  '/datenschutz.html',
  'css/styles.css',
  'js/script.js',
  'assets/smilecare_logo.png',
  'assets/vertrauen.png',
  'assets/Smiling_2.png',
  'assets/flexibilität.png',
  'assets/certicificate.svg',
  'assets/tooth.svg',
  'assets/contract.svg',
  'assets/hero_vid.mp4'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  // Skip for API requests
  if (event.request.url.includes('/chat')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request - request streams can only be used once
        const fetchRequest = event.request.clone();

        // Make network request and cache the response
        return fetch(fetchRequest)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response - response streams can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            console.log('Fetch error:', err);
            // If offline and not in cache, could return a custom offline page here
          });
      })
  );
}); 