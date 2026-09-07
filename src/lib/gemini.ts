/**
 * Gemini API client — supports new API key formats (AQ..., AIza..., any Google-issued key).
 * NO prefix validation. Validity is determined only by live API response.
 */

export type GeminiErrorType =
  | "GEMINI_API_KEY_MISSING"
  | "INVALID_API_KEY"
  | "ACCESS_DENIED"
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "MODEL_NOT_FOUND"
  | "SERVICE_UNAVAILABLE"
  | "TIMEOUT"
  | "UNKNOWN_ERROR";

const BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Default models to try (order = priority). Only real public model IDs. */
export const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-pro",
];

export function classifyGeminiError(status: number, message: string): GeminiErrorType {
  const m = (message || "").toLowerCase();
  if (!status && m.includes("timeout")) return "TIMEOUT";
  if (status === 401 || m.includes("api key not valid") || m.includes("invalid api key") || m.includes("api_key_invalid"))
    return "INVALID_API_KEY";
  if (status === 403 || m.includes("denied") || m.includes("permission") || m.includes("blocked") || m.includes("contact support"))
    return "ACCESS_DENIED";
  if (status === 404 || m.includes("not found") || m.includes("is not supported") || m.includes("not supported for"))
    return "MODEL_NOT_FOUND";
  if (status === 429 || m.includes("quota") || m.includes("rate limit") || m.includes("resource_exhausted"))
    return status === 429 && m.includes("rate") ? "RATE_LIMITED" : "QUOTA_EXCEEDED";
  if (status >= 500) return "SERVICE_UNAVAILABLE";
  return "UNKNOWN_ERROR";
}

export function userFacingMessage(type: GeminiErrorType, detail?: string): string {
  switch (type) {
    case "GEMINI_API_KEY_MISSING":
      return "API Key Gemini belum diatur. Buka /admin, masukkan key dari https://aistudio.google.com/apikey, lalu Test Connection & Simpan.";
    case "INVALID_API_KEY":
      return "Gemini menolak API key ini (tidak valid). Buat key baru di Google AI Studio dan tempel ulang di /admin.";
    case "ACCESS_DENIED":
      return "Gemini menolak akses project ini. Periksa: (1) Key dari AI Studio yang sama dengan project, (2) Generative Language API aktif, (3) Tidak ada restriksi IP/referrer pada key, (4) Quota/billing project.";
    case "QUOTA_EXCEEDED":
      return "Kuota Gemini habis. Coba lagi nanti atau naikkan kuota di Google AI Studio.";
    case "RATE_LIMITED":
      return "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.";
    case "MODEL_NOT_FOUND":
      return detail
        ? `Model tidak tersedia: ${detail}. Pilih model lain di /admin.`
        : "Model tidak tersedia untuk key ini. Pilih model lain di /admin.";
    case "SERVICE_UNAVAILABLE":
      return "Layanan Gemini sedang gangguan. Coba lagi nanti.";
    case "TIMEOUT":
      return "Permintaan ke Gemini timeout. Coba lagi.";
    default:
      return detail || "Gagal menghubungi Gemini. Coba lagi.";
  }
}

/** Call Gemini generateContent with API key in header (supports AQ... and AIza... keys). */
export async function geminiGenerateContent(opts: {
  apiKey: string;
  model: string;
  contents: any[];
  generationConfig?: Record<string, unknown>;
  timeoutMs?: number;
}): Promise<{ ok: true; text: string; model: string; raw: any } | { ok: false; status: number; message: string; errorType: GeminiErrorType }> {
  const { apiKey, model, contents, generationConfig, timeoutMs = 30000 } = opts;
  const key = String(apiKey || "").trim();
  if (!key) {
    return { ok: false, status: 0, message: "Missing key", errorType: "GEMINI_API_KEY_MISSING" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${BASE}/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || { temperature: 0.7, maxOutputTokens: 2048 },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.error?.message || `HTTP ${res.status}`;
      return {
        ok: false,
        status: res.status,
        message,
        errorType: classifyGeminiError(res.status, message),
      };
    }

    const raw = await res.json();
    const text =
      raw?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ||
      raw?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text) {
      const block = raw?.promptFeedback?.blockReason || raw?.candidates?.[0]?.finishReason;
      return {
        ok: false,
        status: 200,
        message: block ? `Response blocked: ${block}` : "Empty response from Gemini",
        errorType: "UNKNOWN_ERROR",
      };
    }

    return { ok: true, text, model, raw };
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === "AbortError") {
      return { ok: false, status: 0, message: "Timeout", errorType: "TIMEOUT" };
    }
    return {
      ok: false,
      status: 0,
      message: e?.message || "Network error",
      errorType: "UNKNOWN_ERROR",
    };
  }
}

/** List models available for this API key */
export async function geminiListModels(apiKey: string): Promise<string[]> {
  const key = String(apiKey || "").trim();
  if (!key) return [];
  try {
    const res = await fetch(`${BASE}/models`, {
      headers: { "x-goog-api-key": key },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const models: string[] = [];
    for (const m of data.models || []) {
      const name = String(m.name || "").replace(/^models\//, "");
      const methods: string[] = m.supportedGenerationMethods || m.supported_generation_methods || [];
      if (name && (methods.includes("generateContent") || methods.length === 0)) {
        models.push(name);
      }
    }
    return models;
  } catch {
    return [];
  }
}

/** Resolve API key: admin server config > env. Never rejects by prefix. */
export function resolveGeminiKey(adminKey?: string, envKey?: string): string {
  const a = String(adminKey || "").trim();
  const e = String(envKey || process.env.GEMINI_API_KEY || "").trim();
  // Prefer explicitly saved admin key, then env
  return a || e;
}
