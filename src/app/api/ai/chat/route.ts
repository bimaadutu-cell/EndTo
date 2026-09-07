import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [], image } = body;

    // Get API key
    let geminiApiKey =
      request.cookies.get("gemini_api_key")?.value ||
      process.env.GEMINI_API_KEY;

    if (!geminiApiKey || geminiApiKey.trim() === "") {
      return NextResponse.json(
        {
          error:
            "Gemini API Key belum diatur. Buka /admin (password: admin123), masukkan API Key dari https://aistudio.google.com/apikey lalu simpan.",
        },
        { status: 500 }
      );
    }

    if (!message && !image) {
      return NextResponse.json(
        { error: "Pesan atau gambar diperlukan" },
        { status: 400 }
      );
    }

    // Get model
    let geminiModel =
      request.cookies.get("gemini_model")?.value ||
      process.env.GEMINI_MODEL ||
      "gemini-3.5-flash-lite";

    // Build contents
    const parts: any[] = [];
    if (message) parts.push({ text: message });
    if (image) {
      try {
        const base64Data = image.split(",")[1];
        const mimeType = image.split(";")[0].split(":")[1] || "image/jpeg";
        parts.push({
          inline_data: { mime_type: mimeType, data: base64Data },
        });
      } catch {
        return NextResponse.json(
          { error: "Format gambar tidak valid" },
          { status: 400 }
        );
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
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    // Try primary model + fallbacks
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

        // If API key invalid, don't try other models
        if (
          lastError.includes("API key") ||
          lastError.includes("API_KEY") ||
          lastError.includes("invalid") ||
          lastError.includes("PERMISSION_DENIED")
        ) {
          return NextResponse.json(
            {
              error:
                "API Key Gemini tidak valid. Buka /admin (password: admin123) dan masukkan API Key yang benar dari https://aistudio.google.com/apikey",
            },
            { status: 401 }
          );
        }
      } catch (e: any) {
        lastError = e.message || "Network error";
      }
    }

    return NextResponse.json({ error: lastError }, { status: 500 });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses permintaan AI" },
      { status: 500 }
    );
  }
}
