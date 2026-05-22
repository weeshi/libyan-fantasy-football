/**
 * Cup Competition System
 * Manages knockout tournament competitions
 */

import { getDb } from "./db";
import { cupTournaments, cupMatches, cupStandings, userTeams, gameweeks } from "../drizzle/schema";
import { eq, and, or, isNull } from "drizzle-orm";

/**
 * Cup tournament types
 */
export type CupType = "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION";

/**
 * Cup match status
 */
export type CupMatchStatus = "PENDING" | "COMPLETED" | "WALKOVER";

/**
 * Cup tournament information
 */
export interface CupTournament {
  id: number;
  name: string;
  description: string;
  cupType: CupType;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalTeams: number;
  currentRound: number;
  totalRounds: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cup match information
 */
export interface CupMatch {
  id: number;
  tournamentId: number;
  round: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  winner: number | null;
  status: CupMatchStatus;
  matchDate: Date;
  createdAt: Date;
}

/**
 * Cup standing information
 */
export interface CupStanding {
  id: number;
  tournamentId: number;
  teamId: number;
  position: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  status: "ACTIVE" | "ELIMINATED" | "CHAMPION";
  updatedAt: Date;
}

/**
 * Create a cup tournament
 */
export async function createCupTournament(
  name: string,
  description: string,
  cupType: CupType,
  teamIds: number[]
): Promise<{ success: boolean; tournamentId?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Calculate total rounds needed
    const totalRounds = Math.ceil(Math.log2(teamIds.length));

    if (teamIds.length < 2) {
      return { success: false, message: "يجب أن يكون هناك فريقان على الأقل" };
    }

    const result = await db.insert(cupTournaments).values({
      name,
      description,
      cupType,
      status: "ACTIVE",
      totalTeams: teamIds.length,
      currentRound: 1,
      totalRounds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const tournamentId = result.insertId as number;

    // Initialize standings for all teams
    for (const teamId of teamIds) {
      await db.insert(cupStandings).values({
        tournamentId,
        teamId,
        position: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        status: "ACTIVE",
        updatedAt: new Date(),
      });
    }

    return {
      success: true,
      tournamentId,
      message: "تم إنشاء الكأس بنجاح",
    };
  } catch (error) {
    console.error("Failed to create cup tournament:", error);
    return { success: false, message: "فشل في إنشاء الكأس" };
  }
}

/**
 * Generate first round matches
 */
export async function generateCupFirstRound(
  tournamentId: number
): Promise<{ success: boolean; matchCount?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get all active teams
    const standings = await db
      .select()
      .from(cupStandings)
      .where(
        and(
          eq(cupStandings.tournamentId, tournamentId),
          eq(cupStandings.status, "ACTIVE")
        )
      );

    if (standings.length < 2) {
      return { success: false, message: "عدد الفرق غير كافي" };
    }

    // Shuffle teams
    const shuffledTeams = [...standings].sort(() => Math.random() - 0.5);

    // Generate matches
    const matches = [];
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
      const team1 = shuffledTeams[i];
      const team2 = shuffledTeams[i + 1];

      if (team1 && team2) {
        matches.push({
          tournamentId,
          round: 1,
          team1Id: team1.teamId,
          team2Id: team2.teamId,
          team1Points: 0,
          team2Points: 0,
          winner: null,
          status: "PENDING",
          matchDate: new Date(),
          createdAt: new Date(),
        });
      }
    }

    // Handle odd number of teams (walkover)
    if (shuffledTeams.length % 2 === 1) {
      const byeTeam = shuffledTeams[shuffledTeams.length - 1];
      matches.push({
        tournamentId,
        round: 1,
        team1Id: byeTeam.teamId,
        team2Id: byeTeam.teamId,
        team1Points: 0,
        team2Points: 0,
        winner: byeTeam.teamId,
        status: "WALKOVER",
        matchDate: new Date(),
        createdAt: new Date(),
      });
    }

    // Insert matches
    for (const match of matches) {
      await db.insert(cupMatches).values(match);
    }

    return {
      success: true,
      matchCount: matches.length,
      message: `تم إنشاء ${matches.length} مباراة`,
    };
  } catch (error) {
    console.error("Failed to generate cup first round:", error);
    return { success: false, message: "فشل في توليد المباريات" };
  }
}

/**
 * Calculate cup match result
 */
export async function calculateCupResult(
  matchId: number,
  team1Points: number,
  team2Points: number
): Promise<{ success: boolean; winnerId?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get match
    const matches = await db
      .select()
      .from(cupMatches)
      .where(eq(cupMatches.id, matchId));

    if (matches.length === 0) {
      return { success: false, message: "المباراة غير موجودة" };
    }

    const match = matches[0];

    // Determine winner
    let winnerId: number;
    if (team1Points > team2Points) {
      winnerId = match.team1Id;
    } else if (team2Points > team1Points) {
      winnerId = match.team2Id;
    } else {
      // In case of tie, use penalty (random for now)
      winnerId = Math.random() > 0.5 ? match.team1Id : match.team2Id;
    }

    // Update match
    await db
      .update(cupMatches)
      .set({
        team1Points,
        team2Points,
        winner: winnerId,
        status: "COMPLETED",
      })
      .where(eq(cupMatches.id, matchId));

    // Update standings
    const loser = winnerId === match.team1Id ? match.team2Id : match.team1Id;

    // Update winner
    const winnerStanding = await db
      .select()
      .from(cupStandings)
      .where(
        and(
          eq(cupStandings.tournamentId, match.tournamentId),
          eq(cupStandings.teamId, winnerId)
        )
      )
      .limit(1);

    if (winnerStanding.length > 0) {
      const ws = winnerStanding[0];
      await db
        .update(cupStandings)
        .set({
          wins: ws.wins + 1,
          pointsFor: ws.pointsFor + (winnerId === match.team1Id ? team1Points : team2Points),
          pointsAgainst: ws.pointsAgainst + (winnerId === match.team1Id ? team2Points : team1Points),
          updatedAt: new Date(),
        })
        .where(eq(cupStandings.id, ws.id));
    }

    // Update loser
    const loserStanding = await db
      .select()
      .from(cupStandings)
      .where(
        and(
          eq(cupStandings.tournamentId, match.tournamentId),
          eq(cupStandings.teamId, loser)
        )
      )
      .limit(1);

    if (loserStanding.length > 0) {
      const ls = loserStanding[0];
      await db
        .update(cupStandings)
        .set({
          losses: ls.losses + 1,
          status: "ELIMINATED",
          pointsFor: ls.pointsFor + (loser === match.team1Id ? team1Points : team2Points),
          pointsAgainst: ls.pointsAgainst + (loser === match.team1Id ? team2Points : team1Points),
          updatedAt: new Date(),
        })
        .where(eq(cupStandings.id, ls.id));
    }

    return {
      success: true,
      winnerId,
      message: "تم حساب النتيجة بنجاح",
    };
  } catch (error) {
    console.error("Failed to calculate cup result:", error);
    return { success: false, message: "فشل في حساب النتيجة" };
  }
}

/**
 * Generate next round matches
 */
export async function generateCupNextRound(
  tournamentId: number
): Promise<{ success: boolean; matchCount?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get tournament
    const tournaments = await db
      .select()
      .from(cupTournaments)
      .where(eq(cupTournaments.id, tournamentId));

    if (tournaments.length === 0) {
      return { success: false, message: "الكأس غير موجودة" };
    }

    const tournament = tournaments[0];

    // Check if all matches in current round are completed
    const currentRoundMatches = await db
      .select()
      .from(cupMatches)
      .where(
        and(
          eq(cupMatches.tournamentId, tournamentId),
          eq(cupMatches.round, tournament.currentRound)
        )
      );

    const allCompleted = currentRoundMatches.every(
      (m) => m.status === "COMPLETED" || m.status === "WALKOVER"
    );

    if (!allCompleted) {
      return { success: false, message: "لم تكتمل جميع مباريات الجولة الحالية" };
    }

    // Get winners from current round
    const winners = currentRoundMatches
      .filter((m) => m.winner !== null)
      .map((m) => m.winner);

    if (winners.length < 2) {
      // Tournament is over
      await db
        .update(cupTournaments)
        .set({ status: "COMPLETED" })
        .where(eq(cupTournaments.id, tournamentId));

      return {
        success: true,
        matchCount: 0,
        message: "انتهت الكأس - تم تتويج البطل",
      };
    }

    // Generate matches for next round
    const matches = [];
    for (let i = 0; i < winners.length - 1; i += 2) {
      const team1Id = winners[i];
      const team2Id = winners[i + 1];

      if (team1Id && team2Id) {
        matches.push({
          tournamentId,
          round: tournament.currentRound + 1,
          team1Id,
          team2Id,
          team1Points: 0,
          team2Points: 0,
          winner: null,
          status: "PENDING",
          matchDate: new Date(),
          createdAt: new Date(),
        });
      }
    }

    // Handle odd number of winners (walkover)
    if (winners.length % 2 === 1) {
      const byeTeamId = winners[winners.length - 1];
      matches.push({
        tournamentId,
        round: tournament.currentRound + 1,
        team1Id: byeTeamId,
        team2Id: byeTeamId,
        team1Points: 0,
        team2Points: 0,
        winner: byeTeamId,
        status: "WALKOVER",
        matchDate: new Date(),
        createdAt: new Date(),
      });
    }

    // Insert matches
    for (const match of matches) {
      await db.insert(cupMatches).values(match);
    }

    // Update tournament current round
    await db
      .update(cupTournaments)
      .set({
        currentRound: tournament.currentRound + 1,
        updatedAt: new Date(),
      })
      .where(eq(cupTournaments.id, tournamentId));

    return {
      success: true,
      matchCount: matches.length,
      message: `تم إنشاء ${matches.length} مباراة للجولة القادمة`,
    };
  } catch (error) {
    console.error("Failed to generate cup next round:", error);
    return { success: false, message: "فشل في توليد الجولة القادمة" };
  }
}

/**
 * Get cup matches by round
 */
export async function getCupMatchesByRound(
  tournamentId: number,
  round: number
): Promise<CupMatch[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const matches = await db
      .select()
      .from(cupMatches)
      .where(
        and(
          eq(cupMatches.tournamentId, tournamentId),
          eq(cupMatches.round, round)
        )
      );

    return matches.map((m) => ({
      id: m.id,
      tournamentId: m.tournamentId,
      round: m.round,
      team1Id: m.team1Id,
      team2Id: m.team2Id,
      team1Points: m.team1Points,
      team2Points: m.team2Points,
      winner: m.winner,
      status: m.status as CupMatchStatus,
      matchDate: m.matchDate,
      createdAt: m.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get cup matches by round:", error);
    return [];
  }
}

/**
 * Get cup standings
 */
export async function getCupStandings(tournamentId: number): Promise<CupStanding[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const standings = await db
      .select()
      .from(cupStandings)
      .where(eq(cupStandings.tournamentId, tournamentId))
      .orderBy(cupStandings.position);

    return standings.map((s) => ({
      id: s.id,
      tournamentId: s.tournamentId,
      teamId: s.teamId,
      position: s.position,
      wins: s.wins,
      losses: s.losses,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      status: s.status as "ACTIVE" | "ELIMINATED" | "CHAMPION",
      updatedAt: s.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get cup standings:", error);
    return [];
  }
}

/**
 * Get cup tournament info
 */
export async function getCupTournament(
  tournamentId: number
): Promise<CupTournament | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const tournaments = await db
      .select()
      .from(cupTournaments)
      .where(eq(cupTournaments.id, tournamentId));

    if (tournaments.length === 0) return null;

    const t = tournaments[0];
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      cupType: t.cupType as CupType,
      status: t.status as "ACTIVE" | "COMPLETED" | "CANCELLED",
      totalTeams: t.totalTeams,
      currentRound: t.currentRound,
      totalRounds: t.totalRounds,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get cup tournament:", error);
    return null;
  }
}

/**
 * Get cup bracket
 */
export async function getCupBracket(tournamentId: number): Promise<{
  tournament: CupTournament | null;
  rounds: Array<{ round: number; matches: CupMatch[] }>;
}> {
  const db = await getDb();
  if (!db) return { tournament: null, rounds: [] };

  try {
    const tournament = await getCupTournament(tournamentId);
    if (!tournament) return { tournament: null, rounds: [] };

    const rounds = [];
    for (let i = 1; i <= tournament.totalRounds; i++) {
      const matches = await getCupMatchesByRound(tournamentId, i);
      rounds.push({ round: i, matches });
    }

    return { tournament, rounds };
  } catch (error) {
    console.error("Failed to get cup bracket:", error);
    return { tournament: null, rounds: [] };
  }
}

/**
 * Get cup champion
 */
export async function getCupChampion(
  tournamentId: number
): Promise<{ teamId: number; wins: number } | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const standings = await db
      .select()
      .from(cupStandings)
      .where(
        and(
          eq(cupStandings.tournamentId, tournamentId),
          eq(cupStandings.status, "CHAMPION")
        )
      )
      .limit(1);

    if (standings.length === 0) return null;

    const s = standings[0];
    return { teamId: s.teamId, wins: s.wins };
  } catch (error) {
    console.error("Failed to get cup champion:", error);
    return null;
  }
}

/**
 * Get team's cup performance
 */
export async function getTeamCupPerformance(
  tournamentId: number,
  teamId: number
): Promise<CupStanding | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const standings = await db
      .select()
      .from(cupStandings)
      .where(
        and(
          eq(cupStandings.tournamentId, tournamentId),
          eq(cupStandings.teamId, teamId)
        )
      )
      .limit(1);

    if (standings.length === 0) return null;

    const s = standings[0];
    return {
      id: s.id,
      tournamentId: s.tournamentId,
      teamId: s.teamId,
      position: s.position,
      wins: s.wins,
      losses: s.losses,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      status: s.status as "ACTIVE" | "ELIMINATED" | "CHAMPION",
      updatedAt: s.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get team cup performance:", error);
    return null;
  }
}

/**
 * Calculate cup statistics
 */
export async function getCupStatistics(tournamentId: number): Promise<{
  totalTeams: number;
  activeTeams: number;
  eliminatedTeams: number;
  totalMatches: number;
  completedMatches: number;
  averagePointsPerMatch: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTeams: 0,
      activeTeams: 0,
      eliminatedTeams: 0,
      totalMatches: 0,
      completedMatches: 0,
      averagePointsPerMatch: 0,
    };
  }

  try {
    const standings = await db
      .select()
      .from(cupStandings)
      .where(eq(cupStandings.tournamentId, tournamentId));

    const matches = await db
      .select()
      .from(cupMatches)
      .where(eq(cupMatches.tournamentId, tournamentId));

    const activeTeams = standings.filter((s) => s.status === "ACTIVE").length;
    const eliminatedTeams = standings.filter((s) => s.status === "ELIMINATED").length;
    const completedMatches = matches.filter(
      (m) => m.status === "COMPLETED" || m.status === "WALKOVER"
    ).length;

    let totalPoints = 0;
    matches.forEach((m) => {
      totalPoints += m.team1Points + m.team2Points;
    });

    const averagePointsPerMatch = matches.length > 0 ? totalPoints / matches.length : 0;

    return {
      totalTeams: standings.length,
      activeTeams,
      eliminatedTeams,
      totalMatches: matches.length,
      completedMatches,
      averagePointsPerMatch: Math.round(averagePointsPerMatch * 100) / 100,
    };
  } catch (error) {
    console.error("Failed to get cup statistics:", error);
    return {
      totalTeams: 0,
      activeTeams: 0,
      eliminatedTeams: 0,
      totalMatches: 0,
      completedMatches: 0,
      averagePointsPerMatch: 0,
    };
  }
}
