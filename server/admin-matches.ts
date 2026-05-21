/**
 * Admin Match Management System
 * Handles creation, update, and management of matches
 */

import { getDb } from "./db";
import { matches } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Create a new match
 */
export async function createMatch(
  gameweekId: number,
  team1Id: number,
  team2Id: number,
  kickoffTime: Date,
  venue?: string
): Promise<{ success: boolean; matchId?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Validate teams are different
    if (team1Id === team2Id) {
      return { success: false, message: "يجب أن يكون الفريقان مختلفين" };
    }

    const result = await db.insert(matches).values({
      gameweekId,
      team1Id,
      team2Id,
      kickoffTime,
      venue: venue || "",
      status: "scheduled",
      team1Score: 0,
      team2Score: 0,
    });

    return {
      success: true,
      matchId: (result as any).insertId,
      message: "تم إنشاء المباراة بنجاح",
    };
  } catch (error) {
    console.error("Failed to create match:", error);
    return { success: false, message: "فشل في إنشاء المباراة" };
  }
}

/**
 * Update match status
 */
export async function updateMatchStatus(
  matchId: number,
  status: "scheduled" | "live" | "completed"
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(matches)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    const statusText =
      status === "scheduled"
        ? "مجدول"
        : status === "live"
          ? "جاري"
          : "انتهى";

    return { success: true, message: `تم تحديث حالة المباراة إلى: ${statusText}` };
  } catch (error) {
    console.error("Failed to update match status:", error);
    return { success: false, message: "فشل في تحديث حالة المباراة" };
  }
}

/**
 * Update match kickoff time
 */
export async function updateMatchKickoffTime(
  matchId: number,
  kickoffTime: Date
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(matches)
      .set({
        kickoffTime,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    return { success: true, message: "تم تحديث موعد المباراة بنجاح" };
  } catch (error) {
    console.error("Failed to update match kickoff time:", error);
    return { success: false, message: "فشل في تحديث موعد المباراة" };
  }
}

/**
 * Update match venue
 */
export async function updateMatchVenue(matchId: number, venue: string): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(matches)
      .set({
        venue,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    return { success: true, message: "تم تحديث ملعب المباراة بنجاح" };
  } catch (error) {
    console.error("Failed to update match venue:", error);
    return { success: false, message: "فشل في تحديث ملعب المباراة" };
  }
}

/**
 * Get all matches for a gameweek
 */
export async function getGameweekMatches(gameweekId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const matchList = await db
      .select()
      .from(matches)
      .where(eq(matches.gameweekId, gameweekId))
      .orderBy(matches.kickoffTime);

    return matchList;
  } catch (error) {
    console.error("Failed to get gameweek matches:", error);
    return [];
  }
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const matchList = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);

    return matchList.length > 0 ? matchList[0] : null;
  } catch (error) {
    console.error("Failed to get match:", error);
    return null;
  }
}

/**
 * Delete match (only if not completed)
 */
export async function deleteMatch(matchId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    const match = await getMatchById(matchId);

    if (!match) {
      return { success: false, message: "المباراة غير موجودة" };
    }

    if (match.status === "completed") {
      return { success: false, message: "لا يمكن حذف مباراة انتهت" };
    }

    await db.delete(matches).where(eq(matches.id, matchId));

    return { success: true, message: "تم حذف المباراة بنجاح" };
  } catch (error) {
    console.error("Failed to delete match:", error);
    return { success: false, message: "فشل في حذف المباراة" };
  }
}

/**
 * Get matches by status
 */
export async function getMatchesByStatus(status: "scheduled" | "live" | "completed") {
  const db = await getDb();
  if (!db) return [];

  try {
    const matchList = await db
      .select()
      .from(matches)
      .where(eq(matches.status, status))
      .orderBy(matches.kickoffTime);

    return matchList;
  } catch (error) {
    console.error("Failed to get matches by status:", error);
    return [];
  }
}

/**
 * Get upcoming matches
 */
export async function getUpcomingMatches(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const now = new Date();
    const matchList = await db.execute(`
      SELECT * FROM matches
      WHERE kickoffTime > '${now.toISOString()}' AND status = 'scheduled'
      ORDER BY kickoffTime ASC
      LIMIT ${limit}
    `);

    return matchList;
  } catch (error) {
    console.error("Failed to get upcoming matches:", error);
    return [];
  }
}

/**
 * Get live matches
 */
export async function getLiveMatches() {
  const db = await getDb();
  if (!db) return [];

  try {
    const matchList = await db.select().from(matches).where(eq(matches.status, "live"));

    return matchList;
  } catch (error) {
    console.error("Failed to get live matches:", error);
    return [];
  }
}

/**
 * Bulk create matches for a gameweek
 */
export async function bulkCreateMatches(
  gameweekId: number,
  matchData: Array<{
    team1Id: number;
    team2Id: number;
    kickoffTime: Date;
    venue?: string;
  }>
): Promise<{ success: boolean; message: string; createdCount?: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    let createdCount = 0;

    for (const match of matchData) {
      try {
        await db.insert(matches).values({
          gameweekId,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          kickoffTime: match.kickoffTime,
          venue: match.venue || "",
          status: "scheduled",
          team1Score: 0,
          team2Score: 0,
        });

        createdCount++;
      } catch (error) {
        console.warn(`Failed to create match:`, error);
      }
    }

    return {
      success: createdCount > 0,
      message: `تم إنشاء ${createdCount} مباراة من أصل ${matchData.length}`,
      createdCount,
    };
  } catch (error) {
    console.error("Failed to bulk create matches:", error);
    return { success: false, message: "فشل في إنشاء المباريات" };
  }
}

/**
 * Get match statistics
 */
export async function getMatchStats(matchId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const match = await getMatchById(matchId);

    if (!match) return null;

    return {
      matchId,
      team1Score: match.team1Score,
      team2Score: match.team2Score,
      status: match.status,
      duration: match.status === "completed" ? "90+" : "N/A",
      attendance: 0, // Can be updated later
    };
  } catch (error) {
    console.error("Failed to get match stats:", error);
    return null;
  }
}
