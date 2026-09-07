import { NextRequest, NextResponse } from "next/server";
import { getTmdbKey } from "@/lib/app-config";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let tmdbApiKey =
      getTmdbKey() ||
      request.cookies.get("tmdb_api_key")?.value ||
      process.env.TMDB_API_KEY ||
      "";

    if (!tmdbApiKey) {
      return NextResponse.json({ error: "TMDB API key belum dikonfigurasi" }, { status: 500 });
    }

    const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${tmdbApiKey}&language=id-ID`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch from TMDB");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: "Film tidak ditemukan" }, { status: 404 });
  }
}
