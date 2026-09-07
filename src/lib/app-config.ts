/**
 * GLOBAL CONFIGURATION — single source of truth (server-side only).
 * Secrets never leave the server. Public endpoints only expose safe metadata.
 */

export type AppConfig = {
  geminiApiKey: string;
  geminiModel: string;
  tmdbApiKey: string;
  instagramUrl: string;
  musicUrl: string;
  publicMusicEnabled: boolean;
  updatedAt: number;
  updatedBy?: string;
};

const globalStore = globalThis as typeof globalThis & {
  __appConfig?: AppConfig;
  __configVersion?: number;
};

export function getAppConfig(): AppConfig {
  return (
    globalStore.__appConfig || {
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      tmdbApiKey: process.env.TMDB_API_KEY || "",
      instagramUrl: "",
      musicUrl: "",
      publicMusicEnabled: false,
      updatedAt: 0,
    }
  );
}

export function setAppConfig(partial: Partial<AppConfig>): AppConfig {
  const current = getAppConfig();
  const next: AppConfig = {
    ...current,
    ...partial,
    updatedAt: Date.now(),
  };
  // Empty string means "keep existing key" (don't wipe)
  if (partial.geminiApiKey === "") next.geminiApiKey = current.geminiApiKey;
  if (partial.tmdbApiKey === "") next.tmdbApiKey = current.tmdbApiKey;
  globalStore.__appConfig = next;
  globalStore.__configVersion = (globalStore.__configVersion || 0) + 1;
  return next;
}

export function getConfigVersion(): number {
  return globalStore.__configVersion || 0;
}

export function getGeminiKey(): string {
  return getAppConfig().geminiApiKey || process.env.GEMINI_API_KEY || "";
}

export function getGeminiModel(): string {
  return getAppConfig().geminiModel || process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

export function getTmdbKey(): string {
  return getAppConfig().tmdbApiKey || process.env.TMDB_API_KEY || "";
}

/** Safe public snapshot — never includes secrets */
export function getPublicConfig() {
  const cfg = getAppConfig();
  return {
    geminiConfigured: !!(cfg.geminiApiKey || process.env.GEMINI_API_KEY),
    geminiModel: cfg.geminiModel || process.env.GEMINI_MODEL || "gemini-2.5-flash",
    tmdbConfigured: !!(cfg.tmdbApiKey || process.env.TMDB_API_KEY),
    publicMusicEnabled: cfg.publicMusicEnabled,
    musicUrl: cfg.publicMusicEnabled ? cfg.musicUrl : "",
    instagramUrl: cfg.instagramUrl,
    updatedAt: cfg.updatedAt,
    version: getConfigVersion(),
  };
}
