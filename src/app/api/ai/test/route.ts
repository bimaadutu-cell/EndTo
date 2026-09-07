import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel, setAppConfig } from "@/lib/app-config";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function classifyError(status: number, message: string): string {
  const m = (message || "").toLowerCase();
  if (status === 401 || m.includes("api key") || m.includes("api_key") || m.includes("invalid"))
    return "INVALID_API_KEY";
  if (status === 403 || m.includes("denied") || m.includes("permission") || m.includes("blocked"))
    return "ACCESS_DENIED";
  if (status === 404 || m.includes("not found") || m.includes("not supported"))
    return "MODEL_NOT_FOUND";
  if (status === 429 || m.includes("quota") || m.includes("rate"))
    return "QUOTA_EXCEEDED";
  if (status >= 500) return "PROVIDER_TEMPORARY_ERROR";
  if (m.includes("billing")) return "BILLING_REQUIRED";
  return "UNKNOWN_ERROR";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    // Optional: save key from test form
    if (body.geminiApiKey && body.adminPassword === "admin123") {
      setAppConfig({
        geminiApiKey: body.geminiApiKey,
        geminiModel: body.geminiModel || getGeminiModel(),
      });
    }

    const key = body.geminiApiKey || getGeminiKey();
    let model = body.geminiModel || getGeminiModel() || "gemini-2.5-flash";
    if (model.includes("1.5") || model.includes("1.0")) model = "gemini-2.5-flash";

    if (!key) {
      return NextResponse.json({
        status: "error",
        configured: false,
        errorType: "MISSING_KEY",
        message: "API Key belum diisi",
      });
    }

    const fallbacks = [
      model,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
    ];
    const tried: string[] = [];
    let lastStatus = 0;
    let lastMsg = "";

    for (const m of [...new Set(fallbacks)]) {
      tried.push(m);
      try {
        const res = await fetch(`${GEMINI_URL}/${m}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Jawab hanya: OK" }] }],
            generationConfig: { maxOutputTokens: 16 },
          }),
        });
        lastStatus = res.status;
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "OK";
          return NextResponse.json({
            status: "ok",
            provider: "google-gemini",
            model: m,
            configured: true,
            response: text.slice(0, 100),
            tried,
          });
        }
        const err = await res.json().catch(() => ({}));
        lastMsg = err.error?.message || `HTTP ${res.status}`;
        const errType = classifyError(res.status, lastMsg);
        // Don't retry on auth errors
        if (errType === "INVALID_API_KEY" || errType === "ACCESS_DENIED") {
          return NextResponse.json({
            status: "error",
            provider: "google-gemini",
            model: m,
            configured: true,
            errorType: errType,
            message: lastMsg,
            tried,
            hint:
              errType === "ACCESS_DENIED"
                ? "Buat API key baru di https://aistudio.google.com/apikey tanpa restriksi IP/HTTP referrer. Aktifkan Generative Language API."
                : "API Key tidak valid. Salin ulang key dari Google AI Studio.",
          });
        }
      } catch (e: any) {
        lastMsg = e.message || "Network error";
        lastStatus = 0;
      }
    }

    return NextResponse.json({
      status: "error",
      provider: "google-gemini",
      model,
      configured: true,
      errorType: classifyError(lastStatus, lastMsg),
      message: lastMsg,
      tried,
    });
  } catch (e: any) {
    console.error("[AI TEST]", e?.message);
    return NextResponse.json({
      status: "error",
      errorType: "UNKNOWN_ERROR",
      message: e?.message || "Test gagal",
    });
  }
}

export async function GET() {
  const key = getGeminiKey();
  return NextResponse.json({
    status: key ? "configured" : "missing_key",
    provider: "google-gemini",
    model: getGeminiModel(),
    configured: !!key,
    keyLength: key ? key.length : 0,
  });
}
