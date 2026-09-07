"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Circle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MATERIALS, CATEGORIES_LEARN } from "@/lib/learning-materials";

export default function PembelajaranPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("learning_progress");
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
  }, []);

  const filtered =
    filter === "Semua"
      ? MATERIALS
      : MATERIALS.filter((m) => m.category === filter);

  const doneCount = Object.values(progress).filter((v) => v >= 100).length;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Pembelajaran</h1>
            <p className="text-gray-600">
              33 materi informatika & teknologi · {doneCount}/{MATERIALS.length} selesai
            </p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden max-w-md">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${(doneCount / MATERIALS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {["Semua", ...CATEGORIES_LEARN].map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === c ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => {
              const p = progress[m.id] || 0;
              return (
                <Link
                  key={m.id}
                  href={`/pembelajaran/${m.id}`}
                  className="border border-gray-200 rounded-2xl p-5 hover:border-black hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono text-gray-400">#{String(m.number).padStart(2, "0")}</span>
                    {p >= 100 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-black mb-1 group-hover:underline">{m.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{m.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{m.category}</span>
                    <span className="text-xs text-gray-400">{p}%</span>
                  </div>
                  {p > 0 && p < 100 && (
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black" style={{ width: `${p}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
