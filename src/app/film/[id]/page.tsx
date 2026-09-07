"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Play, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type PlayerState = "idle" | "loading" | "playing" | "error";

export default function FilmDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeServer, setActiveServer] = useState(1);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [iframeKey, setIframeKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID film tidak valid");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/films/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Film tidak ditemukan");
        } else {
          setMovie(data);
          // Auto-start player
          setPlayerState("loading");
        }
      } catch {
        setError("Gagal memuat detail film");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Timeout: if still loading after 12s → error
  useEffect(() => {
    if (playerState === "loading") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setPlayerState((s) => (s === "loading" ? "error" : s));
      }, 12000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playerState, activeServer, iframeKey]);

  const servers = [
    { id: 1, name: "Server 1", src: `https://vidsrc.to/embed/movie/${id}` },
    { id: 2, name: "Server 2", src: `https://www.2embed.cc/embed/${id}` },
    { id: 3, name: "Server 3", src: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  ];

  const currentSrc = servers.find((s) => s.id === activeServer)?.src || "";

  const retry = () => {
    setPlayerState("loading");
    setIframeKey((k) => k + 1);
  };

  const switchServer = (sid: number) => {
    setActiveServer(sid);
    setPlayerState("loading");
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/film" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <Link href="/film" className="text-sm underline mt-2 inline-block">
                  Kembali ke daftar film
                </Link>
              </div>
            </div>
          )}

          {!loading && movie && (
            <>
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-40 rounded-xl shadow-lg mx-auto sm:mx-0"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-black mb-2">{movie.title}</h1>
                  {movie.release_date && (
                    <p className="text-gray-500 text-sm mb-2">{movie.release_date}</p>
                  )}
                  {movie.overview && (
                    <p className="text-gray-700 text-sm leading-relaxed">{movie.overview}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {servers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => switchServer(s.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeServer === s.id ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                {playerState === "idle" && (
                  <button
                    onClick={() => setPlayerState("loading")}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white hover:bg-white/5"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-8 h-8 fill-white" />
                    </div>
                    <span className="text-sm">Putar Film</span>
                  </button>
                )}

                {(playerState === "loading" || playerState === "playing") && (
                  <>
                    {playerState === "loading" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <Loader2 className="w-10 h-10 animate-spin text-white mb-2" />
                        <p className="text-white text-sm">Memuat video...</p>
                      </div>
                    )}
                    <iframe
                      key={`srv-${activeServer}-${iframeKey}`}
                      src={currentSrc}
                      className="w-full h-full absolute inset-0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      referrerPolicy="no-referrer"
                      title={movie.title}
                      onLoad={() => setPlayerState("playing")}
                    />
                  </>
                )}

                {playerState === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="font-medium">Video gagal dimuat</p>
                    <p className="text-sm text-white/70">Coba ganti server atau tekan Coba Lagi</p>
                    <button
                      onClick={retry}
                      className="mt-2 px-5 py-2 bg-white text-black rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Coba Lagi
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Player tetap di halaman ini. Jika gagal, ganti Server 1/2/3.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
