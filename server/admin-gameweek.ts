/**
 * Admin Gameweek Management System
 * Handles creation, update, and management of gameweeks
 */

import { getDb } from "./db";
import { gameweeks, leagues } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { calculateDefaultTransferDeadline } from "./transfers";

/**
 * Create a new gameweek
 */
export async function createGameweek(
  leagueId: number,
  gameweekNumber: number,
  startDate: Date,
  endDate: Date,
  transferDeadline?: Date
): Promise<{ success: boolean; gameweekId?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Check if gameweek already exists
    const existing = await db
      .select()
      .from(gameweeks)
      .where(
        and(
          eq(gameweeks.leagueId, leagueId),
          eq(gameweeks.gameweekNumber, gameweekNumber)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: false, message: `الأسبوع ${gameweekNumber} موجود بالفعل` };
    }

    // Calculate transfer deadline if not provided
    const deadline = transferDeadline || calculateDefaultTransferDeadline(startDate);

    const result = await db.insert(gameweeks).values({
      leagueId,
      gameweekNumber,
      startDate,
      endDate,
      transferDeadline: deadline,
      isTransferWindowOpen: 1,
      status: "upcoming",
    });

    return {
      success: true,
      gameweekId: (result as any).insertId,
      message: `تم إنشاء الأسبوع ${gameweekNumber} بنجاح`,
    };
  } catch (error) {
    console.error("Failed to create gameweek:", error);
    return { success: false, message: "فشل في إنشاء الأسبوع" };
  }
}

/**
 * Update gameweek status
 */
export async function updateGameweekStatus(
  gameweekId: number,
  status: "upcoming" | "active" | "completed"
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(gameweeks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    const statusText =
      status === "upcoming"
        ? "قادم"
        : status === "active"
          ? "جاري"
          : "انتهى";

    return { success: true, message: `تم تحديث حالة الأسبوع إلى: ${statusText}` };
  } catch (error) {
    console.error("Failed to update gameweek status:", error);
    return { success: false, message: "فشل في تحديث حالة الأسبوع" };
  }
}

/**
 * Update transfer deadline
 */
export async function updateTransferDeadline(
  gameweekId: number,
  deadline: Date
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(gameweeks)
      .set({
        transferDeadline: deadline,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return { success: true, message: "تم تحديث الموعد النهائي بنجاح" };
  } catch (error) {
    console.error("Failed to update transfer deadline:", error);
    return { success: false, message: "فشل في تحديث الموعد النهائي" };
  }
}

/**
 * Close transfer window for gameweek
 */
export async function closeTransferWindowForGameweek(gameweekId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(gameweeks)
      .set({
        isTransferWindowOpen: 0,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return { success: true, message: "تم إغلاق نافذة الانتقالات بنجاح" };
  } catch (error) {
    console.error("Failed to close transfer window:", error);
    return { success: false, message: "فشل في إغلاق نافذة الانتقالات" };
  }
}

/**
 * Get all gameweeks for a league
 */
export async function getLeagueGameweeks(leagueId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const gws = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.leagueId, leagueId))
      .orderBy(gameweeks.gameweekNumber);

    return gws;
  } catch (error) {
    console.error("Failed to get league gameweeks:", error);
    return [];
  }
}

/**
 * Get current gameweek for league
 */
export async function getCurrentGameweekForLeague(leagueId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const gws = await db
      .select()
      .from(gameweeks)
      .where(and(eq(gameweeks.leagueId, leagueId), eq(gameweeks.status, "active")))
      .limit(1);

    return gws.length > 0 ? gws[0] : null;
  } catch (error) {
    console.error("Failed to get current gameweek:", error);
    return null;
  }
}

/**
 * Get gameweek by ID
 */
export async function getGameweekById(gameweekId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const gws = await db.select().from(gameweeks).where(eq(gameweeks.id, gameweekId)).limit(1);

    return gws.length > 0 ? gws[0] : null;
  } catch (error) {
    console.error("Failed to get gameweek:", error);
    return null;
  }
}

/**
 * Delete gameweek (only if no matches exist)
 */
export async function deleteGameweek(gameweekId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Check if gameweek has matches
    const matches = await db.execute(`SELECT COUNT(*) as count FROM matches WHERE gameweekId = ${gameweekId}`);

    if (matches[0]?.count > 0) {
      return { success: false, message: "لا يمكن حذف أسبوع يحتوي على مباريات" };
    }

    await db.delete(gameweeks).where(eq(gameweeks.id, gameweekId));

    return { success: true, message: "تم حذف الأسبوع بنجاح" };
  } catch (error) {
    console.error("Failed to delete gameweek:", error);
    return { success: false, message: "فشل في حذف الأسبوع" };
  }
}

/**
 * Get gameweek statistics
 */
export async function getGameweekStats(gameweekId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db.execute(`
      SELECT
        COUNT(*) as totalMatches,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedMatches,
        SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as liveMatches,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduledMatches
      FROM matches
      WHERE gameweekId = ${gameweekId}
    `);

    return stats[0] || null;
  } catch (error) {
    console.error("Failed to get gameweek stats:", error);
    return null;
  }
}

/**
 * Bulk create gameweeks for a season
 */
export async function createSeasonGameweeks(
  leagueId: number,
  startDate: Date,
  numberOfGameweeks: number = 38
): Promise<{ success: boolean; message: string; createdCount?: number }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    let createdCount = 0;
    const weekDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    for (let i = 1; i <= numberOfGameweeks; i++) {
      const gwStart = new Date(startDate.getTime() + (i - 1) * weekDuration);
      const gwEnd = new Date(gwStart.getTime() + weekDuration - 1);
      const deadline = calculateDefaultTransferDeadline(gwStart);

      try {
        await db.insert(gameweeks).values({
          leagueId,
          gameweekNumber: i,
          startDate: gwStart,
          endDate: gwEnd,
          transferDeadline: deadline,
          isTransferWindowOpen: 1,
          status: "upcoming",
        });

        createdCount++;
      } catch (error) {
        console.warn(`Failed to create gameweek ${i}:`, error);
      }
    }

    return {
      success: createdCount > 0,
      message: `تم إنشاء ${createdCount} أسبوع من أصل ${numberOfGameweeks}`,
      createdCount,
    };
  } catch (error) {
    console.error("Failed to create season gameweeks:", error);
    return { success: false, message: "فشل في إنشاء أسابيع الموسم" };
  }
}
