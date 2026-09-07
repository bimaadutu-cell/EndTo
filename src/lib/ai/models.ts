/** Central AI model catalog — single source of truth */

export type AIModel = {
  id: string;
  name: string;
  description: string;
  tier: "lite" | "standard" | "pro";
  speed: "fast" | "balanced" | "deep";
  supportsVision: boolean;
  enabled: boolean;
};

export const AI_MODEL_CATALOG: AIModel[] = [
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Paling cepat & hemat",
    tier: "lite",
    speed: "fast",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Cepat & akurat (rekomendasi)",
    tier: "standard",
    speed: "balanced",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Stabil & kompatibel",
    tier: "standard",
    speed: "balanced",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    description: "Ringan & cepat",
    tier: "lite",
    speed: "fast",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite",
    description: "Model baru (jika tersedia di project)",
    tier: "lite",
    speed: "fast",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    description: "Model baru (jika tersedia di project)",
    tier: "lite",
    speed: "fast",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Model baru (jika tersedia di project)",
    tier: "standard",
    speed: "balanced",
    supportsVision: true,
    enabled: true,
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    description: "Alias model flash terbaru Google",
    tier: "standard",
    speed: "balanced",
    supportsVision: true,
    enabled: true,
  },
];

export const DEFAULT_MODEL_ID = "gemini-2.5-flash";

export function getModelById(id: string): AIModel | undefined {
  return AI_MODEL_CATALOG.find((m) => m.id === id);
}

export function getEnabledModels(): AIModel[] {
  return AI_MODEL_CATALOG.filter((m) => m.enabled);
}

export type ChatMode =
  | "default"
  | "analyze"
  | "explain"
  | "summarize"
  | "solve"
  | "check"
  | "coding"
  | "study"
  | "quiz"
  | "image"
  | "document";

export const CHAT_MODES: { id: ChatMode; label: string; prompt: string }[] = [
  {
    id: "default",
    label: "Chat",
    prompt: "",
  },
  {
    id: "analyze",
    label: "Analyze",
    prompt: `Mode ANALYZE: Analisis input user secara mendalam.
Struktur jawaban:
1. INTI MASALAH / TOPIK
2. INFORMASI PENTING (bullet)
3. POLA / KESALAHAN / KONSEP KUNCI
4. KESIMPULAN
5. REKOMENDASI & LANGKAH BERIKUTNYA
Gunakan bahasa jelas, spesifik terhadap input, hindari jawaban generik.`,
  },
  {
    id: "explain",
    label: "Explain",
    prompt: `Mode EXPLAIN: Jelaskan konsep agar siswa benar-benar paham.
Struktur:
1. Penjelasan sederhana (analogi jika membantu)
2. Konsep inti
3. Contoh konkret
4. Kesalahan umum
5. Ringkasan singkat`,
  },
  {
    id: "summarize",
    label: "Summarize",
    prompt: `Mode SUMMARIZE: Ringkas materi dengan ketat.
- Poin utama (maks 7)
- Istilah kunci
- Kesimpulan 1-2 kalimat
Jangan menambah informasi yang tidak ada di input.`,
  },
  {
    id: "solve",
    label: "Solve",
    prompt: `Mode SOLVE (analisis soal):
1. Baca & pahami pertanyaan
2. Identifikasi konsep yang diuji
3. Langkah penyelesaian step-by-step
4. Jawaban akhir
5. Pembahasan singkat mengapa jawaban itu benar
Prioritaskan pemahaman siswa, bukan hanya jawaban.`,
  },
  {
    id: "check",
    label: "Check",
    prompt: `Mode CHECK: Periksa pekerjaan / jawaban / kode user.
Tampilkan:
- Yang sudah benar
- Yang salah / kurang
- Alasan
- Saran perbaikan
Bersikap tegas tapi membangun.`,
  },
  {
    id: "coding",
    label: "Coding",
    prompt: `Mode CODING: Analisis & bantu kode (HTML, CSS, JS, Python, SQL, Node).
Format jika ada masalah:
MASALAH:
PENYEBAB:
PERBAIKAN:
CONTOH KODE:
Jelaskan logika, potensi bug, dan praktik yang lebih baik. Jangan sarankan kode berbahaya.`,
  },
  {
    id: "study",
    label: "Study",
    prompt: `Mode STUDY / BELAJAR: Bantu pelajari materi secara bertahap.
- Mulai dari dasar
- Beri contoh praktis untuk siswa SMK (TKJ/RPL)
- Ajukan pertanyaan cek pemahaman di akhir
Bahasa Indonesia yang mudah dipahami.`,
  },
  {
    id: "quiz",
    label: "Quiz",
    prompt: `Mode QUIZ: Buat soal pilihan ganda berdasarkan materi user.
Jangan langsung berikan kunci jawaban.
Tunggu user menjawab, lalu nilai dan bahas.`,
  },
  {
    id: "image",
    label: "Image",
    prompt: `Mode IMAGE ANALYSIS: Analisis gambar yang diunggah.
- Baca teks yang terlihat (OCR jika ada)
- Jelaskan objek / diagram / screenshot
- Jawab pertanyaan user berdasarkan gambar
Jika tidak ada gambar, minta user unggah.`,
  },
  {
    id: "document",
    label: "Document",
    prompt: `Mode DOCUMENT: Analisis / ringkas dokumen atau teks panjang.
- Ringkasan
- Poin penting
- Jawab pertanyaan berdasarkan isi dokumen
Hormati batas konteks.`,
  },
];

export const SYSTEM_INSTRUCTION = `Kamu adalah X Website AI, asisten pembelajaran resmi website kelas X TKJ/RPL/TKKR SMK.
Jawab dalam Bahasa Indonesia yang jelas, ramah, dan edukatif.
Fokus membantu siswa dan guru belajar (informatika, jaringan, programming, sekolah).
Analisis input secara nyata — jangan jawab generik.
Jika input berupa soal, prioritaskan pemahaman konsep.
Jika input berupa kode, analisis error, struktur, dan perbaikan.
Jika model mendukung gambar dan user mengirim gambar, analisis isinya.
Jika tidak tahu, katakan jujur. Jangan mengarang fakta.
Jangan mengaku sebagai manusia. Jangan membantu mencontek ujian secara tidak jujur.`;
