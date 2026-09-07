"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Users, ChevronRight } from "lucide-react";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.code as string;
  const [data, setData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTeacher, setIsTeacher] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/competitions/${id}`);
    const d = await res.json();
    if (!res.ok) return;
    setData(d);
    if (d.status === "finished") {
      router.push(`/kompetisi/${id}/result`);
      return;
    }
    if (d.status === "waiting") {
      router.push(`/kompetisi/${id}/lobby`);
      return;
    }
    if (d.questionStartedAt && d.timePerQuestion) {
      const elapsed = Math.floor((Date.now() - d.questionStartedAt) / 1000);
      setTimeLeft(Math.max(0, d.timePerQuestion - elapsed));
    }
  }, [id, router]);

  useEffect(() => {
    const teacherAuth = localStorage.getItem("teacher_token") || localStorage.getItem("admin_auth");
    if (teacherAuth) setIsTeacher(true);
    const sess = localStorage.getItem(`comp_session_${id}`);
    if (sess) {
      try { setSession(JSON.parse(sess)); } catch {}
    }
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [id, load]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setResult(null);
    if (data?.timePerQuestion) setTimeLeft(data.timePerQuestion);
  }, [data?.currentQuestionIndex]);

  const handleSelect = (index: number) => {
    if (isTeacher || submitted || !session) return;
    setSelected(index);
  };

  const handleSubmit = async () => {
    if (selected === null || !session || !data?.currentQuestion || submitting || isTeacher) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionToken: session.sessionToken,
          questionId: data.currentQuestion.id,
          answerIndex: selected,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setResult(d);
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    await fetch(`/api/competitions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next", teacherId: "guruku" }),
    });
    load();
  };

  const handleEnd = async () => {
    if (!confirm("Akhiri kompetisi sekarang?")) return;
    // Force finish by advancing past last question
    let guard = 0;
    while (guard < 50) {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next", teacherId: "guruku" }),
      });
      const d = await res.json();
      if (d.status === "finished") break;
      guard++;
    }
    router.push(`/kompetisi/${id}/result`);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ========== TEACHER HOST MODE ==========
  if (isTeacher) {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-black text-white rounded-2xl p-4 mb-6">
            <p className="text-xs opacity-70 mb-1">HOST MODE · Guru tidak menjawab soal</p>
            <h1 className="text-lg font-bold">{data.name}</h1>
            <p className="text-sm opacity-80 mt-1">
              Soal {(data.currentQuestionIndex ?? 0) + 1} / {data.totalQuestions} · Timer {timeLeft}s
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">{data.playerCount} Peserta</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.players?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500">{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          {data.currentQuestion && (
            <div className="border border-gray-200 rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Soal saat ini (preview host)</p>
              <p className="font-medium text-sm">{data.currentQuestion.question}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleNext}
              className="w-full py-3 bg-black text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              {(data.currentQuestionIndex ?? 0) >= (data.totalQuestions ?? 1) - 1
                ? "Selesai & Lihat Hasil"
                : "Soal Berikutnya"}
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleEnd}
              className="w-full py-3 border border-red-200 text-red-600 font-medium rounded-xl"
            >
              Akhiri Kompetisi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== STUDENT MODE ==========
  if (!data.currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const q = data.currentQuestion;

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Soal {data.currentQuestionIndex + 1} / {data.totalQuestions}
          </span>
          <div className={`text-lg font-bold tabular-nums ${timeLeft <= 5 ? "text-red-600" : "text-black"}`}>
            {timeLeft}s
          </div>
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-black transition-all"
            style={{ width: `${((data.currentQuestionIndex + 1) / data.totalQuestions) * 100}%` }}
          />
        </div>

        <h2 className="text-xl font-bold text-black mb-6 leading-snug">{q.question}</h2>

        <div className="space-y-3 mb-6">
          {q.options.map((opt: string, i: number) => {
            const isSelected = selected === i;
            let cls = "w-full p-4 rounded-xl border text-left font-medium transition-all flex items-center gap-3 ";
            if (!submitted) {
              cls += isSelected
                ? "border-black bg-black text-white scale-[1.02]"
                : "border-gray-200 hover:border-gray-400 active:scale-[0.98]";
            } else if (result) {
              if (i === selected && result.correct) cls += "border-green-500 bg-green-50 text-green-800";
              else if (i === selected && !result.correct) cls += "border-red-500 bg-red-50 text-red-800";
              else cls += "border-gray-100 text-gray-400";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={submitted} className={cls}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  isSelected && !submitted ? "bg-white text-black" : "bg-gray-100 text-gray-700"
                }`}>
                  {isSelected && !submitted ? "✓" : String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {isSelected && !submitted && (
                  <span className="text-xs opacity-80">Dipilih</span>
                )}
              </button>
            );
          })}
        </div>

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={selected === null || submitting}
            className="w-full py-3 bg-black text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Mengirim..." : "Lanjut"}
          </button>
        )}

        {result && (
          <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${result.correct ? "bg-green-50" : "bg-red-50"}`}>
            {result.correct ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-bold ${result.correct ? "text-green-800" : "text-red-800"}`}>
                {result.correct ? "Benar!" : "Belum tepat"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Skor: {result.score} · Streak: {result.streak}</p>
              {result.explanation && <p className="text-sm text-gray-500 mt-1">{result.explanation}</p>}
              <p className="text-xs text-gray-400 mt-2">Menunggu soal berikutnya dari guru...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
