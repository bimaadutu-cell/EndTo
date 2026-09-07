"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Medal, Home, Loader2 } from "lucide-react";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.code as string;
  const [data, setData] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const sess = localStorage.getItem(`comp_session_${id}`);
    if (sess) setSession(JSON.parse(sess));

    fetch(`/api/competitions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status !== "finished") {
          // Try to get leaderboard anyway
        }
        setData(d);
      });

    // Also fetch leaderboard
    fetch(`/api/competitions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leaderboard" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.leaderboard) {
          setData((prev: any) => ({ ...prev, leaderboard: d.leaderboard }));
        }
      });
  }, [id]);

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const lb = data.leaderboard || data.players?.sort((a: any, b: any) => b.score - a.score) || [];
  const myRank = session
    ? lb.findIndex((p: any) => p.name === session.playerName) + 1
    : null;
  const myScore = session
    ? lb.find((p: any) => p.name === session.playerName)
    : null;

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-2xl font-bold text-black mb-1">Hasil Kompetisi</h1>
          <p className="text-gray-600">{data.name}</p>
        </div>

        {myScore && (
          <div className="border border-gray-200 rounded-2xl p-6 mb-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Hasil Kamu</p>
            <p className="text-3xl font-bold text-black mb-1">{myScore.score} poin</p>
            <p className="text-gray-600">
              Peringkat #{myRank} · Benar {myScore.correct || 0} · Salah {myScore.wrong || 0}
            </p>
          </div>
        )}

        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
          <div className="bg-gray-50 px-4 py-3 font-medium text-sm">Leaderboard</div>
          {lb.length === 0 && (
            <p className="p-6 text-center text-gray-400 text-sm">Belum ada data</p>
          )}
          {lb.map((p: any, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 border-t border-gray-100 ${
                session?.playerName === p.name ? "bg-gray-50" : ""
              }`}
            >
              <span className="w-8 text-center font-bold text-gray-400">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
              </span>
              <span className="flex-1 font-medium">{p.name}</span>
              <span className="font-bold">{p.score}</span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="w-full py-3 bg-black text-white font-medium rounded-xl flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
