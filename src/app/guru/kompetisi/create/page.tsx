"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, Copy, Check, Share2 } from "lucide-react";

const CATEGORIES = [
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

export default function CreateCompetitionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("informatika");
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    id: string;
    inviteCode: string;
    inviteUrl: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          questionCount,
          timePerQuestion,
          teacherId: "guruku",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat");
      setResult(data.competition);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-white px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Kompetisi Berhasil Dibuat!</h1>
            <p className="text-gray-600">{result.name}</p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Kode Kompetisi</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold tracking-widest text-black">{result.inviteCode}</span>
                <button
                  onClick={() => copyText(result.inviteCode, "code")}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {copied === "code" ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Link Undangan</p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={result.inviteUrl}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => copyText(result.inviteUrl, "link")}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {copied === "link" ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/guru/kompetisi/${result.id}/lobby`)}
              className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800"
            >
              Buka Lobby Guru
            </button>
            <Link
              href="/guru/dashboard"
              className="w-full py-3 border border-gray-200 text-center font-medium rounded-xl hover:bg-gray-50"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/guru/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <h1 className="text-2xl font-bold text-black mb-6">Buat Kompetisi</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Kompetisi *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: Quiz Informatika X TKJ"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Opsional"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kategori *</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`p-3 rounded-xl border text-left ${
                    category === c.id ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="ml-2 text-sm font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jumlah Soal</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              >
                {[5, 10].map((n) => (
                  <option key={n} value={n}>{n} soal</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Waktu/Soal</label>
              <select
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              >
                {[15, 20, 30].map((n) => (
                  <option key={n} value={n}>{n} detik</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Membuat..." : "Buat Kompetisi"}
          </button>
        </form>
      </div>
    </div>
  );
}
