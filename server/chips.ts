/**
 * Chips System for Talba Fantasy Football
 * Implements special powers like Captain, Triple Captain, Wildcard, etc.
 */

import { getDb } from "./db";
import { userChips, userTeams } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type ChipType = "captain" | "triple_captain" | "wildcard" | "bench_boost" | "free_hit";

export interface ChipInfo {
  id: number;
  chipType: ChipType;
  isUsed: boolean;
  usedInGameweek: number | null;
  description: string;
  maxUsesPerSeason: number;
}

/**
 * Chip definitions with metadata
 */
export const CHIP_DEFINITIONS: Record<ChipType, ChipInfo> = {
  captain: {
    id: 1,
    chipType: "captain",
    isUsed: false,
    usedInGameweek: null,
    description: "مضاعفة نقاط الكابتن (2x) - متاح كل أسبوع",
    maxUsesPerSeason: 38,
  },
  triple_captain: {
    id: 2,
    chipType: "triple_captain",
    isUsed: false,
    usedInGameweek: null,
    description: "مضاعفة نقاط الكابتن (3x) - متاح مرة واحدة في الموسم",
    maxUsesPerSeason: 1,
  },
  wildcard: {
    id: 3,
    chipType: "wildcard",
    isUsed: false,
    usedInGameweek: null,
    description: "تغيير الفريق بالكامل بدون عقوبة - متاح مرتين في الموسم",
    maxUsesPerSeason: 2,
  },
  bench_boost: {
    id: 4,
    chipType: "bench_boost",
    isUsed: false,
    usedInGameweek: null,
    description: "استخدام جميع لاعبي البدلاء - متاح مرة واحدة في الموسم",
    maxUsesPerSeason: 1,
  },
  free_hit: {
    id: 5,
    chipType: "free_hit",
    isUsed: false,
    usedInGameweek: null,
    description: "تغيير الفريق مؤقتاً لأسبوع واحد - متاح مرة واحدة في الموسم",
    maxUsesPerSeason: 1,
  },
};

/**
 * Initialize chips for a new user team
 */
export async function initializeChipsForTeam(userTeamId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const existing = await db
      .select()
      .from(userChips)
      .where(eq(userChips.userTeamId, userTeamId))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Chips already initialized for team ${userTeamId}`);
      return true;
    }

    const chipTypes: ChipType[] = ["captain", "triple_captain", "wildcard", "bench_boost", "free_hit"];

    for (const chipType of chipTypes) {
      await db.insert(userChips).values({
        userTeamId,
        chipType,
        isUsed: 0,
        usedInGameweek: null,
      });
    }

    console.log(`Chips initialized for team ${userTeamId}`);
    return true;
  } catch (error) {
    console.error("Failed to initialize chips:", error);
    return false;
  }
}

/**
 * Get available chips for a user team
 */
export async function getAvailableChips(userTeamId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const chips = await db
      .select()
      .from(userChips)
      .where(and(eq(userChips.userTeamId, userTeamId), eq(userChips.isUsed, 0)));

    return chips.map((chip) => ({
      ...chip,
      isUsed: chip.isUsed === 1,
      description: CHIP_DEFINITIONS[chip.chipType].description,
    }));
  } catch (error) {
    console.error("Failed to get available chips:", error);
    return [];
  }
}

/**
 * Apply chip multiplier to points
 */
export function applyChipMultiplier(basePoints: number, chipType: ChipType): number {
  switch (chipType) {
    case "captain":
      return basePoints * 2;
    case "triple_captain":
      return basePoints * 3;
    case "bench_boost":
      return basePoints;
    case "wildcard":
      return basePoints;
    case "free_hit":
      return basePoints;
    default:
      return basePoints;
  }
}

/**
 * Use a chip for a user team
 */
export async function useChip(
  userTeamId: number,
  chipType: ChipType,
  gameweekId: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    const chip = await db
      .select()
      .from(userChips)
      .where(
        and(
          eq(userChips.userTeamId, userTeamId),
          eq(userChips.chipType, chipType),
          eq(userChips.isUsed, 0)
        )
      )
      .limit(1);

    if (chip.length === 0) {
      return { success: false, message: "الرقاقة غير متاحة أو تم استخدامها بالفعل" };
    }

    await db
      .update(userChips)
      .set({
        isUsed: 1,
        usedInGameweek: gameweekId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userChips.userTeamId, userTeamId),
          eq(userChips.chipType, chipType)
        )
      );

    await db
      .update(userTeams)
      .set({
        activeChip: chipType,
        updatedAt: new Date(),
      })
      .where(eq(userTeams.id, userTeamId));

    return { success: true, message: `تم تفعيل الرقاقة: ${CHIP_DEFINITIONS[chipType].description}` };
  } catch (error) {
    console.error("Failed to use chip:", error);
    return { success: false, message: "فشل في تفعيل الرقاقة" };
  }
}

/**
 * Get active chip for a user team
 */
export async function getActiveChip(userTeamId: number): Promise<ChipType | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const team = await db.select().from(userTeams).where(eq(userTeams.id, userTeamId)).limit(1);

    if (team.length === 0) return null;

    const activeChip = team[0].activeChip;
    return activeChip as ChipType | null;
  } catch (error) {
    console.error("Failed to get active chip:", error);
    return null;
  }
}

/**
 * Clear active chip
 */
export async function clearActiveChip(userTeamId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(userTeams)
      .set({
        activeChip: null,
        updatedAt: new Date(),
      })
      .where(eq(userTeams.id, userTeamId));

    return true;
  } catch (error) {
    console.error("Failed to clear active chip:", error);
    return false;
  }
}

/**
 * Validate chip usage
 */
export async function validateChipUsage(
  userTeamId: number,
  chipType: ChipType
): Promise<{ valid: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) {
    return { valid: false, reason: "قاعدة البيانات غير متاحة" };
  }

  try {
    const chip = await db
      .select()
      .from(userChips)
      .where(
        and(
          eq(userChips.userTeamId, userTeamId),
          eq(userChips.chipType, chipType),
          eq(userChips.isUsed, 0)
        )
      )
      .limit(1);

    if (chip.length === 0) {
      return { valid: false, reason: "الرقاقة غير متاحة أو تم استخدامها بالفعل" };
    }

    return { valid: true };
  } catch (error) {
    console.error("Failed to validate chip usage:", error);
    return { valid: false, reason: "حدث خطأ في التحقق" };
  }
}

/**
 * Reset chips for new season
 */
export async function resetChipsForSeason(userTeamId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(userChips).where(eq(userChips.userTeamId, userTeamId));
    return await initializeChipsForTeam(userTeamId);
  } catch (error) {
    console.error("Failed to reset chips:", error);
    return false;
  }
}
