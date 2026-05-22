/**
 * Advanced Scoring System - FPL-style point calculations
 * Comprehensive point calculation based on player performance
 */

import { getDb } from "./db";
import { playerGameweekStats, scoringRules } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Scoring configuration - matches FPL rules
 */
export interface ScoringConfig {
  // Minutes played
  minutesPlayedThreshold: number; // 60+ minutes
  pointsPerMinute: number; // 1 point per minute played
  
  // Goals
  goalsGoalkeeper: number;
  goalsDefender: number;
  goalsMidfielder: number;
  goalsForward: number;
  
  // Assists
  assistsPoints: number;
  
  // Clean sheets
  cleanSheetGoalkeeper: number;
  cleanSheetDefender: number;
  cleanSheetMidfielder: number;
  
  // Saves
  savesThreshold: number; // 1 point per 3 saves
  
  // Cards
  yellowCardPenalty: number;
  redCardPenalty: number;
  
  // Goals against
  goalsAgainstThreshold: number; // 1 penalty per 2 goals
  goalsAgainstPenalty: number;
  
  // Own goals
  ownGoalPenalty: number;
  
  // Penalties
  penaltyMissedPenalty: number;
  
  // Bonus points
  bonusPointsMultiplier: number;
}

/**
 * Default FPL-style scoring configuration
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  minutesPlayedThreshold: 60,
  pointsPerMinute: 1,
  
  goalsGoalkeeper: 10,
  goalsDefender: 6,
  goalsMidfielder: 5,
  goalsForward: 4,
  
  assistsPoints: 3,
  
  cleanSheetGoalkeeper: 4,
  cleanSheetDefender: 4,
  cleanSheetMidfielder: 1,
  
  savesThreshold: 3,
  
  yellowCardPenalty: -1,
  redCardPenalty: -3,
  
  goalsAgainstThreshold: 2,
  goalsAgainstPenalty: -1,
  
  ownGoalPenalty: -2,
  penaltyMissedPenalty: -2,
  
  bonusPointsMultiplier: 1,
};

/**
 * Player performance data for scoring
 */
export interface PlayerPerformanceData {
  playerId: number;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  saves?: number;
  yellowCards: number;
  redCards: number;
  goalsAgainst?: number;
  ownGoals?: number;
  penaltyMissed?: number;
  bonusPoints?: number;
}

/**
 * Calculate points for minutes played
 */
export function calculateMinutesPoints(minutesPlayed: number, config: ScoringConfig): number {
  if (minutesPlayed < config.minutesPlayedThreshold) {
    return 0; // No points if less than threshold
  }
  return Math.floor(minutesPlayed / config.pointsPerMinute);
}

/**
 * Calculate points for goals scored
 */
export function calculateGoalsPoints(
  goals: number,
  position: "goalkeeper" | "defender" | "midfielder" | "forward",
  config: ScoringConfig
): number {
  if (goals === 0) return 0;
  
  const pointsPerGoal = {
    goalkeeper: config.goalsGoalkeeper,
    defender: config.goalsDefender,
    midfielder: config.goalsMidfielder,
    forward: config.goalsForward,
  };
  
  return goals * (pointsPerGoal[position] || 0);
}

/**
 * Calculate points for assists
 */
export function calculateAssistsPoints(assists: number, config: ScoringConfig): number {
  return assists * config.assistsPoints;
}

/**
 * Calculate points for clean sheets
 */
export function calculateCleanSheetPoints(
  cleanSheet: boolean,
  position: "goalkeeper" | "defender" | "midfielder" | "forward",
  minutesPlayed: number,
  config: ScoringConfig
): number {
  if (!cleanSheet || minutesPlayed < config.minutesPlayedThreshold) {
    return 0;
  }
  
  const pointsPerCleanSheet = {
    goalkeeper: config.cleanSheetGoalkeeper,
    defender: config.cleanSheetDefender,
    midfielder: config.cleanSheetMidfielder,
    forward: 0,
  };
  
  return pointsPerCleanSheet[position] || 0;
}

/**
 * Calculate points for saves (goalkeepers only)
 */
export function calculateSavesPoints(
  saves: number = 0,
  position: "goalkeeper" | "defender" | "midfielder" | "forward",
  config: ScoringConfig
): number {
  if (position !== "goalkeeper" || saves === 0) {
    return 0;
  }
  
  return Math.floor(saves / config.savesThreshold);
}

/**
 * Calculate penalty for yellow cards
 */
export function calculateYellowCardPenalty(yellowCards: number, config: ScoringConfig): number {
  return yellowCards === 0 ? 0 : yellowCards * config.yellowCardPenalty;
}

/**
 * Calculate penalty for red cards
 */
export function calculateRedCardPenalty(redCards: number, config: ScoringConfig): number {
  return redCards === 0 ? 0 : redCards * config.redCardPenalty;
}

/**
 * Calculate penalty for goals against (defenders and goalkeepers)
 */
export function calculateGoalsAgainstPenalty(
  goalsAgainst: number = 0,
  position: "goalkeeper" | "defender" | "midfielder" | "forward",
  config: ScoringConfig
): number {
  if ((position !== "goalkeeper" && position !== "defender") || goalsAgainst === 0) {
    return 0;
  }
  
  return Math.floor(goalsAgainst / config.goalsAgainstThreshold) * config.goalsAgainstPenalty;
}

/**
 * Calculate penalty for own goals
 */
export function calculateOwnGoalPenalty(ownGoals: number = 0, config: ScoringConfig): number {
  return ownGoals * config.ownGoalPenalty;
}

/**
 * Calculate penalty for missed penalties
 */
export function calculatePenaltyMissedPenalty(penaltyMissed: number = 0, config: ScoringConfig): number {
  return penaltyMissed === 0 ? 0 : penaltyMissed * config.penaltyMissedPenalty;
}

/**
 * Calculate bonus points
 */
export function calculateBonusPoints(bonusPoints: number = 0, config: ScoringConfig): number {
  return bonusPoints * config.bonusPointsMultiplier;
}

/**
 * Calculate total points for a player's performance
 */
export function calculatePlayerPoints(
  performance: PlayerPerformanceData,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG
): number {
  let totalPoints = 0;
  
  // Minutes played
  totalPoints += calculateMinutesPoints(performance.minutesPlayed, config);
  
  // Goals
  totalPoints += calculateGoalsPoints(performance.goals, performance.position, config);
  
  // Assists
  totalPoints += calculateAssistsPoints(performance.assists, config);
  
  // Clean sheets
  totalPoints += calculateCleanSheetPoints(
    performance.cleanSheet,
    performance.position,
    performance.minutesPlayed,
    config
  );
  
  // Saves (goalkeepers)
  totalPoints += calculateSavesPoints(performance.saves, performance.position, config);
  
  // Yellow cards
  totalPoints += calculateYellowCardPenalty(performance.yellowCards, config);
  
  // Red cards
  totalPoints += calculateRedCardPenalty(performance.redCards, config);
  
  // Goals against
  totalPoints += calculateGoalsAgainstPenalty(
    performance.goalsAgainst,
    performance.position,
    config
  );
  
  // Own goals
  totalPoints += calculateOwnGoalPenalty(performance.ownGoals, config);
  
  // Missed penalties
  totalPoints += calculatePenaltyMissedPenalty(performance.penaltyMissed, config);
  
  // Bonus points
  totalPoints += calculateBonusPoints(performance.bonusPoints, config);
  
  return Math.max(0, totalPoints); // Ensure non-negative
}

/**
 * Get scoring configuration from database
 */
export async function getScoringConfig(): Promise<ScoringConfig> {
  const db = await getDb();
  if (!db) return DEFAULT_SCORING_CONFIG;
  
  try {
    const rules = await db
      .select()
      .from(scoringRules)
      .where(eq(scoringRules.isActive, 1));
    
    // Build config from rules
    const config = { ...DEFAULT_SCORING_CONFIG };
    
    for (const rule of rules) {
      // Map rule types to config properties
      const ruleMap: Record<string, keyof ScoringConfig> = {
        "minutesPlayedThreshold": "minutesPlayedThreshold",
        "pointsPerMinute": "pointsPerMinute",
        "goalsGoalkeeper": "goalsGoalkeeper",
        "goalsDefender": "goalsDefender",
        "goalsMidfielder": "goalsMidfielder",
        "goalsForward": "goalsForward",
        "assistsPoints": "assistsPoints",
        "cleanSheetGoalkeeper": "cleanSheetGoalkeeper",
        "cleanSheetDefender": "cleanSheetDefender",
        "cleanSheetMidfielder": "cleanSheetMidfielder",
        "savesThreshold": "savesThreshold",
        "yellowCardPenalty": "yellowCardPenalty",
        "redCardPenalty": "redCardPenalty",
        "goalsAgainstThreshold": "goalsAgainstThreshold",
        "goalsAgainstPenalty": "goalsAgainstPenalty",
        "ownGoalPenalty": "ownGoalPenalty",
        "penaltyMissedPenalty": "penaltyMissedPenalty",
        "bonusPointsMultiplier": "bonusPointsMultiplier",
      };
      
      const configKey = ruleMap[rule.ruleType];
      if (configKey) {
        (config as any)[configKey] = rule.points;
      }
    }
    
    return config;
  } catch (error) {
    console.error("Failed to get scoring config:", error);
    return DEFAULT_SCORING_CONFIG;
  }
}

/**
 * Update scoring rule
 */
export async function updateScoringRule(
  ruleType: string,
  points: number,
  position: "goalkeeper" | "defender" | "midfielder" | "forward" | "all" = "all"
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }
  
  try {
    // Check if rule exists
    const existing = await db
      .select()
      .from(scoringRules)
      .where(eq(scoringRules.ruleType, ruleType))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing rule
      await db
        .update(scoringRules)
        .set({ points, updatedAt: new Date() })
        .where(eq(scoringRules.ruleType, ruleType));
    } else {
      // Create new rule
      await db.insert(scoringRules).values({
        ruleType,
        position,
        points,
        isActive: 1,
      });
    }
    
    return { success: true, message: "تم تحديث قاعدة النقاط بنجاح" };
  } catch (error) {
    console.error("Failed to update scoring rule:", error);
    return { success: false, message: "فشل في تحديث قاعدة النقاط" };
  }
}

/**
 * Reset scoring rules to defaults
 */
export async function resetScoringRulesToDefaults(): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }
  
  try {
    // Delete all existing rules
    await db.execute("DELETE FROM scoringRules");
    
    // Insert default rules
    const defaultRules = [
      { ruleType: "minutesPlayedThreshold", position: "all", points: DEFAULT_SCORING_CONFIG.minutesPlayedThreshold },
      { ruleType: "pointsPerMinute", position: "all", points: DEFAULT_SCORING_CONFIG.pointsPerMinute },
      { ruleType: "goalsGoalkeeper", position: "goalkeeper", points: DEFAULT_SCORING_CONFIG.goalsGoalkeeper },
      { ruleType: "goalsDefender", position: "defender", points: DEFAULT_SCORING_CONFIG.goalsDefender },
      { ruleType: "goalsMidfielder", position: "midfielder", points: DEFAULT_SCORING_CONFIG.goalsMidfielder },
      { ruleType: "goalsForward", position: "forward", points: DEFAULT_SCORING_CONFIG.goalsForward },
      { ruleType: "assistsPoints", position: "all", points: DEFAULT_SCORING_CONFIG.assistsPoints },
      { ruleType: "cleanSheetGoalkeeper", position: "goalkeeper", points: DEFAULT_SCORING_CONFIG.cleanSheetGoalkeeper },
      { ruleType: "cleanSheetDefender", position: "defender", points: DEFAULT_SCORING_CONFIG.cleanSheetDefender },
      { ruleType: "cleanSheetMidfielder", position: "midfielder", points: DEFAULT_SCORING_CONFIG.cleanSheetMidfielder },
      { ruleType: "savesThreshold", position: "goalkeeper", points: DEFAULT_SCORING_CONFIG.savesThreshold },
      { ruleType: "yellowCardPenalty", position: "all", points: DEFAULT_SCORING_CONFIG.yellowCardPenalty },
      { ruleType: "redCardPenalty", position: "all", points: DEFAULT_SCORING_CONFIG.redCardPenalty },
      { ruleType: "goalsAgainstThreshold", position: "all", points: DEFAULT_SCORING_CONFIG.goalsAgainstThreshold },
      { ruleType: "goalsAgainstPenalty", position: "all", points: DEFAULT_SCORING_CONFIG.goalsAgainstPenalty },
      { ruleType: "ownGoalPenalty", position: "all", points: DEFAULT_SCORING_CONFIG.ownGoalPenalty },
      { ruleType: "penaltyMissedPenalty", position: "all", points: DEFAULT_SCORING_CONFIG.penaltyMissedPenalty },
      { ruleType: "bonusPointsMultiplier", position: "all", points: DEFAULT_SCORING_CONFIG.bonusPointsMultiplier },
    ];
    
    for (const rule of defaultRules) {
      await db.insert(scoringRules).values({
        ruleType: rule.ruleType,
        position: rule.position as any,
        points: rule.points,
        isActive: 1,
      });
    }
    
    return { success: true, message: "تم إعادة تعيين قواعد النقاط إلى الافتراضية" };
  } catch (error) {
    console.error("Failed to reset scoring rules:", error);
    return { success: false, message: "فشل في إعادة تعيين القواعس" };
  }
}

/**
 * Get all scoring rules
 */
export async function getAllScoringRules() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(scoringRules).orderBy(scoringRules.ruleType);
  } catch (error) {
    console.error("Failed to get scoring rules:", error);
    return [];
  }
}
