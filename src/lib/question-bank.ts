import type { Question } from "./competition-store";

type RawQ = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
};

const BANK: Record<string, RawQ[]> = {
  informatika: [
    { id: "inf1", question: "Kepanjangan dari CPU adalah...", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Control Processing Unit"], correctIndex: 0, explanation: "CPU = Central Processing Unit.", difficulty: "easy" },
    { id: "inf2", question: "HTML adalah singkatan dari...", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctIndex: 0, explanation: "HTML = HyperText Markup Language.", difficulty: "easy" },
    { id: "inf3", question: "Perangkat input berikut adalah...", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctIndex: 2, explanation: "Keyboard adalah perangkat input.", difficulty: "easy" },
    { id: "inf4", question: "RAM termasuk jenis memori...", options: ["Permanen", "Volatile (sementara)", "Eksternal", "ROM"], correctIndex: 1, explanation: "RAM bersifat volatile.", difficulty: "medium" },
    { id: "inf5", question: "Sistem operasi open source yang populer adalah...", options: ["Windows", "macOS", "Linux", "DOS"], correctIndex: 2, explanation: "Linux open source.", difficulty: "easy" },
    { id: "inf6", question: "Protokol transfer file di internet adalah...", options: ["HTTP", "FTP", "SMTP", "DNS"], correctIndex: 1, explanation: "FTP = File Transfer Protocol.", difficulty: "medium" },
    { id: "inf7", question: "Bahasa server-side untuk website dinamis adalah...", options: ["HTML", "CSS", "PHP", "Photoshop"], correctIndex: 2, explanation: "PHP server-side.", difficulty: "medium" },
    { id: "inf8", question: "1 Byte = ... bit", options: ["4", "8", "16", "32"], correctIndex: 1, explanation: "1 Byte = 8 bit.", difficulty: "easy" },
    { id: "inf9", question: "IPv4 terdiri dari berapa oktet?", options: ["2", "3", "4", "6"], correctIndex: 2, explanation: "IPv4 = 4 oktet.", difficulty: "medium" },
    { id: "inf10", question: "Software pelindung dari virus disebut...", options: ["Browser", "Antivirus", "Spreadsheet", "Word Processor"], correctIndex: 1, explanation: "Antivirus.", difficulty: "easy" },
    { id: "inf11", question: "SSD lebih cepat dari HDD karena...", options: ["Lebih besar", "Tidak ada bagian bergerak", "Lebih murah", "Warna berbeda"], correctIndex: 1, explanation: "SSD solid-state, tanpa piringan berputar.", difficulty: "medium" },
    { id: "inf12", question: "URL adalah singkatan dari...", options: ["Uniform Resource Locator", "Universal Remote Link", "User Request Language", "Unique Route Link"], correctIndex: 0, explanation: "URL = Uniform Resource Locator.", difficulty: "easy" },
    { id: "inf13", question: "CSS digunakan untuk...", options: ["Struktur halaman", "Styling tampilan", "Logika program", "Database"], correctIndex: 1, explanation: "CSS = styling.", difficulty: "easy" },
    { id: "inf14", question: "JavaScript terutama digunakan untuk...", options: ["Styling", "Struktur", "Interaktivitas web", "Desain grafis"], correctIndex: 2, explanation: "JS = interaktivitas.", difficulty: "easy" },
    { id: "inf15", question: "Git adalah tools untuk...", options: ["Desain UI", "Version control", "Editing video", "Antivirus"], correctIndex: 1, explanation: "Git = version control.", difficulty: "medium" },
    { id: "inf16", question: "HTTP status 404 berarti...", options: ["OK", "Not Found", "Server Error", "Forbidden"], correctIndex: 1, explanation: "404 = Not Found.", difficulty: "easy" },
    { id: "inf17", question: "Firewall berfungsi untuk...", options: ["Mempercepat internet", "Menyaring lalu lintas jaringan", "Menyimpan data", "Mencetak dokumen"], correctIndex: 1, explanation: "Firewall menyaring traffic.", difficulty: "medium" },
    { id: "inf18", question: "Cloud computing berarti...", options: ["Komputasi di awan fisik", "Layanan komputer via internet", "Hardware lokal saja", "Hanya email"], correctIndex: 1, explanation: "Cloud = layanan via internet.", difficulty: "medium" },
    { id: "inf19", question: "Motherboard adalah...", options: ["Layar komputer", "Papan sirkuit utama", "Keyboard", "Mouse"], correctIndex: 1, explanation: "Motherboard = mainboard.", difficulty: "easy" },
    { id: "inf20", question: "Binary 1010 dalam desimal adalah...", options: ["8", "10", "12", "15"], correctIndex: 1, explanation: "1010₂ = 10₁₀.", difficulty: "hard" },
  ],
  matematika: [
    { id: "mat1", question: "Hasil 15 + 28 =", options: ["33", "43", "53", "63"], correctIndex: 1, explanation: "15+28=43", difficulty: "easy" },
    { id: "mat2", question: "Hasil 12 × 8 =", options: ["86", "96", "106", "116"], correctIndex: 1, explanation: "12×8=96", difficulty: "easy" },
    { id: "mat3", question: "√144 =", options: ["10", "11", "12", "14"], correctIndex: 2, explanation: "√144=12", difficulty: "easy" },
    { id: "mat4", question: "2³ =", options: ["4", "6", "8", "9"], correctIndex: 2, explanation: "2×2×2=8", difficulty: "easy" },
    { id: "mat5", question: "1/4 dalam persen =", options: ["20%", "25%", "40%", "50%"], correctIndex: 1, explanation: "1/4=25%", difficulty: "easy" },
    { id: "mat6", question: "100 - 37 =", options: ["53", "63", "73", "83"], correctIndex: 1, explanation: "100-37=63", difficulty: "easy" },
    { id: "mat7", question: "Keliling persegi sisi 5 cm =", options: ["15 cm", "20 cm", "25 cm", "30 cm"], correctIndex: 1, explanation: "4×5=20", difficulty: "easy" },
    { id: "mat8", question: "3/4 + 1/4 =", options: ["1/2", "3/4", "1", "5/4"], correctIndex: 2, explanation: "4/4=1", difficulty: "easy" },
    { id: "mat9", question: "5! (faktorial) =", options: ["20", "60", "120", "720"], correctIndex: 2, explanation: "5!=120", difficulty: "medium" },
    { id: "mat10", question: "0,5 × 200 =", options: ["50", "100", "150", "200"], correctIndex: 1, explanation: "0,5×200=100", difficulty: "easy" },
    { id: "mat11", question: "Luas segitiga alas 10 tinggi 6 =", options: ["30", "60", "16", "20"], correctIndex: 0, explanation: "½×10×6=30", difficulty: "medium" },
    { id: "mat12", question: "Persamaan 2x+4=10, x =", options: ["2", "3", "4", "5"], correctIndex: 1, explanation: "2x=6, x=3", difficulty: "medium" },
    { id: "mat13", question: "FPB dari 12 dan 18 =", options: ["2", "3", "6", "9"], correctIndex: 2, explanation: "FPB=6", difficulty: "medium" },
    { id: "mat14", question: "KPK dari 4 dan 6 =", options: ["8", "12", "18", "24"], correctIndex: 1, explanation: "KPK=12", difficulty: "medium" },
    { id: "mat15", question: "Sudut siku-siku besarnya...", options: ["45°", "60°", "90°", "180°"], correctIndex: 2, explanation: "90°", difficulty: "easy" },
  ],
  sains: [
    { id: "sai1", question: "Rumus kimia air adalah...", options: ["H2O", "CO2", "O2", "NaCl"], correctIndex: 0, explanation: "Air = H₂O", difficulty: "easy" },
    { id: "sai2", question: "Planet terbesar di tata surya adalah...", options: ["Bumi", "Mars", "Jupiter", "Saturnus"], correctIndex: 2, explanation: "Jupiter terbesar.", difficulty: "easy" },
    { id: "sai3", question: "Proses tumbuhan membuat makanan disebut...", options: ["Respirasi", "Fotosintesis", "Transpirasi", "Fermentasi"], correctIndex: 1, explanation: "Fotosintesis.", difficulty: "easy" },
    { id: "sai4", question: "Satuan gaya SI adalah...", options: ["Joule", "Newton", "Watt", "Pascal"], correctIndex: 1, explanation: "Newton (N).", difficulty: "medium" },
    { id: "sai5", question: "Gas terbanyak di atmosfer bumi...", options: ["Oksigen", "Karbon dioksida", "Nitrogen", "Hidrogen"], correctIndex: 2, explanation: "Nitrogen ~78%.", difficulty: "medium" },
    { id: "sai6", question: "Benda padat berubah jadi cair disebut...", options: ["Menguap", "Mencair", "Membeku", "Mengembun"], correctIndex: 1, explanation: "Mencair/meleleh.", difficulty: "easy" },
    { id: "sai7", question: "Organ tubuh yang memompa darah adalah...", options: ["Paru-paru", "Jantung", "Hati", "Ginjal"], correctIndex: 1, explanation: "Jantung.", difficulty: "easy" },
    { id: "sai8", question: "Sumber energi utama bumi adalah...", options: ["Bulan", "Matahari", "Angin", "Air"], correctIndex: 1, explanation: "Matahari.", difficulty: "easy" },
    { id: "sai9", question: "Satuan hambatan listrik adalah...", options: ["Volt", "Ampere", "Ohm", "Watt"], correctIndex: 2, explanation: "Ohm (Ω).", difficulty: "medium" },
    { id: "sai10", question: "Fotosintesis membutuhkan...", options: ["Oksigen & gelap", "Cahaya & CO2", "Hanya air", "Hanya tanah"], correctIndex: 1, explanation: "Cahaya, CO2, air.", difficulty: "medium" },
  ],
  agama: [
    { id: "agm1", question: "Rukun Islam ada berapa?", options: ["3", "4", "5", "6"], correctIndex: 2, explanation: "5 rukun Islam.", difficulty: "easy" },
    { id: "agm2", question: "Shalat wajib sehari semalam ada...", options: ["3", "4", "5", "6"], correctIndex: 2, explanation: "5 waktu.", difficulty: "easy" },
    { id: "agm3", question: "Kitab suci umat Islam adalah...", options: ["Injil", "Taurat", "Al-Qur'an", "Zabur"], correctIndex: 2, explanation: "Al-Qur'an.", difficulty: "easy" },
    { id: "agm4", question: "Puasa Ramadhan adalah rukun Islam ke...", options: ["1", "2", "3", "4"], correctIndex: 3, explanation: "Ke-4.", difficulty: "easy" },
    { id: "agm5", question: "Nabi terakhir dalam Islam adalah...", options: ["Nabi Isa", "Nabi Musa", "Nabi Muhammad SAW", "Nabi Ibrahim"], correctIndex: 2, explanation: "Nabi Muhammad SAW.", difficulty: "easy" },
    { id: "agm6", question: "Rukun Iman ada berapa?", options: ["4", "5", "6", "7"], correctIndex: 2, explanation: "6 rukun iman.", difficulty: "easy" },
    { id: "agm7", question: "Arah kiblat umat Islam adalah...", options: ["Madinah", "Yerusalem", "Ka'bah di Mekah", "Kubah Shakhrah"], correctIndex: 2, explanation: "Ka'bah di Mekah.", difficulty: "easy" },
    { id: "agm8", question: "Zakat termasuk rukun Islam ke...", options: ["1", "2", "3", "5"], correctIndex: 2, explanation: "Ke-3.", difficulty: "medium" },
  ],
  html: [
    { id: "html1", question: "Tag untuk judul terbesar di HTML adalah...", options: ["<h6>", "<h1>", "<title>", "<header>"], correctIndex: 1, explanation: "<h1> terbesar.", difficulty: "easy" },
    { id: "html2", question: "Tag untuk membuat tautan adalah...", options: ["<link>", "<a>", "<url>", "<href>"], correctIndex: 1, explanation: "<a href=...>", difficulty: "easy" },
    { id: "html3", question: "Atribut untuk sumber gambar adalah...", options: ["href", "src", "alt", "link"], correctIndex: 1, explanation: "src pada <img>.", difficulty: "easy" },
    { id: "html4", question: "Tag untuk daftar tidak berurut adalah...", options: ["<ol>", "<ul>", "<li>", "<dl>"], correctIndex: 1, explanation: "<ul> unordered list.", difficulty: "easy" },
    { id: "html5", question: "Elemen semantik untuk navigasi adalah...", options: ["<div>", "<nav>", "<section>", "<span>"], correctIndex: 1, explanation: "<nav>.", difficulty: "medium" },
  ],
  css: [
    { id: "css1", question: "Property untuk warna teks adalah...", options: ["background", "color", "font", "text-style"], correctIndex: 1, explanation: "color.", difficulty: "easy" },
    { id: "css2", question: "Selector class diawali dengan...", options: ["#", ".", "@", "$"], correctIndex: 1, explanation: "Titik (.).", difficulty: "easy" },
    { id: "css3", question: "Selector ID diawali dengan...", options: [".", "#", "*", "&"], correctIndex: 1, explanation: "Pagar (#).", difficulty: "easy" },
    { id: "css4", question: "Untuk layout fleksibel modern digunakan...", options: ["float saja", "Flexbox/Grid", "table layout", "marquee"], correctIndex: 1, explanation: "Flexbox & Grid.", difficulty: "medium" },
    { id: "css5", question: "Media query digunakan untuk...", options: ["Animasi", "Responsive design", "Database", "SEO saja"], correctIndex: 1, explanation: "Responsive.", difficulty: "medium" },
  ],
  javascript: [
    { id: "js1", question: "Keyword variable yang tidak bisa diubah...", options: ["var", "let", "const", "static"], correctIndex: 2, explanation: "const.", difficulty: "easy" },
    { id: "js2", question: "Operator strict equality adalah...", options: ["=", "==", "===", "!="], correctIndex: 2, explanation: "===.", difficulty: "easy" },
    { id: "js3", question: "Method menambah elemen di akhir array...", options: ["pop()", "push()", "shift()", "slice()"], correctIndex: 1, explanation: "push().", difficulty: "easy" },
    { id: "js4", question: "Keyword mengembalikan nilai function...", options: ["yield", "return", "send", "output"], correctIndex: 1, explanation: "return.", difficulty: "easy" },
    { id: "js5", question: "typeof null di JavaScript menghasilkan...", options: ["null", "undefined", "object", "number"], correctIndex: 2, explanation: "typeof null === 'object' (quirk JS).", difficulty: "hard" },
  ],
  networking: [
    { id: "net1", question: "LAN adalah singkatan dari...", options: ["Large Area Network", "Local Area Network", "Long Access Node", "Linked Area Net"], correctIndex: 1, explanation: "Local Area Network.", difficulty: "easy" },
    { id: "net2", question: "Perangkat yang menghubungkan ke internet...", options: ["Switch", "Hub", "Router", "Repeater"], correctIndex: 2, explanation: "Router.", difficulty: "easy" },
    { id: "net3", question: "DNS berfungsi untuk...", options: ["Mengamankan data", "Menerjemahkan domain ke IP", "Mempercepat download", "Menghapus virus"], correctIndex: 1, explanation: "Domain → IP.", difficulty: "medium" },
    { id: "net4", question: "Protokol andal connection-oriented adalah...", options: ["UDP", "IP", "TCP", "ICMP"], correctIndex: 2, explanation: "TCP.", difficulty: "medium" },
    { id: "net5", question: "Layer OSI yang menangani IP adalah layer...", options: ["1", "2", "3", "4"], correctIndex: 2, explanation: "Network layer (3).", difficulty: "hard" },
  ],
  cybersecurity: [
    { id: "cyb1", question: "Usaha menipu user agar memberi password disebut...", options: ["Malware", "Phishing", "Firewall", "Encryption"], correctIndex: 1, explanation: "Phishing.", difficulty: "easy" },
    { id: "cyb2", question: "Autentikasi dua faktor disebut...", options: ["SSO", "2FA/MFA", "VPN", "SSL"], correctIndex: 1, explanation: "2FA/MFA.", difficulty: "easy" },
    { id: "cyb3", question: "CIA Triad dalam keamanan info terdiri dari...", options: ["Code, Internet, Access", "Confidentiality, Integrity, Availability", "Computer, Info, Auth", "Cache, Index, API"], correctIndex: 1, explanation: "C-I-A.", difficulty: "medium" },
    { id: "cyb4", question: "Password yang kuat sebaiknya...", options: ["Pendek & mudah diingat", "Panjang, unik, kombinasi karakter", "Sama untuk semua akun", "Hanya angka"], correctIndex: 1, explanation: "Panjang & unik.", difficulty: "easy" },
    { id: "cyb5", question: "Ransomware adalah malware yang...", options: ["Mempercepat PC", "Mengenkripsi data & meminta tebusan", "Membersihkan virus", "Hanya iklan"], correctIndex: 1, explanation: "Minta tebusan.", difficulty: "medium" },
  ],
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q: RawQ): Question {
  const indexed = q.options.map((opt, i) => ({ opt, i }));
  const shuffled = shuffleArray(indexed);
  const options = shuffled.map((x) => x.opt);
  const correctIndex = shuffled.findIndex((x) => x.i === q.correctIndex);
  return {
    id: `${q.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    question: q.question,
    options,
    correctIndex,
    explanation: q.explanation,
  };
}

export function getQuestionsForCategory(
  category: string,
  count: number = 10,
  difficulty?: string
): Question[] {
  let pool: RawQ[] = [];
  if (category === "all" || category === "campuran") {
    pool = Object.values(BANK).flat();
  } else {
    pool = BANK[category] || BANK.informatika;
  }
  if (difficulty && difficulty !== "mixed" && difficulty !== "semua") {
    const filtered = pool.filter((q) => q.difficulty === difficulty);
    if (filtered.length >= count) pool = filtered;
  }
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  return selected.map(shuffleOptions);
}

export const CATEGORIES = [
  { id: "informatika", name: "Informatika", icon: "💻" },
  { id: "matematika", name: "Matematika", icon: "📐" },
  { id: "sains", name: "Sains", icon: "🔬" },
  { id: "agama", name: "Agama", icon: "📖" },
  { id: "html", name: "HTML", icon: "🌐" },
  { id: "css", name: "CSS", icon: "🎨" },
  { id: "javascript", name: "JavaScript", icon: "⚡" },
  { id: "networking", name: "Jaringan", icon: "📡" },
  { id: "cybersecurity", name: "Cyber Security", icon: "🔒" },
  { id: "all", name: "Campuran", icon: "🎲" },
];
