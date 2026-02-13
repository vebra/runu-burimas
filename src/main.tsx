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

// Global error handler - catch unhandled errors and log to Supabase
window.addEventListener('error', (event) => {
  const msg = event.error?.message || event.message || 'Unknown error'
  // Auto-reload on chunk load failures
  if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Loading chunk')) {
    window.location.reload()
    return
  }
  import('./lib/supabase').then(({ supabase }) => {
    supabase.from('error_logs').insert({
      error_message: msg,
      error_stack: event.error?.stack?.slice(0, 2000) || null,
      url: window.location.href,
      user_agent: navigator.userAgent,
    })// eslint-disable-next-line @typescript-eslint/no-empty-function
.then(() => {})
  }).catch(() => {})
})

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason) || 'Unhandled rejection'
  if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Loading chunk')) {
    window.location.reload()
    return
  }
  import('./lib/supabase').then(({ supabase }) => {
    supabase.from('error_logs').insert({
      error_message: `[Promise] ${msg}`,
      error_stack: event.reason?.stack?.slice(0, 2000) || null,
      url: window.location.href,
      user_agent: navigator.userAgent,
    })// eslint-disable-next-line @typescript-eslint/no-empty-function
.then(() => {})
  }).catch(() => {})
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
