import { NextRequest, NextResponse } from "next/server";
import { getTmdbKey } from "@/lib/app-config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "trending";
    const page = searchParams.get("page") || "1";
    const query = searchParams.get("query");

    const tmdbApiKey = getTmdbKey() || process.env.TMDB_API_KEY || "";

    if (!tmdbApiKey) {
      return NextResponse.json(
        { error: "TMDB API key belum dikonfigurasi. Admin atur di /admin (global)." },
        { status: 500 }
      );
    }

    let url = "";
    switch (type) {
      case "trending":
        url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${tmdbApiKey}&language=id-ID&page=${page}`;
        break;
      case "popular":
        url = `${TMDB_BASE_URL}/movie/popular?api_key=${tmdbApiKey}&language=id-ID&page=${page}`;
        break;
      case "now_playing":
        url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${tmdbApiKey}&language=id-ID&page=${page}`;
        break;
      case "upcoming":
        url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${tmdbApiKey}&language=id-ID&page=${page}`;
        break;
      case "search":
        url = `${TMDB_BASE_URL}/search/movie?api_key=${tmdbApiKey}&language=id-ID&query=${encodeURIComponent(query || "")}&page=${page}`;
        break;
      default:
        url = `${TMDB_BASE_URL}/trending/movie/week?api_key=${tmdbApiKey}&language=id-ID&page=${page}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch from TMDB");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("[TMDB]", e.message);
    return NextResponse.json({ error: "Gagal memuat film" }, { status: 500 });
  }
}
