export type AppConfig = {
  geminiApiKey: string;
  geminiModel: string;
  tmdbApiKey: string;
  instagramUrl: string;
  musicUrl: string;
  updatedAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __appConfig?: AppConfig;
};

export function getAppConfig(): AppConfig {
  return (
    globalStore.__appConfig || {
      geminiApiKey: process.env.GEMINI_API_KEY || "",
      geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      tmdbApiKey: process.env.TMDB_API_KEY || "",
      instagramUrl: "",
      musicUrl: "",
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
  if (partial.geminiApiKey === "") next.geminiApiKey = current.geminiApiKey;
  if (partial.tmdbApiKey === "") next.tmdbApiKey = current.tmdbApiKey;
  globalStore.__appConfig = next;
  return next;
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
