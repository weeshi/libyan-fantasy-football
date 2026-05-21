/**
 * Head-to-Head Leagues System for Talba Fantasy Football
 * Implements direct competition between pairs of teams
 */

import { getDb } from "./db";
import { leagues, userTeams } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * H2H Match result
 */
export interface H2HMatch {
  id: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  gameweekId: number;
  winner: number | null; // 1 for team1, 2 for team2, null for draw
  status: "upcoming" | "active" | "completed";
}

/**
 * H2H League standings
 */
export interface H2HStanding {
  userTeamId: number;
  teamName: string;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  totalPoints: number;
  rank: number;
}

/**
 * Create Head-to-Head league table (if not exists)
 */
export async function createH2HTablesIfNotExists(): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Create h2h_matches table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS h2h_matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leagueId INT NOT NULL,
        team1Id INT NOT NULL,
        team2Id INT NOT NULL,
        team1Points INT DEFAULT 0,
        team2Points INT DEFAULT 0,
        gameweekId INT NOT NULL,
        winner INT,
        status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (leagueId) REFERENCES leagues(id),
        FOREIGN KEY (team1Id) REFERENCES userTeams(id),
        FOREIGN KEY (team2Id) REFERENCES userTeams(id),
        FOREIGN KEY (gameweekId) REFERENCES gameweeks(id)
      )
    `);

    // Create h2h_standings table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS h2h_standings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leagueId INT NOT NULL,
        userTeamId INT NOT NULL,
        wins INT DEFAULT 0,
        draws INT DEFAULT 0,
        losses INT DEFAULT 0,
        pointsFor INT DEFAULT 0,
        pointsAgainst INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (leagueId) REFERENCES leagues(id),
        FOREIGN KEY (userTeamId) REFERENCES userTeams(id),
        UNIQUE KEY unique_league_team (leagueId, userTeamId)
      )
    `);

    return true;
  } catch (error) {
    console.error("Failed to create H2H tables:", error);
    return false;
  }
}

/**
 * Generate H2H matchups for a gameweek
 */
export async function generateH2HMatchups(leagueId: number, gameweekId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get all teams in the league
    const teams = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.leagueId, leagueId));

    if (teams.length < 2) {
      console.log("Not enough teams for H2H matchups");
      return false;
    }

    // Create round-robin matchups
    const matchups: Array<{ team1Id: number; team2Id: number }> = [];

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matchups.push({
          team1Id: teams[i].id,
          team2Id: teams[j].id,
        });
      }
    }

    // Insert matchups
    for (const matchup of matchups) {
      await db.execute(`
        INSERT INTO h2h_matches (leagueId, team1Id, team2Id, gameweekId, status)
        VALUES (${leagueId}, ${matchup.team1Id}, ${matchup.team2Id}, ${gameweekId}, 'upcoming')
      `);
    }

    return true;
  } catch (error) {
    console.error("Failed to generate H2H matchups:", error);
    return false;
  }
}

/**
 * Update H2H match result
 */
export async function updateH2HMatchResult(
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
    }

    await db.execute(`
      UPDATE h2h_matches
      SET team1Points = ${team1Points}, team2Points = ${team2Points}, winner = ${winner}, status = 'completed'
      WHERE id = ${matchId}
    `);

    // Update standings
    const match = await db.execute(`SELECT * FROM h2h_matches WHERE id = ${matchId}`);
    if (match.length > 0) {
      const m = match[0];
      await updateH2HStandings(m.leagueId, m.team1Id, m.team2Id, team1Points, team2Points, winner);
    }

    return { success: true, message: "تم تحديث نتيجة المباراة" };
  } catch (error) {
    console.error("Failed to update H2H match result:", error);
    return { success: false, message: "فشل تحديث النتيجة" };
  }
}

/**
 * Update H2H standings
 */
async function updateH2HStandings(
  leagueId: number,
  team1Id: number,
  team2Id: number,
  team1Points: number,
  team2Points: number,
  winner: number | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Initialize standings if not exists
    await db.execute(`
      INSERT IGNORE INTO h2h_standings (leagueId, userTeamId)
      VALUES (${leagueId}, ${team1Id}), (${leagueId}, ${team2Id})
    `);

    if (winner === 1) {
      // Team 1 wins
      await db.execute(`
        UPDATE h2h_standings
        SET wins = wins + 1, pointsFor = pointsFor + ${team1Points}, pointsAgainst = pointsAgainst + ${team2Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team1Id}
      `);

      await db.execute(`
        UPDATE h2h_standings
        SET losses = losses + 1, pointsFor = pointsFor + ${team2Points}, pointsAgainst = pointsAgainst + ${team1Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team2Id}
      `);
    } else if (winner === 2) {
      // Team 2 wins
      await db.execute(`
        UPDATE h2h_standings
        SET losses = losses + 1, pointsFor = pointsFor + ${team1Points}, pointsAgainst = pointsAgainst + ${team2Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team1Id}
      `);

      await db.execute(`
        UPDATE h2h_standings
        SET wins = wins + 1, pointsFor = pointsFor + ${team2Points}, pointsAgainst = pointsAgainst + ${team1Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team2Id}
      `);
    } else {
      // Draw
      await db.execute(`
        UPDATE h2h_standings
        SET draws = draws + 1, pointsFor = pointsFor + ${team1Points}, pointsAgainst = pointsAgainst + ${team2Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team1Id}
      `);

      await db.execute(`
        UPDATE h2h_standings
        SET draws = draws + 1, pointsFor = pointsFor + ${team2Points}, pointsAgainst = pointsAgainst + ${team1Points}
        WHERE leagueId = ${leagueId} AND userTeamId = ${team2Id}
      `);
    }
  } catch (error) {
    console.error("Failed to update H2H standings:", error);
  }
}

/**
 * Get H2H standings for a league
 */
export async function getH2HStandings(leagueId: number): Promise<H2HStanding[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const standings = await db.execute(`
      SELECT 
        s.userTeamId,
        ut.teamName,
        s.wins,
        s.draws,
        s.losses,
        s.pointsFor,
        s.pointsAgainst,
        (s.pointsFor - s.pointsAgainst) as pointDifference,
        (s.wins * 3 + s.draws) as totalPoints
      FROM h2h_standings s
      JOIN userTeams ut ON s.userTeamId = ut.id
      WHERE s.leagueId = ${leagueId}
      ORDER BY totalPoints DESC, pointDifference DESC
    `);

    return standings.map((s, index) => ({
      userTeamId: s.userTeamId,
      teamName: s.teamName,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      pointDifference: s.pointDifference,
      totalPoints: s.totalPoints,
      rank: index + 1,
    }));
  } catch (error) {
    console.error("Failed to get H2H standings:", error);
    return [];
  }
}

/**
 * Get H2H matches for a gameweek
 */
export async function getH2HMatches(leagueId: number, gameweekId: number) {
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
        m.gameweekId,
        m.winner,
        m.status,
        t1.teamName as team1Name,
        t2.teamName as team2Name
      FROM h2h_matches m
      JOIN userTeams t1 ON m.team1Id = t1.id
      JOIN userTeams t2 ON m.team2Id = t2.id
      WHERE m.leagueId = ${leagueId} AND m.gameweekId = ${gameweekId}
      ORDER BY m.status DESC, m.id
    `);

    return matches;
  } catch (error) {
    console.error("Failed to get H2H matches:", error);
    return [];
  }
}

/**
 * Calculate H2H points (3 for win, 1 for draw, 0 for loss)
 */
export function calculateH2HPoints(team1Points: number, team2Points: number): { team1: number; team2: number } {
  if (team1Points > team2Points) {
    return { team1: 3, team2: 0 };
  } else if (team2Points > team1Points) {
    return { team1: 0, team2: 3 };
  } else {
    return { team1: 1, team2: 1 };
  }
}
