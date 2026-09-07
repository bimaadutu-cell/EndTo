import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, varchar } from "drizzle-orm/pg-core";

export const teachers = pgTable("teachers", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitions = pgTable("competitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteCode: varchar("invite_code", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  questionCount: integer("question_count").default(10),
  timePerQuestion: integer("time_per_question").default(20),
  maxPlayers: integer("max_players").default(50),
  shuffleQuestions: boolean("shuffle_questions").default(true),
  status: varchar("status", { length: 20 }).default("waiting").notNull(),
  currentQuestion: integer("current_question").default(0),
  questions: jsonb("questions"),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const competitionPlayers = pgTable("competition_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  sessionToken: varchar("session_token", { length: 100 }).notNull(),
  score: integer("score").default(0),
  correctAnswers: integer("correct_answers").default(0),
  wrongAnswers: integer("wrong_answers").default(0),
  streak: integer("streak").default(0),
  maxStreak: integer("max_streak").default(0),
  answers: jsonb("answers").default([]),
  status: varchar("status", { length: 20 }).default("joined").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
