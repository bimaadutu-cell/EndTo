import { NextRequest, NextResponse } from "next/server";
import { getTmdbKey } from "@/lib/app-config";
export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const key = getTmdbKey(); if (!key) return NextResponse.json({ error: "TMDB belum dikonfigurasi oleh admin." }, { status: 503 }); const { id } = await params; const res = await fetch(`https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?api_key=${encodeURIComponent(key)}&language=id-ID&append_to_response=credits,videos`, { next: { revalidate: 3600 } }); const data = await res.json(); return NextResponse.json(res.ok ? data : { error: "TMDB provider unavailable." }, { status: res.ok ? 200 : res.status }); } catch { return NextResponse.json({ error: "Gagal memuat detail film." }, { status: 503 }); }
}
