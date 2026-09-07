export type Question = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  timeLimit?: number;
};

export type Player = {
  id: string;
  name: string;
  sessionToken: string;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  answers: { questionId: string; answerIndex: number; correct: boolean; timeMs: number }[];
  status: "joined" | "playing" | "finished";
  joinedAt: number;
};

export type Competition = {
  id: string;
  inviteCode: string;
  name: string;
  description: string;
  category: string;
  status: "waiting" | "starting" | "running" | "finished" | "cancelled";
  questions: Question[];
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  timePerQuestion: number;
  maxPlayers: number;
  createdBy: string;
  createdAt: number;
  startedAt: number | null;
  finishedAt: number | null;
  players: Player[];
};

const globalStore = globalThis as typeof globalThis & {
  __competitions?: Map<string, Competition>;
  __codeToId?: Map<string, string>;
};

if (!globalStore.__competitions) {
  globalStore.__competitions = new Map();
  globalStore.__codeToId = new Map();
}

const competitions = globalStore.__competitions;
const codeToId = globalStore.__codeToId;

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  if (codeToId.has(code)) return generateCode();
  return code;
}

export function createCompetition(data: {
  name: string;
  description?: string;
  category: string;
  questions: Question[];
  timePerQuestion?: number;
  maxPlayers?: number;
  createdBy: string;
}): Competition {
  const id = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const inviteCode = generateCode();
  const comp: Competition = {
    id,
    inviteCode,
    name: data.name,
    description: data.description || "",
    category: data.category,
    status: "waiting",
    questions: data.questions,
    currentQuestionIndex: 0,
    questionStartedAt: null,
    timePerQuestion: data.timePerQuestion || 20,
    maxPlayers: data.maxPlayers || 50,
    createdBy: data.createdBy,
    createdAt: Date.now(),
    startedAt: null,
    finishedAt: null,
    players: [],
  };
  competitions.set(id, comp);
  codeToId.set(inviteCode, id);
  return comp;
}

/** Hydrate competition from another serverless instance (token payload) */
export function hydrateCompetition(data: Competition): Competition {
  const existing = competitions.get(data.id);
  if (existing) return existing;
  // Don't overwrite players if somehow exists
  const comp = { ...data, players: data.players || [] };
  competitions.set(comp.id, comp);
  codeToId.set(comp.inviteCode.toUpperCase(), comp.id);
  return comp;
}

export function getCompetitionById(id: string): Competition | undefined {
  return competitions.get(id);
}

export function getCompetitionByCode(code: string): Competition | undefined {
  const normalized = String(code || "").trim().toUpperCase();
  const id = codeToId.get(normalized);
  if (!id) return undefined;
  return competitions.get(id);
}

export function joinCompetition(
  code: string,
  playerName: string
): { player: Player; competition: Competition } | { error: string } {
  const comp = getCompetitionByCode(code);
  if (!comp) return { error: "Kode kompetisi tidak ditemukan. Minta guru bagikan ulang link undangan." };
  if (comp.status !== "waiting") {
    return { error: "Kompetisi sudah dimulai atau selesai. Tidak bisa bergabung." };
  }
  if (comp.players.length >= comp.maxPlayers) {
    return { error: "Kompetisi sudah penuh" };
  }
  const name = playerName.trim().slice(0, 30);
  if (!name || name.length < 2) return { error: "Nama minimal 2 karakter" };
  if (comp.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
    return { error: "Nama sudah digunakan. Silakan pakai nama lain." };
  }

  const player: Player = {
    id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    sessionToken: `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`,
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    answers: [],
    status: "joined",
    joinedAt: Date.now(),
  };
  comp.players.push(player);
  return { player, competition: comp };
}

export function startCompetition(id: string, teacherId: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  if (comp.status !== "waiting") return { error: "Kompetisi sudah dimulai" };
  if (comp.players.length === 0) return { error: "Belum ada peserta" };

  comp.status = "running";
  comp.startedAt = Date.now();
  comp.currentQuestionIndex = 0;
  comp.questionStartedAt = Date.now();
  comp.players.forEach((p) => (p.status = "playing"));
  return comp;
}

export function submitAnswer(
  competitionId: string,
  sessionToken: string,
  questionId: string,
  answerIndex: number
): { correct: boolean; score: number; streak: number; explanation?: string } | { error: string } {
  const comp = competitions.get(competitionId);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  if (comp.status !== "running") return { error: "Kompetisi tidak sedang berjalan" };

  const player = comp.players.find((p) => p.sessionToken === sessionToken);
  if (!player) return { error: "Sesi tidak valid" };

  const qIndex = comp.currentQuestionIndex;
  const question = comp.questions[qIndex];
  if (!question || question.id !== questionId) {
    return { error: "Soal tidak aktif" };
  }

  if (player.answers.some((a) => a.questionId === questionId)) {
    return { error: "Sudah menjawab soal ini" };
  }

  const timeMs = Date.now() - (comp.questionStartedAt || Date.now());
  const timeLimitMs = (question.timeLimit || comp.timePerQuestion) * 1000;
  const correct = answerIndex === question.correctIndex;

  let points = 0;
  if (correct) {
    points = 100;
    const ratio = Math.max(0, 1 - timeMs / timeLimitMs);
    points += Math.round(ratio * 50);
    player.streak += 1;
    player.maxStreak = Math.max(player.maxStreak, player.streak);
    if (player.streak >= 2) points += Math.min(player.streak * 10, 50);
    player.correct += 1;
  } else {
    player.streak = 0;
    player.wrong += 1;
  }

  player.score += points;
  player.answers.push({ questionId, answerIndex, correct, timeMs });

  return {
    correct,
    score: player.score,
    streak: player.streak,
    explanation: question.explanation,
  };
}

export function nextQuestion(id: string, teacherId: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };

  if (comp.currentQuestionIndex >= comp.questions.length - 1) {
    comp.status = "finished";
    comp.finishedAt = Date.now();
    comp.players.forEach((p) => (p.status = "finished"));
    return comp;
  }

  comp.currentQuestionIndex += 1;
  comp.questionStartedAt = Date.now();
  return comp;
}

export function getLeaderboard(id: string) {
  const comp = competitions.get(id);
  if (!comp) return [];
  return [...comp.players]
    .sort((a, b) => b.score - a.score || b.correct - a.correct)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      score: p.score,
      correct: p.correct,
      wrong: p.wrong,
      maxStreak: p.maxStreak,
    }));
}

/** Serialize competition for cross-instance token (strip bulky player answers) */
export function serializeForToken(comp: Competition) {
  return {
    id: comp.id,
    inviteCode: comp.inviteCode,
    name: comp.name,
    description: comp.description,
    category: comp.category,
    status: comp.status,
    questions: comp.questions,
    currentQuestionIndex: comp.currentQuestionIndex,
    questionStartedAt: comp.questionStartedAt,
    timePerQuestion: comp.timePerQuestion,
    maxPlayers: comp.maxPlayers,
    createdBy: comp.createdBy,
    createdAt: comp.createdAt,
    startedAt: comp.startedAt,
    finishedAt: comp.finishedAt,
    players: comp.players.map((p) => ({
      id: p.id,
      name: p.name,
      sessionToken: p.sessionToken,
      score: p.score,
      correct: p.correct,
      wrong: p.wrong,
      streak: p.streak,
      maxStreak: p.maxStreak,
      answers: p.answers,
      status: p.status,
      joinedAt: p.joinedAt,
    })),
  };
}
