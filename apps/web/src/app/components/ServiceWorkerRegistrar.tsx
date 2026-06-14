'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        const config = { type: 'SW_CONFIG', apiUrl };
        reg.active?.postMessage(config);
        // Re-send config whenever a new SW takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          navigator.serviceWorker.controller?.postMessage(config);
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
