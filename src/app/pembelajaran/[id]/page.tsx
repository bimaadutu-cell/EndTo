"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMaterial } from "@/lib/learning-materials";

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const material = getMaterial(id);

  const [progress, setProgress] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [section, setSection] = useState<"materi" | "contoh" | "poin" | "quiz">("materi");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("learning_progress") || "{}");
      if (saved[id]) setProgress(saved[id]);
    } catch {}
  }, [id]);

  const saveProgress = (value: number) => {
    setProgress(value);
    try {
      const saved = JSON.parse(localStorage.getItem("learning_progress") || "{}");
      saved[id] = value;
      localStorage.setItem("learning_progress", JSON.stringify(saved));
    } catch {}
  };

  if (!material) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Materi tidak ditemukan</p>
          <Link href="/pembelajaran" className="text-black underline">Kembali</Link>
        </div>
      </div>
    );
  }

  const q = material.quiz[0];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/pembelajaran" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Semua Materi
          </Link>

          <div className="mb-2 text-xs font-mono text-gray-400">MATERI #{String(material.number).padStart(2, "0")}</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">{material.title}</h1>
          <p className="text-gray-600 mb-4">{material.description}</p>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto">
            {(["materi", "contoh", "poin", "quiz"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSection(s);
                  if (s === "materi" && progress < 25) saveProgress(25);
                  if (s === "contoh" && progress < 50) saveProgress(50);
                  if (s === "poin" && progress < 75) saveProgress(75);
                }}
                className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 -mb-px ${
                  section === s ? "border-black text-black" : "border-transparent text-gray-500"
                }`}
              >
                {s === "poin" ? "Poin Penting" : s}
              </button>
            ))}
          </div>

          {section === "materi" && (
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-line">
              {material.content}
            </div>
          )}

          {section === "contoh" && (
            <ul className="space-y-2">
              {material.examples.map((ex, i) => (
                <li key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                  <span className="font-bold text-gray-400">{i + 1}.</span>
                  {ex}
                </li>
              ))}
            </ul>
          )}

          {section === "poin" && (
            <ul className="space-y-2">
              {material.keyPoints.map((kp, i) => (
                <li key={i} className="flex gap-3 p-3 border border-gray-100 rounded-xl text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {kp}
                </li>
              ))}
            </ul>
          )}

          {section === "quiz" && q && (
            <div>
              <p className="font-medium text-black mb-4">{q.question}</p>
              <div className="space-y-2 mb-4">
                {q.options.map((opt, i) => {
                  let cls = "w-full p-3 rounded-xl border text-left text-sm transition-all ";
                  if (quizAnswer === null) cls += "border-gray-200 hover:border-black";
                  else if (i === q.correct) cls += "border-green-500 bg-green-50 text-green-800";
                  else if (i === quizAnswer) cls += "border-red-500 bg-red-50 text-red-800";
                  else cls += "border-gray-100 text-gray-400";
                  return (
                    <button
                      key={i}
                      disabled={quizAnswer !== null}
                      onClick={() => {
                        setQuizAnswer(i);
                        setQuizDone(true);
                        if (i === q.correct) saveProgress(100);
                        else if (progress < 90) saveProgress(90);
                      }}
                      className={cls}
                    >
                      <span className="inline-block w-6 font-bold">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  );
                })}
              </div>
              {quizDone && (
                <div className={`p-4 rounded-xl text-sm ${quizAnswer === q.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  {quizAnswer === q.correct ? "Benar! " : "Belum tepat. "}
                  {q.explanation}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {progress < 100 ? (
              <button
                onClick={() => saveProgress(100)}
                className="flex-1 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800"
              >
                Tandai Selesai
              </button>
            ) : (
              <div className="flex-1 py-3 bg-green-50 text-green-700 font-medium rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Selesai
              </div>
            )}
            <Link
              href="/pembelajaran"
              className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
            >
              Kembali
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
