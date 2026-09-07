import "server-only";
import fs from "node:fs";
import path from "node:path";

export type GlobalConfig = {
  geminiApiKey: string;
  geminiModel: string;
  tmdbApiKey: string;
  instagramUrl: string;
  musicUrl: string;
  musicEnabled: boolean;
  updatedAt: number;
  updatedBy: string;
};

export type PublicConfig = {
  geminiConfigured: boolean;
  geminiModel: string;
  tmdbConfigured: boolean;
  instagramUrl: string;
  musicUrl: string;
  musicEnabled: boolean;
  updatedAt: number;
};

const DEFAULT_CONFIG: GlobalConfig = {
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  instagramUrl: "",
  musicUrl: "",
  musicEnabled: false,
  updatedAt: 0,
  updatedBy: "environment",
};

const store = globalThis as typeof globalThis & { __globalConfig?: GlobalConfig };
const configFile = process.env.GLOBAL_CONFIG_FILE || path.join(process.cwd(), ".data", "global-config.json");

function readPersisted(): GlobalConfig | null {
  try {
    if (!fs.existsSync(configFile)) return null;
    const value = JSON.parse(fs.readFileSync(configFile, "utf8"));
    if (!value || typeof value !== "object") return null;
    return { ...DEFAULT_CONFIG, ...value };
  } catch {
    return null;
  }
}

function persist(config: GlobalConfig) {
  try {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    const temp = `${configFile}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(config), { mode: 0o600 });
    fs.renameSync(temp, configFile);
  } catch (error) {
    // Serverless filesystems are often read-only. Environment variables remain a safe fallback.
    console.warn("[GLOBAL_CONFIG] persistent storage unavailable", error instanceof Error ? error.message : error);
  }
}

export function getAppConfig(): GlobalConfig {
  if (!store.__globalConfig) store.__globalConfig = readPersisted() || DEFAULT_CONFIG;
  return store.__globalConfig;
}

export function getPublicConfig(): PublicConfig {
  const cfg = getAppConfig();
  return {
    geminiConfigured: Boolean(cfg.geminiApiKey),
    geminiModel: cfg.geminiModel,
    tmdbConfigured: Boolean(cfg.tmdbApiKey),
    instagramUrl: cfg.instagramUrl,
    musicUrl: cfg.musicUrl,
    musicEnabled: cfg.musicEnabled,
    updatedAt: cfg.updatedAt,
  };
}

export function setAppConfig(partial: Partial<GlobalConfig>, updatedBy = "admin"): GlobalConfig {
  const current = getAppConfig();
  const next = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
    updatedBy,
  };
  store.__globalConfig = next;
  persist(next);
  return next;
}

export function getGeminiKey(): string { return getAppConfig().geminiApiKey || process.env.GEMINI_API_KEY || ""; }
export function getGeminiModel(): string { return getAppConfig().geminiModel || process.env.GEMINI_MODEL || "gemini-2.5-flash"; }
export function getTmdbKey(): string { return getAppConfig().tmdbApiKey || process.env.TMDB_API_KEY || ""; }

export function isAdminPasswordValid(value: unknown): boolean {
  const configured = process.env.ADMIN_PASSWORD || "admin123";
  return typeof value === "string" && value.length > 0 && value === configured;
}

export function validateMusicUrl(value: string) {
  if (!value) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}
