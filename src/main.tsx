import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline service worker for PWA and WebView caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  window.dispatchEvent(new CustomEvent('app_update_available'));
                }
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('Service worker registration note:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
