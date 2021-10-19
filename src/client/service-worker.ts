/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals, jest/require-hook */

import { clientsClaim, RouteHandlerCallbackOptions } from 'workbox-core';
import * as navigationPreload from 'workbox-navigation-preload';
import { precacheAndRoute } from 'workbox-precaching';
import type { PrecacheEntry } from 'workbox-precaching/_types';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly /* StaleWhileRevalidate */ } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'offline-html';
const FALLBACK_HTML_URL = '/index.html';

self.addEventListener('install', async (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(FALLBACK_HTML_URL)));
});

navigationPreload.enable();

clientsClaim();

const networkOnly = new NetworkOnly();

const isPrecacheEntry = (entry: string | PrecacheEntry): entry is PrecacheEntry =>
  typeof entry !== 'string';

precacheAndRoute(
  self.__WB_MANIFEST.filter((entry) => isPrecacheEntry(entry) && entry.url !== '/index.html'),
);

const navigationHandler = async (params: RouteHandlerCallbackOptions): Promise<Response> => {
  try {
    const result = await networkOnly.handle(params);
    return result;
  } catch (error) {
    return caches.match(FALLBACK_HTML_URL, {
      cacheName: CACHE_NAME,
    }) as Promise<Response>;
  }
};

registerRoute(new NavigationRoute(navigationHandler));
