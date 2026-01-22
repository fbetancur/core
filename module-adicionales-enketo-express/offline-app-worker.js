
const version = '7.5.1-p-9d74544-34ab2ec';
const resources = [
    // CSS themes
    '/x/css/theme-formhub.css',
    '/x/css/theme-formhub.print.css',
    '/x/css/theme-grid.css',
    '/x/css/theme-grid.print.css',
    '/x/css/theme-kobo.css',
    '/x/css/theme-kobo.print.css',
    '/x/css/theme-plain.css',
    '/x/css/theme-plain.print.css',
    
    // Fonts
    '/x/fonts/OpenSans-Bold-webfont.woff',
    '/x/fonts/OpenSans-Regular-webfont.woff',
    '/x/fonts/fontawesome-webfont.woff?v=4.6.2',
    
    // Images
    '/x/images/favicon.ico',
    '/x/images/icon_180x180.png',
    '/x/images/offline-enabled.png',
    
    // JavaScript chunks
    '/x/js/build/chunks/chunk-3RPRB7E5.js',
    '/x/js/build/chunks/chunk-5LFY7ZTH.js',
    '/x/js/build/chunks/chunk-T5XHUESB.js',
    '/x/js/build/enketo-webform.js',
    
    // Translations
    '/x/locales/build/en/translation-combined.json',
    '/x/locales/build/es/translation-combined.json'
];

/**
 * The version, resources variables above are dynamically prepended by the offline-controller.
 */

const CACHES = [`enketo-common_${version}`];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    // Perform install steps
    event.waitUntil(
        caches
            .open(CACHES[0])
            .then((cache) => {
                console.log('Opened cache');

                // To bypass any HTTP caching, always obtain resource from network
                return cache.addAll(
                    resources.map(
                        (resource) => new Request(resource, { cache: 'reload' })
                    )
                );
            })
            .catch((e) => {
                console.log('Service worker install error', e);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('activated!');
    // Delete old resource caches
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.map((key) => {
                        if (!CACHES.includes(key)) {
                            console.log('deleting cache', key);

                            return caches.delete(key);
                        }
                    })
                )
            )
            .then(() => {
                console.log(`${version} now ready to handle fetches!`);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('returning cached response for', event.request.url);

                return response;
            }

            // TODO: we have a fallback page we could serve when offline, but tbc if that is actually useful at all

            // To bypass any HTTP caching, always obtain resource from network
            return fetch(event.request, {
                credentials: 'same-origin',
                cache: 'reload',
            })
                .then((response) => {
                    const isScopedResource = event.request.url.includes('/x/');
                    const isTranslation =
                        event.request.url.includes('/locales/build/');
                    const isServiceWorkerScript =
                        event.request.url === self.location.href;

                    // The second clause prevents confusing logging when opening the service worker directly in a separate tab.
                    if (
                        isScopedResource &&
                        !isServiceWorkerScript &&
                        !isTranslation
                    ) {
                        console.error(
                            'Resource missing from cache?',
                            event.request.url
                        );
                    }

                    // Check if we received a valid response
                    if (
                        !response ||
                        response.status !== 200 ||
                        response.type !== 'basic' ||
                        !isScopedResource ||
                        isServiceWorkerScript
                    ) {
                        return response;
                    }

                    // Cache any additional loaded languages
                    const responseToCache = response.clone();

                    // Cache any non-English language files that are requested
                    // Also, if the cache didn't get built correctly using the explicit resources list,
                    // just cache whatever is scoped dynamically to self-heal the cache.
                    caches.open(CACHES[0]).then((cache) => {
                        console.log(
                            'Dynamically adding resource to cache',
                            event.request.url
                        );
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch((e) => {
                    // Let fail silently
                    console.log('Failed to fetch resource', event.request, e);
                });
        })
    );
});
