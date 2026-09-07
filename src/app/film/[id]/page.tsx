"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Calendar, Clock, Film, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
}

export default function FilmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeServer, setActiveServer] = useState(1);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    try {
      const response = await fetch(`/api/films/${id}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMovie(data);
      }
    } catch (err) {
      setError("Gagal memuat detail film");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-4">
            {error || "Film tidak ditemukan"}
          </h1>
          <Link
            href="/film"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Film
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-20">
        {/* Backdrop */}
        {movie.backdrop_path && (
          <div className="relative h-64 sm:h-96">
            <img
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2">
              <Link
                href="/film"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>

              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="text-lg text-gray-600 mb-4">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-black">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({movie.vote_count} votes)
                  </span>
                </div>
                {movie.release_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {new Date(movie.release_date).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{movie.runtime} menit</span>
                  </div>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-lg font-bold text-black mb-2">Sinopsis</h2>
                <p className="text-gray-700 leading-relaxed">
                  {movie.overview || "Tidak ada sinopsis tersedia."}
                </p>
              </div>

              {/* Video Player Section */}
              <div className="border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Nonton Film
                </h2>

                {/* Server Selection */}
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map((server) => (
                    <button
                      key={server}
                      onClick={() => setActiveServer(server)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeServer === server
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Server {server}
                    </button>
                  ))}
                </div>

                {/* Video Player Embed - sandboxed to reduce popups/ads redirect */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                  {activeServer === 1 && (
                    <iframe
                      key={`s1-${id}`}
                      src={`https://vidsrc.to/embed/movie/${id}`}
                      className="w-full h-full absolute inset-0"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="no-referrer"
                      
                      
                      title={`${movie.title} - Server 1`}
                    />
                  )}
                  {activeServer === 2 && (
                    <iframe
                      key={`s2-${id}`}
                      src={`https://www.2embed.cc/embed/${id}`}
                      className="w-full h-full absolute inset-0"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="no-referrer"
                      
                      
                      title={`${movie.title} - Server 2`}
                    />
                  )}
                  {activeServer === 3 && (
                    <iframe
                      key={`s3-${id}`}
                      src={`https://multiembed.mov/?video_id=${id}&tmdb=1`}
                      className="w-full h-full absolute inset-0"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      referrerPolicy="no-referrer"
                      
                      
                      title={`${movie.title} - Server 3`}
                    />
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Jika video tidak muncul, coba ganti Server (1/2/3). Gunakan mode fullscreen. Beberapa browser mungkin memblokir embed — coba browser lain atau adblocker.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
