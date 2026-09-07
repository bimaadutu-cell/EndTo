"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.code as string;
  const [data, setData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
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
    if (sess) setSession(JSON.parse(sess));
    load();
    const interval = setInterval(load, 1500);
    return () => clearInterval(interval);
  }, [id, load]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Reset when question changes
  useEffect(() => {
    setSelected(null);
    setResult(null);
    if (data?.timePerQuestion) setTimeLeft(data.timePerQuestion);
  }, [data?.currentQuestionIndex]);

  const handleAnswer = async (index: number) => {
    if (selected !== null || !session || !data?.currentQuestion || submitting) return;
    setSelected(index);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionToken: session.sessionToken,
          questionId: data.currentQuestion.id,
          answerIndex: index,
        }),
      });
      const d = await res.json();
      if (res.ok) setResult(d);
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
    setSelected(null);
    setResult(null);
    load();
  };

  if (!data || !data.currentQuestion) {
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">
            Soal {data.currentQuestionIndex + 1} / {data.totalQuestions}
          </span>
          <div
            className={`text-lg font-bold tabular-nums ${
              timeLeft <= 5 ? "text-red-600" : "text-black"
            }`}
          >
            {timeLeft}s
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-1000"
            style={{
              width: `${((data.currentQuestionIndex + 1) / data.totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <h2 className="text-xl font-bold text-black mb-6 leading-snug">{q.question}</h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt: string, i: number) => {
            let cls = "w-full p-4 rounded-xl border text-left font-medium transition-all ";
            if (selected === null) {
              cls += "border-gray-200 hover:border-black active:scale-[0.98]";
            } else if (result) {
              if (i === selected && result.correct) cls += "border-green-500 bg-green-50 text-green-800";
              else if (i === selected && !result.correct) cls += "border-red-500 bg-red-50 text-red-800";
              else cls += "border-gray-100 text-gray-400";
            } else {
              cls += i === selected ? "border-black bg-gray-50" : "border-gray-100 text-gray-400";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null || isTeacher}
                className={cls}
              >
                <span className="inline-block w-7 h-7 rounded-full bg-gray-200 text-sm font-bold mr-3 text-center leading-7">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {result && (
          <div
            className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
              result.correct ? "bg-green-50" : "bg-red-50"
            }`}
          >
            {result.correct ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-bold ${result.correct ? "text-green-800" : "text-red-800"}`}>
                {result.correct ? `Benar! +${result.score > 0 ? "poin" : ""}` : "Salah"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Skor: {result.score} · Streak: {result.streak}
              </p>
              {result.explanation && (
                <p className="text-sm text-gray-500 mt-1">{result.explanation}</p>
              )}
            </div>
          </div>
        )}

        {/* Teacher next button */}
        {isTeacher && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-black text-white font-medium rounded-xl"
          >
            {data.currentQuestionIndex >= data.totalQuestions - 1
              ? "Selesai & Lihat Hasil"
              : "Soal Berikutnya →"}
          </button>
        )}

        {!isTeacher && selected !== null && (
          <p className="text-center text-sm text-gray-500">
            Menunggu soal berikutnya...
          </p>
        )}
      </div>
    </div>
  );
}
