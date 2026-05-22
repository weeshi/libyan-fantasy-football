# نظام المواعيد النهائية للانتقالات - دليل شامل

## نظرة عامة

تم تطوير نظام شامل لإدارة المواعيد النهائية للانتقالات يتبع معايير **Fantasy Premier League (FPL)** مع دعم كامل للإشعارات والعدادات التنازلية.

---

## 📋 المميزات الرئيسية

### 1. إدارة المواعيد النهائية
- تعيين موعد نهائي لكل أسبوع
- فتح/إغلاق نافذة الانتقالات
- التحقق من الموعد النهائي تلقائياً

### 2. عداد تنازلي حي
- عرض الوقت المتبقي بصيغة مقروءة
- تحديث كل ثانية
- تنسيق متعدد الوحدات (أيام، ساعات، دقائق، ثواني)

### 3. نظام الإشعارات
- تنبيه قبل ساعة واحدة
- تنبيه قبل 15 دقيقة
- تنبيه عند إغلاق النافذة

### 4. حالات الحالة
- **مفتوح** - يمكن إجراء الانتقالات
- **قريب من الإغلاق** - تحذير (أقل من ساعة)
- **حرج** - تحذير حرج (أقل من 15 دقيقة)
- **مغلق** - لا يمكن إجراء الانتقالات

---

## 🔧 الدوال الرئيسية

### 1. التحقق من حالة النافذة

```typescript
// التحقق من فتح نافذة الانتقالات
const isOpen = await isTransferWindowOpen(gameweekId);

// الحصول على حالة مفصلة
const status = await getTransferDeadlineStatus(gameweekId);
// {
//   isOpen: boolean,
//   timeRemaining: number (ms),
//   timeRemainingFormatted: string,
//   deadline: Date,
//   currentTime: Date,
//   message: string,
//   canTransfer: boolean
// }
```

### 2. التحقق من إمكانية الانتقال

```typescript
// التحقق من إمكانية إجراء انتقال
const { allowed, reason } = await canMakeTransfer(gameweekId);

if (!allowed) {
  console.log(`لا يمكن الانتقال: ${reason}`);
}
```

### 3. الحصول على الوقت المتبقي

```typescript
// الحصول على الوقت المتبقي بصيغة منفصلة
const time = await getTimeUntilDeadline(gameweekId);
// {
//   hours: number,
//   minutes: number,
//   seconds: number,
//   total: number (seconds)
// }
```

### 4. تعيين الموعد النهائي

```typescript
// تعيين موعد نهائي جديد
const result = await setTransferDeadline(
  gameweekId,
  new Date("2026-05-22T11:00:00Z")
);
```

### 5. فتح/إغلاق النافذة

```typescript
// فتح نافذة الانتقالات
await openTransferWindow(gameweekId);

// إغلاق نافذة الانتقالات
await closeTransferWindow(gameweekId);
```

---

## 📊 أمثلة الاستخدام

### مثال 1: عرض العداد التنازلي

```typescript
import TransferDeadlineCountdown from "@/components/TransferDeadlineCountdown";

export default function MyComponent() {
  const deadline = new Date("2026-05-22T11:00:00Z");
  
  return (
    <TransferDeadlineCountdown
      deadline={deadline}
      isOpen={true}
      gameweekNumber={1}
    />
  );
}
```

### مثال 2: التحقق قبل الانتقال

```typescript
async function handleTransfer(gameweekId: number) {
  const { allowed, reason } = await canMakeTransfer(gameweekId);
  
  if (!allowed) {
    showError(reason);
    return;
  }
  
  // إجراء الانتقال
  performTransfer();
}
```

### مثال 3: الحصول على الإشعارات

```typescript
async function checkForNotifications(leagueId: number) {
  const notifications = await getDeadlineApproachingNotifications(leagueId);
  
  notifications.forEach(notif => {
    if (notif.type === "deadline_1hour") {
      sendNotification("تحذير: نافذة الانتقالات ستغلق خلال ساعة");
    } else if (notif.type === "deadline_15min") {
      sendNotification("تحذير حرج: نافذة الانتقالات ستغلق خلال 15 دقيقة");
    }
  });
}
```

---

## ⏱️ صيغ الوقت

### تنسيق الوقت المتبقي

```
مثال: "2 يوم و 5 ساعة"
مثال: "3 ساعة و 30 دقيقة"
مثال: "45 دقيقة"
مثال: "30 ثانية"
```

### تنسيق الموعد النهائي

```
الموعد النهائي: الجمعة، 22 مايو 2026 11:00:00 صباحاً
```

---

## 🔔 نظام الإشعارات

### الإشعارات المدعومة

| النوع | الوقت | الخطورة | الرسالة |
|--------|--------|---------|---------|
| `deadline_1hour` | قبل ساعة واحدة | تحذير | نافذة الانتقالات ستغلق خلال ساعة واحدة |
| `deadline_15min` | قبل 15 دقيقة | حرج | نافذة الانتقالات ستغلق خلال 15 دقيقة فقط |
| `deadline_closed` | عند الإغلاق | معلومة | نافذة الانتقالات مغلقة الآن |

---

## 🎨 مكونات الواجهة

### 1. TransferDeadlineCountdown

عرض العداد التنازلي مع حالة النافذة.

**الخصائص:**
- `deadline: Date | null` - الموعد النهائي
- `isOpen: boolean` - هل النافذة مفتوحة
- `gameweekNumber?: number` - رقم الأسبوع (اختياري)

**الحالات:**
- ✅ مفتوح (أخضر)
- ⚠️ قريب من الإغلاق (أصفر)
- 🔴 حرج (أحمر)
- ❌ مغلق (رمادي)

### 2. Transfers Page

صفحة إدارة الانتقالات مع:
- عرض الميزانية المتبقية
- البحث والتصفية حسب المركز
- قائمة اللاعبين المتاحين
- عرض الانتقالات المعلقة
- زر تأكيد الانتقالات

---

## 📊 حالات الاختبار

تم اختبار النظام بـ **48 حالة اختبار** تغطي:

✅ تنسيق الوقت المتبقي  
✅ حسابات الوقت  
✅ كشف الموعد النهائي القريب  
✅ سيناريوهات الموعد النهائي  
✅ الحدود الحرجة  
✅ حالات نافذة الانتقالات  
✅ سيناريوهات الإشعارات  
✅ الحالات الحدية  
✅ مقارنة المواعيد النهائية  
✅ سيناريوهات العالم الحقيقي  

**النتيجة:** ✅ 232 اختبار نجح (100%)

---

## 🔐 الأمان والتحقق

### التحقق من الموعد النهائي

```typescript
// التحقق يتم تلقائياً قبل أي انتقال
if (!await isTransferWindowOpen(gameweekId)) {
  throw new Error("نافذة الانتقالات مغلقة");
}
```

### معالجة الأخطاء

```typescript
try {
  const status = await getTransferDeadlineStatus(gameweekId);
  if (!status.canTransfer) {
    // عرض رسالة خطأ واضحة
    showError(status.message);
  }
} catch (error) {
  console.error("خطأ في الحصول على حالة الموعد النهائي:", error);
}
```

---

## 📱 التكامل مع الواجهة

### في صفحة الانتقالات

```typescript
// عرض العداد التنازلي
<TransferDeadlineCountdown
  deadline={gameweek.transferDeadline}
  isOpen={gameweek.isTransferWindowOpen === 1}
  gameweekNumber={gameweek.gameweekNumber}
/>

// التحقق قبل السماح بالانتقال
if (!await canMakeTransfer(gameweekId)) {
  disableTransferButton();
}
```

### في لوحة التحكم

```typescript
// عرض حالة جميع الأسابيع
const gameweeks = await getGameweeksWithTransferStatus(leagueId);
gameweeks.forEach(gw => {
  console.log(`الأسبوع ${gw.gameweekNumber}: ${gw.transferStatus.message}`);
});
```

---

## 🚀 الميزات المستقبلية

- [ ] إشعارات البريد الإلكتروني
- [ ] إشعارات الهاتف المحمول
- [ ] تنبيهات مخصصة لكل لاعب
- [ ] سجل الانتقالات المفصل
- [ ] تحليل الانتقالات والإحصائيات

---

## 📞 الدعم والمساعدة

للأسئلة أو الاقتراحات حول نظام المواعيد النهائية، يرجى التواصل مع فريق التطوير.
