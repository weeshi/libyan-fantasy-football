import fs from 'fs';
import path from 'path';
import { getDb } from './db';

interface Team {
  name: string;
  playerCount: number;
}

interface Player {
  team: string;
  name: string;
  number: number;
  position: string;
}

interface LibyanData {
  teams: Team[];
  players: Player[];
}

/**
 * Seed Libyan football teams and players into the database
 */
export async function seedLibyanData(): Promise<{ success: boolean; message: string; stats: any }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: 'Database connection failed', stats: {} };
  }

  try {
    // Read the JSON data file
    const dataPath = path.join(process.cwd(), 'libyan_data.json');
    if (!fs.existsSync(dataPath)) {
      return { success: false, message: 'libyan_data.json not found', stats: {} };
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: LibyanData = JSON.parse(rawData);

    const stats = {
      teamsCreated: 0,
      playersCreated: 0,
      teamsSkipped: 0,
      playersSkipped: 0,
      errors: [] as string[]
    };

    // Seed teams
    for (const team of data.teams) {
      try {
        // Check if team already exists
        const existing = await db.execute(`SELECT id FROM teams WHERE name = '${team.name.replace(/'/g, "''")}'`);
        
        if (Array.isArray(existing) && existing.length > 0) {
          stats.teamsSkipped++;
          continue;
        }

        // Insert team
        await db.execute(`
          INSERT INTO teams (name, city, createdAt)
          VALUES ('${team.name.replace(/'/g, "''")}', 'Libya', NOW())
        `);
        stats.teamsCreated++;
      } catch (error) {
        stats.errors.push(`Error creating team ${team.name}: ${error}`);
      }
    }

    // Seed players
    for (const player of data.players) {
      try {
        // Get team ID
        const teamResult = await db.execute(`
          SELECT id FROM teams WHERE name = '${player.team.replace(/'/g, "''")}'
        `);
        
        if (!Array.isArray(teamResult) || teamResult.length === 0) {
          stats.playersSkipped++;
          continue;
        }

        const teamId = (teamResult[0] as any).id;

        // Check if player already exists
        const existing = await db.execute(`
          SELECT id FROM players 
          WHERE name = '${player.name.replace(/'/g, "''")}' AND teamId = ${teamId}
        `);
        
        if (Array.isArray(existing) && existing.length > 0) {
          stats.playersSkipped++;
          continue;
        }

        // Map position to player type
        const positionLower = player.position.toLowerCase();
        let playerType = 'MID'; // Default to midfielder
        
        if (positionLower.includes('حارس') || positionLower.includes('goalkeeper')) {
          playerType = 'GK';
        } else if (positionLower.includes('مدافع') || positionLower.includes('defender')) {
          playerType = 'DEF';
        } else if (positionLower.includes('مهاجم') || positionLower.includes('forward')) {
          playerType = 'FWD';
        } else if (positionLower.includes('وسط') || positionLower.includes('midfielder')) {
          playerType = 'MID';
        }

        // Insert player
        await db.execute(`
          INSERT INTO players (name, teamId, playerType, number, createdAt)
          VALUES (
            '${player.name.replace(/'/g, "''")}',
            ${teamId},
            '${playerType}',
            ${player.number},
            NOW()
          )
        `);
        stats.playersCreated++;
      } catch (error) {
        stats.errors.push(`Error creating player ${player.name}: ${error}`);
      }
    }

    return {
      success: true,
      message: `✅ Seeding completed successfully!`,
      stats
    };
  } catch (error) {
    console.error('Seeding error:', error);
    return {
      success: false,
      message: `❌ Seeding failed: ${error}`,
      stats: {}
    };
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLibyanData().then(result => {
    console.log(result.message);
    console.log('Stats:', result.stats);
    process.exit(result.success ? 0 : 1);
  });
}
