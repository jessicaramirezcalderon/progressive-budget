
// if online,
//    we should read the entire transaction history from indexDB or cache
//    update MongoDB (which will update the app)
//    update the cache (if necessary using a certain "key")
//    clear the transaction history
// else if offline,
//    take the information from the user request, save it to cache or indexDB
//    update the cache based on calculations (if necessary using a certain "key")
//    add to transaction history (if necessary using a certain "key")


const FILES_TO_CACHE = [
    "/",
    "index.html",
    "styles.css",
    "index.js",
    "manifest.webmanifest",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
];
const CACHE_NAME = "static-cache-v2";
const TRANSACTION_CACHE = "transaction-v1";
const OFFLINE_TRANSACTION_CACHE = "offline-transaction-v1";


// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// fetch
self.addEventListener("fetch", (evt) => {
    // cache successful requests to the API
    if (evt.request.url.includes("/api/transaction")  && evt.request.method === "GET") {
        return evt.respondWith(
            caches.open(TRANSACTION_CACHE)
                .then((cache) => {
                    return fetch(evt.request)
                        .then((response) => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch((err) => {
                            console.error(err);
                            // Network request failed, try to get it from the cache.
                            return cache.match(evt.request);
                        });
                })
        )
    }

    // if the request is not for the API, serve static assets using "offline-first" approach.
    //
    evt.respondWith(
        caches.match(evt.request).then((response) => response || fetch(evt.request))
    );
});