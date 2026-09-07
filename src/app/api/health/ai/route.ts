import { NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";

export async function GET() {
  const key = getGeminiKey();
  const model = getGeminiModel();
  if (!key) {
    return NextResponse.json({
      status: "error",
      configured: false,
      errorType: "MISSING_KEY",
      message: "GEMINI_API_KEY not configured",
    });
  }
  return NextResponse.json({
    status: "ok",
    provider: "gemini",
    model,
    configured: true,
    keyLength: key.length,
  });
}
