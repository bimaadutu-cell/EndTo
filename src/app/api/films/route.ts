import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "trending";
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";

    // Get API key from cookies or environment
    let tmdbApiKey = request.cookies.get("tmdb_api_key")?.value;
    if (!tmdbApiKey) {
      tmdbApiKey = process.env.TMDB_API_KEY;
    }

    if (!tmdbApiKey) {
      return NextResponse.json(
        { error: "TMDB API key belum dikonfigurasi. Silakan hubungi admin untuk mengatur API key di panel admin." },
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

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from TMDB");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data film" },
      { status: 500 }
    );
  }
}
