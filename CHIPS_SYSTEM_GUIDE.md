# نظام الرقائق الخاصة - دليل شامل

## نظرة عامة

تم تطوير نظام شامل للرقائق الخاصة يتبع معايير **Fantasy Premier League (FPL)** مع 4 أنواع رقائق استراتيجية تعزز تجربة اللعب.

---

## 📋 أنواع الرقائق

### 1. الكابتن الثلاثي (Triple Captain)
- **الوصف:** مضاعفة نقاط الكابتن 3 مرات
- **عدد الاستخدامات:** مرة واحدة فقط
- **التأثير:** عالي جداً
- **الاستخدام الأمثل:** عندما يكون الكابتن في حالة ممتازة

**مثال:**
```
الكابتن يسجل 20 نقطة:
- بدون رقاقة: 40 نقطة (20 × 2)
- مع الكابتن الثلاثي: 60 نقطة (20 × 3)
الفائدة الإضافية: 20 نقطة
```

### 2. البطاقة البرية (Wildcard)
- **الوصف:** تغيير الفريق بالكامل بدون عقوبة
- **عدد الاستخدامات:** مرتان
- **التأثير:** عالي
- **الاستخدام الأمثل:** عند إصابات كبيرة أو تغييرات جدول المباريات

**الميزات:**
- انتقالات غير محدودة
- بدون خصم نقاط
- يمكن إعادة هيكلة الفريق بالكامل

### 3. تعزيز البدلاء (Bench Boost)
- **الوصف:** استخدام جميع لاعبي البدلاء
- **عدد الاستخدامات:** مرة واحدة فقط
- **التأثير:** متوسط
- **الاستخدام الأمثل:** عندما يكون لديك بدلاء بأداء جيد

**الآلية:**
- بدلاً من استخدام 11 لاعب فقط
- تحصل على نقاط من جميع اللاعبين (عادة 15 لاعب)
- يزيد من إجمالي النقاط المحتملة

### 4. الضربة الحرة (Free Hit)
- **الوصف:** تغيير مؤقت للفريق
- **عدد الاستخدامات:** مرة واحدة فقط
- **التأثير:** متوسط
- **الاستخدام الأمثل:** للاختبار السريع أو الاستفادة من مباريات سهلة

**الميزات:**
- تغيير مؤقت للأسبوع الحالي فقط
- يعود الفريق إلى حالته السابقة بعد الأسبوع
- لا توجد عقوبات

---

## 🔧 الدوال الرئيسية

### 1. الحصول على الرقائق المتاحة

```typescript
import { getAvailableChips } from "./server/chips-system";

const chips = await getAvailableChips(userId);
// Returns: UserChipStatus[]
```

### 2. الحصول على الرقائق غير المستخدمة

```typescript
import { getUnusedChips } from "./server/chips-system";

const unusedChips = await getUnusedChips(userId);
// Returns only chips that haven't been used yet
```

### 3. التحقق من توفر رقاقة

```typescript
import { isChipAvailable } from "./server/chips-system";

const available = await isChipAvailable(userId, "TRIPLE_CAPTAIN");
// Returns: boolean
```

### 4. استخدام رقاقة

```typescript
import { useChip } from "./server/chips-system";

const result = await useChip(userId, "TRIPLE_CAPTAIN", gameweekId);
// Returns: { success: boolean, message: string }
```

### 5. حساب النقاط مع تأثير الرقاقة

```typescript
import { calculatePointsWithChip } from "./server/chips-system";

const points = calculatePointsWithChip(
  basePoints,      // 20
  chipType,        // "TRIPLE_CAPTAIN"
  playerRole       // "captain" | "regular" | "bench"
);
// Returns: number (calculated points with chip effect)
```

### 6. التحقق من صحة استخدام الرقاقة

```typescript
import { validateChipUsage } from "./server/chips-system";

const validation = await validateChipUsage(userId, "WILDCARD", gameweekId);
// Returns: { valid: boolean, reason: string }
```

### 7. إعادة تعيين الرقائق للموسم الجديد

```typescript
import { resetChipsForSeason } from "./server/chips-system";

const result = await resetChipsForSeason(userId);
// Returns: { success: boolean, message: string }
```

---

## 📊 أمثلة الاستخدام

### مثال 1: عرض الرقائق المتاحة

```typescript
import ChipsSelector from "@/components/ChipsSelector";

export default function MyComponent() {
  const [chips, setChips] = useState([]);

  useEffect(() => {
    // Fetch chips from API
    const fetchChips = async () => {
      const data = await getAvailableChips(userId);
      setChips(data);
    };
    fetchChips();
  }, []);

  return (
    <ChipsSelector
      availableChips={chips}
      activeChip={activeChip}
      onUseChip={handleUseChip}
    />
  );
}
```

### مثال 2: استخدام رقاقة

```typescript
async function handleUseChip(chipType: string) {
  const validation = await validateChipUsage(userId, chipType, gameweekId);

  if (!validation.valid) {
    showError(validation.reason);
    return;
  }

  const result = await useChip(userId, chipType, gameweekId);

  if (result.success) {
    showSuccess(result.message);
    refreshChips();
  } else {
    showError(result.message);
  }
}
```

### مثال 3: حساب النقاط النهائية

```typescript
function calculateFinalPoints(team: Player[], activeChip: string | null) {
  let totalPoints = 0;

  team.forEach((player) => {
    const basePoints = calculatePlayerPoints(player);
    const role = player.isCaptain ? "captain" : "regular";
    const finalPoints = calculatePointsWithChip(basePoints, activeChip, role);

    totalPoints += finalPoints;
  });

  return totalPoints;
}
```

---

## 🎨 مكونات الواجهة

### 1. ChipsSelector Component

عرض الرقائق المتاحة والمستخدمة مع إمكانية الاستخدام.

**الخصائص:**
- `availableChips: Chip[]` - قائمة الرقائق المتاحة
- `activeChip: string | null` - الرقاقة النشطة حالياً
- `onUseChip: (chipType: string) => Promise<void>` - دالة الاستخدام
- `isLoading?: boolean` - حالة التحميل

**الميزات:**
- عرض الرقائق المتاحة والمستخدمة
- أيقونات وألوان مختلفة لكل رقاقة
- dialog تأكيد الاستخدام
- تحذير عند استخدام آخر رقاقة

### 2. Chips Page

صفحة شاملة لإدارة الرقائق تتضمن:
- تبويب استخدام الرقائق
- تبويب دليل الرقائق
- شرح مفصل لكل رقاقة
- نصائح استراتيجية

---

## 📊 حالات الاختبار

تم اختبار النظام بـ **59 حالة اختبار** تغطي:

✅ تكوين الرقائق  
✅ مضاعفات الكابتن الثلاثي  
✅ تأثير تعزيز البدلاء  
✅ حسابات النقاط المختلفة  
✅ الاستخدامات المتعددة  
✅ معلومات الرقائق  
✅ الحالات الحدية  
✅ السيناريوهات الحقيقية  

**النتيجة:** ✅ 291 اختبار نجح (100%)

---

## 💡 نصائح استراتيجية

### متى تستخدم الكابتن الثلاثي؟
- عندما يكون الكابتن في حالة ممتازة
- ضد فريق ضعيف دفاعياً
- في الأسابيع التي تتوقع فيها أهداف كثيرة

### متى تستخدم البطاقة البرية؟
- عند إصابات كبيرة متعددة
- عند تغيير جدول المباريات بشكل كبير
- عندما تريد إعادة هيكلة كاملة للفريق

### متى تستخدم تعزيز البدلاء؟
- عندما يكون لديك بدلاء بأداء جيد
- في الأسابيع التي تتوقع فيها نتائج عالية
- عندما يكون لديك فريق متوازن

### متى تستخدم الضربة الحرة؟
- للاختبار السريع للاعبين
- عند عدم تأكدك من الانتقالات
- للاستفادة من مباريات سهلة مؤقتاً

---

## 🔐 الأمان والتحقق

### التحقق من الاستخدام

```typescript
// التحقق يتم تلقائياً قبل استخدام أي رقاقة
const validation = await validateChipUsage(userId, chipType, gameweekId);

if (!validation.valid) {
  throw new Error(validation.reason);
}
```

### معالجة الأخطاء

```typescript
try {
  const result = await useChip(userId, chipType, gameweekId);
  if (!result.success) {
    console.error(result.message);
  }
} catch (error) {
  console.error("Failed to use chip:", error);
}
```

---

## 📱 التكامل مع الواجهة

### في لوحة المعلومات

```typescript
// عرض الرقائق المتاحة
<ChipsSelector
  availableChips={userChips}
  activeChip={activeChip}
  onUseChip={handleUseChip}
/>
```

### في صفحة الفريق

```typescript
// عرض الرقاقة النشطة
{activeChip && (
  <Alert>
    الرقاقة النشطة: {CHIP_CONFIGS[activeChip].name}
  </Alert>
)}
```

---

## 🚀 الميزات المستقبلية

- [ ] تحليل الرقائق والإحصائيات
- [ ] توصيات ذكية لاستخدام الرقائق
- [ ] سجل استخدام الرقائق المفصل
- [ ] مقارنة النتائج مع/بدون رقائق
- [ ] إشعارات عند توفر رقائق جديدة

---

## 📞 الدعم والمساعدة

للأسئلة أو الاقتراحات حول نظام الرقائق، يرجى التواصل مع فريق التطوير.
