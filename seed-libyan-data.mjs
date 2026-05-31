import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the JSON data
const dataPath = path.join(__dirname, '../libyan_data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const { teams, players } = JSON.parse(rawData);

console.log('📊 Libyan Football Data Seeding Script');
console.log('=====================================\n');

console.log(`✅ Loaded ${teams.length} teams`);
console.log(`✅ Loaded ${players.length} players\n`);

console.log('Teams to seed:');
teams.forEach((team, idx) => {
  console.log(`  ${idx + 1}. ${team.name} (${team.playerCount} players)`);
});

console.log('\nPlayers by team:');
const playersByTeam = {};
players.forEach(player => {
  if (!playersByTeam[player.team]) {
    playersByTeam[player.team] = [];
  }
  playersByTeam[player.team].push(player);
});

Object.entries(playersByTeam).forEach(([teamName, teamPlayers]) => {
  console.log(`\n${teamName}:`);
  teamPlayers.forEach(player => {
    console.log(`  - ${player.name} (#${player.number}) - ${player.position}`);
  });
});

console.log('\n✅ Data ready for database seeding!');
console.log('Run: pnpm run seed:libyan');
