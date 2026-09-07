# Website Kelas X TKJ / RPL / TKKR

Platform digital resmi untuk kelas X TKJ/RPL/TKKR SMK Khaidir Nur Binjai.

## Fitur

- **Roster** - Jadwal pelajaran lengkap kelas X TKJ RPL TKKR (TA 2026/2027)
- **Pembelajaran** - Materi Matematika, Agama, Sains, Informatika
- **Game** - Game edukasi + 25+ game dari Poki/CrazyGames (main langsung di website, tanpa tab baru)
- **Film** - Database film TMDB + player dengan sandbox anti-iklan/popup
- **X Website AI** - Asisten AI berbasis Google Gemini (dukung model terbaru 2.5 / 3.5 Flash Lite)
- **Kompetisi** - Quiz real-time antar siswa
- **Admin Config** - Konfigurasi API Key & model di `/admin` (password: admin123)

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Copy env
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY serta TMDB_API_KEY (opsional)

# Development
npm run dev

# Build production
npm run build
npm start
```

Buka http://localhost:3000

## Admin

- URL: /admin
- Password default: `admin123`
- Atur Gemini API Key & pilih model (termasuk Gemini 2.5 Flash Lite s/d 3.5 Flash Lite)
- Atur TMDB API Key untuk fitur Film

## Catatan

- Player film & game menggunakan iframe sandbox ketat untuk memblokir iklan popup dan tab baru.
- Welcome credit muncul saat pertama kali membuka website.
- Roster diambil dari jadwal resmi SMK Khaidir Nur Binjai TA 2026/2027.

Dibuat dengan ❤️ untuk kelas X TKJ/RPL/TKKR
