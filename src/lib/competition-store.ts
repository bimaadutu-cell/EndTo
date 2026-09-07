export type Question = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  timeLimit?: number;
};

export type PlayerAnswer = {
  questionId: string;
  answerIndex: number; // -1 = timeout / skipped
  correct: boolean;
  timeMs: number;
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
  answers: PlayerAnswer[];
  status: "joined" | "playing" | "finished";
  joinedAt: number;
  /** When the current question was shown to this player (for per-player timer) */
  currentQuestionStartedAt: number | null;
};

export type Competition = {
  id: string;
  inviteCode: string;
  name: string;
  description: string;
  category: string;
  status: "waiting" | "starting" | "running" | "paused" | "finished" | "cancelled";
  questions: Question[];
  /** Shared index only used for teacher overview / legacy; players progress individually */
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
  if (existing) {
    // Merge players progress if newer
    if (data.players && data.players.length > existing.players.length) {
      existing.players = data.players;
    } else if (data.players) {
      for (const p of data.players) {
        const ex = existing.players.find((x) => x.id === p.id);
        if (ex && p.answers.length > ex.answers.length) {
          Object.assign(ex, p);
        } else if (!ex) {
          existing.players.push(p);
        }
      }
    }
    if (data.status && data.status !== existing.status) {
      existing.status = data.status;
      existing.finishedAt = data.finishedAt;
      existing.startedAt = data.startedAt;
    }
    return existing;
  }
  const comp = {
    ...data,
    players: (data.players || []).map((p) => ({
      ...p,
      currentQuestionStartedAt: p.currentQuestionStartedAt ?? null,
    })),
  };
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
    currentQuestionStartedAt: null,
  };
  comp.players.push(player);
  return { player, competition: comp };
}

export function startCompetition(id: string, teacherId: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  if (comp.status !== "waiting" && comp.status !== "paused") return { error: "Kompetisi sudah dimulai" };
  if (comp.players.length === 0) return { error: "Belum ada peserta" };

  const now = Date.now();
  comp.status = "running";
  if (!comp.startedAt) comp.startedAt = now;
  comp.currentQuestionIndex = 0;
  comp.questionStartedAt = now;
  comp.players.forEach((p) => {
    if (p.status !== "finished") {
      p.status = "playing";
      // Only reset start time if they haven't started answering yet
      if (p.answers.length === 0) {
        p.currentQuestionStartedAt = now;
      }
    }
  });
  return comp;
}

export function pauseCompetition(id: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  if (comp.status !== "running") return { error: "Hanya bisa pause saat running" };
  comp.status = "paused";
  return comp;
}

export function endCompetition(id: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  comp.status = "finished";
  comp.finishedAt = Date.now();
  comp.players.forEach((p) => (p.status = "finished"));
  return comp;
}

/**
 * Player progress is individual: index = answers.length
 * After a valid answer, the next question for that player is returned.
 */
export function submitAnswer(
  competitionId: string,
  sessionToken: string,
  questionId: string,
  answerIndex: number
):
  | {
      correct: boolean;
      score: number;
      streak: number;
      explanation?: string;
      answered: true;
      finished: boolean;
      nextQuestion: {
        id: string;
        question: string;
        options: string[];
        index: number;
        timeLimit: number;
      } | null;
      currentIndex: number;
      totalQuestions: number;
    }
  | { error: string } {
  const comp = competitions.get(competitionId);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };
  if (comp.status === "paused") return { error: "Kompetisi sedang dijeda oleh guru" };
  if (comp.status !== "running") return { error: "Kompetisi tidak sedang berjalan" };

  const player = comp.players.find((p) => p.sessionToken === sessionToken);
  if (!player) return { error: "Sesi tidak valid" };
  if (player.status === "finished") return { error: "Anda sudah menyelesaikan semua soal" };

  const expectedIndex = player.answers.length;
  const question = comp.questions[expectedIndex];
  if (!question) {
    player.status = "finished";
    return { error: "Tidak ada soal berikutnya" };
  }
  if (question.id !== questionId) {
    return { error: "Soal tidak cocok dengan progress Anda. Refresh halaman." };
  }

  // Anti-duplicate (idempotent)
  if (player.answers.some((a) => a.questionId === questionId)) {
    // Already answered — return current next state
    const nextIdx = player.answers.length;
    const nextQ = comp.questions[nextIdx] || null;
    return {
      correct: player.answers.find((a) => a.questionId === questionId)!.correct,
      score: player.score,
      streak: player.streak,
      answered: true,
      finished: !nextQ,
      nextQuestion: nextQ
        ? {
            id: nextQ.id,
            question: nextQ.question,
            options: nextQ.options,
            index: nextIdx,
            timeLimit: nextQ.timeLimit || comp.timePerQuestion,
          }
        : null,
      currentIndex: nextIdx,
      totalQuestions: comp.questions.length,
    };
  }

  const startedAt = player.currentQuestionStartedAt || Date.now();
  const timeMs = Math.max(0, Date.now() - startedAt);
  const timeLimitMs = (question.timeLimit || comp.timePerQuestion) * 1000;
  const isTimeout = answerIndex < 0;
  const correct = !isTimeout && answerIndex === question.correctIndex;

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
  player.answers.push({
    questionId,
    answerIndex: isTimeout ? -1 : answerIndex,
    correct,
    timeMs,
  });

  const nextIndex = player.answers.length;
  const nextQ = comp.questions[nextIndex] || null;

  if (nextQ) {
    player.currentQuestionStartedAt = Date.now();
  } else {
    player.status = "finished";
    player.currentQuestionStartedAt = null;
    // If all players finished, mark competition finished
    if (comp.players.every((p) => p.status === "finished" || p.answers.length >= comp.questions.length)) {
      comp.status = "finished";
      comp.finishedAt = Date.now();
    }
  }

  // Update shared index for teacher overview (max progress)
  const maxProgress = Math.max(...comp.players.map((p) => p.answers.length), 0);
  comp.currentQuestionIndex = Math.min(maxProgress, comp.questions.length - 1);

  return {
    correct,
    score: player.score,
    streak: player.streak,
    explanation: question.explanation,
    answered: true,
    finished: !nextQ,
    nextQuestion: nextQ
      ? {
          id: nextQ.id,
          question: nextQ.question,
          options: nextQ.options,
          index: nextIndex,
          timeLimit: nextQ.timeLimit || comp.timePerQuestion,
        }
      : null,
    currentIndex: nextIndex,
    totalQuestions: comp.questions.length,
  };
}

/** Legacy teacher next — now optional force advance for all lagging players is not forced; just end or leave auto */
export function nextQuestion(id: string, teacherId: string): Competition | { error: string } {
  const comp = competitions.get(id);
  if (!comp) return { error: "Kompetisi tidak ditemukan" };

  // With auto-next, teacher "next" is no longer required.
  // Keep for compatibility: if all players finished current shared, mark done.
  if (comp.players.every((p) => p.answers.length >= comp.questions.length)) {
    comp.status = "finished";
    comp.finishedAt = Date.now();
    comp.players.forEach((p) => (p.status = "finished"));
    return comp;
  }

  // Soft advance shared index only (does not force players)
  if (comp.currentQuestionIndex < comp.questions.length - 1) {
    comp.currentQuestionIndex += 1;
    comp.questionStartedAt = Date.now();
  }
  return comp;
}

export function getPlayerProgress(competitionId: string, sessionToken: string) {
  const comp = competitions.get(competitionId);
  if (!comp) return null;
  const player = comp.players.find((p) => p.sessionToken === sessionToken);
  if (!player) return null;

  const index = player.answers.length;
  const q = comp.questions[index] || null;
  return {
    playerId: player.id,
    name: player.name,
    score: player.score,
    status: player.status,
    currentIndex: index,
    totalQuestions: comp.questions.length,
    currentQuestion:
      q && player.status === "playing"
        ? {
            id: q.id,
            question: q.question,
            options: q.options,
            index,
            timeLimit: q.timeLimit || comp.timePerQuestion,
          }
        : null,
    questionStartedAt: player.currentQuestionStartedAt,
    answersCount: player.answers.length,
    finished: player.status === "finished" || index >= comp.questions.length,
  };
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
      progress: p.answers.length,
      status: p.status,
    }));
}

/** Serialize competition for cross-instance token */
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
      currentQuestionStartedAt: p.currentQuestionStartedAt,
    })),
  };
}
