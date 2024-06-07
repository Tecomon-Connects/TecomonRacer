// // Path: service-worker.js

// self.addEventListener("install", (event) => {});

// self.addEventListener("fetch", function (event) {
//   event.respondWith(fetch(event.request));
// });

// self.addEventListener("activate", (event) => {});
// Replace 3.6.3 with the current version number of Workbox.
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js"
);

workbox.routing.registerRoute(
  new RegExp(".png$"),
  workbox.strategies.cacheFirst({
    cacheName: "images-cache",
  })
);
