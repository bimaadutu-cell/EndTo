"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, BookOpen, FlaskConical, Laptop, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypingText from "@/components/TypingText";

const categories = [
  {
    id: "matematika",
    name: "Matematika",
    icon: Calculator,
    color: "bg-blue-500",
    description: "Aljabar, Geometri, Statistika, dan Logika",
    materials: [
      { title: "Aljabar Dasar", description: "Variabel, persamaan, dan fungsi" },
      { title: "Persamaan Linear", description: "SPLV dan aplikasinya" },
      { title: "Fungsi Kuadrat", description: "Grafik dan sifat fungsi" },
      { title: "Geometri", description: "Bangun datar dan ruang" },
      { title: "Statistika", description: "Mean, median, modus" },
      { title: "Logika Matematika", description: "Proposisi dan ingkaran" },
    ],
  },
  {
    id: "agama",
    name: "Agama",
    icon: BookOpen,
    color: "bg-green-500",
    description: "Akhlak, Fiqih, Sejarah Islam",
    materials: [
      { title: "Akhlak Mulia", description: "Tata krama dan adab" },
      { title: "Fiqih Dasar", description: "Thaharah dan shalat" },
      { title: "Sejarah Islam", description: "Sirah Nabawiyah" },
      { title: "Al-Qur'an Hadits", description: "Tajwid dan hadits" },
      { title: "Aqidah", description: "Rukun Iman" },
    ],
  },
  {
    id: "sains",
    name: "Sains",
    icon: FlaskConical,
    color: "bg-purple-500",
    description: "Fisika, Biologi, Kimia",
    materials: [
      { title: "Fisika Dasar", description: "Gerak dan gaya" },
      { title: "Biologi", description: "Sel dan organisme" },
      { title: "Kimia", description: "Unsur dan senyawa" },
      { title: "Lingkungan", description: "Ekosistem" },
      { title: "Listrik", description: "Rangkaian listrik" },
    ],
  },
  {
    id: "informatika",
    name: "Informatika",
    icon: Laptop,
    color: "bg-orange-500",
    description: "Programming, Jaringan, Database",
    materials: [
      { title: "Algoritma", description: "Dasar pemrograman" },
      { title: "HTML & CSS", description: "Web development" },
      { title: "JavaScript", description: "Programming web" },
      { title: "Jaringan Komputer", description: "TCP/IP, LAN, WAN" },
      { title: "Basis Data", description: "SQL dan database" },
      { title: "Sistem Komputer", description: "Hardware & software" },
    ],
  },
];

export default function PembelajaranPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              <TypingText text="Materi Pembelajaran" speed={60} />
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Pilih kategori materi yang ingin kamu pelajari. Setiap materi
              dilengkapi dengan penjelasan, contoh, dan quiz.
            </p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 ${category.color} text-white rounded-xl flex items-center justify-center`}
                      >
                        <category.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-black">
                          {category.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {category.materials.slice(0, 4).map((material) => (
                      <div
                        key={material.title}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div>
                          <h3 className="font-medium text-black">
                            {material.title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {material.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/pembelajaran/${category.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Lihat Semua Materi
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Tips */}
          <div className="border border-gray-200 rounded-2xl p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-black mb-6">
              Tips Belajar Efektif
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-semibold text-black">Pahami Konsep</h3>
                <p className="text-sm text-gray-600">
                  Jangan hanya menghafal, tapi pahami konsep dasar setiap materi
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-semibold text-black">Latihan Rutin</h3>
                <p className="text-sm text-gray-600">
                  Kerjakan soal latihan setiap hari untuk memperkuat pemahaman
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-semibold text-black">Diskusi</h3>
                <p className="text-sm text-gray-600">
                  Diskusikan materi dengan teman untuk memperdalam pemahaman
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
