# 🚀 SETUP GUIDE - White-Label LMS Template

> Panduan lengkap untuk membuat LMS baru dari template missyuni.
> Dibuat agar tidak perlu kerja panjang lagi.

---

## 📋 CHECKLIST PER KLIE N BARU

```
□ 1. Buat folder project baru
□ 2. Buat akun Supabase baru
□ 3. Setup database di Supabase
□ 4. Edit template.config.ts
□ 5. Ganti logo & favicon
□ 6. Deploy ke Vercel
□ 7. Setup domain (opsional)
□ 8. Test login admin
□ 9. Test dashboard siswa
□ 10. Serahkan ke klien
```

---

## 1️⃣ BUAT FOLDER PROJECT

```bash
# Copy project missyuni
cp -r missyuni nama-klien-baru

# Masuk ke folder
cd nama-klien-baru

# Hapus folder .git (mulai fresh)
rm -rf .git

# Install dependencies
npm install
```

---

## 2️⃣ BUAT AKUN SUPABASE BARU

### Langkah:
1. Buka **https://supabase.com**
2. Login / buat akun baru
3. Klik **"New Project"**
4. Isi:
   - **Organization**: Pilih atau buat baru
   - **Project name**: nama-klien (contoh: `masak-nusantara`)
   - **Database password**: Simpan! (contoh: `LkQJqBvOqEodwSlX`)
   - **Region**: Pilih terdekat (Singapore / Jakarta)
5. Klik **"Create new project"**
6. Tunggu 1-2 menit sampai selesai

### Setelah Selesai:
1. Buka **Settings → API**
2. Catat:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`
   - **service_role secret**: `eyJhbG...`

3. Buka **Settings → Database**
4. Catat:
   - **Connection string**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

---

## 3️⃣ SETUP DATABASE

### Buka SQL Editor di Supabase:
1. Klik menu **"SQL Editor"** (di sebelah kiri)
2. Klik **"New query"**
3. Copy-paste semua SQL di bawah ini
4. Klik **"Run"** (tombol biru)

```sql
-- ============================================
-- LMS DATABASE SCHEMA
-- ============================================

-- Tabel Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Courses (Kelas)
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Modules (Modul dalam kelas)
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Quizzes (Kuis)
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Quiz Questions (Pertanyaan Kuis)
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Tabel Enrollments (Pembelian Kelas)
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_method TEXT,
  payment_proof TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Tabel Course Progress (Progress Siswa)
CREATE TABLE course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, module_id)
);

-- Tabel Quiz Attempts (Percobaan Kuis)
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Testimonials (Testimoni)
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Events (Event)
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Announcements (Pengumuman/Broadcast)
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Sales Page Content (Konten Halaman Depan)
CREATE TABLE sales_page_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Admin default
INSERT INTO users (email, name, password, role) VALUES
('admin@domain.com', 'Admin', 'admin123', 'admin');

-- Konten default sales page
INSERT INTO sales_page_content (id, content) VALUES
('hero', '{"title": "Selamat Datang", "tagline": "Belajar Tanpa Batas", "badge": "Platform E-Learning #1", "imageUrl": ""}'),
('about', '{"title": "Tentang Kami", "subtitle": "Kenapa harus belajar di sini?", "features": []}'),
('courses', '{"title": "Katalog Kelas", "subtitle": "Pilih kelas yang sesuai"}'),
('testimonials', '{"title": "Testimoni Siswa", "subtitle": "Apa kata mereka?"}'),
('cta', '{"title": "Siap Belajar?", "subtitle": "Daftar sekarang dan mulai belajar!", "badge": "Mulai Sekarang"}'),
('footer', '{"brandDescription": "Platform e-learning terpercaya", "email": "info@domain.com", "phone": "+62812xxxx", "address": "Indonesia"}');

-- ============================================
-- SELESAI! Database siap digunakan.
-- ============================================
```

---

## 4️⃣ EDIT TEMPLATE CONFIG

Buka file `template.config.ts` dan ganti isinya:

```typescript
export const config = {
  // ===== BRAND =====
  brand: {
    name: "Nama Klien",                    // GANTI: Nama bisnis klien
    tagline: "Tagline keren",              // GANTI: Tagline
    logo: "/logo.png",                     // JANGAN DIUBAH (file logo di public/)
    favicon: "/favicon.ico",              // JANGAN DIUBAH
  },

  // ===== WARNA =====
  theme: {
    primaryColor: "#3B82F6",              // GANTI: Warna utama (biru)
    secondaryColor: "#1E40AF",            // GANTI: Warna kedua
    backgroundColor: "#F8FAFC",           // GANTI: Warna latar
    textColor: "#1E293B",                // GANTI: Warna teks
  },

  // ===== DOMAIN =====
  domain: "domain-klien.com",            // GANTI: Domain klien

  // ===== DATABASE =====
  supabase: {
    url: "https://xxxxx.supabase.co",     // GANTI: dari Supabase
    anonKey: "eyJhbG...",                 // GANTI: dari Supabase
    serviceRoleKey: "eyJhbG...",          // GANTI: dari Supabase
  },

  // ===== FITUR =====
  features: {
    quiz: true,
    certificate: true,
    events: true,
    testimonials: true,
    checkout: true,
    announcement: true,
  },

  // ===== KONTAK =====
  contact: {
    email: "info@domain-klien.com",       // GANTI: Email klien
    phone: "+62812xxxx",                 // GANTI: Telepon klien
    address: "Alamat klien",             // GANTI: Alamat klien
    whatsapp: "62812xxxx",              // GANTI: WhatsApp klien
  },
};
```

---

## 5️⃣ GANTI LOGO & FAVICON

### Logo:
1. Siapkan file logo klien (format PNG, ukuran 512x512px)
2. Rename menjadi `logo.png`
3. Copy ke folder `public/logo.png`

### Favicon:
1. Siapkan file favicon (format ICO atau PNG, ukuran 32x32px)
2. Rename menjadi `favicon.ico`
3. Copy ke folder `public/favicon.ico`

### QRIS (untuk pembayaran):
1. Siapkan file QRIS klien (format JPG)
2. Rename menjadi `qris.jpg`
3. Copy ke folder `public/qris.jpg`

---

## 6️⃣ DEPLOY KE VERCEL

### Langkah 1: Buat Akun Vercel
1. Buka **https://vercel.com**
2. Login dengan GitHub
3. Klik **"New Project"**
4. Import repository GitHub
5. Klik **"Deploy"**

### Langkah 2: Setup Environment Variables
Di Vercel Dashboard → Project → Settings → Environment Variables, tambahkan:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...
SUPABASE_SERVICE_ROLE_KEY = eyJhbG...
```

### Langkah 3: Deploy
```bash
# Inisialisasi git baru
git init
git add .
git commit -m "Initial commit"

# Push ke GitHub
git remote add origin https://github.com/username/nama-klien.git
git push -u origin main
```

Vercel otomatis build dan deploy!

---

## 7️⃣ SETUP DOMAIN (OPSIONAL)

### Jika Punya Domain Sendiri:
1. Buka Vercel Dashboard → Project → Settings → Domains
2. Tambah domain (contoh: `masaknusantara.com`)
3. Ikuti instruksi DNS dari Vercel
4. Tunggu 1-2 menit sampai aktif

### Jika Pakai Domain Vercel:
- Otomatis dapat: `nama-klien.vercel.app`

---

## 8️⃣ TEST LOGIN ADMIN

### Buka website yang sudah di-deploy, lalu:
1. Buka `/login`
2. Login dengan:
   - **Email**: admin@domain.com
   - **Password**: admin123
3. Buka `/admin`
4. Pastikan semua menu bisa diakses

### Ganti Password Admin:
Buka SQL Editor di Supabase, jalankan:
```sql
UPDATE users SET password = 'password-baru' WHERE email = 'admin@domain.com';
```

---

## 9️⃣ TEST DASHBOARD SISWA

### Buat Akun Siswa Baru:
1. Buka `/register`
2. Isi:
   - **Nama**: Siswa Test
   - **Email**: siswa@test.com
   - **Password**: siswa123
3. Login
4. Pastikan dashboard bisa diakses

### Beli Kelas (Testing):
1. Login sebagai siswa
2. Buka halaman depan
3. Klik "Beli" pada salah satu kelas
4. Upload bukti pembayaran (bisa pakai gambar random)
5. Login admin → approve pembayaran
6. Cek dashboard siswa → kelas sudah muncul

---

## 🔟 SERAHKAN KE KLIE N

### Checklist Serah Terima:
```
□ Website bisa diakses
□ Admin bisa login
□ Siswa bisa register & login
□ Kelas bisa dibuat
□ Pembayaran bisa diapprove
□ Testimoni bisa ditambah
□ Event bisa dibuat
□ Broadcast bisa dikirim
□ Logo sudah benar
□ Warna sudah benar
□ Kontak sudah benar
```

### Kirim ke Klien:
```
Domain: https://domain-klien.com
Login Admin: admin@domain.com / password-baru

Catatan:
- Ganti password admin setelah serah terima
- Simpan password Supabase di tempat aman
- Hubungi developer jika ada masalah
```

---

## 🛠️ TROUBLESHOOTING

### Masalah: Website error 500
**Solusi:** Cek environment variables di Vercel

### Masalah: Login gagal
**Solusi:** Cek database Supabase, pastikan tabel `users` ada

### Masalah: Pembayaran tidak muncul di admin
**Solusi:** Cek tabel `enrollments` di Supabase

### Masalah: Logo tidak tampil
**Solusi:** Pastikan file ada di `public/logo.png`

### Masalah: Warna tidak berubah
**Solusi:** Clear cache browser (Ctrl+Shift+Delete)

---

## 📝 CATATAN PENTING

### Backup Database:
- Supabase otomatis backup harian
- Manual backup: Buka Database → Backups → Download

### Update Code:
```bash
# Jika ada update dari template missyuni
git remote add template https://github.com/username/missyuni-template.git
git fetch template
git merge template/main
```

### Batas Supabase Free Tier:
- **500MB database**
- **1GB file storage**
- **50,000 monthly active users**
- **2 project gratis**

---

## 📞 KONTAK DEVELOPER

Jika ada masalah, hubungi:
- **Developer**: [Nama Kamu]
- **Email**: [Email Kamu]
- **WhatsApp**: [Nomor Kamu]

---

**Terakhir diperbarui**: 25 Agustus 2026
**Versi Template**: 1.0 (missyuni)
