# 🔮 Runų Būrimas - Elder Futhark Runų Aplikacija

Lietuviška runų būrimo aplikacija su kasdienėmis runomis, trijų runų išdėstymu, runų biblioteka ir teksto konverteriu.

## ✨ Funkcijos

- **Kasdienė Runa** - Traukite vieną runą per dieną ir užrašykite savo refleksiją
- **Trijų Runų Būrimas** - Praeitis, Dabartis, Ateitis išdėstymas
- **Runų Biblioteka** - Visos 24 Elder Futhark runos su interpretacijomis
- **Runų Konverteris** - Paverskite tekstą runomis (palaiko lietuviškas raides)
- **Vartotojo Profilis** - Statistika ir būrimų istorija

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4
- **Animacijos:** Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth)
- **Icons:** Lucide React

## 🚀 Pradžia

### 1. Klonuokite projektą

```bash
git clone <repository-url>
cd rune-app
npm install
```

### 2. Sukurkite Supabase projektą

1. Eikite į [supabase.com](https://supabase.com) ir sukurkite naują projektą
2. Nukopijuokite `Project URL` ir `anon public` raktą

### 3. Sukonfigūruokite aplinkos kintamuosius

Redaguokite `.env.local` failą:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Įkelkite duomenų bazės schemą

Supabase Dashboard → SQL Editor → New Query → Įklijuokite `supabase/schema.sql` turinį ir paleiskite.

### 5. Paleiskite aplikaciją

```bash
npm run dev
```

Aplikacija bus pasiekiama: http://localhost:5173

## 📁 Projekto Struktūra

```
src/
├── components/
│   ├── auth/          # Prisijungimo/registracijos formos
│   ├── common/        # Bendri komponentai (Button, Modal)
│   ├── layout/        # Header, Footer
│   └── runes/         # RuneCard, RuneGrid
├── hooks/
│   ├── useAuth.ts     # Autentifikacijos hook
│   └── useRunes.ts    # Runų duomenų hooks
├── lib/
│   └── supabase.ts    # Supabase klientas
├── pages/             # Visi puslapiai
├── types/             # TypeScript tipai
└── utils/             # Pagalbinės funkcijos
```

## 🎨 Dizaino Sistema

- **Primary:** `#8B5CF6` (Purple)
- **Secondary:** `#EC4899` (Pink)  
- **Accent:** `#F59E0B` (Amber)
- **Šriftai:** Cinzel (antraštės), Inter (tekstas)

## 🚀 Deployment

```bash
npm run build
vercel deploy
```

## 📄 Licencija

MIT
