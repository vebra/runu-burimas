declare function gtag(...args: unknown[]): void

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals'

// Register Service Worker for PWA functionality (only in production)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('SW registered: ', registration)
        }
      })
      .catch((registrationError) => {
        if (import.meta.env.DEV) {
          console.log('SW registration failed: ', registrationError)
        }
      })
  })
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Unregister any existing SW in dev mode
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister())
  })
}

// Send Web Vitals to Google Analytics 4
function sendToGA({ name, delta, id }: { name: string; delta: number; id: string }) {
  if (typeof gtag === 'function') {
    gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? delta * 1000 : delta),
      event_label: id,
      non_interaction: true,
    })
  }
}

onCLS(sendToGA)
onINP(sendToGA)
onLCP(sendToGA)
onFCP(sendToGA)
onTTFB(sendToGA)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
