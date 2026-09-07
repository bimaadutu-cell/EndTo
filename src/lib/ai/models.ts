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
  | "belajar"
  | "jelaskan"
  | "quiz"
  | "coding"
  | "ringkas";

export const CHAT_MODES: { id: ChatMode; label: string; prompt: string }[] = [
  {
    id: "default",
    label: "Chat",
    prompt: "",
  },
  {
    id: "belajar",
    label: "Belajar",
    prompt:
      "Mode BELAJAR: Jelaskan materi secara bertahap, sederhana, dengan contoh praktis untuk siswa SMK. Gunakan bahasa Indonesia yang mudah dipahami.",
  },
  {
    id: "jelaskan",
    label: "Jelaskan",
    prompt:
      "Mode JELASKAN: Berikan (1) penjelasan sederhana, (2) contoh konkret, (3) poin penting, (4) kesimpulan singkat.",
  },
  {
    id: "quiz",
    label: "Quiz",
    prompt:
      "Mode QUIZ: Buat soal pilihan ganda berdasarkan materi user. Jangan langsung beri jawaban. Tunggu user menjawab, lalu nilai dan bahas.",
  },
  {
    id: "coding",
    label: "Coding",
    prompt:
      "Mode CODING: Bantu sebagai asisten coding (HTML, CSS, JS, Python, SQL). Jelaskan error, berikan contoh kode bersih, jangan jalankan kode berbahaya.",
  },
  {
    id: "ringkas",
    label: "Ringkas",
    prompt:
      "Mode RINGKAS: Buat ringkasan poin penting, istilah kunci, dan kesimpulan dari materi yang diberikan user.",
  },
];

export const SYSTEM_INSTRUCTION = `Kamu adalah X Website AI, asisten pembelajaran resmi website kelas X TKJ/RPL/TKKR.
Jawab dalam Bahasa Indonesia yang jelas, ramah, dan edukatif.
Fokus membantu siswa dan guru belajar (informatika, jaringan, programming, sekolah).
Jika tidak tahu, katakan jujur. Jangan mengarang fakta.
Jangan mengaku sebagai manusia. Jangan membantu mencontek ujian secara tidak jujur.`;
