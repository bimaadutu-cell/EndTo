export type AIModel = { id: string; name: string; description: string; tier: "lite" | "standard" | "pro"; speed: "fast" | "balanced" | "deep"; supportsVision: boolean; supportsFiles: boolean; enabled: boolean };
export const AI_MODEL_CATALOG: AIModel[] = [
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", description: "Cepat & hemat", tier: "lite", speed: "fast", supportsVision: true, supportsFiles: true, enabled: true },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Cepat & akurat", tier: "standard", speed: "balanced", supportsVision: true, supportsFiles: true, enabled: true },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Stabil & kompatibel", tier: "standard", speed: "balanced", supportsVision: true, supportsFiles: true, enabled: true },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", description: "Ringan & cepat", tier: "lite", speed: "fast", supportsVision: true, supportsFiles: true, enabled: true },
  { id: "gemini-flash-latest", name: "Gemini Flash Latest", description: "Alias flash terbaru", tier: "standard", speed: "balanced", supportsVision: true, supportsFiles: true, enabled: true },
];
export const DEFAULT_MODEL_ID = "gemini-2.5-flash";
export function getModelById(id: string) { return AI_MODEL_CATALOG.find((m) => m.id === id); }
export function getEnabledModels() { return AI_MODEL_CATALOG.filter((m) => m.enabled); }
export type ChatMode = "default" | "analyze" | "explain" | "summarize" | "solve" | "check" | "coding" | "study" | "quiz" | "image" | "document";
export const CHAT_MODES: { id: ChatMode; label: string; prompt: string }[] = [
  { id: "default", label: "Ask AI", prompt: "Jawab dengan konteks input yang diberikan dan akui jika informasi kurang." },
  { id: "analyze", label: "Analyze", prompt: "Analisis inti masalah, informasi penting, kesalahan, pola, kesimpulan, rekomendasi, dan langkah berikutnya." },
  { id: "explain", label: "Explain", prompt: "Jelaskan bertahap dari konsep dasar, analogi, contoh, hingga rangkuman." },
  { id: "summarize", label: "Summarize", prompt: "Ringkas materi menjadi poin utama, istilah kunci, dan kesimpulan tanpa menghilangkan konteks." },
  { id: "solve", label: "Solve", prompt: "Identifikasi konsep soal, uraikan langkah penyelesaian, jawaban, dan pembahasan edukatif." },
  { id: "check", label: "Check", prompt: "Periksa fakta, logika, struktur, dan kesalahan; berikan MASALAH, PENYEBAB, PERBAIKAN, dan CONTOH." },
  { id: "coding", label: "Coding", prompt: "Audit syntax, logic, error, struktur, performance, potensi bug; berikan MASALAH, PENYEBAB, PERBAIKAN, CONTOH." },
  { id: "study", label: "Study", prompt: "Bertindak sebagai tutor: ajukan pertanyaan pemahaman dan bantu siswa membangun konsep." },
  { id: "quiz", label: "Quiz", prompt: "Buat atau nilai kuis berdasarkan materi; jangan langsung membocorkan jawaban sebelum siswa mencoba." },
  { id: "image", label: "Image", prompt: "Analisis gambar, teks yang terlihat, objek, dan informasi relevan dengan hati-hati." },
  { id: "document", label: "Document", prompt: "Analisis dokumen, cari informasi, ringkas, dan jawab pertanyaan hanya berdasarkan dokumen." },
];
export const SYSTEM_INSTRUCTION = `Kamu adalah X Website AI, asisten pembelajaran resmi website kelas X TKJ/RPL/TKKR. Jawab dalam Bahasa Indonesia yang jelas, ramah, dan edukatif. Gunakan konteks input sebenarnya. Jangan mengarang fakta. Untuk materi pendidikan prioritaskan pemahaman konsep dan jangan membantu kecurangan ujian.`;
