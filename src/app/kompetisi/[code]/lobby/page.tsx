"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Trophy, Play, Loader2 } from "lucide-react";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.code as string; // we use competition id in path
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [starting, setStarting] = useState(false);
  const [session, setSession] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/competitions/${id}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Gagal memuat");
      setData(d);
      if (d.status === "running") {
        router.push(`/kompetisi/${id}/play`);
      }
      if (d.status === "finished") {
        router.push(`/kompetisi/${id}/result`);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }, [id, router]);

  useEffect(() => {
    // Check if teacher or student
    const teacherAuth = localStorage.getItem("teacher_token") || localStorage.getItem("admin_auth");
    if (teacherAuth) setIsTeacher(true);

    const sess = localStorage.getItem(`comp_session_${id}`);
    if (sess) setSession(JSON.parse(sess));

    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [id, load]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/competitions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", teacherId: "guruku" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      router.push(`/kompetisi/${id}/play`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  if (error && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => router.push("/")} className="px-6 py-2 bg-black text-white rounded-xl">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">{data.name}</h1>
          <p className="text-gray-500 text-sm">
            {data.status === "waiting" ? "Menunggu guru memulai..." : data.status}
          </p>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            <span className="font-medium">{data.playerCount} Peserta</span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {data.players?.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada peserta</p>
            )}
            {data.players?.map((p: any, i: number) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  session?.playerId === p.id ? "bg-black text-white" : "bg-gray-50"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-gray-200 text-black text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="font-medium">{p.name}</span>
                {session?.playerId === p.id && (
                  <span className="ml-auto text-xs opacity-70">Kamu</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isTeacher && data.status === "waiting" && (
          <button
            onClick={handleStart}
            disabled={starting || data.playerCount === 0}
            className="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {starting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" /> Mulai Kompetisi
              </>
            )}
          </button>
        )}

        {!isTeacher && (
          <p className="text-center text-sm text-gray-500">
            Menunggu guru menekan tombol Mulai...
          </p>
        )}
      </div>
    </div>
  );
}
