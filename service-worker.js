"use strict";

const CACHE_NAME = "fieldhouse-app-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css",
  "./app.js",
  "./config.js",
  "./qr.js",
  "./amazing-grace-logo.svg",
  "./icons/app-icon-192.png",
  "./icons/app-icon-512.png",
  "./icons/app-icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./certificate-trophy.png",
  "./photo/athletics-01.jpg",
  "./photo/athletics-02.jpg",
  "./photo/athletics-03.jpg",
  "./photo/athletics-04.jpg",
  "./photo/athletics-05.jpg",
  "./photo/athletics-06.jpg",
  "./photo/athletics-07.jpg",
  "./photo/athletics-08.jpg",
  "./photo/athletics-09.jpg",
  "./photo/athletics-10.jpg",
  "./photo/engineer-john-dwight-tholley.png",
  "./photo/engineer-kabba-samura.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("fieldhouse-app-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  const isAppFile = request.mode === "navigate" || /\.(?:html|css|js)$/.test(url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (!isAppFile) {
      const cached = await cache.match(request);
      if (cached) return cached;
    }

    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const appShell = await cache.match("./index.html");
        if (appShell) return appShell;
      }
      throw error;
    }
  })());
});
