"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gamepad2, Trophy, Timer, CheckCircle, XCircle, Play } from "lucide-react";
import Footer from "@/components/Footer";

const gameQuestions: Record<string, { question: string; options: string[]; correct: number; explanation: string }[]> = {
  matematika: [
    { question: "Hasil dari 2x + 3 = 7 adalah...", options: ["x = 1", "x = 2", "x = 3", "x = 4"], correct: 1, explanation: "2x = 7 - 3 = 4, maka x = 2" },
    { question: "Luas persegi dengan sisi 5 cm adalah...", options: ["20 cm²", "25 cm²", "30 cm²", "35 cm²"], correct: 1, explanation: "Luas = s × s = 5 × 5 = 25 cm²" },
    { question: "Nilai dari 3² + 4² adalah...", options: ["20", "25", "30", "35"], correct: 1, explanation: "3² + 4² = 9 + 16 = 25" },
  ],
  informatika: [
    { question: "HTML adalah singkatan dari...", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0, explanation: "HTML = Hyper Text Markup Language" },
    { question: "CPU adalah singkatan dari...", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Central Processor Unity"], correct: 0, explanation: "CPU = Central Processing Unit" },
  ],
  sains: [
    { question: "Rumus kimia air adalah...", options: ["H2O", "CO2", "O2", "H2O2"], correct: 0, explanation: "Air = H2O" },
    { question: "Planet terbesar di tata surya adalah...", options: ["Bumi", "Mars", "Jupiter", "Saturnus"], correct: 2, explanation: "Jupiter adalah planet terbesar" },
  ],
  agama: [
    { question: "Rukun Islam ada ... ", options: ["4", "5", "6", "7"], correct: 1, explanation: "Rukun Islam ada 5" },
    { question: "Shalat wajib dalam sehari ada ... kali", options: ["3", "4", "5", "6"], correct: 2, explanation: "Shalat wajib 5 waktu" },
  ],
};

const gameCategories = [
  { id: "matematika", name: "Matematika", color: "bg-blue-500" },
  { id: "informatika", name: "Informatika", color: "bg-orange-500" },
  { id: "sains", name: "Sains", color: "bg-purple-500" },
  { id: "agama", name: "Agama", color: "bg-green-500" },
];

export default function GamePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  const [questions, setQuestions] = useState<any[]>([]);

  const startGame = (categoryId: string) => {
    const categoryQuestions = [...gameQuestions[categoryId] || []];
    for (let i = categoryQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [categoryQuestions[i], categoryQuestions[j]] = [categoryQuestions[j], categoryQuestions[i]];
    }
    setQuestions(categoryQuestions.slice(0, 5));
    setSelectedCategory(categoryId);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setGameState("playing");
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    if (isCorrect) {
      const points = 100 + (streak * 10) + (timeLeft * 2);
      setScore(score + points);
      setStreak(streak + 1);
      if (streak + 1 > maxStreak) {
        setMaxStreak(streak + 1);
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    } else {
      setGameState("result");
    }
  };

  const resetGame = () => {
    setGameState("menu");
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuestions([]);
  };

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-6 h-6 text-black" />
                <h1 className="text-xl font-bold text-black">Game Edukasi</h1>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">Game Edukasi</h1>
                <p className="text-gray-600">Pilih kategori dan mulai bermain!</p>
              </div>
            </div>
          </div>

          <Link
            href="/game/game1"
            className="block mb-8 p-6 border-2 border-black rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎮 Game 1 - CrazyGames & Poki</h2>
                <p className="text-white/90">Mainkan 100+ game dari CrazyGames dan Poki langsung di website ini!</p>
              </div>
              <Play className="w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => startGame(category.id)}
                className="p-6 border border-gray-200 rounded-2xl hover:border-black hover:shadow-lg transition-all text-left group"
              >
                <div className={`w-12 h-12 ${category.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">5 Soal • 30 detik/soal</p>
              </button>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <h3 className="font-bold text-black mb-4">Cara Bermain:</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Pilih kategori game yang kamu inginkan</li>
              <li>2. Jawab pertanyaan dalam waktu 30 detik</li>
              <li>3. Jawaban benar = +100 poin + bonus waktu dan streak</li>
              <li>4. Pertahankan streak untuk skor maksimal!</li>
            </ol>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (gameState === "result") {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="border border-gray-200 rounded-2xl p-8 text-center">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black mb-2">Permainan Selesai!</h1>
            <p className="text-gray-600 mb-8">
              Kategori: {gameCategories.find(c => c.id === selectedCategory)?.name}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-black">{score}</div>
                <div className="text-sm text-gray-500">Total Skor</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-bold text-black">{maxStreak}</div>
                <div className="text-sm text-gray-500">Max Streak</div>
              </div>
            </div>

            <button
              onClick={resetGame}
              className="px-8 py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Main Lagi
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">
              Soal {currentQuestion + 1} dari {questions.length}
            </p>
            <div className="text-2xl font-bold text-black">{score} poin</div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            timeLeft <= 10 ? "bg-red-100 text-red-700" : "bg-gray-100"
          }`}>
            <Timer className="w-5 h-5" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>

        <div className="h-2 bg-gray-200 rounded-full mb-8">
          <div
            className="h-full bg-black rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="border border-gray-200 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-black mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option: string, index: number) => {
              let buttonClass = "w-full p-4 text-left border border-gray-200 rounded-xl hover:border-black transition-colors";
              
              if (showResult) {
                if (index === question.correct) {
                  buttonClass = "w-full p-4 text-left border-2 border-green-500 bg-green-50 rounded-xl";
                } else if (index === selectedAnswer && index !== question.correct) {
                  buttonClass = "w-full p-4 text-left border-2 border-red-500 bg-red-50 rounded-xl";
                } else {
                  buttonClass = "w-full p-4 text-left border border-gray-200 rounded-xl opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && index === question.correct && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && index === selectedAnswer && index !== question.correct && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`mt-6 p-4 rounded-xl ${
              selectedAnswer === question.correct
                ? "bg-green-50 border border-green-200"
                : "bg-blue-50 border border-blue-200"
            }`}>
              <p className="text-sm">
                <span className="font-bold">Penjelasan: </span>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
