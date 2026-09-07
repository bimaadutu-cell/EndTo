"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Film, Star, Calendar, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypingText from "@/components/TypingText";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export default function FilmPage() {
  const [activeTab, setActiveTab] = useState("trending");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMovies();
  }, [activeTab]);

  const loadMovies = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/films?type=${activeTab}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setMovies([]);
      } else {
        setMovies(data.results || []);
      }
    } catch (err) {
      setError("Gagal memuat data film");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadMovies();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/films?type=search&query=${searchQuery}`);
      const data = await response.json();
      setMovies(data.results || []);
    } catch (err) {
      setError("Gagal mencari film");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "trending", label: "Trending" },
    { id: "popular", label: "Populer" },
    { id: "now_playing", label: "Sedang Tayang" },
    { id: "upcoming", label: "Akan Datang" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              <TypingText text="Film" speed={60} />
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Jelajahi dunia film dengan informasi lengkap dari TMDB
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari film..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Movies Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-gray-200 rounded-xl mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">
                {error.includes("API key") ? (
                  <>
                    TMDB API Key Belum Dikonfigurasi
                    <p className="text-sm text-gray-500 mt-2">
                      Admin perlu menambahkan TMDB_API_KEY di environment variables
                    </p>
                  </>
                ) : (
                  "Gagal memuat data film"
                )}
              </h3>
              <button
                onClick={loadMovies}
                className="mt-4 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-16">
              <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">
                Tidak Ada Film Ditemukan
              </h3>
              <p className="text-gray-600">Coba kata kunci pencarian lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/film/${movie.id}`}
                  className="group"
                >
                  <div className="aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden mb-2">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Film className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-black text-sm line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </span>
                    {movie.release_date && (
                      <>
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(movie.release_date).getFullYear()}
                        </span>
                      </>
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
