import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get API key from cookies or environment
    let tmdbApiKey = request.cookies.get("tmdb_api_key")?.value;
    if (!tmdbApiKey) {
      tmdbApiKey = process.env.TMDB_API_KEY;
    }

    if (!tmdbApiKey) {
      return NextResponse.json(
        { error: "TMDB API key belum dikonfigurasi" },
        { status: 500 }
      );
    }

    const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${tmdbApiKey}&language=id-ID`;

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
    console.error("Error fetching film detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail film" },
      { status: 500 }
    );
  }
}
