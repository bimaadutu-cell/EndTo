import { pgTable, text, integer, boolean, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
  status: varchar("status", { length: 20 }).default("waiting").notNull(),
  createdBy: varchar("created_by", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitionPlayers = pgTable("competition_players", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull(),
  playerName: varchar("player_name", { length: 100 }).notNull(),
  score: integer("score").default(0),
  status: varchar("status", { length: 20 }).default("joined").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
