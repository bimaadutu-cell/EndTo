import { NextRequest, NextResponse } from "next/server";
import { getPublicConfig, isAdminPasswordValid, setAppConfig, validateMusicUrl } from "@/lib/app-config";
import { geminiGenerateContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(getPublicConfig(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isAdminPasswordValid(body.adminPassword)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const geminiApiKey = String(body.geminiApiKey || "").trim();
    const geminiModel = String(body.geminiModel || "gemini-2.5-flash").trim();
    const tmdbApiKey = String(body.tmdbApiKey || "").trim();
    const musicUrl = String(body.musicUrl || "").trim();
    if (!geminiApiKey && !process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Gemini API key wajib diisi atau disediakan lewat environment server." }, { status: 400 });
    if (!validateMusicUrl(musicUrl)) return NextResponse.json({ error: "URL musik harus HTTPS yang valid." }, { status: 400 });

    const ai = await geminiGenerateContent({ apiKey: geminiApiKey || process.env.GEMINI_API_KEY || "", model: geminiModel, contents: [{ role: "user", parts: [{ text: "Reply exactly OK" }] }], generationConfig: { maxOutputTokens: 8, temperature: 0 }, timeoutMs: 15000 });
    if (!ai.ok) return NextResponse.json({ error: "Gemini tidak berhasil diverifikasi.", errorType: ai.errorType, detail: ai.message }, { status: 422 });

    let tmdbVerified = !tmdbApiKey;
    if (tmdbApiKey) {
      const tmdb = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(tmdbApiKey)}`, { cache: "no-store" });
      tmdbVerified = tmdb.ok;
      if (!tmdbVerified) return NextResponse.json({ error: "TMDB API key tidak berhasil diverifikasi." }, { status: 422 });
    }
    const updated = setAppConfig({ geminiApiKey, geminiModel: ai.model, tmdbApiKey, instagramUrl: String(body.instagramUrl || ""), musicUrl, musicEnabled: Boolean(body.musicEnabled && musicUrl) });
    return NextResponse.json({ success: true, verified: { gemini: true, tmdb: tmdbVerified }, config: { ...getPublicConfig(), geminiModel: updated.geminiModel } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan konfigurasi" }, { status: 500 });
  }
}
