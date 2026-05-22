# نظام دوري المنافسة المباشرة (Head-to-Head) - دليل شامل

## نظرة عامة

تم تطوير نظام شامل لدوري المنافسة المباشرة يتبع معايير **Fantasy Premier League (FPL)** حيث يتنافس الفرق بشكل مباشر كل أسبوع.

---

## 📋 مبادئ النظام

### كيف يعمل دوري H2H؟

1. **المباريات الأسبوعية:** يتم توليد مباريات عشوائية بين الفرق كل أسبوع
2. **المقارنة المباشرة:** يتم مقارنة نقاط الفريقين مباشرة
3. **نظام النقاط:** 3 نقاط للفوز، 1 للتعادل، 0 للخسارة
4. **الترتيب:** يتم ترتيب الفرق حسب النقاط والفارق

---

## 🔧 الدوال الرئيسية

### 1. إنشاء دوري H2H

```typescript
import { createH2HLeague } from "./server/h2h-system";

const result = await createH2HLeague(
  "دوري الأصدقاء",
  "منافسة مباشرة بين الأصدقاء",
  userId
);

// Returns: { success: boolean, leagueId?: number, message: string }
```

### 2. توليد المباريات الأسبوعية

```typescript
import { generateH2HMatches } from "./server/h2h-system";

const result = await generateH2HMatches(leagueId, gameweekId);

// Returns: { success: boolean, matchCount?: number, message: string }
```

**الخوارزمية:**
- تقسيم الفرق إلى أزواج عشوائية
- تجنب تكرار نفس المباريات
- معالجة عدد فردي من الفرق (bye round)

### 3. حساب نتائج المباريات

```typescript
import { calculateH2HResults } from "./server/h2h-system";

const result = await calculateH2HResults(leagueId, gameweekId);

// Returns: { success: boolean, updatedCount?: number, message: string }
```

### 4. الحصول على الترتيب

```typescript
import { getH2HStandings } from "./server/h2h-system";

const standings = await getH2HStandings(leagueId);

// Returns: H2HStanding[]
```

### 5. الحصول على المباريات

```typescript
import { getH2HMatches } from "./server/h2h-system";

const matches = await getH2HMatches(leagueId, gameweekId);

// Returns: H2HMatch[]
```

### 6. سجل المباريات

```typescript
import { getH2HMatchHistory } from "./server/h2h-system";

const history = await getH2HMatchHistory(leagueId, teamId, limit);

// Returns: H2HMatch[]
```

### 7. تحديث نقاط المباراة

```typescript
import { updateH2HMatchPoints } from "./server/h2h-system";

const result = await updateH2HMatchPoints(matchId, team1Points, team2Points);

// Returns: { success: boolean, message: string }
```

### 8. الحصول على سجل المواجهة المباشرة

```typescript
import { getH2HHeadToHead } from "./server/h2h-system";

const h2h = await getH2HHeadToHead(leagueId, team1Id, team2Id);

// Returns: { team1Wins, team2Wins, draws, matches }
```

### 9. إحصائيات الدوري

```typescript
import { getH2HLeagueStats } from "./server/h2h-system";

const stats = await getH2HLeagueStats(leagueId);

// Returns: { totalTeams, totalMatches, totalDraws, totalWins, averagePointsPerMatch }
```

---

## 📊 أمثلة الاستخدام

### مثال 1: إنشاء دوري وتوليد مباريات

```typescript
// 1. إنشاء الدوري
const leagueResult = await createH2HLeague(
  "دوري الليبيين",
  "منافسة مباشرة للاعبي الدوري الليبي",
  ownerId
);

if (!leagueResult.success) {
  console.error(leagueResult.message);
  return;
}

const leagueId = leagueResult.leagueId;

// 2. توليد المباريات للأسبوع الأول
const matchResult = await generateH2HMatches(leagueId, 1);

if (matchResult.success) {
  console.log(`تم توليد ${matchResult.matchCount} مباراة`);
}
```

### مثال 2: حساب النتائج وتحديث الترتيب

```typescript
// 1. تحديث نقاط المباريات
await updateH2HMatchPoints(matchId, 50, 45);

// 2. حساب النتائج
const resultCalc = await calculateH2HResults(leagueId, gameweekId);

if (resultCalc.success) {
  console.log(`تم تحديث ${resultCalc.updatedCount} مباراة`);
}

// 3. الحصول على الترتيب الجديد
const standings = await getH2HStandings(leagueId);
standings.forEach((standing) => {
  console.log(`${standing.position}. ${standing.teamId}: ${standing.totalPoints} نقطة`);
});
```

### مثال 3: عرض المباريات الأسبوعية

```typescript
const matches = await getH2HMatches(leagueId, currentGameweek);

matches.forEach((match) => {
  console.log(`
    ${match.team1Id} (${match.team1Points}) 
    vs 
    ${match.team2Id} (${match.team2Points})
    النتيجة: ${match.result}
  `);
});
```

---

## 📊 هيكل البيانات

### H2HMatch

```typescript
interface H2HMatch {
  id: number;
  leagueId: number;
  gameweekId: number;
  team1Id: number;
  team2Id: number;
  team1Points: number;
  team2Points: number;
  result: "WIN" | "DRAW" | "LOSS" | null;
  matchDate: Date;
  createdAt: Date;
}
```

### H2HStanding

```typescript
interface H2HStanding {
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
```

---

## 🎯 نظام الترتيب

### معايير الترتيب (بالترتيب):

1. **إجمالي النقاط** (الأهم)
   - 3 نقاط للفوز
   - 1 نقطة للتعادل
   - 0 نقطة للخسارة

2. **فارق النقاط** (في حالة التساوي)
   - النقاط المسجلة - النقاط المستقبلة

3. **النقاط المسجلة** (في حالة التساوي الكامل)
   - إجمالي النقاط المسجلة من الفريق

### مثال على الترتيب:

```
المركز | الفريق        | ف | ت | خ | له | عليه | الفارق | النقاط
1      | فريق النجم    | 8 | 1 | 1 | 450| 380  | +70    | 25
2      | فريق الصقور   | 7 | 2 | 1 | 440| 390  | +50    | 23
3      | فريق الأسود   | 6 | 2 | 2 | 420| 410  | +10    | 20
4      | فريق الشرقاوي | 5 | 1 | 4 | 400| 430  | -30    | 16
```

---

## 🎨 مكونات الواجهة

### H2HLeague Page

صفحة شاملة لعرض دوري H2H تتضمن:

**التبويب الأول: الترتيب**
- بطاقات ملونة لكل فريق
- عرض الترتيب والنقاط
- فارق النقاط
- سجل الفوز والتعادل والخسارة

**التبويب الثاني: المباريات**
- نتائج المباريات الأسبوعية
- عرض النقاط لكل فريق
- حالة المباراة (فوز/تعادل/خسارة)
- تاريخ المباراة

**الإحصائيات:**
- إجمالي الفرق
- إجمالي المباريات
- متوسط النقاط
- الأسبوع الحالي

---

## 📊 حالات الاختبار

تم اختبار النظام بـ **80 حالة اختبار** تغطي:

✅ توليد المباريات (أحجام مختلفة)  
✅ حساب النتائج  
✅ نظام النقاط  
✅ الترتيب والتصنيف  
✅ سجل المواجهة المباشرة  
✅ معالجة الأسابيع الفردية (bye round)  
✅ الإحصائيات  
✅ الحالات الحدية  
✅ السيناريوهات الحقيقية  

**النتيجة:** ✅ 344 اختبار نجح (100%)

---

## 💡 نصائح استراتيجية

### للاعبين:

1. **راقب الترتيب:** تابع ترتيبك والفرق الأخرى
2. **ادرس المباريات:** انظر إلى نقاط الفرق الأخرى
3. **خطط الانتقالات:** استعد للمباريات القادمة
4. **استخدم الرقائق:** استخدم الرقائق في المباريات المهمة

### للمسؤولين:

1. **توليد المباريات:** توليد عشوائي لتجنب التحيز
2. **تحديث النقاط:** تحديث نقاط المباريات فوراً
3. **حساب النتائج:** حساب النتائج تلقائياً
4. **الإشعارات:** إخطار الفرق بالنتائج

---

## 🔐 الأمان والتحقق

### التحقق من البيانات

```typescript
// التحقق من وجود الدوري
if (!leagueId) {
  throw new Error("الدوري غير موجود");
}

// التحقق من وجود الأسبوع
if (!gameweekId) {
  throw new Error("الأسبوع غير موجود");
}

// التحقق من عدد الفرق
if (teamCount < 2) {
  throw new Error("يجب أن يكون هناك فريقان على الأقل");
}
```

---

## 📱 التكامل مع الواجهة

### في لوحة المعلومات

```typescript
// عرض الترتيب الحالي
<H2HLeague leagueId={leagueId} />

// عرض المباريات الأسبوعية
<H2HMatches leagueId={leagueId} gameweekId={currentGameweek} />
```

---

## 🚀 الميزات المستقبلية

- [ ] نظام الترتيب الحي مع تحديثات فورية
- [ ] رسوم بيانية لأداء الفريق
- [ ] تحليل المواجهات المباشرة
- [ ] توصيات ذكية للانتقالات
- [ ] إشعارات عند تغيير الترتيب

---

## 📞 الدعم والمساعدة

للأسئلة أو الاقتراحات حول نظام H2H، يرجى التواصل مع فريق التطوير.
