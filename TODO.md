# 📋 TODO — Missyuni PWA LMS

## ✅ FASE 1: Setup & Arsitektur Dasar
- [x] Inisialisasi Next.js + Tailwind CSS + TypeScript
- [x] ~~Setup database (SQLite + Prisma ORM)~~ → **Migrasi ke Supabase PostgreSQL**
- [x] ~~Setup Auth (NextAuth.js v5 + JWT)~~ → **Simple cookie-based auth**
- [x] Struktur folder & routing
- [x] Next.js 16 + proxy.ts (bukan middleware.ts)

## ✅ FASE 2: Sales Page & Landing
- [x] Hero section dengan **foto hero.png asli**
- [x] About section (keunggulan)
- [x] Katalog kelas (grid)
- [x] Testimoni section
- [x] CTA section

## ✅ FASE 3: Autentikasi & User
- [x] Register/Login Student
- [x] Role-based access (Student vs Admin)
- [x] Proxy auth proteksi route
- [x] Profil & edit profile page
- [x] Admin user `dewiflorenda@gmail.com` / `admin123`

## ✅ FASE 4: Checkout & Pembayaran
- [x] Halaman checkout
- [x] **QRIS image asli (qrisyuni.jpg)**
- [x] Upload bukti transfer
- [x] API checkout

## ✅ FASE 5: Verifikasi Admin
- [x] Antrean approval transaksi
- [x] Tombol Approve → akses kelas terbuka otomatis
- [x] Tombol Tolak

## ✅ FASE 6: Member Area / Dashboard
- [x] Dashboard "Kelas Saya"
- [x] Pemutar video YouTube (Unlisted embed)
- [x] Modul list dengan progress
- [x] Module progress tracking

## ✅ FASE 7: Kuis & Sertifikat
- [x] Kuis pilihan ganda interaktif
- [x] Auto-grading
- [x] Generator Sertifikat (HTML)

## ✅ FASE 8: Live Event, Broadcast, Profile
- [x] Halaman profile & edit
- [x] PDF viewer untuk modul (inline viewer)
- [x] Audio player (custom component)
- [x] Live event management (admin CRUD)

## ✅ FASE 9: Admin CMS Lengkap
- [x] Manajemen kursus (list + edit)
- [x] Form tambah/edit kursus
- [x] CRUD modul
- [x] CRUD kuis & soal
- [x] Manajemen konten sales page
- [x] Schedule live event
- [x] Broadcast pengumuman
- [x] Export Excel/CSV

## ✅ FASE 10: PWA & Polish
- [x] manifest.json
- [x] Service Worker (sw.js + registration)
- [x] Push Notification (web-push + API)
- [x] Offline support (cache strategies)
- [x] Install prompt (PWA banner)
- [x] Logo Missyuni (logomissyuni.png) → favicon, navbar, dashboard, hero, footer

## ✅ FASE 11: Migrasi ke Supabase
- [x] Hapus semua Prisma (schema, config, adapter, seed, generated)
- [x] Uninstall Prisma packages (prisma, @prisma/client, better-sqlite3, pg)
- [x] Uninstall next-auth
- [x] Buat Supabase client (`src/lib/supabase.ts`)
- [x] Buat SQL migration (`prisma/supabase-migration.sql`)
- [x] Rewrite `db.ts` — Supabase wrapper dengan Prisma-compatible API
- [x] Rewrite `types/index.ts` — plain TypeScript types
- [x] Update semua 29 file yang pakai Prisma → Supabase
- [x] Seed data di Supabase (admin, courses, modules, testimonials)
- [x] Fix admin password hash di Supabase
- [x] TypeScript clean — 0 errors

## ✅ FASE 12: Mobile & Responsive Fix
- [x] Hero image tampil di mobile (hapus `hidden md:flex`)
- [x] Login form rapi di mobile (tanpa icon overlap)
- [x] Eye icon toggle password (lucide-react `<Eye>` / `<EyeOff>`)
- [x] Login redirect fix (`window.location.replace` + delay)
- [x] Form state pakai variable terpisah (tidak reset saat submit)
- [x] `mounted` state — tombol disable sampai JS hydrate
- [x] `allowedDevOrigins` di next.config.ts
- [x] Keyboard type `inputMode="email"` / `inputMode="tel"`

---

## 🔲 FASE 13: Deploy ke Vercel (Next)
- [ ] Push ke GitHub
- [ ] Import ke Vercel
- [ ] Setup environment variables
- [ ] Deploy & testing

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production (Windows)
npx next build --webpack
```

### Login Admin
- **Email:** dewiflorenda@gmail.com
- **Password:** admin123

### Access dari HP
```
http://192.168.1.7:3000
```
(Pastikan HP dan laptop satu WiFi)

---

## 🗂 Struktur Proyek

```
missyuni/
├── public/
│   ├── logomissyuni.png      # Logo utama
│   ├── favicon.png           # Favicon
│   ├── hero.png              # Foto hero section
│   ├── qrisyuni.jpg          # QRIS pembayaran
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service Worker
│   ├── uploads/              # Upload bukti transfer
│   └── certificates/         # Sertifikat HTML
├── prisma/
│   └── supabase-migration.sql # SQL untuk Supabase
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing/Sales page
│   │   ├── globals.css       # Global styles
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── profile/          # Profil user
│   │   ├── dashboard/        # Member area
│   │   ├── checkout/         # Checkout page
│   │   ├── admin/            # Admin dashboard
│   │   │   ├── courses/      # CRUD Kursus & Modul
│   │   │   ├── events/       # Live Events
│   │   │   ├── announcements/# Broadcast Pengumuman
│   │   │   ├── sales-page/   # Kelola Sales Page
│   │   │   ├── students/     # Manajemen Siswa
│   │   │   └── transactions/ # Verifikasi Transaksi
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── landing/          # Sales page sections
│   │   ├── course/           # Course components
│   │   │   ├── course-player.tsx
│   │   │   ├── module-list.tsx
│   │   │   ├── pdf-viewer.tsx
│   │   │   ├── audio-player.tsx
│   │   │   ├── quiz-section.tsx
│   │   │   ├── certificate-section.tsx
│   │   │   └── checkout-form.tsx
│   │   ├── pwa/              # PWA components
│   │   │   ├── sw-register.tsx
│   │   │   ├── install-prompt.tsx
│   │   │   └── notification-permission.tsx
│   │   ├── auth/             # Auth components
│   │   ├── layout/           # Navbar, Footer
│   │   └── ui/               # UI components
│   ├── lib/
│   │   ├── db.ts             # Supabase wrapper (Prisma-compatible)
│   │   ├── supabase.ts       # Supabase client
│   │   ├── auth.ts           # Session helper
│   │   ├── simple-auth.ts    # Simple auth helper
│   │   └── utils.ts          # Utilities
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── proxy.ts              # Auth proxy (Next.js 16)
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yzkfhnhqjbpjjaplihmj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Auth
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

---

## 📝 Catatan Penting

### Database
- **Supabase PostgreSQL** (bukan SQLite/Prisma lagi)
- `db.ts` adalah wrapper yang menyediakan API mirip Prisma
- 29 file backend sudah di-migrate ke Supabase

### QRIS
- File: `public/qrisyuni.jpg`
- Ditampilkan di halaman checkout

### Logo
- File: `public/logomissyuni.png`
- Dipakai di: favicon, navbar, hero, dashboard, login, register, footer

### Mobile
- Login form sudah responsive
- Hero image tampil di mobile
- Eye icon untuk show/hide password

### Deploy ke Vercel
- Push ke GitHub → Import ke Vercel
- Tambah env vars di Vercel dashboard
- Build command: `npx next build --webpack` (karena Turbopack tidak support di Windows)
