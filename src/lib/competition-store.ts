import fs from "node:fs";
import path from "node:path";

export type Question = { id: string; question: string; options: string[]; correctIndex: number; explanation?: string; timeLimit?: number };
export type Answer = { questionId: string; answerIndex: number; correct: boolean; timeMs: number; submittedAt: number; timedOut?: boolean };
export type Player = {
  id: string; name: string; sessionToken: string; score: number; correct: number; wrong: number; streak: number; maxStreak: number;
  answers: Answer[]; status: "joined" | "playing" | "finished"; joinedAt: number; currentQuestionIndex: number; questionStartedAt: number | null;
};
export type Competition = {
  id: string; inviteCode: string; name: string; description: string; category: string;
  status: "waiting" | "starting" | "running" | "paused" | "finished" | "cancelled";
  questions: Question[]; currentQuestionIndex: number; questionStartedAt: number | null; timePerQuestion: number; maxPlayers: number;
  createdBy: string; createdAt: number; startedAt: number | null; finishedAt: number | null; players: Player[];
};

const store = globalThis as typeof globalThis & { __competitions?: Map<string, Competition>; __codeToId?: Map<string, string>; __competitionLoaded?: boolean };
const competitions = store.__competitions ||= new Map<string, Competition>();
const codeToId = store.__codeToId ||= new Map<string, string>();
const file = process.env.COMPETITION_STORE_FILE || path.join(process.cwd(), ".data", "competitions.json");

function persist() {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(`${file}.tmp`, JSON.stringify([...competitions.values()]), { mode: 0o600 });
    fs.renameSync(`${file}.tmp`, file);
  } catch (error) { console.warn("[COMPETITION] persistent storage unavailable", error instanceof Error ? error.message : error); }
}
function load() {
  if (store.__competitionLoaded) return;
  store.__competitionLoaded = true;
  try {
    const rows = JSON.parse(fs.readFileSync(file, "utf8")) as Competition[];
    for (const comp of rows || []) { competitions.set(comp.id, comp); codeToId.set(comp.inviteCode, comp.id); }
  } catch {}
}
function generateCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let code = ""; do { code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""); } while (codeToId.has(code)); return code; }
function publicQuestion(comp: Competition, player: Player) {
  const q = comp.questions[player.currentQuestionIndex];
  return q ? { id: q.id, question: q.question, options: q.options, index: player.currentQuestionIndex, timeLimit: q.timeLimit || comp.timePerQuestion } : null;
}
function finishIfComplete(comp: Competition) {
  if (comp.players.length > 0 && comp.players.every((p) => p.currentQuestionIndex >= comp.questions.length)) {
    comp.status = "finished"; comp.finishedAt = Date.now(); comp.players.forEach((p) => (p.status = "finished")); persist();
  }
}

export function createCompetition(data: { name: string; description?: string; category: string; questions: Question[]; timePerQuestion?: number; maxPlayers?: number; createdBy: string }): Competition {
  load();
  const comp: Competition = { id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, inviteCode: generateCode(), name: data.name, description: data.description || "", category: data.category, status: "waiting", questions: data.questions, currentQuestionIndex: 0, questionStartedAt: null, timePerQuestion: data.timePerQuestion || 20, maxPlayers: data.maxPlayers || 50, createdBy: data.createdBy, createdAt: Date.now(), startedAt: null, finishedAt: null, players: [] };
  competitions.set(comp.id, comp); codeToId.set(comp.inviteCode, comp.id); persist(); return comp;
}
export function hydrateCompetition(data: Competition) { load(); const existing = competitions.get(data.id); if (existing) return existing; const comp = { ...data, players: data.players || [] }; competitions.set(comp.id, comp); codeToId.set(comp.inviteCode.toUpperCase(), comp.id); persist(); return comp; }
export function getCompetitionById(id: string) { load(); return competitions.get(id); }
export function getCompetitionByCode(code: string) { load(); const id = codeToId.get(String(code || "").trim().toUpperCase()); return id ? competitions.get(id) : undefined; }

export function joinCompetition(code: string, playerName: string): { player: Player; competition: Competition } | { error: string } {
  const comp = getCompetitionByCode(code); if (!comp) return { error: "Kode kompetisi tidak ditemukan." }; if (comp.status !== "waiting") return { error: "Kompetisi sudah dimulai atau selesai." }; if (comp.players.length >= comp.maxPlayers) return { error: "Kompetisi sudah penuh" };
  const name = playerName.trim().slice(0, 30); if (name.length < 2) return { error: "Nama minimal 2 karakter" }; if (comp.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return { error: "Nama sudah digunakan." };
  const player: Player = { id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, sessionToken: `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`, score: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0, answers: [], status: "joined", joinedAt: Date.now(), currentQuestionIndex: 0, questionStartedAt: null };
  comp.players.push(player); persist(); return { player, competition: comp };
}
export function startCompetition(id: string, teacherId: string): Competition | { error: string } {
  const comp = getCompetitionById(id); if (!comp) return { error: "Kompetisi tidak ditemukan" }; if (comp.createdBy !== teacherId && teacherId !== "guruku") return { error: "Host tidak valid" }; if (comp.status !== "waiting") return { error: "Kompetisi sudah dimulai" }; if (!comp.players.length) return { error: "Belum ada peserta" };
  comp.status = "running"; comp.startedAt = Date.now(); comp.currentQuestionIndex = 0; comp.questionStartedAt = Date.now(); comp.players.forEach((p) => { p.status = "playing"; p.currentQuestionIndex = 0; p.questionStartedAt = Date.now(); }); persist(); return comp;
}
export function pauseCompetition(id: string, teacherId: string, paused: boolean) { const comp = getCompetitionById(id); if (!comp) return { error: "Kompetisi tidak ditemukan" }; if (comp.createdBy !== teacherId && teacherId !== "guruku") return { error: "Host tidak valid" }; if (comp.status !== "running" && !paused) return { error: "Kompetisi tidak berjalan" }; comp.status = paused ? "paused" : "running"; persist(); return comp; }

export function submitAnswer(competitionId: string, sessionToken: string, questionId: string, answerIndex: number, timedOut = false): { correct: boolean; score: number; streak: number; explanation?: string; nextQuestion: ReturnType<typeof publicQuestion>; finished: boolean; duplicate?: boolean } | { error: string } {
  const comp = getCompetitionById(competitionId); if (!comp) return { error: "Kompetisi tidak ditemukan" }; if (comp.status !== "running") return { error: comp.status === "paused" ? "Kompetisi sedang dijeda oleh guru" : "Kompetisi tidak sedang berjalan" };
  const player = comp.players.find((p) => p.sessionToken === sessionToken); if (!player) return { error: "Sesi tidak valid" };
  const question = comp.questions[player.currentQuestionIndex]; if (!question || question.id !== questionId) return { error: "Soal tidak aktif atau sudah terjawab" };
  const existing = player.answers.find((a) => a.questionId === questionId); if (existing) return { correct: existing.correct, score: player.score, streak: player.streak, explanation: question.explanation, nextQuestion: publicQuestion(comp, player), finished: player.currentQuestionIndex >= comp.questions.length, duplicate: true };
  const elapsed = Math.max(0, Date.now() - (player.questionStartedAt || Date.now())); const correct = !timedOut && answerIndex === question.correctIndex; const limit = (question.timeLimit || comp.timePerQuestion) * 1000; let points = 0;
  if (correct) { points = 100 + Math.round(Math.max(0, 1 - elapsed / limit) * 50); player.streak += 1; player.maxStreak = Math.max(player.maxStreak, player.streak); if (player.streak >= 2) points += Math.min(player.streak * 10, 50); player.correct += 1; } else { player.streak = 0; player.wrong += 1; }
  player.score += points; player.answers.push({ questionId, answerIndex: timedOut ? -1 : answerIndex, correct, timeMs: elapsed, submittedAt: Date.now(), timedOut }); player.currentQuestionIndex += 1; player.questionStartedAt = player.currentQuestionIndex < comp.questions.length ? Date.now() : null; if (player.currentQuestionIndex >= comp.questions.length) player.status = "finished";
  comp.currentQuestionIndex = Math.max(...comp.players.map((p) => Math.min(p.currentQuestionIndex, comp.questions.length - 1))); comp.questionStartedAt = Date.now(); finishIfComplete(comp); persist();
  return { correct, score: player.score, streak: player.streak, explanation: question.explanation, nextQuestion: (comp.status as string) === "finished" ? null : publicQuestion(comp, player), finished: player.status === "finished" };
}
export function autoTimeout(id: string, sessionToken: string) { const comp = getCompetitionById(id); const player = comp?.players.find((p) => p.sessionToken === sessionToken); if (!comp || !player || comp.status !== "running") return null; const q = comp.questions[player.currentQuestionIndex]; if (!q || !player.questionStartedAt || Date.now() - player.questionStartedAt < (q.timeLimit || comp.timePerQuestion) * 1000) return null; return submitAnswer(id, sessionToken, q.id, -1, true); }
export function nextQuestion(id: string, teacherId: string): Competition | { error: string } { const comp = getCompetitionById(id); if (!comp) return { error: "Kompetisi tidak ditemukan" }; if (comp.createdBy !== teacherId && teacherId !== "guruku") return { error: "Host tidak valid" }; comp.currentQuestionIndex += 1; comp.questionStartedAt = Date.now(); persist(); return comp; }
export function getLeaderboard(id: string) { const comp = getCompetitionById(id); if (!comp) return []; return [...comp.players].sort((a, b) => b.score - a.score || b.correct - a.correct).map((p, i) => ({ rank: i + 1, name: p.name, score: p.score, correct: p.correct, wrong: p.wrong, maxStreak: p.maxStreak })); }
export function serializeForToken(comp: Competition) { return { ...comp, players: comp.players.map((p) => ({ ...p })) }; }
export function getPlayerState(comp: Competition, sessionToken: string) { const player = comp.players.find((p) => p.sessionToken === sessionToken); if (!player) return null; return { player: { id: player.id, name: player.name, score: player.score, correct: player.correct, wrong: player.wrong, currentQuestionIndex: player.currentQuestionIndex, status: player.status }, currentQuestion: comp.status === "running" ? publicQuestion(comp, player) : null }; }
