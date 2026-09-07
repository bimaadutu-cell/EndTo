"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/kelas", label: "Kelas" },
  { href: "/roster", label: "Roster" },
  { href: "/pembelajaran", label: "Pembelajaran" },
  { href: "/game", label: "Game" },
  { href: "/kompetisi", label: "Kompetisi" },
  { href: "/film", label: "Film" },
  { href: "/ai", label: "X Website AI" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-black">Website Kelas</Link>
        <div className="hidden lg:flex gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm ${pathname === item.href ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-gray-100 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm ${pathname === item.href ? "bg-black text-white" : "text-gray-600"}`}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
