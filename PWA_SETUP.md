# 📱 PWA Setup Instrukcijos

## ✅ Kas Jau Padaryta:

- ✅ `manifest.json` - PWA konfigūracija
- ✅ `sw.js` - Service Worker (offline support)
- ✅ PWA meta tags `index.html`
- ✅ Service Worker registracija `main.tsx`
- ✅ `browserconfig.xml` - Microsoft Tiles

---

## 🎨 Ikonų Generavimas

PWA reikia ikonų įvairių dydžių. Galite naudoti vieną iš šių metodų:

### **Metodas 1: Online Generatorius (Greičiausias)**

1. Eikite į [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Įkelkite savo logo (rekomenduojamas dydis: 512x512px)
3. Pasirinkite spalvą: `#8B5CF6` (purple)
4. Atsisiųskite visus sugeneruotus failus
5. Įdėkite į `public/icons/` folderį

### **Metodas 2: ImageMagick (Command Line)**

Jei turite ImageMagick įdiegtą:

```bash
# Sukurkite public/icons/ folderį
mkdir -p public/icons

# Generuokite ikonas iš source failo (pvz., logo.png)
convert logo.png -resize 72x72 public/icons/icon-72x72.png
convert logo.png -resize 96x96 public/icons/icon-96x96.png
convert logo.png -resize 128x128 public/icons/icon-128x128.png
convert logo.png -resize 144x144 public/icons/icon-144x144.png
convert logo.png -resize 152x152 public/icons/icon-152x152.png
convert logo.png -resize 192x192 public/icons/icon-192x192.png
convert logo.png -resize 384x384 public/icons/icon-384x384.png
convert logo.png -resize 512x512 public/icons/icon-512x512.png
```

### **Metodas 3: Laikinai Naudoti Emoji**

Kol neturite tikrų ikonų, galite naudoti emoji:

1. Eikite į [Emoji to PNG](https://emoji.gg/)
2. Atsisiųskite 🔮 emoji kaip PNG
3. Pervadinkite ir įdėkite į `public/icons/`

---

## 📸 Screenshots (Pasirenkama)

Sukurkite `public/screenshots/` folderį ir pridėkite:
- `screenshot-1.png` (1280x720px) - desktop view
- `screenshot-2.png` (750x1334px) - mobile view

---

## 🧪 PWA Testavimas

### **1. Local Testavimas**

```bash
# Build production versija
npm run build

# Serve su http-server arba vite preview
npm run preview
```

### **2. Chrome DevTools**

1. Atidarykite Chrome DevTools (F12)
2. Eikite į **Application** tab
3. Kairėje pusėje:
   - **Manifest** - patikrinkite ar manifest.json veikia
   - **Service Workers** - patikrinkite ar SW registruotas
   - **Cache Storage** - patikrinkite ar failai cache'inami

### **3. Lighthouse Audit**

1. Chrome DevTools → **Lighthouse** tab
2. Pasirinkite **Progressive Web App**
3. Paspauskite **Generate report**
4. Tikslas: **90+ score**

### **4. Mobile Testavimas**

**Android:**
1. Atidarykite Chrome mobile
2. Eikite į jūsų app URL
3. Chrome meniu → **Add to Home screen**
4. Patikrinkite ar app atsidaro standalone mode

**iOS:**
1. Atidarykite Safari
2. Eikite į jūsų app URL
3. Share mygtukas → **Add to Home Screen**
4. Patikrinkite ar app atsidaro

### **5. Offline Testavimas**

1. Atidarykite app
2. Chrome DevTools → **Network** tab
3. Pasirinkite **Offline**
4. Refresh puslapį
5. App turėtų veikti offline!

---

## 🚀 Deployment su PWA

### **Vercel**

```bash
# Vercel automatiškai aptiks PWA
npm run build
vercel --prod
```

### **Netlify**

```bash
# Netlify automatiškai aptiks PWA
npm run build
netlify deploy --prod
```

### **Custom Headers (Pasirenkama)**

Sukurkite `public/_headers` failą:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/sw.js
  Cache-Control: public, max-age=0, must-revalidate
  Service-Worker-Allowed: /

/manifest.json
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=0, must-revalidate
```

---

## 📊 PWA Features Checklist

- ✅ **Manifest.json** - App metadata
- ✅ **Service Worker** - Offline support
- ✅ **HTTPS** - Required for PWA (Vercel/Netlify auto)
- ✅ **Responsive Design** - Works on all devices
- ✅ **Fast Load** - Code splitting implemented
- ⏳ **Icons** - Reikia sugeneruoti
- ⏳ **Screenshots** - Pasirenkama
- ✅ **Theme Color** - #8B5CF6
- ✅ **Apple Touch Icons** - iOS support
- ✅ **Microsoft Tiles** - Windows support

---

## 🔧 Troubleshooting

### **Service Worker Neregistruojasi**

```javascript
// Patikrinkite console:
// main.tsx turėtų parodyti: "SW registered"
```

### **Manifest Neveikia**

1. Patikrinkite ar `manifest.json` yra `public/` folderyje
2. Patikrinkite ar `<link rel="manifest">` yra `index.html`
3. Patikrinkite Chrome DevTools → Application → Manifest

### **Ikonos Nerodomos**

1. Patikrinkite ar ikonos yra `public/icons/` folderyje
2. Patikrinkite ar failų pavadinimai atitinka `manifest.json`
3. Clear cache ir refresh

### **Offline Neveikia**

1. Patikrinkite ar Service Worker registruotas
2. Patikrinkite Cache Storage DevTools
3. Patikrinkite ar `sw.js` yra `public/` folderyje

---

## 🎯 Next Steps

1. **Sugeneruokite ikonas** - naudokite vieną iš metodų aukščiau
2. **Testuokite locally** - `npm run preview`
3. **Lighthouse audit** - patikrinkite PWA score
4. **Deploy** - Vercel arba Netlify
5. **Testuokite mobile** - Add to Home Screen

---

## 📚 Papildomi Resursai

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)

---

**Sėkmės su PWA! 🚀**
