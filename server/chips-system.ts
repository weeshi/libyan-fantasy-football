/**
 * Chips System
 * Manages special power-ups for fantasy football teams
 * Supports: Triple Captain, Wildcard, Bench Boost, Free Hit
 */

import { getDb } from "./db";
import { userChips, userTeams, gameweeks } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

/**
 * Chip types
 */
export type ChipType = "TRIPLE_CAPTAIN" | "WILDCARD" | "BENCH_BOOST" | "FREE_HIT";

/**
 * Chip information
 */
export interface ChipInfo {
  type: ChipType;
  name: string;
  description: string;
  effect: string;
  usesPerSeason: number;
  isActive: boolean;
}

/**
 * User chip status
 */
export interface UserChipStatus {
  id: number;
  userId: number;
  chipType: ChipType;
  isUsed: boolean;
  usedInGameweek: number | null;
  usedAt: Date | null;
  createdAt: Date;
}

/**
 * Chip effects configuration
 */
export const CHIP_CONFIGS: Record<ChipType, ChipInfo> = {
  TRIPLE_CAPTAIN: {
    type: "TRIPLE_CAPTAIN",
    name: "الكابتن الثلاثي",
    description: "مضاعفة نقاط الكابتن 3 مرات",
    effect: "captain_points * 3",
    usesPerSeason: 1,
    isActive: true,
  },
  WILDCARD: {
    type: "WILDCARD",
    name: "البطاقة البرية",
    description: "تغيير الفريق بالكامل بدون عقوبة",
    effect: "unlimited_transfers",
    usesPerSeason: 2,
    isActive: true,
  },
  BENCH_BOOST: {
    type: "BENCH_BOOST",
    name: "تعزيز البدلاء",
    description: "استخدام جميع لاعبي البدلاء",
    effect: "include_bench_points",
    usesPerSeason: 1,
    isActive: true,
  },
  FREE_HIT: {
    type: "FREE_HIT",
    name: "الضربة الحرة",
    description: "تغيير مؤقت للفريق (يعود بعد الأسبوع)",
    effect: "temporary_transfers",
    usesPerSeason: 1,
    isActive: true,
  },
};

/**
 * Get all available chips for a user
 */
export async function getAvailableChips(userId: number): Promise<UserChipStatus[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const chips = await db
      .select()
      .from(userChips)
      .where(eq(userChips.userId, userId));

    return chips.map((chip) => ({
      id: chip.id,
      userId: chip.userId,
      chipType: chip.chipType as ChipType,
      isUsed: chip.isUsed === 1,
      usedInGameweek: chip.usedInGameweek,
      usedAt: chip.usedAt,
      createdAt: chip.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get available chips:", error);
    return [];
  }
}

/**
 * Get unused chips for a user
 */
export async function getUnusedChips(userId: number): Promise<UserChipStatus[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const chips = await db
      .select()
      .from(userChips)
      .where(and(eq(userChips.userId, userId), eq(userChips.isUsed, 0)));

    return chips.map((chip) => ({
      id: chip.id,
      userId: chip.userId,
      chipType: chip.chipType as ChipType,
      isUsed: chip.isUsed === 1,
      usedInGameweek: chip.usedInGameweek,
      usedAt: chip.usedAt,
      createdAt: chip.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get unused chips:", error);
    return [];
  }
}

/**
 * Check if a chip is available for use
 */
export async function isChipAvailable(
  userId: number,
  chipType: ChipType
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const chip = await db
      .select()
      .from(userChips)
      .where(
        and(
          eq(userChips.userId, userId),
          eq(userChips.chipType, chipType),
          eq(userChips.isUsed, 0)
        )
      )
      .limit(1);

    return chip.length > 0;
  } catch (error) {
    console.error("Failed to check chip availability:", error);
    return false;
  }
}

/**
 * Use a chip
 */
export async function useChip(
  userId: number,
  chipType: ChipType,
  gameweekId: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Check if chip is available
    const available = await isChipAvailable(userId, chipType);
    if (!available) {
      return { success: false, message: "الرقاقة غير متاحة" };
    }

    // Get gameweek number
    const gw = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.id, gameweekId))
      .limit(1);

    if (!gw[0]) {
      return { success: false, message: "الأسبوع غير موجود" };
    }

    // Update chip as used
    await db
      .update(userChips)
      .set({
        isUsed: 1,
        usedInGameweek: gw[0].gameweekNumber,
        usedAt: new Date(),
      })
      .where(
        and(
          eq(userChips.userId, userId),
          eq(userChips.chipType, chipType),
          eq(userChips.isUsed, 0)
        )
      );

    // Update active chip in user team
    await db
      .update(userTeams)
      .set({
        activeChip: chipType,
        updatedAt: new Date(),
      })
      .where(eq(userTeams.userId, userId));

    return {
      success: true,
      message: `تم تفعيل رقاقة ${CHIP_CONFIGS[chipType].name} بنجاح`,
    };
  } catch (error) {
    console.error("Failed to use chip:", error);
    return { success: false, message: "فشل في استخدام الرقاقة" };
  }
}

/**
 * Reset chips for a new season
 */
export async function resetChipsForSeason(userId: number): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Delete old chips
    await db.delete(userChips).where(eq(userChips.userId, userId));

    // Create new chips for the season
    const newChips = Object.values(CHIP_CONFIGS).map((config) => ({
      userId,
      chipType: config.type,
      isUsed: 0,
      usedInGameweek: null,
      usedAt: null,
      createdAt: new Date(),
    }));

    // Insert new chips
    for (const chip of newChips) {
      await db.insert(userChips).values(chip);
    }

    // Reset active chip in user teams
    await db
      .update(userTeams)
      .set({
        activeChip: null,
        updatedAt: new Date(),
      })
      .where(eq(userTeams.userId, userId));

    return {
      success: true,
      message: "تم إعادة تعيين الرقائق للموسم الجديد",
    };
  } catch (error) {
    console.error("Failed to reset chips:", error);
    return { success: false, message: "فشل في إعادة تعيين الرقائق" };
  }
}

/**
 * Get chip effect on points
 */
export function getChipPointsMultiplier(
  chipType: ChipType | null,
  playerRole: "captain" | "regular" | "bench"
): number {
  if (!chipType) return 1;

  switch (chipType) {
    case "TRIPLE_CAPTAIN":
      // Only affects captain
      return playerRole === "captain" ? 3 : 1;

    case "BENCH_BOOST":
      // All players count (including bench)
      return 1; // Multiplier is 1, but bench players are included

    case "FREE_HIT":
    case "WILDCARD":
      // No direct multiplier, affects transfers
      return 1;

    default:
      return 1;
  }
}

/**
 * Calculate points with chip effect
 */
export function calculatePointsWithChip(
  basePoints: number,
  chipType: ChipType | null,
  playerRole: "captain" | "regular" | "bench"
): number {
  const multiplier = getChipPointsMultiplier(chipType, playerRole);
  return Math.round(basePoints * multiplier);
}

/**
 * Validate chip usage
 */
export async function validateChipUsage(
  userId: number,
  chipType: ChipType,
  gameweekId: number
): Promise<{ valid: boolean; reason: string }> {
  // Check if chip is available
  const available = await isChipAvailable(userId, chipType);
  if (!available) {
    return { valid: false, reason: "الرقاقة غير متاحة أو تم استخدامها مسبقاً" };
  }

  // Check if gameweek exists
  const db = await getDb();
  if (!db) {
    return { valid: false, reason: "قاعدة البيانات غير متاحة" };
  }

  try {
    const gw = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.id, gameweekId))
      .limit(1);

    if (!gw[0]) {
      return { valid: false, reason: "الأسبوع غير موجود" };
    }

    // Check if gameweek is active
    if (gw[0].status !== "active") {
      return { valid: false, reason: "الأسبوع غير نشط" };
    }

    return { valid: true, reason: "الرقاقة صالحة للاستخدام" };
  } catch (error) {
    console.error("Failed to validate chip usage:", error);
    return { valid: false, reason: "خطأ في التحقق من صحة الرقاقة" };
  }
}

/**
 * Get chip info
 */
export function getChipInfo(chipType: ChipType): ChipInfo {
  return CHIP_CONFIGS[chipType];
}

/**
 * Get all chip info
 */
export function getAllChipInfo(): ChipInfo[] {
  return Object.values(CHIP_CONFIGS);
}

/**
 * Check if chip can be used multiple times
 */
export function canChipBeUsedMultipleTimes(chipType: ChipType): boolean {
  return CHIP_CONFIGS[chipType].usesPerSeason > 1;
}

/**
 * Get remaining uses for a chip
 */
export async function getRemainingChipUses(
  userId: number,
  chipType: ChipType
): Promise<number> {
  const chips = await getAvailableChips(userId);
  const chipCount = chips.filter((c) => c.chipType === chipType).length;
  return chipCount;
}

/**
 * Deactivate current chip
 */
export async function deactivateChip(userId: number): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(userTeams)
      .set({
        activeChip: null,
        updatedAt: new Date(),
      })
      .where(eq(userTeams.userId, userId));

    return {
      success: true,
      message: "تم إلغاء تفعيل الرقاقة",
    };
  } catch (error) {
    console.error("Failed to deactivate chip:", error);
    return { success: false, message: "فشل في إلغاء تفعيل الرقاقة" };
  }
}

/**
 * Get active chip for user
 */
export async function getActiveChip(userId: number): Promise<ChipType | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const team = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.userId, userId))
      .limit(1);

    if (!team[0]) return null;

    return team[0].activeChip as ChipType | null;
  } catch (error) {
    console.error("Failed to get active chip:", error);
    return null;
  }
}

/**
 * Get chip usage history
 */
export async function getChipUsageHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const chips = await db
      .select()
      .from(userChips)
      .where(and(eq(userChips.userId, userId), eq(userChips.isUsed, 1)))
      .orderBy(userChips.usedAt);

    return chips.map((chip) => ({
      chipType: chip.chipType as ChipType,
      usedInGameweek: chip.usedInGameweek,
      usedAt: chip.usedAt,
      chipInfo: CHIP_CONFIGS[chip.chipType as ChipType],
    }));
  } catch (error) {
    console.error("Failed to get chip usage history:", error);
    return [];
  }
}

/**
 * Initialize chips for new user
 */
export async function initializeChipsForUser(userId: number): Promise<{
  success: boolean;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Create chips for the user
    const newChips = Object.values(CHIP_CONFIGS).map((config) => ({
      userId,
      chipType: config.type,
      isUsed: 0,
      usedInGameweek: null,
      usedAt: null,
      createdAt: new Date(),
    }));

    for (const chip of newChips) {
      await db.insert(userChips).values(chip);
    }

    return {
      success: true,
      message: "تم تهيئة الرقائق للمستخدم الجديد",
    };
  } catch (error) {
    console.error("Failed to initialize chips:", error);
    return { success: false, message: "فشل في تهيئة الرقائق" };
  }
}
