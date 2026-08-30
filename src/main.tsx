/**
 * main.tsx — Application entry point.
 *
 * Responsibilities:
 *  1. Register the PWA service worker
 *  2. Seed the IndexedDB database with fictional demo records
 *  3. Wrap the app in the i18n provider
 *  4. Mount React
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { I18nProvider } from '@/lib/i18n';
import { seedDatabase } from '@/lib/storage/seed';
import { App } from './App';
import '@/styles/global.css';

// ── PWA Service Worker ────────────────────────────────────────────────────────
// registerSW provided by vite-plugin-pwa — auto-updates the SW silently.
registerSW({
  onRegistered(r) {
    console.info('[Sakhi] Service worker registered:', r?.scope);
  },
  onRegisterError(error) {
    console.warn('[Sakhi] Service worker registration failed (non-fatal):', error);
  },
});

// ── IndexedDB seed ────────────────────────────────────────────────────────────
// Run before React mount so data is available immediately.
// This is a non-blocking fire-and-forget; app renders regardless.
seedDatabase().catch(console.warn);

// ── React mount ───────────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('[Sakhi] #root element not found in DOM');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
