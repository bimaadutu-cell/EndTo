import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";
import {
  geminiGenerateContent,
  resolveGeminiKey,
  DEFAULT_MODELS,
  userFacingMessage,
  type GeminiErrorType,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [], image } = body;

    // Key resolution: server config (admin) > env > cookie (admin browser backup only)
    // NO prefix validation — AQ... and AIza... both accepted
    const apiKey = resolveGeminiKey(
      getGeminiKey() || request.cookies.get("gemini_api_key")?.value,
      process.env.GEMINI_API_KEY
    );

    if (!apiKey) {
      return NextResponse.json(
        { error: userFacingMessage("GEMINI_API_KEY_MISSING"), errorType: "GEMINI_API_KEY_MISSING" },
        { status: 500 }
      );
    }

    if (!message && !image) {
      return NextResponse.json({ error: "Pesan atau gambar diperlukan" }, { status: 400 });
    }

    let primaryModel =
      getGeminiModel() ||
      request.cookies.get("gemini_model")?.value ||
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";

    // Build multimodal contents
    const parts: any[] = [];
    if (message) parts.push({ text: String(message) });
    if (image) {
      try {
        const base64Data = String(image).split(",")[1];
        const mimeType = String(image).split(";")[0].split(":")[1] || "image/jpeg";
        if (base64Data) {
          parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
        }
      } catch {
        return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
      }
    }

    const contents = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: String(msg.content || "") }],
      })),
      { role: "user", parts },
    ];

    const modelsToTry = [
      primaryModel,
      ...DEFAULT_MODELS.filter((m) => m !== primaryModel),
    ];

    let lastType: GeminiErrorType = "UNKNOWN_ERROR";
    let lastMsg = "";

    for (const model of modelsToTry) {
      const result = await geminiGenerateContent({
        apiKey,
        model,
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      });

      if (result.ok) {
        return NextResponse.json({ response: result.text, model: result.model });
      }

      lastType = result.errorType;
      lastMsg = result.message;

      // Auth/project errors: don't waste time on other models with same key
      if (
        result.errorType === "INVALID_API_KEY" ||
        result.errorType === "ACCESS_DENIED" ||
        result.errorType === "GEMINI_API_KEY_MISSING"
      ) {
        break;
      }
      // MODEL_NOT_FOUND → try next model
    }

    return NextResponse.json(
      {
        error: userFacingMessage(lastType, lastMsg),
        errorType: lastType,
        detail: lastMsg,
      },
      {
        status:
          lastType === "INVALID_API_KEY" || lastType === "ACCESS_DENIED"
            ? 403
            : lastType === "QUOTA_EXCEEDED" || lastType === "RATE_LIMITED"
              ? 429
              : 500,
      }
    );
  } catch (error: any) {
    console.error("[AI CHAT]", error?.message);
    return NextResponse.json(
      { error: "AI sedang mengalami gangguan. Silakan coba lagi.", errorType: "UNKNOWN_ERROR" },
      { status: 500 }
    );
  }
}
