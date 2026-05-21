/**
 * Admin Result Management System
 * Handles match results, player statistics, and point calculations
 */

import { getDb } from "./db";
import { matches, playerGameweekStats } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculatePlayerPoints } from "./scoring";

/**
 * Update match result
 */
export async function updateMatchResult(
  matchId: number,
  team1Score: number,
  team2Score: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Validate scores
    if (team1Score < 0 || team2Score < 0) {
      return { success: false, message: "النتيجة لا يمكن أن تكون سالبة" };
    }

    await db
      .update(matches)
      .set({
        team1Score,
        team2Score,
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    return { success: true, message: "تم تحديث النتيجة بنجاح" };
  } catch (error) {
    console.error("Failed to update match result:", error);
    return { success: false, message: "فشل في تحديث النتيجة" };
  }
}

/**
 * Record player performance in a match
 */
export async function recordPlayerPerformance(
  playerId: number,
  gameweekId: number,
  matchId: number,
  stats: {
    minutesPlayed: number;
    goals: number;
    assists: number;
    cleanSheet: boolean;
    saves?: number;
    yellowCards: number;
    redCards: number;
    ownGoals?: number;
    penaltyMissed?: number;
    bonusPoints?: number;
  }
): Promise<{ success: boolean; points?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Calculate points
    const points = calculatePlayerPoints(stats);

    // Check if record exists
    const existing = await db
      .select()
      .from(playerGameweekStats)
      .where(
        eq(playerGameweekStats.playerId, playerId) &&
          eq(playerGameweekStats.gameweekId, gameweekId)
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(playerGameweekStats)
        .set({
          minutesPlayed: stats.minutesPlayed,
          goals: stats.goals,
          assists: stats.assists,
          cleanSheet: stats.cleanSheet ? 1 : 0,
          saves: stats.saves || 0,
          yellowCards: stats.yellowCards,
          redCards: stats.redCards,
          ownGoals: stats.ownGoals || 0,
          penaltyMissed: stats.penaltyMissed || 0,
          bonusPoints: stats.bonusPoints || 0,
          totalPoints: points,
          updatedAt: new Date(),
        })
        .where(eq(playerGameweekStats.playerId, playerId));
    } else {
      // Create new record
      await db.insert(playerGameweekStats).values({
        playerId,
        gameweekId,
        matchId,
        minutesPlayed: stats.minutesPlayed,
        goals: stats.goals,
        assists: stats.assists,
        cleanSheet: stats.cleanSheet ? 1 : 0,
        saves: stats.saves || 0,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards,
        ownGoals: stats.ownGoals || 0,
        penaltyMissed: stats.penaltyMissed || 0,
        bonusPoints: stats.bonusPoints || 0,
        totalPoints: points,
      });
    }

    return {
      success: true,
      points,
      message: `تم تسجيل أداء اللاعب بنجاح (${points} نقطة)`,
    };
  } catch (error) {
    console.error("Failed to record player performance:", error);
    return { success: false, message: "فشل في تسجيل أداء اللاعب" };
  }
}

/**
 * Get player performance in gameweek
 */
export async function getPlayerGameweekStats(playerId: number, gameweekId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db
      .select()
      .from(playerGameweekStats)
      .where(
        eq(playerGameweekStats.playerId, playerId) &&
          eq(playerGameweekStats.gameweekId, gameweekId)
      )
      .limit(1);

    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    console.error("Failed to get player gameweek stats:", error);
    return null;
  }
}

/**
 * Get all player performances in a gameweek
 */
export async function getGameweekPlayerStats(gameweekId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const stats = await db
      .select()
      .from(playerGameweekStats)
      .where(eq(playerGameweekStats.gameweekId, gameweekId));

    return stats;
  } catch (error) {
    console.error("Failed to get gameweek player stats:", error);
    return [];
  }
}

/**
 * Finalize gameweek results (calculate all points and update standings)
 */
export async function finalizeGameweekResults(gameweekId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get all matches for gameweek
    const gameweekMatches = await db
      .select()
      .from(matches)
      .where(eq(matches.gameweekId, gameweekId));

    // Verify all matches are completed
    const allCompleted = gameweekMatches.every((m) => m.status === "completed");

    if (!allCompleted) {
      return { success: false, message: "جميع المباريات يجب أن تكون مكتملة" };
    }

    // Update gameweek status
    await db.execute(`
      UPDATE gameweeks
      SET status = 'completed'
      WHERE id = ${gameweekId}
    `);

    // Calculate and update all team points
    await db.execute(`
      UPDATE userTeams ut
      SET totalPoints = (
        SELECT COALESCE(SUM(pgs.totalPoints), 0)
        FROM playerGameweekStats pgs
        JOIN players p ON pgs.playerId = p.id
        WHERE p.leagueId = ut.leagueId
        AND pgs.gameweekId <= ${gameweekId}
      )
      WHERE ut.leagueId IN (
        SELECT leagueId FROM gameweeks WHERE id = ${gameweekId}
      )
    `);

    return { success: true, message: "تم إنهاء نتائج الأسبوع بنجاح" };
  } catch (error) {
    console.error("Failed to finalize gameweek results:", error);
    return { success: false, message: "فشل في إنهاء نتائج الأسبوع" };
  }
}

/**
 * Get match result details
 */
export async function getMatchResultDetails(matchId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

    if (match.length === 0) return null;

    const m = match[0];

    // Get player stats for this match
    const playerStats = await db
      .select()
      .from(playerGameweekStats)
      .where(eq(playerGameweekStats.matchId, matchId));

    return {
      match: m,
      playerStats,
      totalGoals: m.team1Score + m.team2Score,
      winner: m.team1Score > m.team2Score ? "team1" : m.team2Score > m.team1Score ? "team2" : "draw",
    };
  } catch (error) {
    console.error("Failed to get match result details:", error);
    return null;
  }
}

/**
 * Bulk update match results
 */
export async function bulkUpdateMatchResults(
  results: Array<{
    matchId: number;
    team1Score: number;
    team2Score: number;
  }>
): Promise<{ success: boolean; message: string; updatedCount?: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    let updatedCount = 0;

    for (const result of results) {
      try {
        await db
          .update(matches)
          .set({
            team1Score: result.team1Score,
            team2Score: result.team2Score,
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(matches.id, result.matchId));

        updatedCount++;
      } catch (error) {
        console.warn(`Failed to update match ${result.matchId}:`, error);
      }
    }

    return {
      success: updatedCount > 0,
      message: `تم تحديث ${updatedCount} نتيجة من أصل ${results.length}`,
      updatedCount,
    };
  } catch (error) {
    console.error("Failed to bulk update match results:", error);
    return { success: false, message: "فشل في تحديث النتائج" };
  }
}

/**
 * Get gameweek summary
 */
export async function getGameweekSummary(gameweekId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const summary = await db.execute(`
      SELECT
        COUNT(*) as totalMatches,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedMatches,
        SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as liveMatches,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduledMatches,
        SUM(team1Score + team2Score) as totalGoals,
        AVG(team1Score + team2Score) as avgGoalsPerMatch
      FROM matches
      WHERE gameweekId = ${gameweekId}
    `);

    return summary[0] || null;
  } catch (error) {
    console.error("Failed to get gameweek summary:", error);
    return null;
  }
}

/**
 * Undo match result
 */
export async function undoMatchResult(matchId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

    if (match.length === 0) {
      return { success: false, message: "المباراة غير موجودة" };
    }

    // Reset match to scheduled
    await db
      .update(matches)
      .set({
        team1Score: 0,
        team2Score: 0,
        status: "scheduled",
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    // Delete player stats for this match
    await db.execute(`DELETE FROM playerGameweekStats WHERE matchId = ${matchId}`);

    return { success: true, message: "تم إلغاء نتيجة المباراة بنجاح" };
  } catch (error) {
    console.error("Failed to undo match result:", error);
    return { success: false, message: "فشل في إلغاء النتيجة" };
  }
}
