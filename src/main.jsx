import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.jsx';

// Non-blocking API key health check (only in dev)
if (import.meta.env.DEV) {
  import('./services/api').then(({ checkApiKeys }) => checkApiKeys());
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('[Travista] Root element #root not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
