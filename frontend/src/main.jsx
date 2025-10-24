// LitInvestorBlog-frontend/src/main.jsx

if (typeof window !== 'undefined') {
  window.global = window;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';

// Importa SOLO App.css. Sarà lui a caricare il tema.
import './App.css';

// Service Worker (solo in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(() => console.log('SW registration failed'));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
