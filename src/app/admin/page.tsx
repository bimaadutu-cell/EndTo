"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Eye, EyeOff, Brain, Film, Link as LinkIcon, Share } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [config, setConfig] = useState({
    geminiApiKey: "",
    geminiModel: "gemini-2.5-flash",
    tmdbApiKey: "",
    instagramUrl: "https://www.instagram.com/xten_alliance?stkn=eXdkbzA1M2JpY2pw",
    musicUrl: "",
    temperature: 0.7,
    maxOutputTokens: 2048,
    systemPrompt: "Kamu adalah asisten pembelajaran untuk siswa kelas X.",
  });

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTmdbKey, setShowTmdbKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "film">("general");

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      loadConfig();
    }
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem("app_config");
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      loadConfig();
    } else {
      setError("Password salah");
    }
  };

  const handleTestAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: "admin123",
          geminiApiKey: config.geminiApiKey,
          geminiModel: config.geminiModel,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ status: "error", errorType: "NETWORK_ERROR", message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      // Save to server so ALL users can use the keys (not just this browser)
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: "admin123",
          geminiApiKey: config.geminiApiKey,
          geminiModel: config.geminiModel,
          tmdbApiKey: config.tmdbApiKey,
          instagramUrl: config.instagramUrl,
          musicUrl: config.musicUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simpan ke server");

      // Also keep local cookie backup
      localStorage.setItem("app_config", JSON.stringify(config));
      document.cookie = `gemini_api_key=${config.geminiApiKey}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `gemini_model=${config.geminiModel}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `tmdb_api_key=${config.tmdbApiKey}; path=/; max-age=31536000; SameSite=Lax`;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Admin Configuration</h1>
            <p className="text-gray-600">Masukkan password admin</p>
          </div>

          <form onSubmit={handleLogin} className="border border-gray-200 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">Password Admin</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Login
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Default password: admin123
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Admin Configuration</h1>
              <p className="text-sm text-gray-500">Konfigurasi Website Kelas</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              router.push("/");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "general"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <LinkIcon className="w-5 h-5" />
            Umum
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "ai"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Brain className="w-5 h-5" />
            AI
          </button>
          <button
            onClick={() => setActiveTab("film")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "film"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Film className="w-5 h-5" />
            Film
          </button>
        </div>

        {activeTab === "general" && (
          <div className="border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Share className="w-6 h-6 text-black" />
              <h2 className="text-lg font-bold text-black">Instagram Kelas</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Link Instagram
              </label>
              <input
                type="url"
                value={config.instagramUrl}
                onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-mono"
                placeholder="https://www.instagram.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Link Instagram kelas akan ditampilkan di homepage
              </p>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-black" />
              <h2 className="text-lg font-bold text-black">Google Gemini AI</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Gemini API Key *</label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    value={config.geminiApiKey}
                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12 font-mono"
                    placeholder="Tempel API Key dari AI Studio (AQ... atau format Google lainnya)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showGeminiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dapatkan API key dari{" "}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">
                    Google AI Studio
                  </a>
                  . Support format AQ... dan AIza...
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Model</label>
                <select
                  value={config.geminiModel}
                  onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-white"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended)</option>
                  <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                  <option value="gemini-flash-latest">gemini-flash-latest</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                </select>
              </div>

              <div className="mt-2 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleTestAI}
                  disabled={testing || !config.geminiApiKey}
                  className="w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  {testing ? "Testing AI Connection..." : "Test AI Connection"}
                </button>
                {testResult && (
                  <div
                    className={`p-4 rounded-xl text-sm border ${
                      testResult.success || testResult.status === "ok" || testResult.status === "connected"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}
                  >
                    <p className="font-bold mb-1">
                      {testResult.success || testResult.status === "ok" || testResult.status === "connected"
                        ? "AI CONNECTION SUCCESSFUL"
                        : "AI CONNECTION FAILED"}
                    </p>
                    {testResult.model && <p>Model: {testResult.model}</p>}
                    {testResult.errorType && <p>Type: {testResult.errorType}</p>}
                    {testResult.message && <p className="mt-1 opacity-80">{testResult.message}</p>}
                    {testResult.detail && <p className="mt-1 text-xs opacity-70">{testResult.detail}</p>}
                    {testResult.response && <p className="mt-1">Response: {testResult.response}</p>}
                    {testResult.keyPrefix && <p className="mt-1 text-xs">Key: {testResult.keyPrefix}</p>}
                    {testResult.availableModels?.length > 0 && (
                      <p className="mt-2 text-xs opacity-80">
                        Models tersedia: {testResult.availableModels.slice(0, 8).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "film" && (
          <div className="border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Film className="w-6 h-6 text-black" />
              <h2 className="text-lg font-bold text-black">TMDB (Film Database)</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">TMDB API Key</label>
              <div className="relative">
                <input
                  type={showTmdbKey ? "text" : "password"}
                  value={config.tmdbApiKey}
                  onChange={(e) => setConfig({ ...config, tmdbApiKey: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors pr-12 font-mono"
                  placeholder="Masukkan TMDB API Key"
                />
                <button
                  type="button"
                  onClick={() => setShowTmdbKey(!showTmdbKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showTmdbKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dapatkan API key dari{" "}
                <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="underline">
                  TMDB
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-black mb-4">Musik Latar (Public)</h2>
          <label className="block text-sm font-medium text-black mb-2">URL MP3</label>
          <input
            type="url"
            value={config.musicUrl || ""}
            onChange={(e) => setConfig({ ...config, musicUrl: e.target.value })}
            placeholder="https://example.com/musik-kelas.mp3"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
          />
          <p className="text-xs text-gray-500 mt-2">
            Tempel URL file MP3 publik. Musik diputar di seluruh website tanpa restart saat pindah menu.
            File besar host di cloud (Google Drive public, S3, dll) lalu tempel link direct-nya di sini.
            Maksimal praktis tergantung host; Vercel tidak cocok untuk upload 2GB langsung.
          </p>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saveSuccess && (
            <p className="text-sm text-green-600">Konfigurasi berhasil disimpan!</p>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </div>
    </div>
  );
}
