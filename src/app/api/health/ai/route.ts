import { NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";
import { resolveGeminiKey, geminiGenerateContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = resolveGeminiKey(getGeminiKey(), process.env.GEMINI_API_KEY);
  const model = getGeminiModel() || "gemini-2.5-flash";

  if (!key) {
    return NextResponse.json({
      provider: "Google Gemini",
      configured: false,
      status: "error",
      errorType: "GEMINI_API_KEY_MISSING",
    });
  }

  const result = await geminiGenerateContent({
    apiKey: key,
    model,
    contents: [{ role: "user", parts: [{ text: "OK" }] }],
    generationConfig: { maxOutputTokens: 8 },
    timeoutMs: 15000,
  });

  if (result.ok) {
    return NextResponse.json({
      provider: "Google Gemini",
      configured: true,
      status: "connected",
      model: result.model,
      keyPrefix: key.slice(0, 4) + "…",
    });
  }

  return NextResponse.json({
    provider: "Google Gemini",
    configured: true,
    status: "error",
    errorType: result.errorType,
    model,
    keyPrefix: key.slice(0, 4) + "…",
  });
}
