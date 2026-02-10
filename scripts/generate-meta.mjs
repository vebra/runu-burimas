/**
 * Post-build script: generates per-route HTML files with correct meta tags.
 * This ensures Google and social media crawlers see correct title/description/OG
 * without needing SSR or a headless browser.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

const DIST = join(import.meta.dirname, '..', 'dist')
const BASE_URL = 'https://www.runes.lt'
const SITE_NAME = 'Runų Būrimas'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

// Public routes with SEO meta data (must match useSEO() calls in each page)
const routes = [
  {
    path: '/dienos-runa',
    title: 'Kasdienė Runa',
    description: 'Traukite savo kasdienę Elder Futhark runą ir gaukite asmeninę interpretaciją. Pradėkite dieną su senovės runų išmintimi.',
  },
  {
    path: '/trys-runos',
    title: 'Trijų Runų Būrimas',
    description: 'Trijų runų būrimas — praeitis, dabartis ir ateitis. Gaukite gilesnį supratimą apie savo gyvenimo kelią per Elder Futhark runas.',
  },
  {
    path: '/penkiu-runu-kryzius',
    title: 'Penkių Runų Kryžius',
    description: 'Penkių runų kryžiaus būrimas — išsami situacijos analizė per Elder Futhark runas. Dabartis, praeitis, ateitis, patarimas ir rezultatas.',
  },
  {
    path: '/septiniu-runu-zemelapis',
    title: 'Septynių Runų Žemėlapis',
    description: 'Septynių runų žemėlapio būrimas — giliausia Elder Futhark runų analizė. Praeitis, dabartis, ateitis, paslėptos įtakos ir galutinis rezultatas.',
  },
  {
    path: '/celtic-kryzius',
    title: 'Keltų Kryžius',
    description: 'Keltų kryžiaus runų būrimas — 10 runų išdėstymas detaliam gyvenimo situacijos tyrimui. Seniausias ir išsamiausias būrimo metodas.',
  },
  {
    path: '/meiles-skaitymas',
    title: 'Meilės Būrimas',
    description: 'Meilės runų būrimas — sužinokite apie savo santykius per Elder Futhark runas. Jūsų jausmai, partnerio jausmai ir santykių ateitis.',
  },
  {
    path: '/taip-ne',
    title: 'Taip arba Ne Būrimas',
    description: 'Užduokite klausimą ir gaukite atsakymą per Elder Futhark runas. Paprastas ir greitas būrimo metodas.',
  },
  {
    path: '/biblioteka',
    title: 'Runų Biblioteka',
    description: 'Pilna Elder Futhark runų biblioteka su reikšmėmis, simboliais ir interpretacijomis. 24 senovės runos su detaliais aprašymais.',
  },
  {
    path: '/konverteris',
    title: 'Runų Konverteris',
    description: 'Konvertuokite tekstą į Elder Futhark runas. Rašykite savo vardą ar žinutę runomis.',
  },
  {
    path: '/horoskopas',
    title: 'Rūnų Horoskopas',
    description: 'Sužinokite savo gimimo rūną pagal gimimo datą. Atraskite ką Elder Futhark runos atskleidžia apie jūsų asmenybę.',
  },
  {
    path: '/premium',
    title: 'Premium Narystė',
    description: 'Atrakinkite visas Runų Būrimo funkcijas — neriboti būrimai, AI interpretacijos, runų dienoraštis ir daugiau.',
  },
  {
    path: '/privatumo-politika',
    title: 'Privatumo Politika',
    description: 'Runų Būrimo privatumo politika — kaip renkame, saugome ir naudojame jūsų duomenis.',
  },
  {
    path: '/naudojimosi-salygos',
    title: 'Naudojimo Sąlygos',
    description: 'Runų Būrimo naudojimo sąlygos ir taisyklės.',
  },
]

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

let count = 0

for (const route of routes) {
  const fullTitle = `${route.title} | ${SITE_NAME}`
  const canonicalUrl = `${BASE_URL}${route.path}`

  let html = template
    // Title
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${fullTitle}</title>`
    )
    // meta name="title"
    .replace(
      /<meta name="title" content="[^"]*"/,
      `<meta name="title" content="${fullTitle}"`
    )
    // meta name="description"
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${route.description}"`
    )
    // canonical
    .replace(
      /<link rel="canonical" href="[^"]*"/,
      `<link rel="canonical" href="${canonicalUrl}"`
    )
    // og:title
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${fullTitle}"`
    )
    // og:description
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${route.description}"`
    )
    // og:url
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${canonicalUrl}"`
    )
    // twitter:title
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${fullTitle}"`
    )
    // twitter:description
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${route.description}"`
    )
    // twitter:url
    .replace(
      /<meta name="twitter:url" content="[^"]*"/,
      `<meta name="twitter:url" content="${canonicalUrl}"`
    )

  // Write to dist/path/index.html (e.g. dist/dienos-runa/index.html)
  const dir = join(DIST, route.path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(join(dir, 'index.html'), html, 'utf-8')
  count++
}

console.log(`✓ Generated ${count} prerendered HTML files with per-route meta tags`)
