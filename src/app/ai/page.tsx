"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Send, Brain, Sparkles, Copy, RotateCcw, StopCircle, BookOpen, Calculator, FlaskConical, Laptop, Camera, Image as ImageIcon, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TypingText from "@/components/TypingText";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  timestamp: Date;
}

const quickActions = [
  { icon: BookOpen, label: "Jelaskan Materi", prompt: "Jelaskan materi pembelajaran dengan bahasa yang mudah dipahami" },
  { icon: Calculator, label: "Belajar Matematika", prompt: "Bantu saya belajar matematika dengan contoh soal" },
  { icon: Laptop, label: "Belajar Informatika", prompt: "Bantu saya belajar informatika dan pemrograman" },
  { icon: FlaskConical, label: "Belajar Sains", prompt: "Bantu saya belajar sains (fisika, kimia, biologi)" },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (messageText: string, image?: string) => {
    if ((!messageText.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      image,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);
    setError("");

    const newController = new AbortController();
    setController(newController);

    try {
      const requestBody: any = {
        message: messageText || "Analisis gambar ini",
        conversationHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (image) {
        requestBody.image = image;
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: newController.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan respons");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
      setController(null);
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setController(null);
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, selectedImage || undefined);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  <TypingText text="X Website AI" speed={60} />
                </h1>
                <p className="text-gray-600">
                  Asisten AI dengan kemampuan analisis gambar
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="p-4 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all text-left group"
                >
                  <action.icon className="w-6 h-6 text-black mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-black text-sm">
                    {action.label}
                  </h3>
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <div className="h-[500px] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-black mb-2">
                      Mulai Percakapan
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Tanyakan apa saja tentang materi pembelajaran, atau upload
                      gambar untuk dianalisis oleh AI.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === "user"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-black"
                        }`}
                      >
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Uploaded"
                            className="w-full max-w-xs rounded-lg mb-3"
                          />
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-60">
                            {message.timestamp.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.role === "assistant" && (
                            <button
                              onClick={() => handleCopy(message.content)}
                              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                              title="Salin"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          X Website AI sedang berpikir...
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-4 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">Gambar siap dianalisis</p>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 border border-gray-200 rounded-xl hover:border-black transition-colors ${
                selectedImage ? "bg-green-50 border-green-200" : ""
              }`}
            >
              {selectedImage ? (
                <ImageIcon className="w-5 h-5 text-green-600" />
              ) : (
                <Camera className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu atau upload gambar..."
              className="flex-1 px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              disabled={isLoading}
            />
            {isLoading ? (
              <button
                type="button"
                onClick={handleStop}
                className="px-6 py-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !selectedImage}
                className="px-6 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* Actions */}
          {messages.length > 0 && (
            <div className="mt-4 flex justify-between">
              <button
                onClick={clearChat}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Percakapan Baru
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              AI ini menggunakan Google Gemini untuk memberikan respons.
              Upload gambar untuk analisis visual (diagram, grafik, soal, dll).
              <br />
              Gunakan untuk membantu pembelajaran, bukan untuk menyontek.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
