# 📋 QUICK REFERENCE - Tugas Umum LMS

> Panduan singkat untuk tugas sehari-hari.

---

## 🔐 AKUN DEFAULT

### Admin:
```
Email: admin@domain.com
Password: admin123
```

### Supabase:
```
Project URL: https://xxxxx.supabase.co
Password DB: LkQJqBvOqEodwSlX (contoh)
```

---

## 🔧 TUGAS UMUM

### Ganti Password Admin:
```sql
-- Buka SQL Editor di Supabase
UPDATE users SET password = 'password-baru' WHERE email = 'admin@domain.com';
```

### Lihat Semua User:
```sql
SELECT * FROM users;
```

### Lihat Semua Kelas:
```sql
SELECT * FROM courses;
```

### Lihat Pembelian:
```sql
SELECT e.*, u.name, u.email, c.title 
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
ORDER BY e.created_at DESC;
```

### Hapus Kelas:
```sql
-- Hapus kelas tertentu
DELETE FROM courses WHERE id = 'ID-KELAS';
```

### Reset Database:
```sql
-- HAPUS SEMUA DATA (HATI-HATI!)
TRUNCATE TABLE users, courses, modules, quizzes, quiz_questions, 
enrollments, course_progress, quiz_attempts, testimonials, 
events, announcements, sales_page_content CASCADE;
```

---

## 🚀 DEPLOY ULANG

```bash
# Jika ada perubahan code
git add .
git commit -m "Update: [jelaskan perubahan]"
git push origin main
```

Vercel otomatis deploy!

---

## 📱 CEK WEBSITE DI HP

1. Buka browser di HP
2. Ketik: `https://domain-klien.com`
3. Login admin
4. Test semua menu

---

## 💾 BACKUP DATABASE

### Manual:
1. Buka Supabase Dashboard
2. Klik **Database** (di sebelah kiri)
3. Klik **Backups**
4. Klik **Download**

### Otomatis:
- Supabase backup otomatis setiap hari
- Retensi: 7 hari (free tier)

---

## 🐛 ERROR UMUM

| Error | Solusi |
|-------|--------|
| `500 Internal Server Error` | Cek environment variables di Vercel |
| `Login gagal` | Cek tabel `users` di Supabase |
| `Logo tidak tampil` | Cek file `public/logo.png` |
| `Warna tidak berubah` | Clear cache browser (Ctrl+Shift+Delete) |
| `Redirect ke login` | Clear cache + login ulang |

---

## 📞 KONTAK

Developer: [Nama Kamu]
Email: [Email Kamu]
WhatsApp: [Nomor Kamu]

---

**Versi**: 1.0
**Terakhir diperbarui**: 25 Agustus 2026
