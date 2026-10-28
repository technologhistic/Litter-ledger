import { useState, useEffect, useCallback } from 'react';

export function useAppUpdate() {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      setSwRegistration(reg);

      // Check if a service worker is already waiting to activate
      if (reg.waiting) {
        setHasUpdate(true);
      }

      // Listen for new service worker installation
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version downloaded and ready to activate!
            setHasUpdate(true);
          }
        });
      });
    });

    // Check for updates when user refocuses window
    const handleFocus = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch(() => {});
          if (reg.waiting) {
            setHasUpdate(true);
          }
        }
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const triggerUpdate = useCallback(async () => {
    setIsUpdating(true);

    try {
      if (swRegistration?.waiting) {
        // Send skip waiting to the waiting service worker
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Clean browser caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // Check registration update
      if (swRegistration) {
        await swRegistration.update().catch(() => {});
      }
    } catch {
      // Ignore cache cleaning errors
    } finally {
      // Reload page to run latest app code
      setTimeout(() => {
        window.location.reload();
      }, 350);
    }
  }, [swRegistration]);

  return {
    hasUpdate,
    isUpdating,
    triggerUpdate,
  };
}
