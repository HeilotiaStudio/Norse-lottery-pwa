const CACHE_NAME = 'norse-lotto-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/manifest.json',
    '/js/app.js',
    '/js/userManager.js',
    '/js/csvManager.js',
    '/js/patternAnalyzer.js',
    '/js/quantumModifier.js',
    '/js/astrology.js',
    '/js/weather.js',
    '/js/trials.js',
    '/js/extraNumber.js',
    '/js/ui.js'
];

// Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
    return self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Don't cache API calls
                        if (event.request.url.includes('api.openweathermap.org')) {
                            return response;
                        }
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback
                        return new Response('Offline - Please connect to the internet', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});