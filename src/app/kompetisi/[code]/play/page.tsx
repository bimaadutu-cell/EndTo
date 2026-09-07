"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Users, ChevronRight, Trophy } from "lucide-react";

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
  const [loadingNext, setLoadingNext] = useState(false);
  const timeoutSent = useRef(false);
  const currentQId = useRef<string | null>(null);

  const load = useCallback(async () => {
    const sessRaw = typeof window !== "undefined" ? localStorage.getItem(`comp_session_${id}`) : null;
    let sessToken = "";
    if (sessRaw) {
      try {
        const s = JSON.parse(sessRaw);
        sessToken = s.sessionToken || "";
        setSession(s);
      } catch {}
    }
    const qs = sessToken ? `?session=${encodeURIComponent(sessToken)}` : "";
    const res = await fetch(`/api/competitions/${id}${qs}`, { cache: "no-store" });
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

    if (d.playerProgress?.finished) {
      // Player finished all questions
      setTimeout(() => router.push(`/kompetisi/${id}/result`), 1500);
    }

    // Sync timer from player's question start
    if (d.playerProgress?.questionStartedAt && d.currentQuestion) {
      const limit = d.currentQuestion.timeLimit || d.timePerQuestion || 20;
      const elapsed = Math.floor((Date.now() - d.playerProgress.questionStartedAt) / 1000);
      setTimeLeft(Math.max(0, limit - elapsed));
      timeoutSent.current = false;
    }
  }, [id, router]);

  useEffect(() => {
    const teacherAuth = localStorage.getItem("teacher_token") || localStorage.getItem("admin_auth");
    if (teacherAuth) setIsTeacher(true);
    const sess = localStorage.getItem(`comp_session_${id}`);
    if (sess) {
      try {
        setSession(JSON.parse(sess));
      } catch {}
    }
    load();
    const interval = setInterval(load, 2500);
    return () => clearInterval(interval);
  }, [id, load]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || submitted || isTeacher || !data?.currentQuestion) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted, isTeacher, data?.currentQuestion]);

  // Auto timeout -> submit as timeout
  useEffect(() => {
    if (
      timeLeft <= 0 &&
      !submitted &&
      !submitting &&
      !isTeacher &&
      session &&
      data?.currentQuestion &&
      !timeoutSent.current
    ) {
      timeoutSent.current = true;
      handleSubmit(-1);
    }
  }, [timeLeft, submitted, submitting, isTeacher, session, data?.currentQuestion]);

  // Reset selection when question changes
  useEffect(() => {
    const qid = data?.currentQuestion?.id;
    if (qid && qid !== currentQId.current) {
      currentQId.current = qid;
      setSelected(null);
      setSubmitted(false);
      setResult(null);
      setLoadingNext(false);
      timeoutSent.current = false;
      const limit = data.currentQuestion.timeLimit || data.timePerQuestion || 20;
      setTimeLeft(limit);
    }
  }, [data?.currentQuestion?.id]);

  const handleSelect = (index: number) => {
    if (isTeacher || submitted || !session || loadingNext) return;
    setSelected(index);
  };

  const handleSubmit = async (forcedIndex?: number) => {
    const ans = forcedIndex !== undefined ? forcedIndex : selected;
    if (ans === null || ans === undefined || !session || !data?.currentQuestion || submitting || isTeacher)
      return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionToken: session.sessionToken,
          questionId: data.currentQuestion.id,
          answerIndex: ans,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setResult(d);
        setSubmitted(true);
        // AUTO NEXT after short feedback
        setLoadingNext(true);
        setTimeout(() => {
          if (d.finished || !d.nextQuestion) {
            router.push(`/kompetisi/${id}/result`);
          } else {
            // Apply next question immediately from response
            setData((prev: any) => ({
              ...prev,
              currentQuestion: d.nextQuestion,
              playerProgress: {
                ...prev?.playerProgress,
                currentIndex: d.currentIndex,
                score: d.score,
                finished: d.finished,
                questionStartedAt: Date.now(),
              },
            }));
            setSelected(null);
            setSubmitted(false);
            setResult(null);
            setLoadingNext(false);
            setTimeLeft(d.nextQuestion.timeLimit || 20);
            timeoutSent.current = false;
            currentQId.current = d.nextQuestion.id;
          }
        }, 1200);
      } else {
        alert(d.error || "Gagal menyimpan jawaban");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (!confirm("Akhiri kompetisi sekarang?")) return;
    await fetch(`/api/competitions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", teacherId: "guruku" }),
    });
    router.push(`/kompetisi/${id}/result`);
  };

  const handlePause = async () => {
    await fetch(`/api/competitions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pause", teacherId: "guruku" }),
    });
    load();
  };

  const handleResume = async () => {
    await fetch(`/api/competitions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", teacherId: "guruku" }),
    });
    load();
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
            <p className="text-xs opacity-70 mb-1">HOST MODE · Auto-Next aktif</p>
            <h1 className="text-lg font-bold">{data.name}</h1>
            <p className="text-sm opacity-80 mt-1">
              Status: {data.status} · {data.finishedCount || 0}/{data.playerCount} selesai
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">{data.playerCount} Peserta</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.players?.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      Soal {p.progress || 0}/{data.totalQuestions}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          {data.leaderboard?.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Leaderboard</span>
              </div>
              <div className="space-y-1">
                {data.leaderboard.slice(0, 8).map((p: any) => (
                  <div key={p.rank} className="flex justify-between text-sm">
                    <span>
                      #{p.rank} {p.name}
                    </span>
                    <span className="font-medium">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {data.status === "paused" ? (
              <button
                onClick={handleResume}
                className="w-full py-3 bg-black text-white font-medium rounded-xl"
              >
                Lanjutkan Kompetisi
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-full py-3 border border-gray-300 font-medium rounded-xl"
              >
                Jeda Kompetisi
              </button>
            )}
            <button
              onClick={handleEnd}
              className="w-full py-3 border border-red-200 text-red-600 font-medium rounded-xl"
            >
              Akhiri Kompetisi
            </button>
            <p className="text-xs text-center text-gray-400">
              Peserta maju otomatis setelah menjawab. Tidak perlu klik soal berikutnya.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== STUDENT MODE ==========
  if (data.status === "paused") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="font-medium">Kompetisi dijeda oleh guru</p>
          <p className="text-sm text-gray-500 mt-1">Menunggu dilanjutkan…</p>
        </div>
      </div>
    );
  }

  if (!data.currentQuestion && !data.playerProgress?.finished) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat soal…</p>
        </div>
      </div>
    );
  }

  if (data.playerProgress?.finished || (!data.currentQuestion && data.status === "running")) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="font-bold text-lg">Semua soal selesai!</p>
          <p className="text-sm text-gray-500 mt-1">Skor: {data.playerProgress?.score ?? session?.score ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-4">Mengarahkan ke hasil…</p>
        </div>
      </div>
    );
  }

  const q = data.currentQuestion;
  const progressIndex = data.playerProgress?.currentIndex ?? 0;
  const total = data.totalQuestions || 1;

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">
              Soal {progressIndex + 1} / {total}
            </p>
            <p className="font-medium text-sm">{session?.name || "Peserta"}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tabular-nums">{timeLeft}s</p>
            <p className="text-xs text-gray-500">Skor: {result?.score ?? data.playerProgress?.score ?? 0}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${((progressIndex + (submitted ? 1 : 0)) / total) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-5">
          <p className="font-medium text-base leading-relaxed">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options?.map((opt: string, i: number) => {
            let cls =
              "w-full text-left px-4 py-3.5 rounded-xl border transition-all font-medium text-sm ";
            if (submitted && result) {
              if (i === selected) {
                cls += result.correct
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-400 bg-red-50 text-red-800";
              } else {
                cls += "border-gray-100 text-gray-400";
              }
            } else if (selected === i) {
              cls += "border-black bg-black text-white";
            } else {
              cls += "border-gray-200 hover:border-gray-400";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={submitted || submitting || loadingNext}
                className={cls}
              >
                <span className="mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback / Submit */}
        {submitted && result ? (
          <div className="text-center">
            {result.correct ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Benar! +poin</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">
                  {selected === -1 || result.answerIndex === -1 ? "Waktu habis" : "Salah"}
                </span>
              </div>
            )}
            {loadingNext && (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat soal berikutnya…
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={selected === null || submitting || loadingNext}
            className="w-full py-4 bg-black text-white font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan…
              </>
            ) : (
              "Kirim Jawaban"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
