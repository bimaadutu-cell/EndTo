import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";
import { geminiGenerateContent, DEFAULT_MODELS, userFacingMessage, type GeminiErrorType } from "@/lib/gemini";
import { DEFAULT_MODEL_ID, getModelById, SYSTEM_INSTRUCTION, CHAT_MODES, type ChatMode, getEnabledModels } from "@/lib/ai/models";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const rateMap = new Map<string, { count: number; reset: number }>();
function rateLimit(ip: string, limit = 30, windowMs = 60_000) { const now = Date.now(); const cur = rateMap.get(ip); if (!cur || now > cur.reset) { rateMap.set(ip, { count: 1, reset: now + windowMs }); return true; } if (cur.count >= limit) return false; cur.count += 1; return true; }

export async function POST(request: NextRequest) {
  const started = Date.now();
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(ip)) return NextResponse.json({ error: "Permintaan terlalu banyak. Tunggu beberapa saat.", errorType: "RATE_LIMITED" }, { status: 429 });
    const body = await request.json();
    const { message, conversationHistory = [], image, model: requestedModel, mode = "default", document } = body;
    const apiKey = getGeminiKey();
    if (!apiKey) return NextResponse.json({ error: userFacingMessage("GEMINI_API_KEY_MISSING"), errorType: "GEMINI_API_KEY_MISSING" }, { status: 503 });
    const text = typeof message === "string" ? message.trim() : "";
    if (!text && !image && !document) return NextResponse.json({ error: "Pesan, gambar, atau dokumen diperlukan" }, { status: 400 });
    if (text.length > 12000) return NextResponse.json({ error: "Pesan terlalu panjang (maks 12000 karakter)" }, { status: 400 });
    const configuredModel = getGeminiModel();
    const enabled = getEnabledModels();
    const primaryModel = typeof requestedModel === "string" && enabled.some((m) => m.id === requestedModel) ? requestedModel : configuredModel || DEFAULT_MODEL_ID;
    const entry = getModelById(primaryModel);
    if (image && entry && !entry.supportsVision) return NextResponse.json({ error: "Model ini tidak mendukung analisis gambar.", errorType: "MODEL_CAPABILITY_UNSUPPORTED" }, { status: 400 });
    const modeEntry = CHAT_MODES.find((m) => m.id === (mode as ChatMode)) || CHAT_MODES[0];
    const systemText = `${SYSTEM_INSTRUCTION}\n\n${modeEntry.prompt || "Mode ANALISIS: identifikasi inti masalah, informasi penting, kesalahan/pola, kesimpulan, rekomendasi, dan langkah berikutnya. Gunakan konteks input sebenarnya."}`;
    const history = Array.isArray(conversationHistory) ? conversationHistory.slice(-12) : [];
    const parts: any[] = []; if (text) parts.push({ text });
    if (document) { if (typeof document !== "string" || document.length > 2_000_000) return NextResponse.json({ error: "Dokumen terlalu besar (maks 1.5MB data teks)." }, { status: 400 }); parts.push({ text: `\n[DOKUMEN]\n${document}\n[/DOKUMEN]` }); }
    if (image) { const raw = String(image); const base64Data = raw.split(",")[1]; const mimeType = raw.split(";")[0].split(":")[1] || "image/jpeg"; if (!base64Data || base64Data.length > 4_000_000) return NextResponse.json({ error: "Gambar tidak valid atau terlalu besar (maks 4MB)." }, { status: 400 }); parts.push({ inline_data: { mime_type: mimeType, data: base64Data } }); }
    const contents = [{ role: "user", parts: [{ text: systemText }] }, { role: "model", parts: [{ text: "Siap. Saya X Website AI, siap membantu belajar." }] }, ...history.map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: String(m.content || "").slice(0, 6000) }] })), { role: "user", parts }];
    const modelsToTry = [primaryModel, configuredModel, ...DEFAULT_MODELS].filter((m, i, arr) => m && arr.indexOf(m) === i);
    let lastType: GeminiErrorType = "UNKNOWN_ERROR", lastMsg = "";
    for (const model of modelsToTry) { const result = await geminiGenerateContent({ apiKey, model, contents, generationConfig: { temperature: 0.5, maxOutputTokens: 3072 }, timeoutMs: 45000 }); if (result.ok) return NextResponse.json({ response: result.text, model: result.model, latencyMs: Date.now() - started }); lastType = result.errorType; lastMsg = result.message; if (["INVALID_API_KEY", "ACCESS_DENIED", "GEMINI_API_KEY_MISSING"].includes(lastType)) break; }
    return NextResponse.json({ error: userFacingMessage(lastType, lastMsg), errorType: lastType, latencyMs: Date.now() - started }, { status: ["QUOTA_EXCEEDED", "RATE_LIMITED"].includes(lastType) ? 429 : 503 });
  } catch { return NextResponse.json({ error: "AI provider unavailable. Coba lagi.", errorType: "UNKNOWN_ERROR" }, { status: 503 }); }
}
