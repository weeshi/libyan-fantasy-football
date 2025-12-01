import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams in the Libyan Football League
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }),
  logo: text("logo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Players in the Libyan Football League
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  position: mysqlEnum("position", ["goalkeeper", "defender", "midfielder", "forward"]).notNull(),
  jerseyNumber: int("jerseyNumber"),
  marketValue: int("marketValue").default(0).notNull(), // in currency units
  totalPoints: int("totalPoints").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Leagues created by users
 */
export const leagues = mysqlTable("leagues", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  creatorId: int("creatorId").notNull(),
  description: text("description"),
  maxParticipants: int("maxParticipants").default(20).notNull(),
  status: mysqlEnum("status", ["draft", "active", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof leagues.$inferInsert;

/**
 * User teams in a league
 */
export const userTeams = mysqlTable("userTeams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leagueId: int("leagueId").notNull(),
  teamName: varchar("teamName", { length: 255 }).notNull(),
  budget: int("budget").default(100000000).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  goalsFor: int("goalsFor").default(0).notNull(),
  goalsAgainst: int("goalsAgainst").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  wins: int("wins").default(0).notNull(),
  draws: int("draws").default(0).notNull(),
  losses: int("losses").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTeam = typeof userTeams.$inferSelect;
export type InsertUserTeam = typeof userTeams.$inferInsert;

/**
 * Players selected in a user's team
 */
export const userTeamPlayers = mysqlTable("userTeamPlayers", {
  id: int("id").autoincrement().primaryKey(),
  userTeamId: int("userTeamId").notNull(),
  playerId: int("playerId").notNull(),
  purchasePrice: int("purchasePrice").notNull(),
  isCaptain: int("isCaptain").default(0).notNull(), // 0 = false, 1 = true
  isOnBench: int("isOnBench").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTeamPlayer = typeof userTeamPlayers.$inferSelect;
export type InsertUserTeamPlayer = typeof userTeamPlayers.$inferInsert;

/**
 * Match results and player performances
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  homeTeamId: int("homeTeamId").notNull(),
  awayTeamId: int("awayTeamId").notNull(),
  homeScore: int("homeScore"),
  awayScore: int("awayScore"),
  matchDate: timestamp("matchDate").notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "completed", "postponed"]).default("scheduled").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Player performance in a match
 */
export const playerPerformances = mysqlTable("playerPerformances", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  playerId: int("playerId").notNull(),
  minutesPlayed: int("minutesPlayed").default(0).notNull(),
  goals: int("goals").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  cleanSheet: int("cleanSheet").default(0).notNull(),
  yellowCards: int("yellowCards").default(0).notNull(),
  redCards: int("redCards").default(0).notNull(),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerPerformance = typeof playerPerformances.$inferSelect;
export type InsertPlayerPerformance = typeof playerPerformances.$inferInsert;

/**
 * Gameweek standings and user team points
 */
export const gameweeks = mysqlTable("gameweeks", {
  id: int("id").autoincrement().primaryKey(),
  leagueId: int("leagueId").notNull(),
  gameweekNumber: int("gameweekNumber").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["upcoming", "active", "completed"]).default("upcoming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Gameweek = typeof gameweeks.$inferSelect;
export type InsertGameweek = typeof gameweeks.$inferInsert;

/**
 * User team points for each gameweek
 */
export const gameweekScores = mysqlTable("gameweekScores", {
  id: int("id").autoincrement().primaryKey(),
  userTeamId: int("userTeamId").notNull(),
  gameweekId: int("gameweekId").notNull(),
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameweekScore = typeof gameweekScores.$inferSelect;
export type InsertGameweekScore = typeof gameweekScores.$inferInsert;

/**
 * Transaction history for player transfers
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userTeamId: int("userTeamId").notNull(),
  playerId: int("playerId").notNull(),
  transactionType: mysqlEnum("transactionType", ["buy", "sell"]).notNull(),
  price: int("price").notNull(),
  previousPrice: int("previousPrice"),
  budgetBefore: int("budgetBefore").notNull(),
  budgetAfter: int("budgetAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;