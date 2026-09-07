import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/pembelajaran", label: "Pembelajaran" },
  { href: "/game", label: "Game" },
  { href: "/kompetisi", label: "Kompetisi" },
  { href: "/film", label: "Film" },
  { href: "/ai", label: "X Website AI" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-black mb-2">
              Website Kelas X TKJ/RPL/TKKR
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Satu ruang digital untuk belajar, bermain, berkompetisi, dan
              berkembang bersama.
            </p>
            <p className="text-xs text-gray-400">
              Developer by BimzOfficial — Ketua Kelas
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-4">
              Quick Links
            </h4>
            <div className="flex flex-wrap gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-4">Informasi</h4>
            <p className="text-sm text-gray-600">
              Platform digital untuk siswa kelas X TKJ, RPL, dan TKKR.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Belajar • Bermain • Berkembang
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Website Kelas X TKJ/RPL/TKKR. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
