"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calculator, BookOpen, FlaskConical, Laptop, ArrowLeft, Play, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categoryData: Record<string, { name: string; icon: any; color: string; materials: any[] }> = {
  matematika: {
    name: "Matematika",
    icon: Calculator,
    color: "bg-blue-500",
    materials: [
      { id: "aljabar", title: "Aljabar Dasar", description: "Variabel, persamaan, dan fungsi aljabar", content: "Aljabar adalah cabang matematika yang menggunakan simbol dan huruf untuk mewakili bilangan...", examples: ["2x + 3 = 7", "x² - 4 = 0"] },
      { id: "persamaan", title: "Persamaan Linear", description: "SPLV dan aplikasinya dalam kehidupan", content: "Persamaan linear adalah persamaan yang pangkat tertinggi dari variabelnya adalah 1...", examples: ["y = 2x + 1", "3x + 2y = 6"] },
      { id: "fungsi", title: "Fungsi Kuadrat", description: "Grafik dan sifat fungsi kuadrat", content: "Fungsi kuadrat adalah fungsi polinomial yang variabelnya berpangkat dua...", examples: ["f(x) = x² + 2x + 1", "y = ax² + bx + c"] },
      { id: "geometri", title: "Geometri", description: "Bangun datar dan bangun ruang", content: "Geometri adalah cabang matematika yang mempelajari tentang bentuk, ukuran, dan posisi...", examples: ["Luas segitiga = ½ × a × t", "Volume kubus = s³"] },
      { id: "statistika", title: "Statistika", description: "Mean, median, modus, dan penyajian data", content: "Statistika adalah ilmu yang mempelajari tentang pengumpulan, analisis, dan interpretasi data...", examples: ["Mean = Σx / n", "Median = nilai tengah"] },
      { id: "logika", title: "Logika Matematika", description: "Proposisi, ingkaran, dan penarikan kesimpulan", content: "Logika matematika adalah cabang logika dan matematika yang mengandung kajian matematis logika...", examples: ["p ∧ q", "p → q"] },
    ],
  },
  agama: {
    name: "Agama",
    icon: BookOpen,
    color: "bg-green-500",
    materials: [
      { id: "akhlak", title: "Akhlak Mulia", description: "Tata krama dan adab dalam Islam", content: "Akhlak adalah perilaku atau tindakan yang berasal dari kebiasaan...", examples: ["Berkata jujur", "Menghormati orang tua"] },
      { id: "fiqih", title: "Fiqih Dasar", description: "Thaharah, shalat, dan ibadah lainnya", content: "Fiqih adalah ilmu yang mempelajari hukum-hukum syara' yang bersifat praktis...", examples: ["Wudhu", "Shalat 5 waktu"] },
      { id: "sejarah", title: "Sejarah Islam", description: "Sirah Nabawiyah dan perkembangan Islam", content: "Sejarah Islam adalah sejarah yang dimulai dari kelahiran Nabi Muhammad SAW...", examples: ["Kelahiran Nabi", "Hijrah ke Madinah"] },
      { id: "quran", title: "Al-Qur'an Hadits", description: "Tajwid dan hadits-hadits pilihan", content: "Al-Qur'an adalah kitab suci umat Islam yang diturunkan kepada Nabi Muhammad SAW...", examples: ["Hukum Nun Mati", "Hadits Arbain"] },
      { id: "aqidah", title: "Aqidah", description: "Rukun Iman dan keyakinan dalam Islam", content: "Aqidah adalah keyakinan yang tertanam kuat dalam hati tanpa keraguan...", examples: ["Iman kepada Allah", "Iman kepada Rasul"] },
    ],
  },
  sains: {
    name: "Sains",
    icon: FlaskConical,
    color: "bg-purple-500",
    materials: [
      { id: "fisika", title: "Fisika Dasar", description: "Gerak, gaya, dan energi", content: "Fisika adalah ilmu yang mempelajari tentang materi dan energi...", examples: ["F = m × a", "E = m × c²"] },
      { id: "biologi", title: "Biologi", description: "Sel, organisme, dan kehidupan", content: "Biologi adalah ilmu yang mempelajari tentang makhluk hidup...", examples: ["Struktur sel", "Fotosintesis"] },
      { id: "kimia", title: "Kimia", description: "Unsur, senyawa, dan reaksi kimia", content: "Kimia adalah ilmu yang mempelajari tentang komposisi, struktur, dan sifat zat...", examples: ["H₂O", "CO₂"] },
      { id: "lingkungan", title: "Lingkungan", description: "Ekosistem dan pelestarian alam", content: "Ilmu lingkungan mempelajari interaksi antara makhluk hidup dengan lingkungannya...", examples: ["Rantai makanan", "Daur air"] },
      { id: "listrik", title: "Listrik", description: "Rangkaian listrik dan elektronika dasar", content: "Listrik adalah fenomena fisika yang berkaitan dengan muatan listrik...", examples: ["V = I × R", "P = V × I"] },
    ],
  },
  informatika: {
    name: "Informatika",
    icon: Laptop,
    color: "bg-orange-500",
    materials: [
      { id: "algoritma", title: "Algoritma", description: "Dasar pemrograman dan logika", content: "Algoritma adalah urutan langkah-langkah logis untuk menyelesaikan masalah...", examples: ["Flowchart", "Pseudocode"] },
      { id: "html-css", title: "HTML & CSS", description: "Dasar pengembangan web", content: "HTML adalah bahasa markup untuk membuat struktur halaman web...", examples: ["<div>", "<p>"] },
      { id: "javascript", title: "JavaScript", description: "Programming web interaktif", content: "JavaScript adalah bahasa pemrograman untuk membuat web interaktif...", examples: ["console.log()", "function()"] },
      { id: "jaringan", title: "Jaringan Komputer", description: "TCP/IP, LAN, WAN, dan internet", content: "Jaringan komputer adalah kumpulan komputer yang terhubung satu sama lain...", examples: ["IP Address", "DNS"] },
      { id: "database", title: "Basis Data", description: "SQL dan manajemen database", content: "Basis data adalah kumpulan data yang terorganisir...", examples: ["SELECT * FROM", "INSERT INTO"] },
      { id: "sistem", title: "Sistem Komputer", description: "Hardware, software, dan arsitektur", content: "Sistem komputer adalah kumpulan perangkat yang bekerja bersama...", examples: ["CPU", "RAM"] },
    ],
  },
};

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const category = categoryData[categoryId];

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Kategori Tidak Ditemukan</h1>
          <Link href="/pembelajaran" className="text-blue-500 hover:underline">
            Kembali ke Pembelajaran
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/pembelajaran"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Link>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${category.color} text-white rounded-2xl flex items-center justify-center`}>
                <category.icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">{category.name}</h1>
                <p className="text-gray-600">Pilih materi untuk mulai belajar</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Materials List */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-bold text-black">Daftar Materi</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterial(material)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedMaterial?.id === material.id ? "bg-gray-50" : ""
                      }`}
                    >
                      <h3 className="font-medium text-black">{material.title}</h3>
                      <p className="text-sm text-gray-500">{material.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Material Content */}
            <div className="lg:col-span-2">
              {selectedMaterial ? (
                <div className="border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-black mb-4">
                    {selectedMaterial.title}
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-6">{selectedMaterial.content}</p>
                    
                    <h3 className="text-lg font-bold text-black mb-3">Contoh:</h3>
                    <div className="space-y-2 mb-6">
                      {selectedMaterial.examples.map((example: string, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
                          {example}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Link
                        href={`/game?category=${categoryId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Main Game
                      </Link>
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-black font-medium rounded-xl hover:bg-gray-200 transition-colors">
                        <HelpCircle className="w-4 h-4" />
                        Kerjakan Quiz
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">Pilih Materi</h3>
                  <p className="text-gray-600">
                    Pilih materi dari daftar di sebelah kiri untuk mulai belajar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
