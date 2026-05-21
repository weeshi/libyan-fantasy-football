/**
 * Transfer Deadline System for Talba Fantasy Football
 * Manages transfer windows and deadlines per gameweek
 */

import { getDb } from "./db";
import { gameweeks, userTeams } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Transfer deadline status
 */
export interface TransferDeadlineStatus {
  isOpen: boolean;
  timeRemaining: number; // in milliseconds
  deadline: Date | null;
  message: string;
}

/**
 * Check if transfer window is open for a gameweek
 */
export async function isTransferWindowOpen(gameweekId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const gw = await db.select().from(gameweeks).where(eq(gameweeks.id, gameweekId)).limit(1);

    if (gw.length === 0) return false;

    const gameweek = gw[0];
    return gameweek.isTransferWindowOpen === 1;
  } catch (error) {
    console.error("Failed to check transfer window:", error);
    return false;
  }
}

/**
 * Get transfer deadline for a gameweek
 */
export async function getTransferDeadline(gameweekId: number): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const gw = await db.select().from(gameweeks).where(eq(gameweeks.id, gameweekId)).limit(1);

    if (gw.length === 0) return null;

    return gw[0].transferDeadline || null;
  } catch (error) {
    console.error("Failed to get transfer deadline:", error);
    return null;
  }
}

/**
 * Get transfer deadline status for a gameweek
 */
export async function getTransferDeadlineStatus(gameweekId: number): Promise<TransferDeadlineStatus> {
  const db = await getDb();
  if (!db) {
    return {
      isOpen: false,
      timeRemaining: 0,
      deadline: null,
      message: "قاعدة البيانات غير متاحة",
    };
  }

  try {
    const gw = await db.select().from(gameweeks).where(eq(gameweeks.id, gameweekId)).limit(1);

    if (gw.length === 0) {
      return {
        isOpen: false,
        timeRemaining: 0,
        deadline: null,
        message: "الأسبوع غير موجود",
      };
    }

    const gameweek = gw[0];
    const now = new Date();
    const deadline = gameweek.transferDeadline;

    if (!deadline) {
      return {
        isOpen: gameweek.isTransferWindowOpen === 1,
        timeRemaining: 0,
        deadline: null,
        message: "لم يتم تحديد موعد نهائي",
      };
    }

    const timeRemaining = deadline.getTime() - now.getTime();
    const isOpen = timeRemaining > 0 && gameweek.isTransferWindowOpen === 1;

    let message = "";
    if (isOpen) {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      message = `${hours} ساعة و ${minutes} دقيقة متبقية`;
    } else {
      message = "نافذة الانتقالات مغلقة";
    }

    return {
      isOpen,
      timeRemaining,
      deadline,
      message,
    };
  } catch (error) {
    console.error("Failed to get transfer deadline status:", error);
    return {
      isOpen: false,
      timeRemaining: 0,
      deadline: null,
      message: "حدث خطأ في التحقق من الموعد النهائي",
    };
  }
}

/**
 * Set transfer deadline for a gameweek
 */
export async function setTransferDeadline(gameweekId: number, deadline: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(gameweeks)
      .set({
        transferDeadline: deadline,
        isTransferWindowOpen: 1,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return true;
  } catch (error) {
    console.error("Failed to set transfer deadline:", error);
    return false;
  }
}

/**
 * Close transfer window for a gameweek
 */
export async function closeTransferWindow(gameweekId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(gameweeks)
      .set({
        isTransferWindowOpen: 0,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return true;
  } catch (error) {
    console.error("Failed to close transfer window:", error);
    return false;
  }
}

/**
 * Open transfer window for a gameweek
 */
export async function openTransferWindow(gameweekId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(gameweeks)
      .set({
        isTransferWindowOpen: 1,
        updatedAt: new Date(),
      })
      .where(eq(gameweeks.id, gameweekId));

    return true;
  } catch (error) {
    console.error("Failed to open transfer window:", error);
    return false;
  }
}

/**
 * Validate if a transfer is allowed
 */
export async function validateTransferAllowed(gameweekId: number): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getTransferDeadlineStatus(gameweekId);

  if (!status.isOpen) {
    return {
      allowed: false,
      reason: "نافذة الانتقالات مغلقة - " + status.message,
    };
  }

  return {
    allowed: true,
  };
}

/**
 * Get current gameweek
 */
export async function getCurrentGameweek(leagueId: number) {
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
 * Get next gameweek
 */
export async function getNextGameweek(leagueId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const gws = await db
      .select()
      .from(gameweeks)
      .where(and(eq(gameweeks.leagueId, leagueId), eq(gameweeks.status, "upcoming")))
      .limit(1);

    return gws.length > 0 ? gws[0] : null;
  } catch (error) {
    console.error("Failed to get next gameweek:", error);
    return null;
  }
}

/**
 * Calculate default transfer deadline (1 hour before gameweek start)
 */
export function calculateDefaultTransferDeadline(gameweekStartDate: Date): Date {
  const deadline = new Date(gameweekStartDate);
  deadline.setHours(deadline.getHours() - 1);
  return deadline;
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "الموعد النهائي انتهى";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`;
  } else if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  } else if (minutes > 0) {
    return `${minutes} دقيقة و ${seconds} ثانية`;
  } else {
    return `${seconds} ثانية`;
  }
}

/**
 * Get transfer statistics for a user team in a gameweek
 */
export interface TransferStats {
  transfersUsed: number;
  freeTransfersRemaining: number;
  hitPoints: number; // points deducted for additional transfers
}

/**
 * Calculate transfer hit points (4 points per additional transfer)
 */
export function calculateTransferHit(additionalTransfers: number): number {
  return Math.max(0, additionalTransfers - 1) * 4; // First transfer is free
}
