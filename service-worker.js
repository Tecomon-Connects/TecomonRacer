// Path: service-worker.js

self.addEventListener("install", (event) => {});

self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});

self.addEventListener("activate", (event) => {});
