# Website Kelas X TKJ / RPL / TKKR

Platform digital kelas X TKJ/RPL/TKKR SMK Khaidir Nur Binjai.

## Upgrade yang diterapkan

- **Global Configuration**: admin menyimpan Gemini, TMDB, model AI, musik, dan metadata ke konfigurasi server. Endpoint publik hanya mengembalikan status/model/metadata aman; secret tidak disimpan di localStorage, cookie, bundle, atau URL.
- **Verifikasi saat save**: konfigurasi Gemini diuji ke provider sebelum aktif; TMDB juga diverifikasi jika key diisi.
- **X Website AI**: mode Ask AI, Analyze, Explain, Summarize, Solve, Check, Coding, Study, Quiz, Image, dan Document. Input gambar/dokumen dibatasi ukuran dan ditolak jika capability model tidak sesuai.
- **Kompetisi auto-next**: jawaban disimpan server-side, idempotent per peserta/soal, lalu server langsung mengembalikan soal berikutnya. Timeout otomatis diproses saat state diambil kembali. Progress tiap peserta tidak lagi bergantung pada tombol NEXT guru.
- **No stale state**: endpoint kompetisi menggunakan `Cache-Control: no-store`; refresh/reconnect memulihkan progress dari state server.

## Menjalankan

```bash
npm install
cp .env.example .env
# Isi secret server dan password admin
npm run dev
npm run build
npm start
```

## Production persistence

Arsip asal tidak memiliki driver database atau schema persistence. Implementasi ini menyediakan adapter file server-side melalui `GLOBAL_CONFIG_FILE` dan `COMPETITION_STORE_FILE`, dengan atomic write dan permission `0600`. Pada Vercel/serverless, filesystem instance tidak durable; untuk production multi-instance, arahkan kedua variabel tersebut ke adapter database/volume durable yang tersedia di deployment Anda sebelum mengklaim realtime lintas instance. Jangan mengaktifkan konfigurasi publik dengan state kompetisi hanya di memory.

## Admin

- URL: `/admin`
- Password: `ADMIN_PASSWORD` (fallback development: `admin123`; wajib diganti di production)
- Secret baru hanya dikirim melalui POST admin dan tidak pernah dikembalikan oleh GET.

## Fitur lama

Roster, pembelajaran, game, film, halaman kelas, teacher login, dan navigasi publik tetap dipertahankan. Film mengambil metadata melalui server menggunakan TMDB global. Musik publik mematuhi kebijakan autoplay browser dan tetap menyediakan kontrol mute/unmute.
