"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Trophy, Users, AlertCircle, Loader2 } from "lucide-react";

function JoinInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = String(params?.inviteCode || "").toUpperCase().trim();
  const token = searchParams.get("p") || searchParams.get("token") || "";

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{
    name: string;
    status: string;
    playerCount: number;
    maxPlayers?: number;
    category?: string;
  } | null>(null);

  useEffect(() => {
    if (!code || code.length < 3) {
      setError("Kode undangan tidak valid");
      setChecking(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let url = `/api/competitions/join?code=${encodeURIComponent(code)}`;
        if (token) url += `&p=${encodeURIComponent(token)}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Undangan tidak ditemukan");
          setInfo(null);
        } else {
          setInfo(data);
          setError("");
        }
      } catch {
        if (!cancelled) setError("Gagal memuat undangan. Coba refresh.");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: code,
          playerName: name.trim(),
          token: token || undefined,
        }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal bergabung");
        setLoading(false);
        return;
      }
      try {
        localStorage.setItem(
          `comp_session_${data.competition.id}`,
          JSON.stringify({
            sessionToken: data.player.sessionToken,
            playerName: data.player.name,
            playerId: data.player.id,
          })
        );
        // Keep token for lobby hydration on other routes
        if (token) localStorage.setItem(`comp_token_${data.competition.id}`, token);
      } catch {}
      router.push(`/kompetisi/${data.competition.id}/lobby`);
    } catch {
      setError("Koneksi gagal. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-1">Gabung Kompetisi</h1>
          {info?.name && <p className="text-gray-600">{info.name}</p>}
        </div>

        {checking && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {!checking && error && !info && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
              <p className="text-xs text-red-500 mt-1">
                Gunakan <strong>link lengkap</strong> dari guru (bukan hanya kode). Link berisi data kompetisi.
              </p>
            </div>
          </div>
        )}

        {!checking && info && (
          <>
            {info.status !== "waiting" && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                Kompetisi sudah {info.status === "finished" ? "selesai" : "dimulai"}. Tidak bisa bergabung.
              </div>
            )}

            <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {info.playerCount} peserta · {info.category}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Kamu</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={30}
                  placeholder="Masukkan nama"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kode Kompetisi</label>
                <input
                  value={code}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-mono tracking-widest text-center text-lg"
                />
              </div>
              <button
                type="submit"
                disabled={loading || info.status !== "waiting"}
                className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Bergabung..." : "Gabung Sekarang"}
              </button>
            </form>
          </>
        )}

        <p className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-black">
            ← Kembali ke Beranda
          </a>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <JoinInner />
    </Suspense>
  );
}
