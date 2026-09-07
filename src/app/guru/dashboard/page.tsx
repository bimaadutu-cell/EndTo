"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Plus, LogOut, Users } from "lucide-react";

export default function GuruDashboard() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Guru</h1>
            <p className="text-gray-500 text-sm">Kelola kompetisi kelas</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("teacher_token");
              router.push("/");
            }}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="grid gap-4">
          <Link
            href="/guru/kompetisi/create"
            className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Buat Kompetisi Baru</h3>
              <p className="text-sm text-gray-500">Buat kuis live untuk siswa</p>
            </div>
          </Link>

          <div className="p-6 border border-gray-200 rounded-2xl bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5" />
              <h3 className="font-bold">Cara Kerja</h3>
            </div>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Buat kompetisi & pilih kategori soal</li>
              <li>Bagikan kode / link ke siswa</li>
              <li>Tunggu siswa masuk lobby</li>
              <li>Tekan Mulai Kompetisi</li>
              <li>Kontrol soal berikutnya & lihat hasil</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
