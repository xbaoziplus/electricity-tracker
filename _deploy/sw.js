/* 电费记账本 · Service Worker
   策略：应用外壳 cache-first（安装时预缓存）；
   Google Fonts 运行时缓存（首次联网加载后即可离线使用）。 */
'use strict';
const VERSION = 'elec-v1.0.0';
const SHELL_CACHE = 'shell-' + VERSION;
const FONT_CACHE = 'fonts-' + VERSION;
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

// 安装时预缓存字体：CORS 拉取 CSS → 解析 woff2 一并入缓存（失败不阻塞安装）
async function precacheFonts() {
  try {
    const cache = await caches.open(FONT_CACHE);
    const res = await fetch(FONT_CSS, { mode: 'cors' });
    if (!res.ok) throw new Error('css ' + res.status);
    await cache.put(FONT_CSS, res.clone());
    const css = await res.text();
    const urls = Array.from(new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)'"]+/g) || []));
    await Promise.all(urls.map(u => cache.add(u).catch(() => {})));
  } catch (e) { /* 离线安装等场景：字体走系统栈兜底 */ }
}

self.addEventListener('install', e => {
  e.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)),
      precacheFonts()
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Google Fonts：cache-first 运行时缓存（样式表为 no-cors opaque 响应，也要缓存）
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(e.request).then(hit => hit || fetch(e.request).then(res => {
          if (res.ok || res.type === 'opaque') cache.put(e.request, res.clone());
          return res;
        }))
      ).catch(() => caches.match(e.request))
    );
    return;
  }

  // 同源应用外壳：cache-first，网络兜底并回填
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }))
    );
  }
});
