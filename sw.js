const CACHE_NAME = 'rural-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './data.json'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Intercept Network Requests for Offline Use
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
