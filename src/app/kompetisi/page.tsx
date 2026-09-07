"use client";
import Link from "next/link";
import { Trophy, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KompetisiPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-3">Kompetisi</h1>
          <p className="text-gray-600 mb-10">
            Ikuti kuis live bersama teman sekelas. Guru membuat kompetisi, siswa bergabung dengan kode.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/guru/login" className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all text-left">
              <Users className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Saya Guru</h3>
              <p className="text-sm text-gray-500 mb-3">Buat & kelola kompetisi</p>
              <span className="text-sm font-medium inline-flex items-center gap-1">Login Guru <ArrowRight className="w-4 h-4" /></span>
            </Link>
            <div className="p-6 border border-gray-200 rounded-2xl text-left">
              <Trophy className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Saya Siswa</h3>
              <p className="text-sm text-gray-500 mb-3">Masukkan kode dari guru untuk bergabung</p>
              <p className="text-xs text-gray-400">Gunakan link undangan yang dibagikan guru</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
