import mysql from 'mysql2/promise';

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
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fantasy_football',
  });

  try {
    console.log('🌱 Starting to seed Libyan football clubs...');
    
    for (const club of clubs) {
      await connection.execute(
        'INSERT INTO teams (teamName, city, foundedYear) VALUES (?, ?, ?)',
        [club.name, club.city, club.founded]
      );
      console.log(`✅ Added: ${club.name}`);
    }

    console.log('\n✨ Successfully added all 10 Libyan football clubs!');
  } catch (error) {
    console.error('❌ Error seeding clubs:', error.message);
  } finally {
    await connection.end();
  }
}

seedClubs();
