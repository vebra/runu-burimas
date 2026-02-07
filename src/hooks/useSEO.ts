import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'Runų Būrimas'
const BASE_URL = 'https://rune-app-delta.vercel.app'
const DEFAULT_TITLE = `${SITE_NAME} 🔮 | Elder Futhark Runų Aplikacija`
const DEFAULT_DESCRIPTION = 'Atraskite senovės išmintį per Elder Futhark runas. Kasdienės runos, būrimai, runų biblioteka ir dienoraštis. Pradėkite savo dvasinį kelią šiandien!'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export interface SEOConfig {
  title?: string
  description?: string
  image?: string
  type?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

function setJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd(id: string) {
  const el = document.getElementById(id)
  if (el) el.remove()
}

export function useSEO(config: SEOConfig = {}) {
  const location = useLocation()

  useEffect(() => {
    const {
      title,
      description = DEFAULT_DESCRIPTION,
      image = DEFAULT_IMAGE,
      type = 'website',
      noindex = false,
      jsonLd,
    } = config

    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    document.title = fullTitle

    // Primary meta
    setMetaTag('title', fullTitle)
    setMetaTag('description', description)
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow')

    // Canonical
    const canonicalUrl = `${BASE_URL}${location.pathname}`
    setCanonical(canonicalUrl)

    // Open Graph
    setMetaTag('og:title', fullTitle, true)
    setMetaTag('og:description', description, true)
    setMetaTag('og:image', image, true)
    setMetaTag('og:url', canonicalUrl, true)
    setMetaTag('og:type', type, true)
    setMetaTag('og:site_name', SITE_NAME, true)
    setMetaTag('og:locale', 'lt_LT', true)

    // Twitter
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', fullTitle)
    setMetaTag('twitter:description', description)
    setMetaTag('twitter:image', image)
    setMetaTag('twitter:url', canonicalUrl)

    // JSON-LD (page-specific)
    if (jsonLd) {
      setJsonLd('seo-jsonld-page', jsonLd)
    }

    // BreadcrumbList
    const breadcrumbs = buildBreadcrumbs(location.pathname, title)
    if (breadcrumbs.itemListElement.length > 1) {
      setJsonLd('seo-jsonld-breadcrumb', breadcrumbs)
    }

    return () => {
      // Reset to defaults on unmount
      document.title = DEFAULT_TITLE
      setMetaTag('title', DEFAULT_TITLE)
      setMetaTag('description', DEFAULT_DESCRIPTION)
      setMetaTag('robots', 'index, follow')
      setCanonical(BASE_URL + '/')
      setMetaTag('og:title', DEFAULT_TITLE, true)
      setMetaTag('og:description', DEFAULT_DESCRIPTION, true)
      setMetaTag('og:image', DEFAULT_IMAGE, true)
      setMetaTag('og:url', BASE_URL + '/', true)
      setMetaTag('og:type', 'website', true)
      setMetaTag('twitter:title', DEFAULT_TITLE)
      setMetaTag('twitter:description', DEFAULT_DESCRIPTION)
      setMetaTag('twitter:image', DEFAULT_IMAGE)
      setMetaTag('twitter:url', BASE_URL + '/')
      removeJsonLd('seo-jsonld-page')
      removeJsonLd('seo-jsonld-breadcrumb')
    }
  }, [config.title, config.description, location.pathname])
}

const PATH_LABELS: Record<string, string> = {
  '/daily': 'Kasdienė Runa',
  '/three-rune': '3 Runų Būrimas',
  '/five-rune-cross': '5 Runų Kryžius',
  '/seven-rune-map': '7 Runų Žemėlapis',
  '/celtic-cross': 'Keltų Kryžius',
  '/love-reading': 'Meilės Būrimas',
  '/yes-no': 'Taip/Ne Būrimas',
  '/library': 'Runų Biblioteka',
  '/converter': 'Runų Konverteris',
  '/premium': 'Premium',
  '/profile': 'Profilis',
  '/history': 'Būrimų Istorija',
  '/auth': 'Prisijungimas',
  '/privacy': 'Privatumo Politika',
  '/terms': 'Naudojimo Sąlygos',
}

function buildBreadcrumbs(pathname: string, title?: string) {
  const items: { name: string; url: string }[] = [
    { name: 'Pradžia', url: BASE_URL + '/' },
  ]

  if (pathname !== '/') {
    items.push({
      name: title || PATH_LABELS[pathname] || pathname.slice(1),
      url: BASE_URL + pathname,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
