/**
 * Enhanced Cup Competition System
 * Implements all Phase 5 requirements with improved procedures
 */

import { getDb } from "./db";
import { cupTournaments, cupRounds, cupMatches, cupStandings, userTeams } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type CupType = "single_elimination" | "double_elimination";
export type CupStatus = "draw" | "in_progress" | "completed" | "cancelled";
export type CupMatchStatus = "pending" | "completed" | "walkover";

/**
 * 5.2.1 Create a new cup tournament
 */
export async function createCup(
  leagueId: number | null,
  name: string,
  description: string,
  cupType: CupType,
  teamIds: number[],
  startGameweek?: number
): Promise<{ success: boolean; cupId?: number; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "قاعدة البيانات غير متاحة" };

  try {
    if (teamIds.length < 2) {
      return { success: false, message: "يجب أن يكون هناك فريقان على الأقل" };
    }

    const totalRounds = Math.ceil(Math.log2(teamIds.length));

    const result = await db.insert(cupTournaments).values({
      leagueId,
      name,
      description,
      cupType,
      status: "draw",
      startGameweek,
      totalTeams: teamIds.length,
      currentRound: 1,
      totalRounds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cupId = result[0].insertId as number;

    // Initialize standings for all teams
    for (const teamId of teamIds) {
      await db.insert(cupStandings).values({
        cupId,
        teamId,
        position: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return { success: true, cupId, message: "تم إنشاء الكأس بنجاح" };
  } catch (error) {
    console.error("Error creating cup:", error);
    return { success: false, message: "خطأ في إنشاء الكأس" };
  }
}

/**
 * 5.3.1 Perform random draw for cup matches
 */
export async function performDraw(
  cupId: number,
  gameweekId?: number
): Promise<{ success: boolean; matchCount?: number; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "قاعدة البيانات غير متاحة" };

  try {
    // Get cup info
    const cup = await db.query.cupTournaments.findFirst({
      where: eq(cupTournaments.id, cupId),
    });

    if (!cup) return { success: false, message: "الكأس غير موجودة" };
    if (cup.status !== "draw") return { success: false, message: "القرعة تمت بالفعل" };

    // Get active teams
    const standings = await db.query.cupStandings.findMany({
      where: and(eq(cupStandings.cupId, cupId), eq(cupStandings.status, "active")),
    });

    const teamIds = standings.map((s) => s.teamId);

    // Shuffle teams randomly
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);

    // Create first round
    const round = await db.insert(cupRounds).values({
      cupId,
      roundNumber: 1,
      gameweekId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const roundId = round[0].insertId as number;

    // Generate matches
    let matchCount = 0;
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        await db.insert(cupMatches).values({
          cupId,
          roundId,
          round: 1,
          team1Id: shuffled[i],
          team2Id: shuffled[i + 1],
          team1Points: 0,
          team2Points: 0,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        matchCount++;
      } else {
        // Bye round - team advances automatically
        await db.insert(cupMatches).values({
          cupId,
          roundId,
          round: 1,
          team1Id: shuffled[i],
          team2Id: shuffled[i],
          winner: shuffled[i],
          status: "walkover",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        matchCount++;
      }
    }

    // Update cup status
    await db
      .update(cupTournaments)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(cupTournaments.id, cupId));

    return { success: true, matchCount, message: "تمت القرعة بنجاح" };
  } catch (error) {
    console.error("Error performing draw:", error);
    return { success: false, message: "خطأ في إجراء القرعة" };
  }
}

/**
 * 5.2.2 Generate next round matches
 */
export async function generateRound(
  cupId: number,
  gameweekId?: number
): Promise<{ success: boolean; matchCount?: number; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "قاعدة البيانات غير متاحة" };

  try {
    const cup = await db.query.cupTournaments.findFirst({
      where: eq(cupTournaments.id, cupId),
    });

    if (!cup) return { success: false, message: "الكأس غير موجودة" };
    if (cup.currentRound >= cup.totalRounds) {
      return { success: false, message: "انتهت البطولة بالفعل" };
    }

    const nextRound = cup.currentRound + 1;

    // Get winners from current round
    const winners = await db.query.cupMatches.findMany({
      where: and(eq(cupMatches.cupId, cupId), eq(cupMatches.round, cup.currentRound)),
    });

    const winnerIds = winners
      .map((m) => m.winner)
      .filter((w) => w !== null && w !== undefined) as number[];

    if (winnerIds.length < 2) {
      return { success: false, message: "لا توجد فائزون كافيون" };
    }

    // Create next round
    const round = await db.insert(cupRounds).values({
      cupId,
      roundNumber: nextRound,
      gameweekId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const roundId = round[0].insertId as number;

    // Shuffle winners
    const shuffled = [...winnerIds].sort(() => Math.random() - 0.5);

    // Generate matches
    let matchCount = 0;
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        await db.insert(cupMatches).values({
          cupId,
          roundId,
          round: nextRound,
          team1Id: shuffled[i],
          team2Id: shuffled[i + 1],
          team1Points: 0,
          team2Points: 0,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        matchCount++;
      } else {
        // Bye round
        await db.insert(cupMatches).values({
          cupId,
          roundId,
          round: nextRound,
          team1Id: shuffled[i],
          team2Id: shuffled[i],
          winner: shuffled[i],
          status: "walkover",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        matchCount++;
      }
    }

    // Update cup
    await db
      .update(cupTournaments)
      .set({ currentRound: nextRound, updatedAt: new Date() })
      .where(eq(cupTournaments.id, cupId));

    return { success: true, matchCount, message: "تم توليد الجولة بنجاح" };
  } catch (error) {
    console.error("Error generating round:", error);
    return { success: false, message: "خطأ في توليد الجولة" };
  }
}

/**
 * 5.2.3 Calculate match results
 */
export async function calculateResults(
  cupId: number,
  roundNumber: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "قاعدة البيانات غير متاحة" };

  try {
    const matches = await db.query.cupMatches.findMany({
      where: and(eq(cupMatches.cupId, cupId), eq(cupMatches.round, roundNumber)),
    });

    for (const match of matches) {
      if (match.status === "pending") {
        // Determine winner
        const winner =
          match.team1Points > match.team2Points
            ? match.team1Id
            : match.team2Points > match.team1Points
              ? match.team2Id
              : null;

        // Update match
        await db
          .update(cupMatches)
          .set({ winner, status: "completed", updatedAt: new Date() })
          .where(eq(cupMatches.id, match.id));

        // Update standings
        if (winner) {
          const loser = winner === match.team1Id ? match.team2Id : match.team1Id;

          const winnerStanding = await db.query.cupStandings.findFirst({
            where: and(eq(cupStandings.cupId, cupId), eq(cupStandings.teamId, winner)),
          });

          const loserStanding = await db.query.cupStandings.findFirst({
            where: and(eq(cupStandings.cupId, cupId), eq(cupStandings.teamId, loser)),
          });

          if (winnerStanding) {
            await db
              .update(cupStandings)
              .set({
                wins: (winnerStanding.wins || 0) + 1,
                pointsFor: (winnerStanding.pointsFor || 0) + (match.team1Points > match.team2Points ? match.team1Points : match.team2Points),
                pointsAgainst: (winnerStanding.pointsAgainst || 0) + (match.team1Points > match.team2Points ? match.team2Points : match.team1Points),
                updatedAt: new Date(),
              })
              .where(eq(cupStandings.id, winnerStanding.id));
          }

          if (loserStanding) {
            await db
              .update(cupStandings)
              .set({
                losses: (loserStanding.losses || 0) + 1,
                status: "eliminated",
                pointsFor: (loserStanding.pointsFor || 0) + (match.team1Points < match.team2Points ? match.team1Points : match.team2Points),
                pointsAgainst: (loserStanding.pointsAgainst || 0) + (match.team1Points < match.team2Points ? match.team2Points : match.team1Points),
                updatedAt: new Date(),
              })
              .where(eq(cupStandings.id, loserStanding.id));
          }
        }
      }
    }

    return { success: true, message: "تم حساب النتائج بنجاح" };
  } catch (error) {
    console.error("Error calculating results:", error);
    return { success: false, message: "خطأ في حساب النتائج" };
  }
}

/**
 * 5.2.4 Get cup standings
 */
export async function getStandings(cupId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.cupStandings.findMany({
      where: eq(cupStandings.cupId, cupId),
    });
  } catch (error) {
    console.error("Error getting standings:", error);
    return [];
  }
}

/**
 * 5.2.5 Get match history
 */
export async function getMatchHistory(cupId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.cupMatches.findMany({
      where: eq(cupMatches.cupId, cupId),
    });
  } catch (error) {
    console.error("Error getting match history:", error);
    return [];
  }
}

/**
 * Get all cup rounds
 */
export async function getCupRounds(cupId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.cupRounds.findMany({
      where: eq(cupRounds.cupId, cupId),
    });
  } catch (error) {
    console.error("Error getting cup rounds:", error);
    return [];
  }
}

/**
 * Get cup information
 */
export async function getCupInfo(cupId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.query.cupTournaments.findFirst({
      where: eq(cupTournaments.id, cupId),
    });
  } catch (error) {
    console.error("Error getting cup info:", error);
    return null;
  }
}
