/**
 * Head-to-Head Leagues System
 * Manages direct competition between teams in a league
 */

import { getDb } from "./db";
import { leagues, h2hMatches, h2hStandings, userTeams, gameweeks } from "../drizzle/schema";
import { eq, and, or, isNull } from "drizzle-orm";

/**
 * H2H League types
 */
export type LeagueType = "CLASSIC" | "HEAD_TO_HEAD";

/**
 * Match result types
 */
export type MatchResult = "WIN" | "DRAW" | "LOSS";

/**
 * H2H Match information
 */
export interface H2HMatch {
  id: number;
  leagueId: number;
  gameweekId: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  result: MatchResult | null;
  matchDate: Date;
  createdAt: Date;
}

/**
 * H2H Standing information
 */
export interface H2HStanding {
  id: number;
  leagueId: number;
  userId: number;
  teamId: number;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  totalPoints: number;
  position: number;
  updatedAt: Date;
}

/**
 * Create a Head-to-Head league
 */
export async function createH2HLeague(
  name: string,
  description: string,
  ownerId: number
): Promise<{ success: boolean; leagueId?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    const result = await db.insert(leagues).values({
      name,
      description,
      leagueType: "HEAD_TO_HEAD",
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      leagueId: result.insertId as number,
      message: "تم إنشاء دوري Head-to-Head بنجاح",
    };
  } catch (error) {
    console.error("Failed to create H2H league:", error);
    return { success: false, message: "فشل في إنشاء الدوري" };
  }
}

/**
 * Generate random matches for a gameweek
 * Pairs teams randomly while avoiding repeats
 */
export async function generateH2HMatches(
  leagueId: number,
  gameweekId: number
): Promise<{ success: boolean; matchCount?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get all teams in the league
    const teams = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.leagueId, leagueId));

    if (teams.length < 2) {
      return { success: false, message: "يجب أن يكون هناك فريقان على الأقل في الدوري" };
    }

    // Check if matches already exist for this gameweek
    const existingMatches = await db
      .select()
      .from(h2hMatches)
      .where(and(eq(h2hMatches.leagueId, leagueId), eq(h2hMatches.gameweekId, gameweekId)));

    if (existingMatches.length > 0) {
      return { success: false, message: "تم إنشاء المباريات بالفعل لهذا الأسبوع" };
    }

    // Shuffle teams
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Generate matches
    const matches = [];
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
      const team1 = shuffledTeams[i];
      const team2 = shuffledTeams[i + 1];

      if (team1 && team2) {
        matches.push({
          leagueId,
          gameweekId,
          team1Id: team1.id,
          team2Id: team2.id,
          team1Points: 0,
          team2Points: 0,
          result: null,
          matchDate: new Date(),
          createdAt: new Date(),
        });
      }
    }

    // Handle odd number of teams (bye round)
    if (shuffledTeams.length % 2 === 1) {
      const byeTeam = shuffledTeams[shuffledTeams.length - 1];
      // Bye team gets automatic draw
      matches.push({
        leagueId,
        gameweekId,
        team1Id: byeTeam.id,
        team2Id: byeTeam.id, // Same team indicates bye
        team1Points: 0,
        team2Points: 0,
        result: "DRAW",
        matchDate: new Date(),
        createdAt: new Date(),
      });
    }

    // Insert matches
    for (const match of matches) {
      await db.insert(h2hMatches).values(match);
    }

    return {
      success: true,
      matchCount: matches.length,
      message: `تم إنشاء ${matches.length} مباراة بنجاح`,
    };
  } catch (error) {
    console.error("Failed to generate H2H matches:", error);
    return { success: false, message: "فشل في توليد المباريات" };
  }
}

/**
 * Calculate match results based on team points
 */
export async function calculateH2HResults(
  leagueId: number,
  gameweekId: number
): Promise<{ success: boolean; updatedCount?: number; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    // Get all matches for this gameweek
    const matches = await db
      .select()
      .from(h2hMatches)
      .where(and(eq(h2hMatches.leagueId, leagueId), eq(h2hMatches.gameweekId, gameweekId)));

    let updatedCount = 0;

    for (const match of matches) {
      // Determine result
      let result: MatchResult;
      if (match.team1Points > match.team2Points) {
        result = "WIN";
      } else if (match.team1Points < match.team2Points) {
        result = "LOSS";
      } else {
        result = "DRAW";
      }

      // Update match result
      await db
        .update(h2hMatches)
        .set({ result })
        .where(eq(h2hMatches.id, match.id));

      updatedCount++;

      // Update standings for both teams
      await updateH2HStandings(leagueId, match.team1Id, match.team2Id, match);
    }

    return {
      success: true,
      updatedCount,
      message: `تم تحديث ${updatedCount} مباراة بنجاح`,
    };
  } catch (error) {
    console.error("Failed to calculate H2H results:", error);
    return { success: false, message: "فشل في حساب النتائج" };
  }
}

/**
 * Update standings for both teams in a match
 */
async function updateH2HStandings(
  leagueId: number,
  team1Id: number,
  team2Id: number,
  match: H2HMatch
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get or create standings for team 1
    const team1Standing = await db
      .select()
      .from(h2hStandings)
      .where(
        and(
          eq(h2hStandings.leagueId, leagueId),
          eq(h2hStandings.teamId, team1Id)
        )
      )
      .limit(1);

    // Get or create standings for team 2
    const team2Standing = await db
      .select()
      .from(h2hStandings)
      .where(
        and(
          eq(h2hStandings.leagueId, leagueId),
          eq(h2hStandings.teamId, team2Id)
        )
      )
      .limit(1);

    // Determine points for team 1
    let team1Points = 0;
    let team1Wins = 0;
    let team1Draws = 0;
    let team1Losses = 0;

    if (match.result === "WIN") {
      team1Points = 3;
      team1Wins = 1;
    } else if (match.result === "DRAW") {
      team1Points = 1;
      team1Draws = 1;
    } else {
      team1Losses = 1;
    }

    // Determine points for team 2
    let team2Points = 0;
    let team2Wins = 0;
    let team2Draws = 0;
    let team2Losses = 0;

    if (match.result === "WIN") {
      team2Points = 0;
      team2Losses = 1;
    } else if (match.result === "DRAW") {
      team2Points = 1;
      team2Draws = 1;
    } else {
      team2Points = 3;
      team2Wins = 1;
    }

    // Update team 1 standing
    if (team1Standing.length > 0) {
      const standing = team1Standing[0];
      await db
        .update(h2hStandings)
        .set({
          wins: standing.wins + team1Wins,
          draws: standing.draws + team1Draws,
          losses: standing.losses + team1Losses,
          pointsFor: standing.pointsFor + match.team1Points,
          pointsAgainst: standing.pointsAgainst + match.team2Points,
          pointsDifference:
            standing.pointsDifference + (match.team1Points - match.team2Points),
          totalPoints: standing.totalPoints + team1Points,
          updatedAt: new Date(),
        })
        .where(eq(h2hStandings.id, standing.id));
    }

    // Update team 2 standing
    if (team2Standing.length > 0) {
      const standing = team2Standing[0];
      await db
        .update(h2hStandings)
        .set({
          wins: standing.wins + team2Wins,
          draws: standing.draws + team2Draws,
          losses: standing.losses + team2Losses,
          pointsFor: standing.pointsFor + match.team2Points,
          pointsAgainst: standing.pointsAgainst + match.team1Points,
          pointsDifference:
            standing.pointsDifference + (match.team2Points - match.team1Points),
          totalPoints: standing.totalPoints + team2Points,
          updatedAt: new Date(),
        })
        .where(eq(h2hStandings.id, standing.id));
    }

    // Update positions
    await updateH2HPositions(leagueId);
  } catch (error) {
    console.error("Failed to update H2H standings:", error);
  }
}

/**
 * Update positions in standings
 */
async function updateH2HPositions(leagueId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const standings = await db
      .select()
      .from(h2hStandings)
      .where(eq(h2hStandings.leagueId, leagueId))
      .orderBy(h2hStandings.totalPoints);

    // Update positions
    for (let i = 0; i < standings.length; i++) {
      await db
        .update(h2hStandings)
        .set({ position: i + 1 })
        .where(eq(h2hStandings.id, standings[i].id));
    }
  } catch (error) {
    console.error("Failed to update H2H positions:", error);
  }
}

/**
 * Get H2H standings for a league
 */
export async function getH2HStandings(leagueId: number): Promise<H2HStanding[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const standings = await db
      .select()
      .from(h2hStandings)
      .where(eq(h2hStandings.leagueId, leagueId))
      .orderBy(h2hStandings.position);

    return standings.map((s) => ({
      id: s.id,
      leagueId: s.leagueId,
      userId: s.userId,
      teamId: s.teamId,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      pointsDifference: s.pointsDifference,
      totalPoints: s.totalPoints,
      position: s.position,
      updatedAt: s.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get H2H standings:", error);
    return [];
  }
}

/**
 * Get H2H matches for a gameweek
 */
export async function getH2HMatches(
  leagueId: number,
  gameweekId: number
): Promise<H2HMatch[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const matches = await db
      .select()
      .from(h2hMatches)
      .where(and(eq(h2hMatches.leagueId, leagueId), eq(h2hMatches.gameweekId, gameweekId)));

    return matches.map((m) => ({
      id: m.id,
      leagueId: m.leagueId,
      gameweekId: m.gameweekId,
      team1Id: m.team1Id,
      team2Id: m.team2Id,
      team1Points: m.team1Points,
      team2Points: m.team2Points,
      result: m.result as MatchResult | null,
      matchDate: m.matchDate,
      createdAt: m.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get H2H matches:", error);
    return [];
  }
}

/**
 * Get match history for a team
 */
export async function getH2HMatchHistory(
  leagueId: number,
  teamId: number,
  limit: number = 10
): Promise<H2HMatch[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const matches = await db
      .select()
      .from(h2hMatches)
      .where(
        and(
          eq(h2hMatches.leagueId, leagueId),
          or(eq(h2hMatches.team1Id, teamId), eq(h2hMatches.team2Id, teamId))
        )
      )
      .orderBy(h2hMatches.matchDate)
      .limit(limit);

    return matches.map((m) => ({
      id: m.id,
      leagueId: m.leagueId,
      gameweekId: m.gameweekId,
      team1Id: m.team1Id,
      team2Id: m.team2Id,
      team1Points: m.team1Points,
      team2Points: m.team2Points,
      result: m.result as MatchResult | null,
      matchDate: m.matchDate,
      createdAt: m.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get H2H match history:", error);
    return [];
  }
}

/**
 * Update match points
 */
export async function updateH2HMatchPoints(
  matchId: number,
  team1Points: number,
  team2Points: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db
      .update(h2hMatches)
      .set({
        team1Points,
        team2Points,
        updatedAt: new Date(),
      })
      .where(eq(h2hMatches.id, matchId));

    return { success: true, message: "تم تحديث نقاط المباراة بنجاح" };
  } catch (error) {
    console.error("Failed to update match points:", error);
    return { success: false, message: "فشل في تحديث نقاط المباراة" };
  }
}

/**
 * Get team record in H2H league
 */
export async function getH2HTeamRecord(
  leagueId: number,
  teamId: number
): Promise<H2HStanding | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const standing = await db
      .select()
      .from(h2hStandings)
      .where(
        and(
          eq(h2hStandings.leagueId, leagueId),
          eq(h2hStandings.teamId, teamId)
        )
      )
      .limit(1);

    if (standing.length === 0) return null;

    const s = standing[0];
    return {
      id: s.id,
      leagueId: s.leagueId,
      userId: s.userId,
      teamId: s.teamId,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      pointsDifference: s.pointsDifference,
      totalPoints: s.totalPoints,
      position: s.position,
      updatedAt: s.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get H2H team record:", error);
    return null;
  }
}

/**
 * Get head-to-head record between two teams
 */
export async function getH2HHeadToHead(
  leagueId: number,
  team1Id: number,
  team2Id: number
): Promise<{
  team1Wins: number;
  team2Wins: number;
  draws: number;
  matches: H2HMatch[];
}> {
  const db = await getDb();
  if (!db) {
    return { team1Wins: 0, team2Wins: 0, draws: 0, matches: [] };
  }

  try {
    const matches = await db
      .select()
      .from(h2hMatches)
      .where(
        and(
          eq(h2hMatches.leagueId, leagueId),
          or(
            and(eq(h2hMatches.team1Id, team1Id), eq(h2hMatches.team2Id, team2Id)),
            and(eq(h2hMatches.team1Id, team2Id), eq(h2hMatches.team2Id, team1Id))
          )
        )
      );

    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;

    matches.forEach((match) => {
      if (match.result === "DRAW") {
        draws++;
      } else if (match.result === "WIN") {
        if (match.team1Id === team1Id) {
          team1Wins++;
        } else {
          team2Wins++;
        }
      } else if (match.result === "LOSS") {
        if (match.team1Id === team1Id) {
          team2Wins++;
        } else {
          team1Wins++;
        }
      }
    });

    return {
      team1Wins,
      team2Wins,
      draws,
      matches: matches.map((m) => ({
        id: m.id,
        leagueId: m.leagueId,
        gameweekId: m.gameweekId,
        team1Id: m.team1Id,
        team2Id: m.team2Id,
        team1Points: m.team1Points,
        team2Points: m.team2Points,
        result: m.result as MatchResult | null,
        matchDate: m.matchDate,
        createdAt: m.createdAt,
      })),
    };
  } catch (error) {
    console.error("Failed to get H2H head-to-head record:", error);
    return { team1Wins: 0, team2Wins: 0, draws: 0, matches: [] };
  }
}

/**
 * Initialize standings for new teams in league
 */
export async function initializeH2HStandings(
  leagueId: number,
  teamId: number,
  userId: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    await db.insert(h2hStandings).values({
      leagueId,
      teamId,
      userId,
      wins: 0,
      draws: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointsDifference: 0,
      totalPoints: 0,
      position: 0,
      updatedAt: new Date(),
    });

    return { success: true, message: "تم تهيئة الترتيب بنجاح" };
  } catch (error) {
    console.error("Failed to initialize H2H standings:", error);
    return { success: false, message: "فشل في تهيئة الترتيب" };
  }
}

/**
 * Get league statistics
 */
export async function getH2HLeagueStats(leagueId: number): Promise<{
  totalTeams: number;
  totalMatches: number;
  totalDraws: number;
  totalWins: number;
  averagePointsPerMatch: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTeams: 0,
      totalMatches: 0,
      totalDraws: 0,
      totalWins: 0,
      averagePointsPerMatch: 0,
    };
  }

  try {
    const teams = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.leagueId, leagueId));

    const matches = await db
      .select()
      .from(h2hMatches)
      .where(eq(h2hMatches.leagueId, leagueId));

    let totalDraws = 0;
    let totalWins = 0;
    let totalPoints = 0;

    matches.forEach((match) => {
      if (match.result === "DRAW") totalDraws++;
      if (match.result === "WIN") totalWins++;
      totalPoints += match.team1Points + match.team2Points;
    });

    const averagePointsPerMatch = matches.length > 0 ? totalPoints / matches.length : 0;

    return {
      totalTeams: teams.length,
      totalMatches: matches.length,
      totalDraws,
      totalWins,
      averagePointsPerMatch: Math.round(averagePointsPerMatch * 100) / 100,
    };
  } catch (error) {
    console.error("Failed to get H2H league stats:", error);
    return {
      totalTeams: 0,
      totalMatches: 0,
      totalDraws: 0,
      totalWins: 0,
      averagePointsPerMatch: 0,
    };
  }
}
