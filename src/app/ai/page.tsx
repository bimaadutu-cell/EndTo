"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Brain,
  Copy,
  RotateCcw,
  StopCircle,
  Plus,
  Image as ImageIcon,
  X,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  AI_MODEL_CATALOG,
  DEFAULT_MODEL_ID,
  CHAT_MODES,
  type ChatMode,
} from "@/lib/ai/models";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  error?: boolean;
  image?: string;
};

const HISTORY_KEY = "x_website_ai_history_v2";
const MODEL_KEY = "x_website_ai_model";

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const [mode, setMode] = useState<ChatMode>("default");
  const [image, setImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [status, setStatus] = useState<"unknown" | "ok" | "error">("unknown");

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history + model preference
  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) {
        const parsed = JSON.parse(h);
        if (Array.isArray(parsed)) setMessages(parsed.slice(-40));
      }
      const m = localStorage.getItem(MODEL_KEY);
      if (m) setModel(m);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const selectedModel = AI_MODEL_CATALOG.find((m) => m.id === model) || AI_MODEL_CATALOG[1];

  const newChat = () => {
    if (loading) return;
    setMessages([]);
    setInput("");
    setImage(null);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Gambar maks 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const send = useCallback(
    async (override?: { regenerateFrom?: Msg }) => {
      if (loading) return;

      let userText = input.trim();
      let userImage = image;
      let historyForApi = messages;

      if (override?.regenerateFrom) {
        const idx = messages.findIndex((m) => m.id === override.regenerateFrom!.id);
        if (idx <= 0) return;
        // Find preceding user message
        let userMsg = messages[idx - 1];
        if (userMsg?.role !== "user") return;
        userText = userMsg.content;
        userImage = userMsg.image || null;
        historyForApi = messages.slice(0, idx - 1);
        // Remove old assistant reply
        setMessages((prev) => prev.slice(0, idx));
      } else {
        if (!userText && !userImage) return;
        const userMsg: Msg = {
          id: uid(),
          role: "user",
          content: userText || "(gambar)",
          image: userImage || undefined,
        };
        setMessages((prev) => [...prev, userMsg]);
        historyForApi = [...messages];
        setInput("");
        setImage(null);
      }

      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: userText,
            image: userImage,
            model,
            mode,
            conversationHistory: historyForApi
              .filter((m) => !m.error)
              .slice(-12)
              .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus("error");
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              content: data.error || "Gagal mendapatkan respons AI.",
              error: true,
              model: data.model,
            },
          ]);
        } else {
          setStatus("ok");
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              content: data.response || "",
              model: data.model || model,
            },
          ]);
        }
      } catch (e: any) {
        if (e?.name === "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              content: "Generasi dihentikan.",
              error: true,
            },
          ]);
        } else {
          setStatus("error");
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: "assistant",
              content: "Koneksi gagal. Coba lagi.",
              error: true,
            },
          ]);
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [loading, input, image, messages, model, mode]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 pb-0 flex flex-col max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-black text-sm sm:text-base truncate">X Website AI</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      status === "ok" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-gray-300"
                    }`}
                  />
                  {status === "ok" ? "Gemini aktif" : status === "error" ? "Gemini error" : "Siap membantu belajar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={newChat}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                title="Chat baru"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Model selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModels((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg hover:bg-gray-50 max-w-[160px] sm:max-w-[200px]"
                >
                  <span className="truncate">{selectedModel.name.replace("Gemini ", "")}</span>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
                {showModels && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowModels(false)} />
                    <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 max-h-72 overflow-y-auto">
                      {AI_MODEL_CATALOG.filter((m) => m.enabled).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setModel(m.id);
                            try {
                              localStorage.setItem(MODEL_KEY, m.id);
                            } catch {}
                            setShowModels(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 ${
                            model === m.id ? "bg-gray-50 font-medium" : ""
                          }`}
                        >
                          <div className="text-black">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.description}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mode chips */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {CHAT_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors ${
                  mode === m.id
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="font-bold text-lg text-black mb-2">X Website AI</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Asisten belajar untuk siswa & guru kelas X TKJ/RPL/TKKR. Tanya materi, minta penjelasan, atau buat quiz.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Jelaskan apa itu IP Address",
                  "Buat quiz HTML 5 soal",
                  "Bantu pahami CSS Flexbox",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-2 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-black text-white rounded-br-md"
                    : msg.error
                      ? "bg-red-50 text-red-800 border border-red-100 rounded-bl-md"
                      : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="upload"
                    className="max-h-40 rounded-lg mb-2 object-contain"
                  />
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.role === "assistant" && !msg.error && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => copyText(msg.id, msg.content)}
                      className="text-xs text-gray-500 hover:text-black flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => send({ regenerateFrom: msg })}
                      disabled={loading}
                      className="text-xs text-gray-500 hover:text-black flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3 h-3" /> Regenerate
                    </button>
                    {msg.model && (
                      <span className="text-[10px] text-gray-400 ml-auto truncate max-w-[120px]">
                        {msg.model}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                X AI sedang berpikir...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {image && (
            <div className="mb-2 relative inline-block">
              <img src={image} alt="preview" className="h-16 rounded-lg border border-gray-200" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 flex-shrink-0"
              title="Upload gambar"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 resize-none px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-black text-sm max-h-32"
              style={{ minHeight: 42 }}
              disabled={loading}
            />

            {loading ? (
              <button
                onClick={stop}
                className="p-2.5 rounded-xl bg-red-500 text-white flex-shrink-0"
                title="Stop"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim() && !image}
                className="p-2.5 rounded-xl bg-black text-white flex-shrink-0 disabled:opacity-40"
                title="Kirim"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">
            Model: {selectedModel.name} · Mode: {CHAT_MODES.find((m) => m.id === mode)?.label}
          </p>
        </div>
      </main>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
