import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { teams } from '../drizzle/schema.js';

const clubs = [
  { name: 'الأهلي بنغازي', city: 'بنغازي', founded: 1954 },
  { name: 'الأهلي طرابلس', city: 'طرابلس', founded: 1950 },
  { name: 'الهلال البيضاوي', city: 'البيضاء', founded: 1960 },
  { name: 'النصر الزاوية', city: 'الزاوية', founded: 1965 },
  { name: 'الفيصلي الزاوية', city: 'الزاوية', founded: 1970 },
  { name: 'الشرطة طرابلس', city: 'طرابلس', founded: 1975 },
  { name: 'الاتحاد بنغازي', city: 'بنغازي', founded: 1968 },
  { name: 'الثورة الزاوية', city: 'الزاوية', founded: 1972 },
  { name: 'الجيش طرابلس', city: 'طرابلس', founded: 1980 },
  { name: 'الوحدة سرت', city: 'سرت', founded: 1978 },
];

async function seedClubs() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  try {
    console.log('🌱 Starting to seed Libyan football clubs...');
    
    for (const club of clubs) {
      await db.insert(teams).values({
        teamName: club.name,
        city: club.city,
        foundedYear: club.founded,
      });
      console.log(`✅ Added: ${club.name}`);
    }

    console.log('\n✨ Successfully added all 10 Libyan football clubs!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding clubs:', error.message);
    process.exit(1);
  }
}

seedClubs();
