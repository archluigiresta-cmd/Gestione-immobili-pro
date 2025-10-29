// This file is intentionally kept simple.
// The main service worker logic is handled by vite-plugin-pwa.

self.addEventListener('install', () => {
  console.log('Service Worker installed.');
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated.');
});
