const CACHE = 'xc-meet-timer-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// Install the new version
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Delete old app caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// For the main app page, check the internet first.
// If there is no internet, use the saved offline copy.
self.addEventListener('fetch', event => {

  const request = event.request;

  if (request.mode === 'navigate') {

    event.respondWith(
      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE)
            .then(cache =>
              cache.put('./index.html', copy)
            );

          return response;

        })
        .catch(() =>
          caches.match('./index.html')
        )
    );

    return;
  }

  // Other files can use the offline cache first.
  event.respondWith(
    caches.match(request)
      .then(cached => {

        if (cached) return cached;

        return fetch(request)
          .then(response => {

            const copy = response.clone();

            caches.open(CACHE)
              .then(cache =>
                cache.put(request, copy)
              );

            return response;

          });

      })
  );

});
