import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Website Kelas X TKJ/RPL/TKKR",
  description: "Satu ruang digital untuk belajar, bermain, berkompetisi, dan berkembang bersama.",
  keywords: ["sekolah", "kelas", "TKJ", "RPL", "TKKR", "pembelajaran", "game edukasi"],
  authors: [{ name: "BimzOfficial", url: "#" }],
  creator: "BimzOfficial",
  openGraph: {
    title: "Website Kelas X TKJ/RPL/TKKR",
    description: "Satu ruang digital untuk belajar, bermain, berkompetisi, dan berkembang bersama.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-black antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
