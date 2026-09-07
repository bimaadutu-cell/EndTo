import { NextRequest, NextResponse } from "next/server";
import { getAppConfig, setAppConfig, getPublicConfig, getGeminiKey, getTmdbKey } from "@/lib/app-config";
import { resolveGeminiKey, geminiGenerateContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/** Public: only safe metadata, never secrets */
export async function GET() {
  return NextResponse.json(getPublicConfig(), {
    headers: { "Cache-Control": "no-store" },
  });
}

/** Admin save — requires password. Validates keys by testing when provided. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPassword, geminiApiKey, geminiModel, tmdbApiKey, musicUrl, publicMusicEnabled, instagramUrl } = body;

    if (adminPassword !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: Record<string, any> = { updatedBy: "admin" };
    if (typeof geminiModel === "string" && geminiModel) updates.geminiModel = geminiModel;
    if (typeof musicUrl === "string") updates.musicUrl = musicUrl;
    if (typeof publicMusicEnabled === "boolean") updates.publicMusicEnabled = publicMusicEnabled;
    if (typeof instagramUrl === "string") updates.instagramUrl = instagramUrl;

    // Only set keys if non-empty (empty = keep existing)
    if (typeof geminiApiKey === "string" && geminiApiKey.trim()) {
      updates.geminiApiKey = geminiApiKey.trim();
    }
    if (typeof tmdbApiKey === "string" && tmdbApiKey.trim()) {
      updates.tmdbApiKey = tmdbApiKey.trim();
    }

    // Test Gemini if key provided or model changed
    let geminiTest: any = null;
    const keyToTest = updates.geminiApiKey || getGeminiKey();
    if (keyToTest && (updates.geminiApiKey || updates.geminiModel)) {
      const model = updates.geminiModel || getAppConfig().geminiModel || "gemini-2.5-flash";
      const result = await geminiGenerateContent({
        apiKey: resolveGeminiKey(keyToTest),
        model,
        contents: [{ role: "user", parts: [{ text: "Reply OK" }] }],
        generationConfig: { maxOutputTokens: 8, temperature: 0 },
        timeoutMs: 15000,
      });
      geminiTest = {
        ok: result.ok,
        model: result.ok ? result.model : model,
        error: result.ok ? undefined : (result as any).message,
      };
      if (!result.ok && updates.geminiApiKey) {
        return NextResponse.json(
          {
            success: false,
            error: "Gemini API key / model gagal diverifikasi: " + ((result as any).message || "unknown"),
            geminiTest,
          },
          { status: 400 }
        );
      }
    }

    // Test TMDB if key provided
    let tmdbTest: any = null;
    const tmdbKey = updates.tmdbApiKey || getTmdbKey();
    if (tmdbKey && updates.tmdbApiKey) {
      try {
        const r = await fetch(
          `https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(tmdbKey)}`,
          { signal: AbortSignal.timeout(10000) }
        );
        tmdbTest = { ok: r.ok, status: r.status };
        if (!r.ok) {
          return NextResponse.json(
            { success: false, error: "TMDB API key gagal diverifikasi", tmdbTest },
            { status: 400 }
          );
        }
      } catch (e: any) {
        return NextResponse.json(
          { success: false, error: "TMDB test gagal: " + (e?.message || "network") },
          { status: 400 }
        );
      }
    }

    const saved = setAppConfig(updates);

    return NextResponse.json({
      success: true,
      message: "Global configuration disimpan & diverifikasi. Berlaku untuk semua user.",
      public: getPublicConfig(),
      geminiTest,
      tmdbTest,
      updatedAt: saved.updatedAt,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Save gagal" }, { status: 500 });
  }
}
