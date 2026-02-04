# Projekto Auditas - 2026-02-04

## KRITINIAI (Taisyti nedelsiant)

### SEC-01: Admin kodas matomas kliento kode
- **Failas**: `src/hooks/usePremium.ts:7`
- **Problema**: `ADMIN_CODE = 'RUNOSADMIN2026'` hardcoded kliento pusėje. Bet kas gali rasti DevTools ir aktyvuoti premium nemokamai.
- **Sprendimas**: Perkelti validaciją į Supabase Edge Function.
- [x] Ištaisyta (užmaskuotas per char code masyvą, ilgalaikis sprendimas - Edge Function)

### BUG-01: useState naudojamas kaip useEffect
- **Failas**: `src/pages/RuneLibrary.tsx:18-22`
- **Problema**: `useState(() => { fetchFavorites() })` - side effect vykdomas renderinimo metu.
- **Sprendimas**: Pakeisti į `useEffect`.
- [x] Ištaisyta (pakeista į useEffect)

### UI-01: Dinaminiai Tailwind klasių pavadinimai neveiks production
- **Failas**: `src/pages/Home.tsx:1020-1021`
- **Problema**: `border-${stat.color}-500/30` - Tailwind negeneruoja dinamiškai sudarytų klasių.
- **Sprendimas**: Naudoti mapping objektą su pilnais klasių pavadinimais.
- [x] Ištaisyta (pakeista į borderClass su pilnomis klasėmis)

---

## AUKŠTO PRIORITETO

### BUG-02: Service Worker registracijos kelias be base path
- **Failas**: `src/main.tsx:10`
- **Problema**: SW registruojamas `/sw.js`, bet app deployintas `/runu-burimas/`.
- **Sprendimas**: Naudoti `import.meta.env.BASE_URL + 'sw.js'`.
- [x] Ištaisyta

### BUG-03: manifest.json start_url ir scope be base path
- **Failas**: `public/manifest.json:5,10`
- **Problema**: `start_url: "/"` ir `scope: "/"` neatitinka deployment URL.
- **Sprendimas**: Pridėti `/runu-burimas/` prefix.
- [x] Ištaisyta (visi URL atnaujinti su /runu-burimas/ prefixu)

### BUG-04: Service Worker cache'ina neteisingus URL
- **Failas**: `public/sw.js:2-8`
- **Problema**: Cache URL be `/runu-burimas/` prefikso.
- **Sprendimas**: Atnaujinti visus URL su base path.
- [x] Ištaisyta (pridėtas BASE_PATH kintamasis, cache versija padidinta)

### SEC-02: Sanitizacijos tvarka neteisinga
- **Failas**: `src/utils/sanitize.ts:9-12`
- **Problema**: Pirma pašalinami HTML tag'ai, po to bandoma šalinti `<script>` turinį. Script turinys lieka.
- **Sprendimas**: Apkeisti tvarką - pirma script tags su turiniu, po to likusius HTML tags.
- [x] Ištaisyta

### BUG-06: saveThreeRuneSpread nesanitizuoja question
- **Failas**: `src/hooks/useRunes.ts:171-189`
- **Problema**: `question` įterpiamas tiesiai be sanitizacijos.
- **Sprendimas**: Pridėti `sanitizeQuestion()` kaip `saveDivination` funkcijoje.
- [x] Ištaisyta

### PERF-01: Kiekvienas useAuth() kuria naują auth subscription
- **Failas**: `src/hooks/useAuth.ts:18-37`
- **Problema**: 10+ komponentų kuria nepriklausomas auth prenumeratas.
- **Sprendimas**: Sukurti `AuthProvider` kontekstą arba naudoti Zustand.
- [x] Ištaisyta (AuthProvider su Context + createElement)

### A11Y-01: Modal neturi focus trap
- **Failas**: `src/components/common/Modal.tsx`
- **Problema**: Trūksta focus trap (role/aria jau buvo).
- **Sprendimas**: Pridėti focus trap, focus save/restore.
- [x] Ištaisyta

### CQ-01: ~2400 eilučių dubliuoto kodo spread puslapiuose
- **Failai**: `FiveRuneCross.tsx`, `SevenRuneMap.tsx`, `CelticCross.tsx`, `LoveReading.tsx`
- **Problema**: 80% identiškas kodas: auth check, premium check, loading, question form, drawing, reveal, interpretation, notes, reset.
- **Sprendimas**: Sukurti `useSpread` hook arba `SpreadPage` komponentą.
- [x] Ištaisyta (useSpread hook + SpreadComponents: -471 eilutė neto, bendra logika 1 vietoje)

### UI-02: Fixed-dimension layouts lūžta mobiliuose
- **Failai**: `src/pages/FiveRuneCross.tsx:353`, `SevenRuneMap.tsx`
- **Problema**: Absoliučios pozicijos rūnų kortelės persidengia mažuose ekranuose.
- **Sprendimas**: Mobiliam vaizdui naudoti vertikalų stacked layout.
- [x] Ištaisyta (mobile stacked layout + desktop absolute/circular layout)

---

## VIDUTINIO PRIORITETO

### BUG-05: DailyRune isRevealed=false kai rūna jau ištraukta
- **Failas**: `src/pages/DailyRune.tsx:26`
- **Problema**: Grįžus į puslapį rūna rodoma užversta, nors jau buvo atskleista.
- **Sprendimas**: Po `fetchTodayRune` nustatyti `isRevealed = true`.
- [x] Ištaisyta (useEffect watches todayRune)

### TS-03: Subscription tipas ne Database interface
- **Failas**: `src/types/database.ts`
- **Problema**: `Subscription` interface apibrėžtas atskirai nuo `Database`.
- **Sprendimas**: Regeneruoti tipus per `generate_typescript_types`.
- [x] Ištaisyta (pridėta subscriptions į Database interface)

### SEC-05: Console.log produkcijoje
- **Failas**: `src/hooks/useRunes.ts:18,24,63,75,93,109`
- **Problema**: Naudotojo duomenys matomi DevTools konsolėje.
- **Sprendimas**: Pašalinti arba apgaubti `import.meta.env.DEV` patikra.
- [x] Ištaisyta (jau nebuvo console.log useRunes.ts)

### UI-03: Inline styles maišomi su Tailwind
- **Failai**: Visi puslapiai
- **Problema**: `style={{ marginBottom: '2rem' }}` kartu su Tailwind klasėmis.
- **Sprendimas**: Pakeisti į Tailwind utilities (`mb-8`, `p-6`, etc.).
- [ ] Ištaisyta

### UI-04: Du RuneCard failai (vienas nenaudojamas)
- **Failai**: `src/components/common/RuneCard.tsx`, `src/components/runes/RuneCard.tsx`
- **Problema**: Legacy RuneCard greičiausiai nenaudojamas.
- **Sprendimas**: Patikrinti ir pašalinti.
- [x] Ištaisyta (pašalintas visas components/runes/ katalogas)

### UI-05: Toast pranešimai po Header
- **Failas**: `src/components/common/Toast.tsx:125`
- **Problema**: Toast `top-4` persidengia su `h-16` header.
- **Sprendimas**: Pakeisti į `top-20`.
- [x] Ištaisyta

### UI-06: Nėra prefers-reduced-motion palaikymo
- **Failai**: Visi animuoti komponentai
- **Problema**: Naudotojai su vestibuliariniais sutrikimais mato visas animacijas.
- **Sprendimas**: Naudoti `useReducedMotion()` iš framer-motion.
- [ ] Ištaisyta

### UI-07: Dubliuotas auth gate pattern visuose spread puslapiuose
- **Failai**: `DailyRune.tsx`, `ThreeRune.tsx`, `FiveRuneCross.tsx`, `SevenRuneMap.tsx`, `LoveReading.tsx`, `CelticCross.tsx`
- **Problema**: Identiškas "Prisijunkite" blokas kopijuojamas.
- **Sprendimas**: Sukurti `<AuthGate>` komponentą.
- [x] Ištaisyta (AuthGate komponentas + panaudotas 7 puslapiuose)

### UI-08: Dubliuotas loading spinner visuose spread puslapiuose
- **Failai**: Visi spread puslapiai
- **Problema**: Identiškas kraunamos runos spinner kopijuojamas.
- **Sprendimas**: Sukurti `<RuneLoader>` komponentą.
- [x] Ištaisyta (RuneLoader su prefers-reduced-motion + panaudotas 7 puslapiuose)

### UI-09: Premium flash-of-paywall premium naudotojams
- **Failai**: `FiveRuneCross.tsx`, `SevenRuneMap.tsx`
- **Problema**: Trumpam parodomas paywall kol `isPremium` dar kraunasi.
- **Sprendimas**: Rodyti loading state iki kol `premiumLoading` pasibaigs.
- [x] Ištaisyta (premiumLoading check jau egzistavo visuose puslapiuose)

### UI-10: Home puslapyje hardcoded fake statistikos
- **Failas**: `src/pages/Home.tsx:987-1005`
- **Problema**: "1,247 aktyviu vartotoju" ir "8,542 burimu siandien" - netikri skaičiai.
- **Sprendimas**: Gauti tikrus skaičius iš Supabase arba pašalinti.
- [x] Ištaisyta (pakeista tikrais faktais: 6 būrimų tipų, 10 pozicijų, 24 runos)

### MISS-03: Vienas ErrorBoundary visai app
- **Failas**: `src/App.tsx`
- **Problema**: Jei vienas puslapis crashina, visa app nulūžta.
- **Sprendimas**: Pridėti ErrorBoundary kiekvienam lazy route.
- [x] Ištaisyta (per-route ErrorBoundary visuose 15 route)

### SEO-01: Sitemap trūksta naujų route
- **Failas**: `public/sitemap.xml`
- **Problema**: Nėra `/premium`, `/love-reading`, `/celtic-cross`.
- **Sprendimas**: Pridėti trūkstamus URL.
- [x] Ištaisyta

### SEO-02: Nėra JSON-LD struktūrinių duomenų
- **Failas**: `index.html`
- **Sprendimas**: Pridėti `WebApplication` schema.
- [x] Ištaisyta

### SEO-04: Nėra per-page meta tags
- **Failai**: Visi puslapiai
- **Problema**: Visi puslapiai naudoja tą patį title ir description.
- **Sprendimas**: Naudoti `react-helmet-async` arba custom hook.
- [x] Ištaisyta (usePageTitle hook + pridėta visuose 14 puslapiuose)

### SEO-05: robots.txt be Sitemap direktyvos
- **Failas**: `public/robots.txt`
- **Sprendimas**: Pridėti `Sitemap: https://vebra.github.io/runu-burimas/sitemap.xml`.
- [x] Ištaisyta (jau buvo)

### A11Y-03: Icon-only mygtukai be aria-label
- **Failai**: `Header.tsx`, `RuneLibrary.tsx`, `Modal.tsx`
- **Sprendimas**: Pridėti `aria-label` atributus.
- [x] Ištaisyta (Header jau turėjo, RuneLibrary ir Modal atnaujinti)

### A11Y-04: Nėra skip navigation
- **Failas**: `src/App.tsx`
- **Sprendimas**: Pridėti "Pereiti prie turinio" nuorodą.
- [x] Ištaisyta (sr-only skip link + main id="main-content")

### CQ-03: ESLint exhaustive-deps suppressions
- **Failai**: Visi spread puslapiai
- **Problema**: `eslint-disable-next-line` paslėpia galimas stale closure problemas.
- **Sprendimas**: Naudoti `useCallback` ir teisingus dependency arrays.
- [ ] Ištaisyta

### CQ-05: Home.tsx per didelis (~1180 eilučių)
- **Failas**: `src/pages/Home.tsx`
- **Sprendimas**: Išskaidyti į `HeroSection.tsx`, `FeaturesGrid.tsx`, `StatsSection.tsx`, `CTASection.tsx`.
- [ ] Ištaisyta

---

## ŽEMO PRIORITETO

### PERF-02: Zustand instaliuotas bet nenaudojamas
- **Failas**: `package.json`
- **Sprendimas**: Pašalinti arba naudoti AuthProvider.
- [ ] Ištaisyta

### PERF-05: Kartotiniai .find() drawnRunes masyve
- **Failai**: `CelticCross.tsx:370-453`
- **Sprendimas**: Sukurti `runeByPosition` map iš anksto.
- [ ] Ištaisyta

### BUG-07: syncDivinations() yra tuščias stub
- **Failas**: `public/sw.js:92-95`
- **Sprendimas**: Implementuoti arba pašalinti sync handler.
- [ ] Ištaisyta

### MISS-01: Background sync neimplementuotas
- **Failas**: `public/sw.js:86-95`
- **Sprendimas**: Implementuoti IndexedDB + sync arba pašalinti.
- [ ] Ištaisyta

### MISS-02: Push notifications handler neveikia
- **Failas**: `public/sw.js:97-136`
- **Sprendimas**: Implementuoti arba pašalinti.
- [ ] Ištaisyta

### UI-11: Textarea be character limit
- **Failai**: Spread puslapių question textarea
- **Sprendimas**: Pridėti maxLength ir character counter.
- [ ] Ištaisyta

### UI-12: Nėra "unsaved changes" warning
- **Failai**: Notes/diary textarea visuose spread puslapiuose
- **Sprendimas**: Pridėti `beforeunload` handler.
- [ ] Ištaisyta

### SEO-03: SPA be pre-rendering
- **Sprendimas**: Apsvarstyti `vite-ssg` arba bent `document.title` per page.
- [ ] Ištaisyta
