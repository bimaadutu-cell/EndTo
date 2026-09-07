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
    geminiModel: "gemini-3.5-flash-lite",
    tmdbApiKey: "",
    instagramUrl: "https://www.instagram.com/xten_alliance?stkn=eXdkbzA1M2JpY2pw",
    temperature: 0.7,
    maxOutputTokens: 2048,
    systemPrompt: "Kamu adalah asisten pembelajaran untuk siswa kelas X.",
  });

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTmdbKey, setShowTmdbKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    
    localStorage.setItem("app_config", JSON.stringify(config));
    document.cookie = `gemini_api_key=${config.geminiApiKey}; path=/; max-age=31536000`;
    document.cookie = `gemini_model=${config.geminiModel}; path=/; max-age=31536000`;
    document.cookie = `tmdb_api_key=${config.tmdbApiKey}; path=/; max-age=31536000`;
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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
                    placeholder="Masukkan Gemini API Key"
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
                  Dapatkan API key dari <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Model</label>
                <select
                  value={config.geminiModel}
                  onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
                >
                  <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite (Recommended)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                </select>
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
                Dapatkan API key dari <a href="https://www.themoviedb.org/settings/api" target="_blank" className="underline">TMDB</a>
              </p>
            </div>
          </div>
        )}

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
