"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Search, X } from "lucide-react";
import Footer from "@/components/Footer";

// Popular games inspired by Poki.com with working embed URLs + thumbnails
const games = [
  {
    id: 1,
    name: "Subway Surfers",
    category: "Adventure",
    source: "poki",
    embedUrl: "https://html5.gamedistribution.com/8baa45aabd504c1ab7a6c4ee9b1a336f/",
    thumbnail: "https://cdn.poki.com/cdn-cgi/image/q=78,scq=50,width=314,height=314,fit=cover,f=auto/0b8a4e0e0e0e0e0e0e0e0e0e0e0e0e0e/subway-surfers.png",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 2,
    name: "Level Devil",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://leveldevil.io/",
    thumbnail: "",
    color: "from-red-600 to-orange-700",
  },
  {
    id: 3,
    name: "Drive Mad",
    category: "Racing",
    source: "poki",
    embedUrl: "https://html5.gamedistribution.com/5b0abd4c0faa4f5eb190a9a16d5a1b4c/",
    thumbnail: "",
    color: "from-red-500 to-rose-600",
  },
  {
    id: 4,
    name: "Stickman Hook",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://html5.gamedistribution.com/rvvASMiM/stickmanhook/",
    thumbnail: "",
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: 5,
    name: "Drift Boss",
    category: "Racing",
    source: "poki",
    embedUrl: "https://drift-boss.com/",
    thumbnail: "",
    color: "from-lime-400 to-green-600",
  },
  {
    id: 6,
    name: "Temple Run 2",
    category: "Adventure",
    source: "poki",
    embedUrl: "https://html5.gamedistribution.com/rvvASMiM/templerun2/",
    thumbnail: "",
    color: "from-amber-600 to-yellow-700",
  },
  {
    id: 7,
    name: "Monkey Mart",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://monkeymart.io/",
    thumbnail: "",
    color: "from-yellow-300 to-amber-500",
  },
  {
    id: 8,
    name: "Retro Bowl",
    category: "Sports",
    source: "poki",
    embedUrl: "https://retrobowl.me/",
    thumbnail: "",
    color: "from-yellow-500 to-amber-700",
  },
  {
    id: 9,
    name: "Paper.io 2",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://paper-io.com/",
    thumbnail: "",
    color: "from-cyan-400 to-blue-600",
  },
  {
    id: 10,
    name: "Slope",
    category: "Arcade",
    source: "crazygames",
    embedUrl: "https://slopegame.io/",
    thumbnail: "",
    color: "from-indigo-500 to-purple-600",
  },
  {
    id: 11,
    name: "Moto X3M",
    category: "Racing",
    source: "crazygames",
    embedUrl: "https://html5.gamedistribution.com/5b0abd4c0faa4f5eb190a9a16d5a1b4c/?gd_sdk_referrer_url=https://gamedistribution.com/games/moto-x3m-bike-race-game/",
    thumbnail: "",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: 12,
    name: "Smash Karts",
    category: "Racing",
    source: "poki",
    embedUrl: "https://smashkarts.io/",
    thumbnail: "",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 13,
    name: "Tunnel Rush",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://tunnelrush.net/",
    thumbnail: "",
    color: "from-fuchsia-500 to-pink-600",
  },
  {
    id: 14,
    name: "Flappy Bird",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://flappybird.io/",
    thumbnail: "",
    color: "from-sky-400 to-blue-500",
  },
  {
    id: 15,
    name: "Fireboy and Watergirl",
    category: "Adventure",
    source: "poki",
    embedUrl: "https://fireboyandwatergirl.io/",
    thumbnail: "",
    color: "from-red-400 to-blue-500",
  },
  {
    id: 16,
    name: "Basket Random",
    category: "Sports",
    source: "crazygames",
    embedUrl: "https://html5.gamedistribution.com/basket-random/",
    thumbnail: "",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 17,
    name: "1v1.LOL",
    category: "Shooting",
    source: "crazygames",
    embedUrl: "https://1v1.lol/",
    thumbnail: "",
    color: "from-violet-500 to-purple-700",
  },
  {
    id: 18,
    name: "Iron Snout",
    category: "Fighting",
    source: "poki",
    embedUrl: "https://ironsnout.game/",
    thumbnail: "",
    color: "from-slate-600 to-gray-800",
  },
  {
    id: 19,
    name: "Happy Wheels",
    category: "Arcade",
    source: "crazygames",
    embedUrl: "https://happywheels.io/",
    thumbnail: "",
    color: "from-teal-400 to-cyan-600",
  },
  {
    id: 20,
    name: "Among Us",
    category: "Multiplayer",
    source: "poki",
    embedUrl: "https://amongusplay.online/",
    thumbnail: "",
    color: "from-red-500 to-pink-600",
  },
  {
    id: 21,
    name: "Brain Test",
    category: "Arcade",
    source: "poki",
    embedUrl: "https://braintest.me/",
    thumbnail: "",
    color: "from-purple-400 to-indigo-600",
  },
  {
    id: 22,
    name: "Penalty Shooters 2",
    category: "Sports",
    source: "poki",
    embedUrl: "https://penaltyshooters2.com/",
    thumbnail: "",
    color: "from-green-500 to-emerald-700",
  },
  {
    id: 23,
    name: "Red Ball 4",
    category: "Adventure",
    source: "poki",
    embedUrl: "https://redball4.com/",
    thumbnail: "",
    color: "from-red-500 to-red-700",
  },
  {
    id: 24,
    name: "Stickman Battle",
    category: "Fighting",
    source: "poki",
    embedUrl: "https://stickmanbattle.io/",
    thumbnail: "",
    color: "from-gray-700 to-black",
  },
  {
    id: 25,
    name: "Minecraft Classic",
    category: "Adventure",
    source: "crazygames",
    embedUrl: "https://classic.minecraft.net/",
    thumbnail: "",
    color: "from-green-500 to-emerald-600",
  },
];

const categories = ["All", "Racing", "Adventure", "Sports", "Arcade", "Shooting", "Fighting", "Multiplayer"];

export default function Game1Page() {
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/game"
                className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-6 h-6 text-black" />
                <h1 className="text-xl font-bold text-black">Game Arcade</h1>
              </div>
            </div>
            {selectedGame && (
              <button
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Tutup Game
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedGame ? (
        // Fullscreen-ish Game Player - NO new tabs
        <div className="h-[calc(100vh-64px)] flex flex-col">
          <div className="flex-1 bg-black relative">
            <iframe
              src={selectedGame.embedUrl}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; gamepad; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen allow-pointer-lock"
              referrerPolicy="no-referrer"
              title={selectedGame.name}
            />
          </div>
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between flex-wrap gap-3 max-w-7xl mx-auto">
              <div>
                <h2 className="text-lg font-bold text-black">{selectedGame.name}</h2>
                <p className="text-sm text-gray-500">
                  {selectedGame.source === "crazygames" ? "CrazyGames" : "Poki"} • {selectedGame.category}
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Game dimainkan langsung di website • Tidak membuka tab baru
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Game List View
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-1">Koleksi Game</h2>
            <p className="text-gray-600 text-sm">
              Data game terinspirasi dari Poki.com • Main langsung tanpa tab baru
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari game..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid with better visuals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredGames.map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-lg transition-all text-left"
              >
                <div
                  className={`aspect-square bg-gradient-to-br ${game.color} flex flex-col items-center justify-center relative overflow-hidden`}
                >
                  {game.thumbnail ? (
                    <>
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform absolute inset-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </>
                  ) : null}
                  <Gamepad2 className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform z-10" />
                  <span className="text-white text-xs font-bold mt-2 z-10 text-center px-2 drop-shadow">
                    {game.name.split(" ")[0]}
                  </span>
                  <div className="absolute bottom-2 right-2 z-10">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        game.source === "crazygames"
                          ? "bg-blue-600/90 text-white"
                          : "bg-emerald-600/90 text-white"
                      }`}
                    >
                      {game.source === "crazygames" ? "CG" : "Poki"}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-black text-sm mb-1 line-clamp-1 group-hover:text-gray-700">
                    {game.name}
                  </h3>
                  <span className="text-xs text-gray-500">{game.category}</span>
                </div>
              </button>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">Tidak Ada Game Ditemukan</h3>
              <p className="text-gray-600">Coba kata kunci pencarian lain</p>
            </div>
          )}

          <div className="mt-10 p-5 bg-gray-50 rounded-2xl border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Info:</strong> Game diambil & diinspirasi dari koleksi populer di{" "}
              <a href="https://poki.com" target="_blank" rel="noopener noreferrer" className="underline">
                Poki.com
              </a>
              . Semua game dimainkan langsung di dalam website tanpa membuka tab baru.
              Beberapa game memerlukan koneksi internet stabil.
            </p>
          </div>
        </main>
      )}

      {!selectedGame && <Footer />}
    </div>
  );
}
