import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline service worker for PWA and WebView caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
