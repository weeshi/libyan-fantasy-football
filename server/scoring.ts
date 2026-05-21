/**
 * Advanced Scoring System for Talba Fantasy Football
 * Implements FPL-style point calculations with position-specific rules
 */

import { getDb } from "./db";
import { scoringRules, playerGameweekStats, InsertPlayerGameweekStat } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Default scoring rules matching FPL standards
 */
export const DEFAULT_SCORING_RULES = [
  // Minutes played
  { ruleType: "minutesPlayed_0_60", position: "all", points: 1, description: "لعب 0-60 دقيقة" },
  { ruleType: "minutesPlayed_60_plus", position: "all", points: 2, description: "لعب 60 دقيقة أو أكثر" },

  // Goals
  { ruleType: "goal_goalkeeper", position: "goalkeeper", points: 10, description: "هدف - حارس" },
  { ruleType: "goal_defender", position: "defender", points: 6, description: "هدف - مدافع" },
  { ruleType: "goal_midfielder", position: "midfielder", points: 5, description: "هدف - وسط" },
  { ruleType: "goal_forward", position: "forward", points: 4, description: "هدف - مهاجم" },

  // Assists
  { ruleType: "assist", position: "all", points: 3, description: "تمريرة حاسمة" },

  // Clean sheets
  { ruleType: "cleanSheet_goalkeeper", position: "goalkeeper", points: 4, description: "ورقة نظيفة - حارس" },
  { ruleType: "cleanSheet_defender", position: "defender", points: 4, description: "ورقة نظيفة - مدافع" },
  { ruleType: "cleanSheet_midfielder", position: "midfielder", points: 1, description: "ورقة نظيفة - وسط" },

  // Saves (per 3 saves)
  { ruleType: "saves", position: "goalkeeper", points: 1, description: "إنقاذ (لكل 3 إنقاذات)" },

  // Cards
  { ruleType: "yellowCard", position: "all", points: -1, description: "بطاقة صفراء" },
  { ruleType: "redCard", position: "all", points: -3, description: "بطاقة حمراء" },

  // Goals against (per 2 goals)
  { ruleType: "goalsAgainst", position: "goalkeeper", points: -1, description: "أهداف مستقبلة (لكل هدفين)" },
  { ruleType: "goalsAgainst", position: "defender", points: -1, description: "أهداف مستقبلة (لكل هدفين)" },

  // Bonus points
  { ruleType: "bonusPoints", position: "all", points: 1, description: "نقاط المكافأة (1-3)" },
];

/**
 * Get all active scoring rules
 */
export async function getScoringRules() {
  const db = await getDb();
  if (!db) return DEFAULT_SCORING_RULES;

  try {
    const rules = await db
      .select()
      .from(scoringRules)
      .where(eq(scoringRules.isActive, 1));

    return rules.length > 0 ? rules : DEFAULT_SCORING_RULES;
  } catch (error) {
    console.error("Failed to get scoring rules:", error);
    return DEFAULT_SCORING_RULES;
  }
}

/**
 * Initialize default scoring rules in database
 */
export async function initializeScoringRules() {
  const db = await getDb();
  if (!db) return;

  try {
    // Check if rules already exist
    const existingRules = await db.select().from(scoringRules).limit(1);
    if (existingRules.length > 0) {
      console.log("Scoring rules already initialized");
      return;
    }

    // Insert default rules
    for (const rule of DEFAULT_SCORING_RULES) {
      await db.insert(scoringRules).values({
        ruleType: rule.ruleType,
        position: rule.position as any,
        points: rule.points,
        description: rule.description,
        isActive: 1,
      });
    }

    console.log("Scoring rules initialized successfully");
  } catch (error) {
    console.error("Failed to initialize scoring rules:", error);
  }
}

/**
 * Calculate points for a player based on their performance
 */
export interface PlayerPerformanceInput {
  playerId: number;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  goalsAgainst: number;
  saves: number;
  bonusPoints: number;
}

export async function calculatePlayerPoints(performance: PlayerPerformanceInput): Promise<number> {
  const rules = await getScoringRules();
  let totalPoints = 0;

  // Minutes played
  if (performance.minutesPlayed >= 60) {
    const rule = rules.find(
      (r) => r.ruleType === "minutesPlayed_60_plus" && (r.position === performance.position || r.position === "all")
    );
    if (rule) totalPoints += rule.points;
  } else if (performance.minutesPlayed > 0) {
    const rule = rules.find(
      (r) => r.ruleType === "minutesPlayed_0_60" && (r.position === performance.position || r.position === "all")
    );
    if (rule) totalPoints += rule.points;
  }

  // Goals
  if (performance.goals > 0) {
    const ruleType = `goal_${performance.position}`;
    const rule = rules.find((r) => r.ruleType === ruleType);
    if (rule) totalPoints += rule.points * performance.goals;
  }

  // Assists
  if (performance.assists > 0) {
    const rule = rules.find((r) => r.ruleType === "assist");
    if (rule) totalPoints += rule.points * performance.assists;
  }

  // Clean sheet
  if (performance.cleanSheet) {
    const ruleType = `cleanSheet_${performance.position}`;
    const rule = rules.find((r) => r.ruleType === ruleType);
    if (rule) totalPoints += rule.points;
  }

  // Saves (per 3)
  if (performance.saves > 0 && performance.position === "goalkeeper") {
    const rule = rules.find((r) => r.ruleType === "saves");
    if (rule) totalPoints += rule.points * Math.floor(performance.saves / 3);
  }

  // Yellow cards
  if (performance.yellowCards > 0) {
    const rule = rules.find((r) => r.ruleType === "yellowCard");
    if (rule) totalPoints += rule.points * performance.yellowCards;
  }

  // Red cards
  if (performance.redCards > 0) {
    const rule = rules.find((r) => r.ruleType === "redCard");
    if (rule) totalPoints += rule.points * performance.redCards;
  }

  // Goals against (per 2)
  if (performance.goalsAgainst > 0 && (performance.position === "goalkeeper" || performance.position === "defender")) {
    const rule = rules.find((r) => r.ruleType === "goalsAgainst" && r.position === performance.position);
    if (rule) totalPoints += rule.points * Math.floor(performance.goalsAgainst / 2);
  }

  // Bonus points (capped at 3)
  if (performance.bonusPoints > 0) {
    const rule = rules.find((r) => r.ruleType === "bonusPoints");
    if (rule) totalPoints += rule.points * Math.min(performance.bonusPoints, 3);
  }

  return Math.max(0, totalPoints); // Ensure non-negative
}

/**
 * Save player gameweek statistics
 */
export async function savePlayerGameweekStats(stats: InsertPlayerGameweekStat) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(playerGameweekStats).values(stats);
    return result;
  } catch (error) {
    console.error("Failed to save player gameweek stats:", error);
    throw error;
  }
}

/**
 * Get player gameweek statistics
 */
export async function getPlayerGameweekStats(playerId: number, gameweekId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db
      .select()
      .from(playerGameweekStats)
      .where(and(eq(playerGameweekStats.playerId, playerId), eq(playerGameweekStats.gameweekId, gameweekId)))
      .limit(1);

    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    console.error("Failed to get player gameweek stats:", error);
    return null;
  }
}

/**
 * Update player gameweek statistics and recalculate points
 */
export async function updatePlayerGameweekStats(
  playerId: number,
  gameweekId: number,
  performance: PlayerPerformanceInput
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Calculate points
    const points = await calculatePlayerPoints(performance);

    // Check if record exists
    const existing = await getPlayerGameweekStats(playerId, gameweekId);

    if (existing) {
      // Update existing record
      const result = await db
        .update(playerGameweekStats)
        .set({
          minutesPlayed: performance.minutesPlayed,
          goals: performance.goals,
          assists: performance.assists,
          cleanSheet: performance.cleanSheet ? 1 : 0,
          yellowCards: performance.yellowCards,
          redCards: performance.redCards,
          goalsAgainst: performance.goalsAgainst,
          saves: performance.saves,
          bonusPoints: performance.bonusPoints,
          totalPoints: points,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(playerGameweekStats.playerId, playerId),
            eq(playerGameweekStats.gameweekId, gameweekId)
          )
        );
      return result;
    } else {
      // Create new record
      const result = await savePlayerGameweekStats({
        playerId,
        gameweekId,
        minutesPlayed: performance.minutesPlayed,
        goals: performance.goals,
        assists: performance.assists,
        cleanSheet: performance.cleanSheet ? 1 : 0,
        yellowCards: performance.yellowCards,
        redCards: performance.redCards,
        goalsAgainst: performance.goalsAgainst,
        saves: performance.saves,
        bonusPoints: performance.bonusPoints,
        totalPoints: points,
      });
      return result;
    }
  } catch (error) {
    console.error("Failed to update player gameweek stats:", error);
    throw error;
  }
}

/**
 * Get player season statistics
 */
export async function getPlayerSeasonStats(playerId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db
      .select()
      .from(playerGameweekStats)
      .where(eq(playerGameweekStats.playerId, playerId));

    if (stats.length === 0) return null;

    const totalPoints = stats.reduce((sum, s) => sum + s.totalPoints, 0);
    const totalGoals = stats.reduce((sum, s) => sum + s.goals, 0);
    const totalAssists = stats.reduce((sum, s) => sum + s.assists, 0);
    const averagePoints = Math.round(totalPoints / stats.length);

    return {
      playerId,
      totalPoints,
      totalGoals,
      totalAssists,
      averagePoints,
      gameweeksPlayed: stats.length,
      stats,
    };
  } catch (error) {
    console.error("Failed to get player season stats:", error);
    return null;
  }
}
