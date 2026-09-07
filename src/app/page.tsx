"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Gamepad2, Trophy, Film, Brain, Users, Calendar, Share } from "lucide-react";
import TypingText from "@/components/TypingText";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/xten_alliance?stkn=eXdkbzA1M2JpY2pw");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const config = localStorage.getItem("app_config");
    if (config) {
      const parsed = JSON.parse(config);
      if (parsed.instagramUrl) {
        setInstagramUrl(parsed.instagramUrl);
      }
    }
    // Welcome credit on first visit
    const hasSeenWelcome = localStorage.getItem("has_seen_welcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("has_seen_welcome", "true");
  };

  const features = [
    {
      icon: BookOpen,
      title: "Pembelajaran",
      description: "Materi lengkap untuk Matematika, Agama, Sains, dan Informatika",
      href: "/pembelajaran",
    },
    {
      icon: Calendar,
      title: "Roster",
      description: "Jadwal pelajaran lengkap kelas X TKJ RPL TKKR",
      href: "/roster",
    },
    {
      icon: Gamepad2,
      title: "Game",
      description: "Game edukasi dan game dari CrazyGames/Poki",
      href: "/game",
    },
    {
      icon: Trophy,
      title: "Kompetisi",
      description: "Bertanding dengan teman sekelas dalam quiz seru",
      href: "/kompetisi",
    },
    {
      icon: Film,
      title: "Film",
      description: "Jelajah dunia film dengan informasi lengkap",
      href: "/film",
    },
    {
      icon: Brain,
      title: "X Website AI",
      description: "Asisten AI untuk membantu pembelajaranmu",
      href: "/ai",
    },
    {
      icon: Users,
      title: "Kelas",
      description: "Pusat informasi dan aktivitas kelas",
      href: "/kelas",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-700 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-full mb-6">
              X TKJ / RPL / TKKR
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6">
              <TypingText
                text="Website Kelas X TKJ/RPL/TKKR"
                speed={80}
                className="inline"
              />
            </h1>

            <p
              className={`text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 transition-all duration-700 delay-300 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              Satu ruang digital untuk belajar, bermain, berkompetisi, dan
              berkembang bersama.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Link
                href="/kelas"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors group"
              >
                Mulai Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Share className="w-5 h-5" />
                Instagram Kelas
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Siswa", value: "33" },
              { label: "Materi", value: "50+" },
              { label: "Game", value: "100+" },
              { label: "Kompetisi", value: "Aktif" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center transition-all duration-500 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl sm:text-4xl font-bold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Fitur Lengkap
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk belajar dan berkembang dalam satu
              platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all duration-300 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Siap untuk Mulai Belajar?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan platform pembelajaran digital kelas X
            TKJ/RPL/TKKR dan rasakan pengalaman belajar yang menyenangkan.
          </p>
          <Link
            href="/kelas"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-colors group"
          >
            Gabung Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />

      {/* Welcome Credit Modal - First Visit */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
            <div className="text-center">
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-black mb-4">
                Hallo Selamat Datang!
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Hallo selamat datang di website kelas kami, yang di Dirikan oleh ketua kelasnya yang baik, tidak sombong dan rajin menabung eakkk, jangan lupa folow Instagram kami yakkk✌️😜
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Share className="w-4 h-4" />
                  Follow Instagram
                </a>
                <button
                  onClick={closeWelcome}
                  className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Masuk Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
