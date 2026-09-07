import type { Question } from "./competition-store";

export const QUESTION_BANK: Record<string, Question[]> = {
  informatika: [
    {
      id: "inf1",
      question: "Kepanjangan dari CPU adalah...",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Processing Unit"],
      correctIndex: 0,
      explanation: "CPU = Central Processing Unit, otak dari komputer.",
    },
    {
      id: "inf2",
      question: "HTML adalah singkatan dari...",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
      correctIndex: 0,
      explanation: "HTML = Hyper Text Markup Language.",
    },
    {
      id: "inf3",
      question: "Perangkat input berikut adalah...",
      options: ["Monitor", "Printer", "Keyboard", "Speaker"],
      correctIndex: 2,
      explanation: "Keyboard adalah perangkat input.",
    },
    {
      id: "inf4",
      question: "RAM termasuk jenis memori...",
      options: ["Permanen", "Volatile (sementara)", "Ekternal", "ROM"],
      correctIndex: 1,
      explanation: "RAM bersifat volatile, data hilang saat listrik mati.",
    },
    {
      id: "inf5",
      question: "Sistem operasi open source yang populer adalah...",
      options: ["Windows", "macOS", "Linux", "DOS"],
      correctIndex: 2,
      explanation: "Linux adalah sistem operasi open source.",
    },
    {
      id: "inf6",
      question: "Protokol untuk transfer file di internet adalah...",
      options: ["HTTP", "FTP", "SMTP", "DNS"],
      correctIndex: 1,
      explanation: "FTP = File Transfer Protocol.",
    },
    {
      id: "inf7",
      question: "Bahasa pemrograman untuk membuat website dinamis di sisi server adalah...",
      options: ["HTML", "CSS", "PHP", "Photoshop"],
      correctIndex: 2,
      explanation: "PHP adalah bahasa server-side.",
    },
    {
      id: "inf8",
      question: "1 Byte = ... bit",
      options: ["4", "8", "16", "32"],
      correctIndex: 1,
      explanation: "1 Byte = 8 bit.",
    },
    {
      id: "inf9",
      question: "IP Address versi 4 terdiri dari berapa oktet?",
      options: ["2", "3", "4", "6"],
      correctIndex: 2,
      explanation: "IPv4 terdiri dari 4 oktet (contoh: 192.168.1.1).",
    },
    {
      id: "inf10",
      question: "Software yang berfungsi melindungi komputer dari virus disebut...",
      options: ["Browser", "Antivirus", "Spreadsheet", "Word Processor"],
      correctIndex: 1,
      explanation: "Antivirus melindungi dari malware/virus.",
    },
  ],
  matematika: [
    {
      id: "mat1",
      question: "Hasil dari 15 + 28 adalah...",
      options: ["33", "43", "53", "63"],
      correctIndex: 1,
      explanation: "15 + 28 = 43",
    },
    {
      id: "mat2",
      question: "Hasil dari 12 × 8 adalah...",
      options: ["86", "96", "106", "116"],
      correctIndex: 1,
      explanation: "12 × 8 = 96",
    },
    {
      id: "mat3",
      question: "Akar kuadrat dari 144 adalah...",
      options: ["10", "11", "12", "14"],
      correctIndex: 2,
      explanation: "√144 = 12",
    },
    {
      id: "mat4",
      question: "Hasil dari 2³ adalah...",
      options: ["4", "6", "8", "9"],
      correctIndex: 2,
      explanation: "2³ = 2×2×2 = 8",
    },
    {
      id: "mat5",
      question: "Persentase dari 1/4 adalah...",
      options: ["20%", "25%", "40%", "50%"],
      correctIndex: 1,
      explanation: "1/4 = 0.25 = 25%",
    },
    {
      id: "mat6",
      question: "Hasil dari 100 - 37 adalah...",
      options: ["53", "63", "73", "83"],
      correctIndex: 1,
      explanation: "100 - 37 = 63",
    },
    {
      id: "mat7",
      question: "Keliling persegi dengan sisi 5 cm adalah...",
      options: ["15 cm", "20 cm", "25 cm", "30 cm"],
      correctIndex: 1,
      explanation: "Keliling = 4 × sisi = 4 × 5 = 20 cm",
    },
    {
      id: "mat8",
      question: "Hasil dari 3/4 + 1/4 adalah...",
      options: ["1/2", "3/4", "1", "5/4"],
      correctIndex: 2,
      explanation: "3/4 + 1/4 = 4/4 = 1",
    },
    {
      id: "mat9",
      question: "Nilai dari 5! (faktorial) adalah...",
      options: ["20", "60", "120", "720"],
      correctIndex: 2,
      explanation: "5! = 5×4×3×2×1 = 120",
    },
    {
      id: "mat10",
      question: "Hasil dari 0,5 × 200 adalah...",
      options: ["50", "100", "150", "200"],
      correctIndex: 1,
      explanation: "0,5 × 200 = 100",
    },
  ],
  sains: [
    {
      id: "sai1",
      question: "Rumus kimia air adalah...",
      options: ["H2O", "CO2", "O2", "NaCl"],
      correctIndex: 0,
      explanation: "Air = H₂O",
    },
    {
      id: "sai2",
      question: "Planet terbesar di tata surya adalah...",
      options: ["Bumi", "Mars", "Jupiter", "Saturnus"],
      correctIndex: 2,
      explanation: "Jupiter adalah planet terbesar.",
    },
    {
      id: "sai3",
      question: "Proses tumbuhan membuat makanan disebut...",
      options: ["Respirasi", "Fotosintesis", "Transpirasi", "Fermentasi"],
      correctIndex: 1,
      explanation: "Fotosintesis menghasilkan makanan menggunakan cahaya matahari.",
    },
    {
      id: "sai4",
      question: "Satuan gaya dalam SI adalah...",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctIndex: 1,
      explanation: "Gaya diukur dalam Newton (N).",
    },
    {
      id: "sai5",
      question: "Gas yang paling banyak di atmosfer bumi adalah...",
      options: ["Oksigen", "Karbon dioksida", "Nitrogen", "Hidrogen"],
      correctIndex: 2,
      explanation: "Nitrogen sekitar 78% atmosfer bumi.",
    },
  ],
  agama: [
    {
      id: "agm1",
      question: "Rukun Islam ada berapa?",
      options: ["3", "4", "5", "6"],
      correctIndex: 2,
      explanation: "Rukun Islam ada 5.",
    },
    {
      id: "agm2",
      question: "Shalat wajib dalam sehari semalam ada...",
      options: ["3", "4", "5", "6"],
      correctIndex: 2,
      explanation: "Shalat wajib 5 waktu.",
    },
    {
      id: "agm3",
      question: "Kitab suci umat Islam adalah...",
      options: ["Injil", "Taurat", "Al-Qur'an", "Zabur"],
      correctIndex: 2,
      explanation: "Al-Qur'an adalah kitab suci umat Islam.",
    },
    {
      id: "agm4",
      question: "Puasa di bulan Ramadhan termasuk rukun Islam ke...",
      options: ["1", "2", "3", "4"],
      correctIndex: 3,
      explanation: "Puasa adalah rukun Islam ke-4.",
    },
    {
      id: "agm5",
      question: "Nabi terakhir dalam Islam adalah...",
      options: ["Nabi Isa", "Nabi Musa", "Nabi Muhammad SAW", "Nabi Ibrahim"],
      correctIndex: 2,
      explanation: "Nabi Muhammad SAW adalah nabi penutup.",
    },
  ],
};

export function getQuestionsForCategory(category: string, count: number = 10): Question[] {
  const bank = QUESTION_BANK[category] || QUESTION_BANK.informatika;
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q, i) => ({
    ...q,
    id: `${q.id}_${i}_${Date.now()}`,
  }));
}

export const CATEGORIES = [
  { id: "informatika", name: "Informatika", icon: "💻" },
  { id: "matematika", name: "Matematika", icon: "📐" },
  { id: "sains", name: "Sains", icon: "🔬" },
  { id: "agama", name: "Agama", icon: "📖" },
];
