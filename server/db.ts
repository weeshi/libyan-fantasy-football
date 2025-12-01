import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userTeams, userTeamPlayers, players, leagues, transactions, InsertUserTeam, InsertUserTeamPlayer, InsertTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Teams
export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(1000);
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, teamId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Players
export async function getPlayersByTeamId(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  } catch (error) {
    console.error("[Database] Failed to get players by team:", error);
    return [];
  }
}

export async function getAllPlayers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(players).limit(1000);
  } catch (error) {
    console.error("[Database] Failed to get all players:", error);
    return [];
  }
}

// Leagues
export async function getLeaguesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return [];
}

export async function getLeagueById(leagueId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return undefined;
}

// User Teams
export async function getUserTeamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(userTeams).where(eq(userTeams.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get user teams:", error);
    return [];
  }
}

export async function getUserTeamById(userTeamId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(userTeams).where(eq(userTeams.id, userTeamId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user team:", error);
    return undefined;
  }
}

export async function createUserTeam(data: InsertUserTeam) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.insert(userTeams).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create user team:", error);
    throw error;
  }
}

export async function addPlayerToUserTeam(data: InsertUserTeamPlayer) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    return await db.insert(userTeamPlayers).values(data);
  } catch (error) {
    console.error("[Database] Failed to add player to user team:", error);
    throw error;
  }
}

export async function getUserTeamPlayers(userTeamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(userTeamPlayers).where(eq(userTeamPlayers.userTeamId, userTeamId));
  } catch (error) {
    console.error("[Database] Failed to get user team players:", error);
    return [];
  }
}

export async function getPlayerById(playerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get player:", error);
    return undefined;
  }
}

export async function updatePlayerPrice(playerId: number, newPrice: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(players).set({ marketValue: newPrice }).where(eq(players.id, playerId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update player price:", error);
    throw error;
  }
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    return await db.insert(transactions).values(data);
  } catch (error) {
    console.error("[Database] Failed to create transaction:", error);
    throw error;
  }
}

export async function getTransactionsByUserTeam(userTeamId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(transactions).where(eq(transactions.userTeamId, userTeamId));
  } catch (error) {
    console.error("[Database] Failed to get transactions:", error);
    return [];
  }
}

export async function updateUserTeamBudget(userTeamId: number, newBudget: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    await db.update(userTeams).set({ budget: newBudget }).where(eq(userTeams.id, userTeamId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update team budget:", error);
    throw error;
  }
}


// Leaderboard functions
export async function getLeagueLeaderboard(leagueId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.leagueId, leagueId))
      .orderBy(userTeams.totalPoints);
    return result.reverse(); // Sort by points descending
  } catch (error) {
    console.error("[Database] Failed to get league leaderboard:", error);
    return [];
  }
}

export async function updateTeamStatistics(
  userTeamId: number,
  stats: {
    totalPoints?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    assists?: number;
    wins?: number;
    draws?: number;
    losses?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const updateData: any = {};
    if (stats.totalPoints !== undefined) updateData.totalPoints = stats.totalPoints;
    if (stats.goalsFor !== undefined) updateData.goalsFor = stats.goalsFor;
    if (stats.goalsAgainst !== undefined) updateData.goalsAgainst = stats.goalsAgainst;
    if (stats.assists !== undefined) updateData.assists = stats.assists;
    if (stats.wins !== undefined) updateData.wins = stats.wins;
    if (stats.draws !== undefined) updateData.draws = stats.draws;
    if (stats.losses !== undefined) updateData.losses = stats.losses;

    await db.update(userTeams).set(updateData).where(eq(userTeams.id, userTeamId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update team statistics:", error);
    throw error;
  }
}

export async function getUserTeamWithStats(userTeamId: number) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db
      .select()
      .from(userTeams)
      .where(eq(userTeams.id, userTeamId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user team with stats:", error);
    return null;
  }
}
