"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Terjadi gangguan</h1>
        <p className="text-gray-600 mb-6 text-sm">
          Fitur ini sedang mengalami masalah. Coba muat ulang halaman.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium mr-3"
        >
          Coba Lagi
        </button>
        <a href="/" className="px-6 py-3 border border-gray-200 rounded-xl font-medium inline-block">
          Beranda
        </a>
      </div>
    </div>
  );
}
