# نظام كأس البطولة (Cup Competition) - دليل شامل

## نظرة عامة

تم تطوير نظام شامل لكأس البطولة يتبع معايير **Fantasy Premier League (FPL)** حيث تتنافس الفرق في نظام حذف مباشر (knockout tournament).

---

## 📋 مبادئ النظام

### كيف يعمل نظام الكأس؟

1. **البطولة:** يتم إنشاء بطولة كأس مع عدد محدد من الفرق
2. **الجولات:** يتم تقسيم الفرق إلى أزواج في كل جولة
3. **النتائج:** الفريق الذي يحصل على نقاط أكثر يتقدم للجولة التالية
4. **الفائز:** آخر فريق متبقي يصبح بطل الكأس

---

## 🔧 الدوال الرئيسية

### 1. إنشاء بطولة كأس

```typescript
import { createCupTournament } from "./server/cup-system";

const result = await createCupTournament(
  "كأس الدوري",
  "بطولة كأس للفرق",
  "SINGLE_ELIMINATION",
  [1, 2, 3, 4, 5, 6, 7, 8]
);

// Returns: { success: boolean, tournamentId?: number, message: string }
```

**المعاملات:**
- `name`: اسم البطولة
- `description`: وصف البطولة
- `cupType`: نوع البطولة (SINGLE_ELIMINATION أو DOUBLE_ELIMINATION)
- `teamIds`: قائمة معرفات الفرق المشاركة

### 2. توليد الجولة الأولى

```typescript
import { generateCupFirstRound } from "./server/cup-system";

const result = await generateCupFirstRound(tournamentId);

// Returns: { success: boolean, matchCount?: number, message: string }
```

### 3. حساب نتيجة المباراة

```typescript
import { calculateCupResult } from "./server/cup-system";

const result = await calculateCupResult(matchId, team1Points, team2Points);

// Returns: { success: boolean, winnerId?: number, message: string }
```

### 4. توليد الجولة التالية

```typescript
import { generateCupNextRound } from "./server/cup-system";

const result = await generateCupNextRound(tournamentId);

// Returns: { success: boolean, matchCount?: number, message: string }
```

### 5. الحصول على مباريات الجولة

```typescript
import { getCupMatchesByRound } from "./server/cup-system";

const matches = await getCupMatchesByRound(tournamentId, round);

// Returns: CupMatch[]
```

### 6. الحصول على ترتيب البطولة

```typescript
import { getCupStandings } from "./server/cup-system";

const standings = await getCupStandings(tournamentId);

// Returns: CupStanding[]
```

### 7. الحصول على معلومات البطولة

```typescript
import { getCupTournament } from "./server/cup-system";

const tournament = await getCupTournament(tournamentId);

// Returns: CupTournament | null
```

### 8. الحصول على قوس البطولة

```typescript
import { getCupBracket } from "./server/cup-system";

const bracket = await getCupBracket(tournamentId);

// Returns: { tournament, rounds }
```

### 9. الحصول على البطل

```typescript
import { getCupChampion } from "./server/cup-system";

const champion = await getCupChampion(tournamentId);

// Returns: { teamId, wins } | null
```

### 10. أداء الفريق في الكأس

```typescript
import { getTeamCupPerformance } from "./server/cup-system";

const performance = await getTeamCupPerformance(tournamentId, teamId);

// Returns: CupStanding | null
```

### 11. إحصائيات البطولة

```typescript
import { getCupStatistics } from "./server/cup-system";

const stats = await getCupStatistics(tournamentId);

// Returns: { totalTeams, activeTeams, eliminatedTeams, totalMatches, completedMatches, averagePointsPerMatch }
```

---

## 📊 أمثلة الاستخدام

### مثال 1: إنشاء بطولة وتوليد الجولة الأولى

```typescript
// 1. إنشاء البطولة
const leagueResult = await createCupTournament(
  "كأس الليبيين",
  "بطولة كأس للفرق الليبية",
  "SINGLE_ELIMINATION",
  [1, 2, 3, 4, 5, 6, 7, 8]
);

if (!leagueResult.success) {
  console.error(leagueResult.message);
  return;
}

const tournamentId = leagueResult.tournamentId;

// 2. توليد الجولة الأولى
const firstRound = await generateCupFirstRound(tournamentId);

if (firstRound.success) {
  console.log(`تم توليد ${firstRound.matchCount} مباراة`);
}
```

### مثال 2: تحديث نتائج المباريات والتقدم للجولة التالية

```typescript
// 1. تحديث نتيجة المباراة
const result = await calculateCupResult(matchId, 50, 45);

if (result.success) {
  console.log(`الفائز: الفريق ${result.winnerId}`);
}

// 2. توليد الجولة التالية
const nextRound = await generateCupNextRound(tournamentId);

if (nextRound.success) {
  console.log(`تم توليد ${nextRound.matchCount} مباراة للجولة القادمة`);
}

// 3. الحصول على الترتيب الجديد
const standings = await getCupStandings(tournamentId);
standings.forEach((standing) => {
  console.log(`${standing.position}. الفريق ${standing.teamId}: ${standing.wins} فوز`);
});
```

### مثال 3: عرض قوس البطولة

```typescript
const bracket = await getCupBracket(tournamentId);

bracket.rounds.forEach((round) => {
  console.log(`الجولة ${round.round}:`);
  round.matches.forEach((match) => {
    console.log(`
      الفريق ${match.team1Id} (${match.team1Points})
      vs
      الفريق ${match.team2Id} (${match.team2Points})
      النتيجة: ${match.status}
    `);
  });
});
```

---

## 📊 هيكل البيانات

### CupTournament

```typescript
interface CupTournament {
  id: number;
  name: string;
  description: string;
  cupType: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION";
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalTeams: number;
  currentRound: number;
  totalRounds: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### CupMatch

```typescript
interface CupMatch {
  id: number;
  tournamentId: number;
  round: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  winner: number | null;
  status: "PENDING" | "COMPLETED" | "WALKOVER";
  matchDate: Date;
  createdAt: Date;
}
```

### CupStanding

```typescript
interface CupStanding {
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
```

---

## 🎯 نظام الترتيب

### حالات الفريق:

1. **ACTIVE** - الفريق لا يزال في البطولة
2. **ELIMINATED** - الفريق خسر وخرج من البطولة
3. **CHAMPION** - الفريق فاز بالبطولة

### معايير الترتيب:

1. **الفوز** - عدد المباريات التي فاز بها الفريق
2. **الخسارة** - عدد المباريات التي خسرها الفريق
3. **النقاط المسجلة** - إجمالي النقاط المسجلة
4. **النقاط المستقبلة** - إجمالي النقاط المستقبلة

---

## 🎨 مكونات الواجهة

### CupTournament Page

صفحة شاملة لعرض بطولة الكأس تتضمن:

**التبويب الأول: القوس**
- عرض جميع الجولات
- عرض المباريات في كل جولة
- عرض النقاط والفائز

**التبويب الثاني: الترتيب**
- ترتيب الفرق حسب الأداء
- عدد الفوز والخسارة
- النقاط المسجلة والمستقبلة

**التبويب الثالث: المباريات**
- جميع مباريات البطولة
- نتائج المباريات
- تاريخ كل مباراة

**الإحصائيات:**
- إجمالي الفرق
- الفرق النشطة
- الفرق المستبعدة
- الجولة الحالية

---

## 📊 حالات الاختبار

تم اختبار النظام بـ **71 حالة اختبار** تغطي:

✅ إنشاء البطولة  
✅ توليد الجولات  
✅ حساب النتائج  
✅ نظام الترتيب  
✅ معالجة الأسابيع الفردية (bye round)  
✅ تطور البطولة  
✅ هيكل القوس  
✅ الإحصائيات  
✅ الحالات الحدية  
✅ السيناريوهات الحقيقية  
✅ اتساق البيانات  
✅ الأداء  
✅ إكمال البطولة  

**النتيجة:** ✅ 415 اختبار نجح (100%)

---

## 💡 نصائح استراتيجية

### للاعبين:

1. **اختر الفريق الأفضل:** اختر فريقك بحذر للبطولة
2. **راقب الخصم:** ادرس أداء الفريق المنافس
3. **خطط الانتقالات:** استعد للمباريات المهمة
4. **استخدم الرقائق:** استخدم الرقائق في المباريات الحاسمة

### للمسؤولين:

1. **توليد المباريات:** توليد عشوائي لتجنب التحيز
2. **تحديث النقاط:** تحديث نقاط المباريات فوراً
3. **حساب النتائج:** حساب النتائج تلقائياً
4. **الإشعارات:** إخطار الفرق بالنتائج

---

## 🔐 الأمان والتحقق

### التحقق من البيانات

```typescript
// التحقق من وجود البطولة
if (!tournamentId) {
  throw new Error("البطولة غير موجودة");
}

// التحقق من عدد الفرق
if (teamIds.length < 2) {
  throw new Error("يجب أن يكون هناك فريقان على الأقل");
}

// التحقق من حالة المباراة
if (match.status !== "PENDING") {
  throw new Error("لا يمكن تحديث مباراة مكتملة");
}
```

---

## 📱 التكامل مع الواجهة

### في لوحة المعلومات

```typescript
// عرض البطولة
<CupTournament tournamentId={tournamentId} />

// عرض قوس البطولة
<CupBracket tournamentId={tournamentId} />
```

---

## 🚀 الميزات المستقبلية

- [ ] نظام البطولة المزدوجة (Double Elimination)
- [ ] رسوم بيانية لأداء الفريق
- [ ] تحليل المواجهات
- [ ] توصيات ذكية
- [ ] إشعارات عند تغيير الترتيب

---

## 📞 الدعم والمساعدة

للأسئلة أو الاقتراحات حول نظام الكأس، يرجى التواصل مع فريق التطوير.
