"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Film, Search, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
};

export default function FilmPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("trending");

  const load = async (t = type, q = query) => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/films?type=${t}`;
      if (t === "search" && q) url = `/api/films?type=search&query=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal memuat film. Admin perlu mengatur TMDB API Key di /admin.");
        setMovies([]);
      } else {
        setMovies(data.results || []);
      }
    } catch {
      setError("Koneksi gagal. Coba lagi.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("trending");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setType("search");
      load("search", query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-2">Nonton Film</h1>
          <p className="text-gray-600 mb-6">Jelajahi film populer</p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-black text-white rounded-xl font-medium">
              Cari
            </button>
          </form>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { id: "trending", label: "Trending" },
              { id: "popular", label: "Populer" },
              { id: "now_playing", label: "Sedang Tayang" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  setQuery("");
                  load(t.id);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  type === t.id ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && error && (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Buka /admin → masukkan TMDB API Key → Save
                </p>
              </div>
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <p className="text-center text-gray-500 py-20">Tidak ada film ditemukan</p>
          )}

          {!loading && movies.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((m) => (
                <Link
                  key={m.id}
                  href={`/film/${m.id}`}
                  className="group rounded-xl overflow-hidden border border-gray-100 hover:border-black hover:shadow-lg transition-all"
                >
                  <div className="aspect-[2/3] bg-gray-100 relative">
                    {m.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                        alt={m.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:underline">{m.title}</h3>
                    {m.release_date && (
                      <p className="text-xs text-gray-400 mt-1">{m.release_date.slice(0, 4)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
