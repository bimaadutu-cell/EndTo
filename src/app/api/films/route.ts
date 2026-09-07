import { NextRequest, NextResponse } from "next/server";
import { getTmdbKey } from "@/lib/app-config";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try { const params = request.nextUrl.searchParams; const type = params.get("type") || "trending"; const page = params.get("page") || "1"; const query = params.get("query") || ""; const key = getTmdbKey(); if (!key) return NextResponse.json({ error: "TMDB belum dikonfigurasi oleh admin." }, { status: 503 }); const routes: Record<string, string> = { trending: `/trending/movie/week`, popular: `/movie/popular`, now_playing: `/movie/now_playing`, upcoming: `/movie/upcoming` }; const endpoint = type === "search" ? `/search/movie?query=${encodeURIComponent(query)}` : (routes[type] || routes.trending); const res = await fetch(`${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(key)}&language=id-ID&page=${page}`, { next: { revalidate: 3600 } }); const data = await res.json(); if (!res.ok) return NextResponse.json({ error: "TMDB provider unavailable." }, { status: res.status }); return NextResponse.json(data); } catch { return NextResponse.json({ error: "Gagal memuat film. Coba lagi." }, { status: 503 }); }
}
