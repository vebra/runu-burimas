// Google Analytics 4 - Custom Events
// https://developers.google.com/analytics/devguides/collection/ga4/events

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// ==========================================
// PAGE VIEWS (SPA route changes)
// ==========================================
export function trackPageView(path: string, title?: string) {
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  })
}

// ==========================================
// DIVINATION EVENTS
// ==========================================
export function trackDivination(type: string, isPremium: boolean) {
  gtag('event', 'divination_performed', {
    divination_type: type,
    is_premium: isPremium,
  })
}

export function trackDailyRune(runeName: string) {
  gtag('event', 'daily_rune_drawn', {
    rune_name: runeName,
  })
}

export function trackYesNo(result: string) {
  gtag('event', 'yes_no_performed', {
    result,
  })
}

export function trackThreeRune() {
  gtag('event', 'three_rune_performed')
}

export function trackCelticCross() {
  gtag('event', 'celtic_cross_performed')
}

export function trackFiveRuneCross() {
  gtag('event', 'five_rune_cross_performed')
}

export function trackSevenRuneMap() {
  gtag('event', 'seven_rune_map_performed')
}

export function trackLoveReading() {
  gtag('event', 'love_reading_performed')
}

// ==========================================
// HOROSCOPE EVENTS
// ==========================================
export function trackHoroscopeCalculation(birthRune: string) {
  gtag('event', 'horoscope_calculated', {
    birth_rune: birthRune,
  })
}

// ==========================================
// JOURNAL EVENTS
// ==========================================
export function trackJournalEntry(mood: string | null, hasRune: boolean) {
  gtag('event', 'journal_entry_saved', {
    mood: mood || 'none',
    has_rune: hasRune,
  })
}

// ==========================================
// PREMIUM FUNNEL
// ==========================================
export function trackPaywallView(source: string) {
  gtag('event', 'paywall_viewed', {
    source,
  })
}

export function trackPremiumPageView() {
  gtag('event', 'premium_page_viewed')
}

export function trackCheckoutStarted(planType: string) {
  gtag('event', 'checkout_started', {
    plan_type: planType,
  })
}

export function trackSubscriptionCreated(planType: string) {
  gtag('event', 'subscription_created', {
    plan_type: planType,
  })
}

// ==========================================
// ENGAGEMENT EVENTS
// ==========================================
export function trackRuneFavorited(runeName: string) {
  gtag('event', 'rune_favorited', {
    rune_name: runeName,
  })
}

export function trackRuneConverted(text: string) {
  gtag('event', 'rune_converted', {
    text_length: text.length,
  })
}

export function trackLibraryRuneViewed(runeName: string) {
  gtag('event', 'library_rune_viewed', {
    rune_name: runeName,
  })
}

export function trackSignUp() {
  gtag('event', 'sign_up', {
    method: 'email',
  })
}

export function trackLogin() {
  gtag('event', 'login', {
    method: 'email',
  })
}

export function trackShare(contentType: string) {
  gtag('event', 'share', {
    content_type: contentType,
  })
}

export function trackNotificationToggle(enabled: boolean) {
  gtag('event', 'notification_toggle', {
    enabled,
  })
}

// ==========================================
// AI EVENTS
// ==========================================
export function trackAIInterpretation(divinationType: string) {
  gtag('event', 'ai_interpretation_requested', {
    divination_type: divinationType,
  })
}
