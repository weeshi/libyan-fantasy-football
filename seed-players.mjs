import { drizzle } from "drizzle-orm/mysql2";
import { teams, players } from "./drizzle/schema.js";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Read the JSON data
const data = JSON.parse(fs.readFileSync("/home/ubuntu/libyan_football_data.json", "utf-8"));

// Map position names to standardized positions
const positionMap = {
  "حارس مرمى": "goalkeeper",
  "مدافع": "defender",
  "ظهير أيمن": "defender",
  "ظهير أيسر": "defender",
  "مدافع/وسط": "defender",
  "وسط": "midfielder",
  "وسط محوري": "midfielder",
  "وسط هجومي": "midfielder",
  "صانع ألعاب": "midfielder",
  "جناح": "forward",
  "جناح/مهاجم": "forward",
  "مهاجم": "forward",
  "مهاجم صريح": "forward",
  "وسط/قائد": "midfielder",
};

// Price mapping based on position and strength
const getPriceByPosition = (position, strength = 1) => {
  const basePrices = {
    goalkeeper: 5000000,
    defender: 6000000,
    midfielder: 7000000,
    forward: 8000000,
  };
  return (basePrices[position] || 6000000) * strength;
};

// Get strength factor based on player name patterns (experience indicators)
const getStrengthFactor = (playerName) => {
  // Names with common prefixes indicating experience
  if (playerName.includes("محمد") || playerName.includes("أحمد")) return 1.2;
  if (playerName.includes("علي") || playerName.includes("عبد")) return 1.1;
  return 1.0;
};

async function seedPlayers() {
  try {
    // Skip header row
    const rows = data.slice(1);
    
    // Group by team
    const teamMap = {};
    rows.forEach((row) => {
      const [teamName, playerName, jerseyNumber, position] = row;
      if (!teamMap[teamName]) {
        teamMap[teamName] = [];
      }
      teamMap[teamName].push({ playerName, jerseyNumber, position });
    });

    console.log(`Found ${Object.keys(teamMap).length} teams`);

    // Insert teams and players
    for (const [teamName, teamPlayers] of Object.entries(teamMap)) {
      console.log(`Processing team: ${teamName} with ${teamPlayers.length} players`);

      // Get or create team
      const existingTeams = await db.select().from(teams).where(eq(teams.name, teamName));
      let teamId;

      if (existingTeams.length > 0) {
        teamId = existingTeams[0].id;
      } else {
        const result = await db.insert(teams).values({
          name: teamName,
          city: "Libya",
        });
        teamId = result.insertId;
      }

      // Insert players
      for (const player of teamPlayers) {
        const position = positionMap[player.position] || "midfielder";
        const strength = getStrengthFactor(player.playerName);
        const marketValue = getPriceByPosition(position, strength);

        try {
          await db.insert(players).values({
            name: player.playerName,
            position,
            teamId,
            jerseyNumber: player.jerseyNumber || 0,
            marketValue,
            totalPoints: 0,
          });
          console.log(`  ✓ ${player.playerName} (${position}) - ${marketValue}`);
        } catch (error) {
          console.log(`  ⚠ ${player.playerName} - Already exists or error`);
        }
      }
    }

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding players:", error);
    process.exit(1);
  }
}

import { eq } from "drizzle-orm";
seedPlayers();
