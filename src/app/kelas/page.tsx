"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Gamepad2, Trophy, Calendar, Users, Bell, ArrowRight, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypingText from "@/components/TypingText";

const announcements = [
  {
    id: 1,
    title: "Selamat Datang di Website Kelas",
    content: "Platform digital resmi untuk kelas X TKJ/RPL/TKKR telah diluncurkan!",
    type: "info",
    date: "2026-01-15",
  },
  {
    id: 2,
    title: "Kompetisi Matematika Minggu Ini",
    content: "Ikuti kompetisi matematika setiap hari Jumat pukul 14:00 WIB",
    type: "event",
    date: "2026-01-20",
  },
];

const schedule = [
  { day: "Senin", subjects: ["Upacara", "Matematika", "Bahasa Indonesia", "PJOK"] },
  { day: "Selasa", subjects: ["Agama", "Informatika", "Bahasa Inggris", "Sejarah"] },
  { day: "Rabu", subjects: ["Fisika", "Kimia", "Biologi", "Seni Budaya"] },
  { day: "Kamis", subjects: ["Matematika", "PKN", "Basis Data", "Jaringan"] },
  { day: "Jumat", subjects: ["Olahraga", "Kompetisi", "Praktek Lab"] },
];



export default function KelasPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { label: "Total Siswa", value: "33", icon: Users },
    { label: "Materi Tersedia", value: "52", icon: BookOpen },
    { label: "Game Edukasi", value: "18", icon: Gamepad2 },
    { label: "Kompetisi Aktif", value: "5", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              <TypingText text="Dashboard Kelas X TKJ/RPL/TKKR" speed={60} />
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Pusat informasi dan aktivitas kelas. Pantau jadwal, pengumuman, dan
              semua kegiatan pembelajaran di sini.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-6 border border-gray-200 rounded-2xl transition-all duration-500 hover:border-black hover:shadow-lg ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <stat.icon className="w-8 h-8 text-black mb-4" />
                <div className="text-3xl font-bold text-black mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pengumuman */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Pengumuman Terbaru
                </h2>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Lihat Semua
                </Link>
              </div>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-black">
                        {announcement.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          announcement.type === "event"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-gray-400">{announcement.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agenda Kelas */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Agenda Kelas
                </h2>
              </div>
              <div className="space-y-3">
                {schedule.slice(0, 3).map((day) => (
                  <div
                    key={day.day}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-20 text-sm font-semibold text-black">
                      {day.day}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {day.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="text-xs px-2 py-1 bg-white border border-gray-200 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/kelas/jadwal"
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
              >
                Lihat Jadwal Lengkap
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Jadwal Pelajaran */}
          <div className="mt-8 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jadwal Pelajaran Lengkap
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Hari
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-black">
                      Mata Pelajaran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day) => (
                    <tr
                      key={day.day}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-black">
                        {day.day}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-2">
                          {day.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="text-sm px-3 py-1 bg-gray-100 rounded-full"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/pembelajaran"
              className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all group"
            >
              <BookOpen className="w-8 h-8 text-black mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-black mb-1">Materi Pembelajaran</h3>
              <p className="text-sm text-gray-500">Akses semua materi</p>
            </Link>
            <Link
              href="/game"
              className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all group"
            >
              <Gamepad2 className="w-8 h-8 text-black mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-black mb-1">Game Edukasi</h3>
              <p className="text-sm text-gray-500">Belajar sambil bermain</p>
            </Link>
            <Link
              href="/kompetisi"
              className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all group"
            >
              <Trophy className="w-8 h-8 text-black mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-black mb-1">Kompetisi</h3>
              <p className="text-sm text-gray-500">Ikuti lomba</p>
            </Link>
            <Link
              href="/ai"
              className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all group"
            >
              <TrendingUp className="w-8 h-8 text-black mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-black mb-1">X Website AI</h3>
              <p className="text-sm text-gray-500">Asisten pembelajaran</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
