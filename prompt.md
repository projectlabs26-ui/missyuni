# RANCANGAN PLATFORM LMS - MISSYUNI.MY.ID

## 1. Konsep & Arsitektur Utama
- **Nama Platform / Domain:** missyuni.my.id
- **Target Audiens:** Siswa SMA/SMK sederajat dan pembelajar umum Bahasa Inggris.
- **Bentuk Aplikasi:** **Progressive Web App (PWA)** — Dapat di-install langsung ke Layar Utama HP (*Add to Home Screen*) tanpa Play Store/App Store.
- **Gaya Tampilan (Hybrid):**
  - **Halaman Depan:** Sales Page persuasif ala *Lynk.id* (Profil Miss Yuni, keunggulan, katalog kelas, testimoni).
  - **Member Area:** Platform E-Course lengkap ala *Udemy* (Video player, modul PDF, kuis, & sertifikat otomatis).

---

## 2. Alur Kerja Pengguna (User Journey)
1. **Sales Page (`missyuni.my.id`):** Pengunjung membaca profil Miss Yuni, keunggulan, dan memilih kelas.
2. **Checkout & Pendaftaran:** Pengguna mengisi data singkat (Nama, WA, Email), melakukan scan QRIS DANA Statis, dan mengunggah foto bukti transfer.
3. **Verifikasi Admin:** Admin mengecek mutasi DANA lalu menekan tombol `Approve` untuk membuka akses kelas secara otomatis.
4. **Member Area PWA:** Peserta menonton materi video (YouTube Unlisted), membaca modul PDF, dan mengerjakan audio/latihan listening.
5. **Kuis & Sertifikat Otomatis:** Setelah lulus kuis dan progres mencapai 100%, sistem menerbitkan tombol unduh **Sertifikat Digital (PDF)**.
6. **Repeat Purchase (Cross-Selling):** Peserta dapat membeli kelas berikutnya dengan cepat tanpa pendaftaran akun ulang.

---

## 3. Rincian Fitur Utama

### A. Sisi Student (Peserta)
- **Sales Page & Katalog:** Landing page penawaran lengkap di halaman utama.
- **PWA Capabilities:** Aplikasi ringan di HP, dapat di-install, serta mendukung *Push Notification*.
- **Dashboard Kelas Saya:** Area terpusat untuk mengakses seluruh kelas yang telah dibeli.
- **Materi Pembelajaran:** Embed Pemutar Video YouTube (*Unlisted*), PDF Viewer untuk modul, dan Audio Player.
- **Evaluasi & Sertifikat:** Kuis pilihan ganda interaktif & generator sertifikat otomatis setelah lulus.
- **Fitur Live Event:** Informasi jadwal dan tombol direct join ke **Zoom / Google Meet**.
- **Profil & Riwayat:** Menu edit nama, nomor WhatsApp, password, serta riwayat transaksi.

### B. Sisi Admin (Miss Yuni / Pengelola)
- **CMS Kursus & Modul:** Manajemen judul kelas, deskripsi, harga, link video YT Unlisted, PDF, dan kuis.
- **Manajemen konten sales page:** foto, teks, dan lain lain yang ada di sales page.
- **Verifikasi Pembayaran:** Antrean approval transaksi QRIS DANA manual.
- **Manajemen Student:** Monitoring daftar siswa, persentase progress belajar, nilai kuis, dan akses manual (*override*).
- **Schedule & Broadcast:** Pengaturan jadwal Live Zoom/GMeet dan fitur pengumuman (*feed update*).
- **Analitik & Laporan Keuangan:** Ringkasan omzet, statistik kelas terlaris, serta **Export Laporan ke Excel/CSV**.

---

## 4. Tech Stack & Infrastruktur
- **Frontend / PWA:** Next.js / Vue.js + Tailwind CSS (Mobile-First Layout).
- **Video Hosting:** YouTube Unlisted (Gratis, tanpa beban storage/bandwidth server).
- **Sistem Pembayaran:** Static QRIS DANA + Upload Bukti Transfer + Approval Admin.