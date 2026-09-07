"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, Users, AlertCircle } from "lucide-react";

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.inviteCode as string)?.toUpperCase();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<{ name: string; status: string; playerCount: number } | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/competitions/join?code=${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInfo(d);
      })
      .catch(() => setError("Gagal memuat data kompetisi"));
  }, [code]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/competitions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code, playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal bergabung");
      // Save session
      localStorage.setItem(
        `comp_session_${data.competition.id}`,
        JSON.stringify({
          sessionToken: data.player.sessionToken,
          playerName: data.player.name,
          playerId: data.player.id,
        })
      );
      router.push(`/kompetisi/${data.competition.id}/lobby`);
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          {info && <p className="text-gray-600">{info.name}</p>}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {info && info.status !== "waiting" && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            Kompetisi sudah {info.status === "finished" ? "selesai" : "dimulai"}. Tidak bisa bergabung.
          </div>
        )}

        {info && (
          <div className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            {info.playerCount} peserta sudah bergabung
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kode Kompetisi</label>
            <input
              value={code || ""}
              readOnly
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 font-mono tracking-widest text-center text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !info || info.status !== "waiting"}
            className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Bergabung..." : "Gabung Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
