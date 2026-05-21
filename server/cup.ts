/**
 * Cup Competition System for Talba Fantasy Football
 * Implements knockout tournament format
 */

import { getDb } from "./db";
import { userTeams } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Cup match result
 */
export interface CupMatch {
  id: number;
  leagueId: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  round: number;
  winner: number | null;
  status: "upcoming" | "active" | "completed";
}

/**
 * Cup round information
 */
export interface CupRound {
  roundNumber: number;
  roundName: string;
  totalMatches: number;
  completedMatches: number;
  status: "upcoming" | "active" | "completed";
}

/**
 * Create Cup tables if not exists
 */
export async function createCupTablesIfNotExists(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Create cup_matches table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cup_matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leagueId INT NOT NULL,
        team1Id INT NOT NULL,
        team2Id INT NOT NULL,
        team1Points INT DEFAULT 0,
        team2Points INT DEFAULT 0,
        round INT NOT NULL,
        winner INT,
        status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (leagueId) REFERENCES leagues(id),
        FOREIGN KEY (team1Id) REFERENCES userTeams(id),
        FOREIGN KEY (team2Id) REFERENCES userTeams(id)
      )
    `);

    return true;
  } catch (error) {
    console.error("Failed to create Cup tables:", error);
    return false;
  }
}

/**
 * Generate cup bracket for first round
 */
export async function generateCupBracket(leagueId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get all teams in the league
    const teams = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.leagueId, leagueId));

    if (teams.length < 2) {
      console.log("Not enough teams for cup bracket");
      return false;
    }

    // Shuffle teams
    const shuffledTeams = teams.sort(() => Math.random() - 0.5);

    // Create first round matchups
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
      await db.execute(`
        INSERT INTO cup_matches (leagueId, team1Id, team2Id, round, status)
        VALUES (${leagueId}, ${shuffledTeams[i].id}, ${shuffledTeams[i + 1].id}, 1, 'upcoming')
      `);
    }

    // If odd number of teams, give one team a bye
    if (shuffledTeams.length % 2 === 1) {
      // The last team gets a bye to the next round
      console.log(`Team ${shuffledTeams[shuffledTeams.length - 1].teamName} gets a bye`);
    }

    return true;
  } catch (error) {
    console.error("Failed to generate cup bracket:", error);
    return false;
  }
}

/**
 * Update cup match result
 */
export async function updateCupMatchResult(
  matchId: number,
  team1Points: number,
  team2Points: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "قاعدة البيانات غير متاحة" };
  }

  try {
    let winner: number | null = null;
    if (team1Points > team2Points) {
      winner = 1;
    } else if (team2Points > team1Points) {
      winner = 2;
    } else {
      // In case of draw, use penalty shootout (random)
      winner = Math.random() > 0.5 ? 1 : 2;
    }

    const match = await db.execute(`SELECT * FROM cup_matches WHERE id = ${matchId}`);
    if (match.length === 0) {
      return { success: false, message: "المباراة غير موجودة" };
    }

    const m = match[0];

    await db.execute(`
      UPDATE cup_matches
      SET team1Points = ${team1Points}, team2Points = ${team2Points}, winner = ${winner}, status = 'completed'
      WHERE id = ${matchId}
    `);

    // Create next round match if this is not the final
    const totalRounds = Math.ceil(Math.log2(await getTeamCountInLeague(m.leagueId)));
    if (m.round < totalRounds) {
      await createNextRoundMatch(m.leagueId, m.round, winner === 1 ? m.team1Id : m.team2Id);
    }

    return { success: true, message: "تم تحديث نتيجة المباراة" };
  } catch (error) {
    console.error("Failed to update cup match result:", error);
    return { success: false, message: "فشل تحديث النتيجة" };
  }
}

/**
 * Get team count in league
 */
async function getTeamCountInLeague(leagueId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const result = await db.execute(`SELECT COUNT(*) as count FROM userTeams WHERE leagueId = ${leagueId}`);
    return result[0]?.count || 0;
  } catch (error) {
    console.error("Failed to get team count:", error);
    return 0;
  }
}

/**
 * Create next round match
 */
async function createNextRoundMatch(leagueId: number, currentRound: number, winnerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Check if next round match already exists for this winner
    const existing = await db.execute(`
      SELECT * FROM cup_matches
      WHERE leagueId = ${leagueId} AND round = ${currentRound + 1}
      AND (team1Id = ${winnerId} OR team2Id = ${winnerId})
    `);

    if (existing.length === 0) {
      // Create placeholder for next round
      await db.execute(`
        INSERT INTO cup_matches (leagueId, team1Id, team2Id, round, status)
        VALUES (${leagueId}, ${winnerId}, 0, ${currentRound + 1}, 'upcoming')
      `);
    }
  } catch (error) {
    console.error("Failed to create next round match:", error);
  }
}

/**
 * Get cup matches for a round
 */
export async function getCupMatches(leagueId: number, round: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const matches = await db.execute(`
      SELECT 
        m.id,
        m.team1Id,
        m.team2Id,
        m.team1Points,
        m.team2Points,
        m.round,
        m.winner,
        m.status,
        t1.teamName as team1Name,
        t2.teamName as team2Name
      FROM cup_matches m
      LEFT JOIN userTeams t1 ON m.team1Id = t1.id
      LEFT JOIN userTeams t2 ON m.team2Id = t2.id
      WHERE m.leagueId = ${leagueId} AND m.round = ${round}
      ORDER BY m.id
    `);

    return matches;
  } catch (error) {
    console.error("Failed to get cup matches:", error);
    return [];
  }
}

/**
 * Get cup rounds for a league
 */
export async function getCupRounds(leagueId: number): Promise<CupRound[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const teamCount = await getTeamCountInLeague(leagueId);
    const totalRounds = Math.ceil(Math.log2(teamCount));

    const rounds: CupRound[] = [];

    for (let i = 1; i <= totalRounds; i++) {
      const matches = await db.execute(`
        SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM cup_matches
        WHERE leagueId = ${leagueId} AND round = ${i}
      `);

      const m = matches[0];
      const roundName = getRoundName(i, totalRounds);

      rounds.push({
        roundNumber: i,
        roundName,
        totalMatches: m.total || 0,
        completedMatches: m.completed || 0,
        status: m.completed === m.total && m.total > 0 ? "completed" : m.completed > 0 ? "active" : "upcoming",
      });
    }

    return rounds;
  } catch (error) {
    console.error("Failed to get cup rounds:", error);
    return [];
  }
}

/**
 * Get round name
 */
function getRoundName(roundNumber: number, totalRounds: number): string {
  const roundsFromEnd = totalRounds - roundNumber;

  switch (roundsFromEnd) {
    case 0:
      return "النهائي";
    case 1:
      return "نصف النهائي";
    case 2:
      return "ربع النهائي";
    default:
      return `الجولة ${roundNumber}`;
  }
}

/**
 * Get cup winner
 */
export async function getCupWinner(leagueId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const teamCount = await getTeamCountInLeague(leagueId);
    const totalRounds = Math.ceil(Math.log2(teamCount));

    const finalMatch = await db.execute(`
      SELECT m.*, t.teamName
      FROM cup_matches m
      JOIN userTeams t ON m.winner = 1 AND m.team1Id = t.id OR m.winner = 2 AND m.team2Id = t.id
      WHERE m.leagueId = ${leagueId} AND m.round = ${totalRounds} AND m.status = 'completed'
      LIMIT 1
    `);

    if (finalMatch.length > 0) {
      return {
        teamId: finalMatch[0].winner === 1 ? finalMatch[0].team1Id : finalMatch[0].team2Id,
        teamName: finalMatch[0].teamName,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to get cup winner:", error);
    return null;
  }
}

/**
 * Calculate total rounds needed
 */
export function calculateTotalRounds(teamCount: number): number {
  return Math.ceil(Math.log2(teamCount));
}

/**
 * Calculate matches in round
 */
export function calculateMatchesInRound(teamCount: number, roundNumber: number): number {
  const totalRounds = calculateTotalRounds(teamCount);
  const matchesInFirstRound = Math.floor(teamCount / 2);
  return Math.floor(matchesInFirstRound / Math.pow(2, roundNumber - 1));
}
