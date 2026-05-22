/**
 * Transfer Deadline System
 * Manages transfer windows and deadlines for each gameweek
 */

import { getDb } from "./db";
import { gameweeks, transactions } from "../drizzle/schema";
import { eq, and, lt, gte } from "drizzle-orm";

/**
 * Transfer deadline status
 */
export interface TransferDeadlineStatus {
  isOpen: boolean;
  timeRemaining: number; // in milliseconds
  timeRemainingFormatted: string;
  deadline: Date;
  currentTime: Date;
  message: string;
  canTransfer: boolean;
}

/**
 * Get current gameweek
 */
export async function getCurrentGameweek(leagueId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const currentGw = await db
      .select()
      .from(gameweeks)
      .where(
        and(
          eq(gameweeks.leagueId, leagueId),
          eq(gameweeks.status, "active")
        )
      )
      .limit(1);

    return currentGw[0] || null;
  } catch (error) {
    console.error("Failed to get current gameweek:", error);
    return null;
  }
}

/**
 * Check if transfer window is open
 */
export async function isTransferWindowOpen(gameweekId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const gw = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.id, gameweekId))
      .limit(1);

    if (!gw[0]) return false;

    const gameweek = gw[0];
    const now = new Date();

    // Check if transfer window is open
    if (gameweek.isTransferWindowOpen === 0) return false;

    // Check if deadline has passed
    if (gameweek.transferDeadline && now > gameweek.transferDeadline) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to check transfer window:", error);
    return false;
  }
}

/**
 * Get transfer deadline status
 */
export async function getTransferDeadlineStatus(
  gameweekId: number
): Promise<TransferDeadlineStatus> {
  const db = await getDb();
  const now = new Date();

  if (!db) {
    return {
      isOpen: false,
      timeRemaining: 0,
      timeRemainingFormatted: "غير متاح",
      deadline: now,
      currentTime: now,
      message: "قاعدة البيانات غير متاحة",
      canTransfer: false,
    };
  }

  try {
    const gw = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.id, gameweekId))
      .limit(1);

    if (!gw[0]) {
      return {
        isOpen: false,
        timeRemaining: 0,
        timeRemainingFormatted: "الأسبوع غير موجود",
        deadline: now,
        currentTime: now,
        message: "الأسبوع غير موجود",
        canTransfer: false,
      };
    }

    const gameweek = gw[0];

    // Check if transfer window is closed
    if (gameweek.isTransferWindowOpen === 0) {
      return {
        isOpen: false,
        timeRemaining: 0,
        timeRemainingFormatted: "مغلق",
        deadline: gameweek.transferDeadline || now,
        currentTime: now,
        message: "نافذة الانتقالات مغلقة لهذا الأسبوع",
        canTransfer: false,
      };
    }

    // Check if deadline exists
    if (!gameweek.transferDeadline) {
      return {
        isOpen: true,
        timeRemaining: Infinity,
        timeRemainingFormatted: "بدون حد",
        deadline: now,
        currentTime: now,
        message: "لا يوجد موعد نهائي محدد",
        canTransfer: true,
      };
    }

    const deadline = new Date(gameweek.transferDeadline);
    const timeRemaining = deadline.getTime() - now.getTime();

    // Check if deadline has passed
    if (timeRemaining <= 0) {
      return {
        isOpen: false,
        timeRemaining: 0,
        timeRemainingFormatted: "انتهى",
        deadline,
        currentTime: now,
        message: "انتهت نافذة الانتقالات",
        canTransfer: false,
      };
    }

    // Format remaining time
    const formatted = formatTimeRemaining(timeRemaining);

    return {
      isOpen: true,
      timeRemaining,
      timeRemainingFormatted: formatted,
      deadline,
      currentTime: now,
      message: `الوقت المتبقي: ${formatted}`,
      canTransfer: true,
    };
  } catch (error) {
    console.error("Failed to get transfer deadline status:", error);
    return {
      isOpen: false,
      timeRemaining: 0,
      timeRemainingFormatted: "خطأ",
      deadline: now,
      currentTime: now,
      message: "حدث خطأ في الحصول على حالة الموعد النهائي",
      canTransfer: false,
    };
  }
}

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "انتهى";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} يوم و ${hours % 24} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة و ${minutes % 60} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة`;
  } else {
    return `${seconds} ثانية`;
  }
}

/**
 * Check if transfer can be made
 */
export async function canMakeTransfer(gameweekId: number): Promise<{
  allowed: boolean;
  reason: string;
}> {
  const status = await getTransferDeadlineStatus(gameweekId);

  if (!status.canTransfer) {
    return {
      allowed: false,
      reason: status.message,
    };
  }

  return {
    allowed: true,
    reason: "يمكن إجراء الانتقالات",
  };
}

/**
 * Get time remaining until deadline
 */
export async function getTimeUntilDeadline(gameweekId: number): Promise<{
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}> {
  const status = await getTransferDeadlineStatus(gameweekId);

  if (!status.canTransfer || status.timeRemaining <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    };
  }

  const totalSeconds = Math.floor(status.timeRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    total: totalSeconds,
  };
}

/**
 * Set transfer deadline for a gameweek
 */
export async function setTransferDeadline(
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

    return {
      success: true,
      message: "تم تعيين الموعد النهائي بنجاح",
    };
  } catch (error) {
    console.error("Failed to set transfer deadline:", error);
    return {
      success: false,
      message: "فشل في تعيين الموعد النهائي",
    };
  }
}

/**
 * Open transfer window
 */
export async function openTransferWindow(gameweekId: number): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(gameweeks)
      .set({
        isTransferWindowOpen: 1,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return {
      success: true,
      message: "تم فتح نافذة الانتقالات",
    };
  } catch (error) {
    console.error("Failed to open transfer window:", error);
    return {
      success: false,
      message: "فشل في فتح نافذة الانتقالات",
    };
  }
}

/**
 * Close transfer window
 */
export async function closeTransferWindow(gameweekId: number): Promise<{
  success: boolean;
  message: string;
}> {
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

    return {
      success: true,
      message: "تم إغلاق نافذة الانتقالات",
    };
  } catch (error) {
    console.error("Failed to close transfer window:", error);
    return {
      success: false,
      message: "فشل في إغلاق نافذة الانتقالات",
    };
  }
}

/**
 * Get all gameweeks with transfer status
 */
export async function getGameweeksWithTransferStatus(leagueId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const gws = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.leagueId, leagueId))
      .orderBy(gameweeks.gameweekNumber);

    const withStatus = await Promise.all(
      gws.map(async (gw) => ({
        ...gw,
        transferStatus: await getTransferDeadlineStatus(gw.id),
      }))
    );

    return withStatus;
  } catch (error) {
    console.error("Failed to get gameweeks with transfer status:", error);
    return [];
  }
}

/**
 * Get transfer history for a gameweek
 */
export async function getTransferHistory(
  userTeamId: number,
  gameweekId: number
) {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get gameweek info to filter transactions
    const gw = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.id, gameweekId))
      .limit(1);

    if (!gw[0]) return [];

    const gameweek = gw[0];
    const startDate = new Date(gameweek.startDate);
    const endDate = new Date(gameweek.endDate);

    // Get transactions within gameweek period
    const txns = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userTeamId, userTeamId),
          gte(transactions.createdAt, startDate),
          lt(transactions.createdAt, endDate)
        )
      )
      .orderBy(transactions.createdAt);

    return txns;
  } catch (error) {
    console.error("Failed to get transfer history:", error);
    return [];
  }
}

/**
 * Check if deadline is approaching (for notifications)
 */
export async function isDeadlineApproaching(
  gameweekId: number,
  minutesThreshold: number = 60
): Promise<boolean> {
  const status = await getTransferDeadlineStatus(gameweekId);

  if (!status.canTransfer) return false;

  const minutesRemaining = Math.floor(status.timeRemaining / (1000 * 60));
  return minutesRemaining <= minutesThreshold && minutesRemaining > 0;
}

/**
 * Get deadline approaching notifications
 */
export async function getDeadlineApproachingNotifications(leagueId: number) {
  const gameweeks_list = await getGameweeksWithTransferStatus(leagueId);
  const notifications = [];

  for (const gw of gameweeks_list) {
    // Check 1 hour before
    if (
      gw.transferStatus.timeRemaining > 0 &&
      gw.transferStatus.timeRemaining <= 60 * 60 * 1000
    ) {
      notifications.push({
        type: "deadline_1hour",
        gameweekId: gw.id,
        message: `نافذة الانتقالات ستغلق خلال ساعة واحدة`,
        severity: "warning",
      });
    }

    // Check 15 minutes before
    if (
      gw.transferStatus.timeRemaining > 0 &&
      gw.transferStatus.timeRemaining <= 15 * 60 * 1000
    ) {
      notifications.push({
        type: "deadline_15min",
        gameweekId: gw.id,
        message: `نافذة الانتقالات ستغلق خلال 15 دقيقة فقط`,
        severity: "critical",
      });
    }

    // Check if just closed
    if (
      gw.transferStatus.timeRemaining === 0 &&
      gw.transferStatus.isOpen === false
    ) {
      notifications.push({
        type: "deadline_closed",
        gameweekId: gw.id,
        message: `نافذة الانتقالات مغلقة الآن`,
        severity: "info",
      });
    }
  }

  return notifications;
}
