import { NextRequest, NextResponse } from "next/server";
import { getGeminiKey, getGeminiModel } from "@/lib/app-config";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Only current working models (no deprecated 1.5)
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [], image } = body;

    // Priority: server config (admin) > env > cookie (legacy)
    let geminiApiKey =
      getGeminiKey() ||
      request.cookies.get("gemini_api_key")?.value ||
      process.env.GEMINI_API_KEY ||
      "";

    if (!geminiApiKey.trim()) {
      return NextResponse.json(
        {
          error:
            "Gemini API Key belum diatur oleh admin. Buka /admin (password: admin123), masukkan API Key dari https://aistudio.google.com/apikey lalu simpan.",
        },
        { status: 500 }
      );
    }

    if (!message && !image) {
      return NextResponse.json({ error: "Pesan atau gambar diperlukan" }, { status: 400 });
    }

    let geminiModel =
      getGeminiModel() ||
      request.cookies.get("gemini_model")?.value ||
      process.env.GEMINI_MODEL ||
      "gemini-2.5-flash";

    // Strip deprecated models
    if (geminiModel.includes("1.5") || geminiModel.includes("1.0")) {
      geminiModel = "gemini-2.5-flash";
    }

    const parts: any[] = [];
    if (message) parts.push({ text: message });
    if (image) {
      try {
        const base64Data = image.split(",")[1];
        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
      } catch {
        return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
      }
    }

    const contents = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content || "" }],
      })),
      { role: "user", parts },
    ];

    const payload = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };

    const modelsToTry = [
      geminiModel,
      ...FALLBACK_MODELS.filter((m) => m !== geminiModel),
    ];

    let lastError = "Gagal mendapatkan respons dari Gemini";

    for (const model of modelsToTry) {
      try {
        const res = await fetch(
          `${GEMINI_URL}/${model}:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Maaf, saya tidak bisa memproses permintaan ini.";
          return NextResponse.json({ response: text, model });
        }

        const errData = await res.json().catch(() => ({}));
        lastError = errData.error?.message || `Model ${model} gagal (${res.status})`;

        if (
          lastError.toLowerCase().includes("api key") ||
          lastError.includes("API_KEY") ||
          lastError.includes("PERMISSION_DENIED") ||
          lastError.toLowerCase().includes("denied access") ||
          lastError.toLowerCase().includes("denied")
        ) {
          return NextResponse.json(
            {
              error:
                "Akses AI ditolak oleh Google. Periksa: (1) API Key benar di /admin, (2) Generative Language API aktif di Google AI Studio, (3) Key tidak dibatasi IP/referrer, (4) Billing/quota project Google aktif. Buat key baru di https://aistudio.google.com/apikey",
            },
            { status: 403 }
          );
        }
        // try next model
      } catch (e: any) {
        lastError = e.message || "Network error";
      }
    }

    return NextResponse.json(
      {
        error: `AI sedang mengalami gangguan: ${lastError}. Coba lagi nanti.`,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[AI ERROR]", error?.message);
    return NextResponse.json(
      { error: "AI sedang mengalami gangguan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
