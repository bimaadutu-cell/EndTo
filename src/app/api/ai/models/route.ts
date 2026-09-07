import { NextResponse } from "next/server";
import { getGeminiKey } from "@/lib/app-config";
import { resolveGeminiKey, geminiListModels } from "@/lib/gemini";
import { AI_MODEL_CATALOG, DEFAULT_MODEL_ID } from "@/lib/ai/models";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = resolveGeminiKey(getGeminiKey(), process.env.GEMINI_API_KEY);
  let available: string[] = [];
  if (key) {
    available = await geminiListModels(key);
  }

  const catalog = AI_MODEL_CATALOG.map((m) => ({
    ...m,
    availableOnKey:
      available.length === 0
        ? null
        : available.includes(m.id) || available.some((a) => a.includes(m.id)),
  }));

  return NextResponse.json({
    defaultModel: process.env.GEMINI_DEFAULT_MODEL || DEFAULT_MODEL_ID,
    catalog,
    availableFromApi: available.slice(0, 40),
    configured: !!key,
  });
}
