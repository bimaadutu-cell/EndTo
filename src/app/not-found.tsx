import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-gray-600 mb-6">Halaman tidak ditemukan</p>
        <Link href="/" className="px-6 py-3 bg-black text-white rounded-xl font-medium inline-block">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
