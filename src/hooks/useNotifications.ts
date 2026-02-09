import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'rune-notifications'
const REMINDER_HOUR = 9 // 9:00 ryto

interface NotificationSettings {
  enabled: boolean
  lastReminder: string | null // ISO date string
  reminderHour: number
}

function getSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { enabled: false, lastReminder: null, reminderHour: REMINDER_HOUR }
}

function saveSettings(settings: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )
  const [enabled, setEnabled] = useState(() => getSettings().enabled)
  const [supported] = useState(() => typeof Notification !== 'undefined' && 'serviceWorker' in navigator)

  // Check and schedule daily reminder
  useEffect(() => {
    if (!enabled || !supported || permission !== 'granted') return

    const settings = getSettings()
    const today = new Date().toISOString().split('T')[0]

    // Already reminded today
    if (settings.lastReminder === today) return

    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(settings.reminderHour, 0, 0, 0)

    // If it's past reminder time, show notification now (user just opened app)
    if (now >= reminderTime) {
      showLocalNotification()
      saveSettings({ ...settings, lastReminder: today })
    } else {
      // Schedule for later today
      const delay = reminderTime.getTime() - now.getTime()
      const timer = setTimeout(() => {
        showLocalNotification()
        saveSettings({ ...getSettings(), lastReminder: today })
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [enabled, supported, permission])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        setEnabled(true)
        saveSettings({ ...getSettings(), enabled: true })
        // Show welcome notification
        showLocalNotification(
          'Pranešimai įjungti! 🔮',
          'Kiekvieną dieną priminsime traukti runą.'
        )
        return true
      }
      return false
    } catch {
      return false
    }
  }, [supported])

  const toggle = useCallback(async () => {
    if (!enabled) {
      // Turning on
      if (permission !== 'granted') {
        return requestPermission()
      }
      setEnabled(true)
      saveSettings({ ...getSettings(), enabled: true })
      return true
    } else {
      // Turning off
      setEnabled(false)
      saveSettings({ ...getSettings(), enabled: false })
      return true
    }
  }, [enabled, permission, requestPermission])

  return {
    supported,
    permission,
    enabled,
    toggle,
    requestPermission,
  }
}

function showLocalNotification(title?: string, body?: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  // Try via service worker first (works in background)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title || 'Runų Būrimas 🔮', {
        body: body || 'Laikas traukti šios dienos runą! Sužinokite, ką runos jums pasakys šiandien.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'daily-rune-reminder',
        data: { url: '/dienos-runa' },
      })
    }).catch(() => {
      // Fallback to regular notification
      new Notification(title || 'Runų Būrimas 🔮', {
        body: body || 'Laikas traukti šios dienos runą!',
        icon: '/icons/icon-192x192.png',
      })
    })
  }
}
