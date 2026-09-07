import { NextRequest, NextResponse } from "next/server";
import { getAppConfig, setAppConfig } from "@/lib/app-config";

export async function GET() {
  const cfg = getAppConfig();
  // Never expose full keys to client - only masked status
  return NextResponse.json({
    hasGeminiKey: !!cfg.geminiApiKey,
    hasTmdbKey: !!cfg.tmdbApiKey,
    geminiModel: cfg.geminiModel,
    instagramUrl: cfg.instagramUrl,
    updatedAt: cfg.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Simple admin gate via password in body
    if (body.adminPassword !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated = setAppConfig({
      geminiApiKey: body.geminiApiKey,
      geminiModel: body.geminiModel,
      tmdbApiKey: body.tmdbApiKey,
      instagramUrl: body.instagramUrl,
    });
    return NextResponse.json({
      success: true,
      hasGeminiKey: !!updated.geminiApiKey,
      hasTmdbKey: !!updated.tmdbApiKey,
      geminiModel: updated.geminiModel,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal simpan" }, { status: 500 });
  }
}
