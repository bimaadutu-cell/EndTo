"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Roster data for X TKJ RPL TKKR from official schedule 2026/2027
const rosterData: Record<string, { time: string; subject: string; teacher?: string }[]> = {
  Senin: [
    { time: "07.30 - 08.15", subject: "UPACARA" },
    { time: "08.15 - 09.00", subject: "PAI", teacher: "RT" },
    { time: "09.00 - 09.45", subject: "PAI", teacher: "RT" },
    { time: "09.45 - 10.00", subject: "ISTIRAHAT" },
    { time: "10.00 - 10.45", subject: "BK", teacher: "MR" },
    { time: "10.45 - 11.30", subject: "B.ING", teacher: "PI" },
    { time: "11.30 - 12.15", subject: "B.ING", teacher: "PI" },
    { time: "12.15 - 13.00", subject: "ISTIRAHAT" },
    { time: "13.00 - 13.45", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "13.45 - 14.30", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "14.30 - 15.15", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "15.15 - 16.00", subject: "PRO AT/DV", teacher: "AT/DV" },
  ],
  Selasa: [
    { time: "07.30 - 08.15", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "08.15 - 09.00", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "09.00 - 09.45", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "09.45 - 10.00", subject: "ISTIRAHAT" },
    { time: "10.00 - 10.45", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "10.45 - 11.30", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "11.30 - 12.15", subject: "PRO AT/DV", teacher: "AT/DV" },
    { time: "12.15 - 13.00", subject: "ISTIRAHAT" },
    { time: "13.00 - 13.45", subject: "SENI", teacher: "AY" },
    { time: "13.45 - 14.30", subject: "SENI", teacher: "AY" },
    { time: "14.30 - 15.15", subject: "B.INDO", teacher: "FN" },
    { time: "15.15 - 16.00", subject: "B.INDO", teacher: "FN" },
  ],
  Rabu: [
    { time: "07.30 - 08.15", subject: "MM", teacher: "WD" },
    { time: "08.15 - 09.00", subject: "MM", teacher: "WD" },
    { time: "09.00 - 09.45", subject: "SENI", teacher: "AY" },
    { time: "09.45 - 10.00", subject: "ISTIRAHAT" },
    { time: "10.00 - 10.45", subject: "SENI", teacher: "AY" },
    { time: "10.45 - 11.30", subject: "B.INDO", teacher: "FN" },
    { time: "11.30 - 12.15", subject: "B.INDO", teacher: "FN" },
    { time: "12.15 - 13.00", subject: "ISTIRAHAT" },
    { time: "13.00 - 13.45", subject: "TIK", teacher: "SC" },
    { time: "13.45 - 14.30", subject: "TIK", teacher: "SC" },
    { time: "14.30 - 15.15", subject: "PJOK", teacher: "IN" },
    { time: "15.15 - 16.00", subject: "PJOK", teacher: "IN" },
  ],
  Kamis: [
    { time: "07.30 - 08.15", subject: "MM", teacher: "WD" },
    { time: "08.15 - 09.00", subject: "MM", teacher: "WD" },
    { time: "09.00 - 09.45", subject: "PKN", teacher: "JS" },
    { time: "09.45 - 10.00", subject: "ISTIRAHAT" },
    { time: "10.00 - 10.45", subject: "PKN", teacher: "JS" },
    { time: "10.45 - 11.30", subject: "PAI", teacher: "RT" },
    { time: "11.30 - 12.15", subject: "PAI", teacher: "RT" },
    { time: "12.15 - 13.00", subject: "ISTIRAHAT" },
    { time: "13.00 - 13.45", subject: "PAI", teacher: "RT" },
    { time: "13.45 - 14.30", subject: "BK", teacher: "MR" },
    { time: "14.30 - 15.15", subject: "TIK", teacher: "SC" },
    { time: "15.15 - 16.00", subject: "TIK", teacher: "SC" },
  ],
  Jumat: [
    { time: "07.30 - 09.30", subject: "EKSKUL", teacher: "Futsal, Musik, Tari, PMR, Paskib, Silat" },
    { time: "09.30 - 10.00", subject: "ISTIRAHAT" },
    { time: "10.00 - 10.45", subject: "PJOK", teacher: "IN" },
    { time: "10.45 - 11.30", subject: "PJOK", teacher: "IN" },
    { time: "11.30 - 12.15", subject: "KWH", teacher: "NN" },
    { time: "12.15 - 13.20", subject: "ISTIRAHAT DAN SHOLAT JUM'AT" },
    { time: "13.20 - 14.00", subject: "KWH", teacher: "NN" },
    { time: "14.00 - 14.40", subject: "B.ING", teacher: "PI" },
    { time: "14.40 - 15.10", subject: "B.ING", teacher: "PI" },
  ],
};

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const subjectColors: Record<string, string> = {
  UPACARA: "bg-blue-100 text-blue-800 border-blue-200",
  PAI: "bg-green-100 text-green-800 border-green-200",
  BK: "bg-purple-100 text-purple-800 border-purple-200",
  "B.ING": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "PRO AT/DV": "bg-orange-100 text-orange-800 border-orange-200",
  SENI: "bg-pink-100 text-pink-800 border-pink-200",
  "B.INDO": "bg-indigo-100 text-indigo-800 border-indigo-200",
  MM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  TIK: "bg-teal-100 text-teal-800 border-teal-200",
  PJOK: "bg-red-100 text-red-800 border-red-200",
  PKN: "bg-lime-100 text-lime-800 border-lime-200",
  KWH: "bg-amber-100 text-amber-800 border-amber-200",
  EKSKUL: "bg-rose-100 text-rose-800 border-rose-200",
  ISTIRAHAT: "bg-gray-100 text-gray-600 border-gray-200",
  "ISTIRAHAT DAN SHOLAT JUM'AT": "bg-gray-100 text-gray-600 border-gray-200",
};

export default function RosterPage() {
  const [selectedDay, setSelectedDay] = useState("Senin");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">
                  Roster Kelas
                </h1>
                <p className="text-gray-600 text-sm">
                  X TKJ RPL TKKR • Tahun Ajaran 2026/2027
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              SMK Khaidir Nur Binjai • Roster resmi
            </p>
          </div>

          {/* Day Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedDay === day
                    ? "bg-black text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Schedule List */}
          <div className="space-y-3">
            {rosterData[selectedDay]?.map((item, index) => {
              const isBreak = item.subject.includes("ISTIRAHAT");
              const colorClass =
                subjectColors[item.subject] ||
                "bg-gray-50 text-gray-800 border-gray-200";

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isBreak
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  } transition-all`}
                >
                  <div className="flex-shrink-0 w-28 sm:w-32">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{item.time}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${colorClass}`}
                    >
                      {!isBreak && <BookOpen className="w-3.5 h-3.5" />}
                      {item.subject}
                    </div>
                    {item.teacher && !isBreak && (
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">
                        Guru: {item.teacher}
                      </p>
                    )}
                    {item.teacher && isBreak && item.subject === "EKSKUL" && (
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">
                        {item.teacher}
                      </p>
                    )}
                  </div>

                  <div className="hidden sm:block text-xs text-gray-400 font-mono">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-black mb-3">Keterangan Singkatan</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              <div><span className="font-medium">PAI</span> — Pendidikan Agama Islam</div>
              <div><span className="font-medium">BK</span> — Bimbingan Konseling</div>
              <div><span className="font-medium">B.ING</span> — Bahasa Inggris</div>
              <div><span className="font-medium">B.INDO</span> — Bahasa Indonesia</div>
              <div><span className="font-medium">PRO AT/DV</span> — Produktif (AT/DV)</div>
              <div><span className="font-medium">MM</span> — Matematika</div>
              <div><span className="font-medium">TIK</span> — Teknologi Informasi</div>
              <div><span className="font-medium">PJOK</span> — Pendidikan Jasmani</div>
              <div><span className="font-medium">PKN</span> — Pendidikan Kewarganegaraan</div>
              <div><span className="font-medium">SENI</span> — Seni Budaya</div>
              <div><span className="font-medium">KWH</span> — Kewirausahaan</div>
              <div><span className="font-medium">EKSKUL</span> — Ekstrakurikuler</div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Sumber: Roster Pelajaran SMK Khaidir Nur Binjai TA 2026/2027 • Binjai, 13 Juli 2026
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
