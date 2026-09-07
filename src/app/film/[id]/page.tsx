"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FilmDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeServer, setActiveServer] = useState(1);
  const [playing, setPlaying] = useState(false);

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
        }
      } catch {
        setError("Gagal memuat detail film");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const servers = [
    { id: 1, name: "Server 1", src: `https://vidsrc.to/embed/movie/${id}` },
    { id: 2, name: "Server 2", src: `https://www.2embed.cc/embed/${id}` },
    { id: 3, name: "Server 3", src: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  ];

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
                <Link href="/film" className="text-sm underline mt-2 inline-block">Kembali ke daftar film</Link>
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

              {/* Server selector */}
              <div className="flex gap-2 mb-4">
                {servers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveServer(s.id);
                      setPlaying(true);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      activeServer === s.id && playing
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {/* Player - stays on page, no new tab */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                {!playing ? (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-8 h-8 fill-white" />
                    </div>
                    <span className="text-sm">Putar Film</span>
                  </button>
                ) : (
                  <iframe
                    key={`srv-${activeServer}-${id}`}
                    src={servers.find((s) => s.id === activeServer)?.src}
                    className="w-full h-full absolute inset-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    referrerPolicy="no-referrer"
                    title={movie.title}
                  />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Jika video tidak muncul, ganti Server. Player tetap di halaman ini (tidak buka tab baru).
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
