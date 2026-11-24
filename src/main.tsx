import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('sw.js', document.baseURI).toString();
    void navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {
      // Offline cache is an enhancement; native app startup must continue.
    });
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// The inline boot screen protects the native WebView from appearing blank while
// JavaScript loads. Remove it only after React has successfully mounted.
window.requestAnimationFrame(() => {
  document.getElementById('boot-status')?.remove();
});
