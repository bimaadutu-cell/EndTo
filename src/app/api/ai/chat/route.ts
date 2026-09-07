import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";
import {
  geminiGenerateContent,
  resolveGeminiKey,
  DEFAULT_MODELS,
  userFacingMessage,
  type GeminiErrorType,
} from "@/lib/gemini";
import {
  DEFAULT_MODEL_ID,
  getModelById,
  SYSTEM_INSTRUCTION,
  CHAT_MODES,
  type ChatMode,
} from "@/lib/ai/models";

export const dynamic = "force-dynamic";

// Simple in-memory rate limit (per IP, serverless best-effort)
const rateMap = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const cur = rateMap.get(ip);
  if (!cur || now > cur.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Permintaan terlalu banyak. Tunggu beberapa saat.", errorType: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      message,
      conversationHistory = [],
      image,
      model: requestedModel,
      mode = "default",
    } = body;

    const apiKey = resolveGeminiKey(
      getGeminiKey() || request.cookies.get("gemini_api_key")?.value,
      process.env.GEMINI_API_KEY
    );

    if (!apiKey) {
      return NextResponse.json(
        {
          error: userFacingMessage("GEMINI_API_KEY_MISSING"),
          errorType: "GEMINI_API_KEY_MISSING",
        },
        { status: 500 }
      );
    }

    const text = typeof message === "string" ? message.trim() : "";
    if (!text && !image) {
      return NextResponse.json({ error: "Pesan atau gambar diperlukan" }, { status: 400 });
    }
    if (text.length > 8000) {
      return NextResponse.json({ error: "Pesan terlalu panjang (maks 8000 karakter)" }, { status: 400 });
    }

    // Resolve model from user selection or defaults
    let primaryModel =
      (typeof requestedModel === "string" && requestedModel.trim()) ||
      getGeminiModel() ||
      request.cookies.get("gemini_model")?.value ||
      process.env.GEMINI_DEFAULT_MODEL ||
      process.env.GEMINI_MODEL ||
      DEFAULT_MODEL_ID;

    const catalogEntry = getModelById(primaryModel);
    if (catalogEntry && !catalogEntry.enabled) {
      return NextResponse.json(
        { error: "Model ini tidak tersedia untuk konfigurasi Gemini saat ini.", errorType: "MODEL_NOT_FOUND" },
        { status: 400 }
      );
    }

    if (image && catalogEntry && !catalogEntry.supportsVision) {
      return NextResponse.json(
        { error: "Model yang dipilih tidak mendukung input gambar.", errorType: "MODEL_NOT_FOUND" },
        { status: 400 }
      );
    }

    // Mode system overlay
    const modeEntry = CHAT_MODES.find((m) => m.id === (mode as ChatMode)) || CHAT_MODES[0];
    const systemText = modeEntry.prompt
      ? `${SYSTEM_INSTRUCTION}\n\n${modeEntry.prompt}`
      : SYSTEM_INSTRUCTION;

    // Build contents with context (limit history)
    const history = Array.isArray(conversationHistory) ? conversationHistory.slice(-12) : [];
    const parts: any[] = [];
    if (text) parts.push({ text });
    if (image) {
      try {
        const base64Data = String(image).split(",")[1];
        const mimeType = String(image).split(";")[0].split(":")[1] || "image/jpeg";
        if (!base64Data) throw new Error("invalid");
        if (base64Data.length > 4_000_000) {
          return NextResponse.json({ error: "Gambar terlalu besar" }, { status: 400 });
        }
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      } catch {
        return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
      }
    }

    // Prepend system as first user turn (Gemini generateContent pattern)
    const contents = [
      { role: "user", parts: [{ text: systemText }] },
      { role: "model", parts: [{ text: "Siap. Saya X Website AI, siap membantu belajar." }] },
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: String(msg.content || "").slice(0, 4000) }],
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
        timeoutMs: 45000,
      });

      if (result.ok) {
        console.log(
          `[AI] model=${result.model} latency=${Date.now() - started}ms status=SUCCESS`
        );
        return NextResponse.json({
          response: result.text,
          model: result.model,
          latencyMs: Date.now() - started,
        });
      }

      lastType = result.errorType;
      lastMsg = result.message;
      console.log(
        `[AI] model=${model} latency=${Date.now() - started}ms status=FAIL type=${lastType}`
      );

      if (
        lastType === "INVALID_API_KEY" ||
        lastType === "ACCESS_DENIED" ||
        lastType === "GEMINI_API_KEY_MISSING"
      ) {
        break;
      }
    }

    return NextResponse.json(
      {
        error: userFacingMessage(lastType, lastMsg),
        errorType: lastType,
        detail: lastMsg,
        latencyMs: Date.now() - started,
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
      {
        error: "AI sedang mengalami gangguan. Silakan coba lagi.",
        errorType: "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
