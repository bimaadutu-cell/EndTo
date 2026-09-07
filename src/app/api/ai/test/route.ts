import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel, setAppConfig } from "@/lib/app-config";
import {
  geminiGenerateContent,
  geminiListModels,
  resolveGeminiKey,
  DEFAULT_MODELS,
  userFacingMessage,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Admin can pass key to test before/while saving
    if (body.adminPassword === "admin123" && body.geminiApiKey) {
      setAppConfig({
        geminiApiKey: String(body.geminiApiKey).trim(),
        geminiModel: body.geminiModel || getGeminiModel(),
      });
    }

    const apiKey = resolveGeminiKey(
      body.geminiApiKey || getGeminiKey(),
      process.env.GEMINI_API_KEY
    );

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: "error",
        errorType: "GEMINI_API_KEY_MISSING",
        message: userFacingMessage("GEMINI_API_KEY_MISSING"),
        configured: false,
      });
    }

    // Optional: discover models for this key
    const available = await geminiListModels(apiKey);

    let primary =
      body.geminiModel || getGeminiModel() || process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // Prefer models that actually exist for this key
    const candidates = [
      primary,
      ...DEFAULT_MODELS,
      ...available.filter((m) => m.includes("flash")),
    ];
    const unique = [...new Set(candidates)];

    const tried: string[] = [];
    for (const model of unique) {
      tried.push(model);
      const result = await geminiGenerateContent({
        apiKey,
        model,
        contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
        generationConfig: { maxOutputTokens: 16, temperature: 0 },
        timeoutMs: 20000,
      });

      if (result.ok) {
        // Persist working model as preferred
        if (body.adminPassword === "admin123") {
          setAppConfig({ geminiModel: result.model });
        }
        return NextResponse.json({
          success: true,
          status: "connected",
          provider: "google-gemini",
          model: result.model,
          response: result.text.slice(0, 80),
          availableModels: available.slice(0, 30),
          tried,
          configured: true,
          keyPrefix: apiKey.slice(0, 4) + "…", // AQ… or AIza… — not the secret
        });
      }

      if (result.errorType === "INVALID_API_KEY" || result.errorType === "ACCESS_DENIED") {
        return NextResponse.json({
          success: false,
          status: "error",
          provider: "google-gemini",
          model,
          errorType: result.errorType,
          message: userFacingMessage(result.errorType, result.message),
          detail: result.message,
          availableModels: available.slice(0, 30),
          tried,
          configured: true,
          keyPrefix: apiKey.slice(0, 4) + "…",
        });
      }
    }

    return NextResponse.json({
      success: false,
      status: "error",
      provider: "google-gemini",
      errorType: "MODEL_NOT_FOUND",
      message: "Tidak ada model yang merespons untuk key ini. Cek akses API di Google AI Studio.",
      availableModels: available.slice(0, 30),
      tried,
      configured: true,
      keyPrefix: apiKey.slice(0, 4) + "…",
    });
  } catch (e: any) {
    console.error("[AI TEST]", e?.message);
    return NextResponse.json({
      success: false,
      status: "error",
      errorType: "UNKNOWN_ERROR",
      message: e?.message || "Test gagal",
    });
  }
}

export async function GET() {
  const key = resolveGeminiKey(getGeminiKey(), process.env.GEMINI_API_KEY);
  return NextResponse.json({
    provider: "Google Gemini",
    configured: !!key,
    status: key ? "configured" : "missing_key",
    model: getGeminiModel(),
    keyPrefix: key ? key.slice(0, 4) + "…" : null,
  });
}
