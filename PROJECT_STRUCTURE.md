# 🏗️ شجرة مشروع Libyan Fantasy Football

## 📋 نظرة عامة على المشروع

مشروع لعبة كرة القدم الخيالية الليبية - تطبيق ويب متكامل مبني على React 19 + Express 4 + tRPC 11 + MySQL/TiDB

---

## 📁 هيكل المشروع الرئيسي

```
libyan_fantasy_football/
├── 📂 client/                          # تطبيق الواجهة الأمامية (React 19)
│   ├── index.html                      # ملف HTML الرئيسي
│   ├── public/                         # الملفات الثابتة
│   └── src/
│       ├── App.tsx                     # مكون التطبيق الرئيسي والتوجيه
│       ├── main.tsx                    # نقطة الدخول
│       ├── index.css                   # الأنماط العامة
│       ├── const.ts                    # الثوابت (عنوان التطبيق، الشعار)
│       │
│       ├── 📂 _core/                   # الأساسيات والخدمات الأساسية
│       │   └── hooks/
│       │       └── useAuth.ts          # خطاف المصادقة
│       │
│       ├── 📂 components/              # المكونات المعاد استخدامها
│       │   ├── DashboardLayout.tsx     # تخطيط لوحة التحكم (الشريط الجانبي)
│       │   ├── AIChatBox.tsx           # صندوق الدردشة الذكية
│       │   ├── Map.tsx                 # مكون خريطة Google Maps
│       │   ├── Pitch.tsx               # ملعب كرة القدم
│       │   ├── TransferDeadlineCountdown.tsx  # عداد موعد الانتقالات
│       │   └── 📂 ui/                  # مكونات shadcn/ui (50+ مكون)
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── table.tsx
│       │       ├── select.tsx
│       │       └── ... (المزيد من المكونات)
│       │
│       ├── 📂 contexts/                # سياقات React
│       │   └── ThemeContext.tsx        # سياق المظهر (فاتح/داكن)
│       │
│       ├── 📂 hooks/                   # الخطافات المخصصة
│       │   ├── useComposition.ts       # خطاف التركيب
│       │   ├── useMobile.tsx           # خطاف الكشف عن الجوال
│       │   └── usePersistFn.ts         # خطاف الدالة المستمرة
│       │
│       ├── 📂 lib/                     # المكتبات والأدوات
│       │   ├── trpc.ts                 # عميل tRPC
│       │   └── utils.ts                # دوال مساعدة
│       │
│       └── 📂 pages/                   # صفحات التطبيق
│           ├── Home.tsx                # الصفحة الرئيسية
│           ├── Dashboard.tsx           # لوحة التحكم
│           ├── CreateTeam.tsx          # إنشاء فريق
│           ├── TeamDetails.tsx         # تفاصيل الفريق
│           ├── Leaderboard.tsx         # جدول الترتيب
│           ├── Matches.tsx             # المباريات
│           ├── PlayerProfile.tsx       # ملف اللاعب الشخصي
│           ├── PlayerComparison.tsx    # مقارنة اللاعبين ⭐ جديد
│           ├── PlayerComparison.test.ts # اختبارات المقارنة
│           ├── PlayerTrading.tsx       # تداول اللاعبين
│           ├── PlayersManagement.tsx   # إدارة اللاعبين
│           ├── Transfers.tsx           # الانتقالات
│           ├── Chips.tsx               # الرقائق
│           ├── H2HLeague.tsx           # دوري المواجهات
│           ├── CupTournament.tsx       # كأس البطولة
│           ├── LeaguesManagement.tsx   # إدارة الدوريات
│           ├── ScoringSystem.tsx       # نظام التصحيح
│           ├── AdminDashboard.tsx      # لوحة تحكم الإدارة
│           └── NotFound.tsx            # صفحة 404
│
├── 📂 server/                          # خادم Express + tRPC
│   ├── routers.ts                      # إجراءات tRPC الرئيسية
│   ├── db.ts                           # مساعدات قاعدة البيانات
│   ├── storage.ts                      # مساعدات تخزين S3
│   │
│   ├── 📂 routers/                     # إجراءات tRPC المتخصصة
│   │   └── admin.ts                    # إجراءات الإدارة
│   │
│   ├── 📂 _core/                       # الأساسيات والخدمات الأساسية
│   │   ├── index.ts                    # نقطة الدخول الرئيسية
│   │   ├── context.ts                  # سياق tRPC (المستخدم الحالي)
│   │   ├── trpc.ts                     # إعدادات tRPC
│   │   ├── oauth.ts                    # مصادقة Manus OAuth
│   │   ├── cookies.ts                  # إدارة ملفات تعريف الارتباط
│   │   ├── env.ts                      # متغيرات البيئة
│   │   ├── llm.ts                      # تكامل نموذج اللغة
│   │   ├── imageGeneration.ts          # توليد الصور
│   │   ├── voiceTranscription.ts       # نسخ الصوت
│   │   ├── map.ts                      # تكامل خريطة Google
│   │   ├── notification.ts             # إشعارات المالك
│   │   ├── dataApi.ts                  # API البيانات المدمج
│   │   ├── sdk.ts                      # SDK Manus
│   │   ├── systemRouter.ts             # موجه النظام
│   │   ├── vite.ts                     # تكامل Vite
│   │   └── types/
│   │       ├── cookie.d.ts             # تعريفات ملفات تعريف الارتباط
│   │       └── manusTypes.ts           # أنواع Manus
│   │
│   ├── 📂 نظام التصحيح (Scoring System)
│   │   ├── scoring.ts                  # منطق التصحيح الأساسي
│   │   ├── scoring.test.ts             # اختبارات التصحيح
│   │   ├── advanced-scoring.ts         # التصحيح المتقدم
│   │   └── advanced-scoring.test.ts    # اختبارات التصحيح المتقدم
│   │
│   ├── 📂 نظام الانتقالات (Transfer System)
│   │   ├── transfers.ts                # منطق الانتقالات
│   │   ├── transfers.test.ts           # اختبارات الانتقالات
│   │   ├── transfer-deadline.ts        # موعد انتهاء الانتقالات
│   │   └── transfer-deadline.test.ts   # اختبارات الموعد
│   │
│   ├── 📂 نظام الرقائق (Chips System)
│   │   ├── chips.ts                    # منطق الرقائق الأساسي
│   │   ├── chips.test.ts               # اختبارات الرقائق
│   │   ├── chips-system.ts             # نظام الرقائق المتقدم
│   │   └── chips-system.test.ts        # اختبارات النظام
│   │
│   ├── 📂 نظام المواجهات (H2H System)
│   │   ├── h2h.ts                      # منطق المواجهات الأساسي
│   │   ├── h2h.test.ts                 # اختبارات المواجهات
│   │   ├── h2h-system.ts               # نظام المواجهات المتقدم
│   │   └── h2h-system.test.ts          # اختبارات النظام
│   │
│   ├── 📂 نظام الكأس (Cup System)
│   │   ├── cup.ts                      # منطق الكأس الأساسي
│   │   ├── cup.test.ts                 # اختبارات الكأس
│   │   ├── cup-system.ts               # نظام الكأس المتقدم
│   │   ├── cup-system.test.ts          # اختبارات النظام
│   │   ├── cup-enhanced.ts             # نظام الكأس المحسّن
│   │   └── cup-enhanced.test.ts        # اختبارات النظام المحسّن
│   │
│   ├── 📂 إدارة المباريات (Admin)
│   │   ├── admin-gameweek.ts           # إدارة أسابيع اللعب
│   │   ├── admin-matches.ts            # إدارة المباريات
│   │   └── admin-results.ts            # إدارة النتائج
│   │
│   ├── 📂 الإشعارات (Notifications)
│   │   ├── notifications.ts            # منطق الإشعارات
│   │   └── notifications.test.ts       # اختبارات الإشعارات
│   │
│   ├── 📂 البيانات (Data)
│   │   ├── seed-libyan.ts              # بيانات البذور الليبية
│   │   └── seed-clubs.mjs              # بيانات النوادي
│   │
│   └── auth.logout.test.ts             # اختبارات تسجيل الخروج
│
├── 📂 drizzle/                         # قاعدة البيانات (Drizzle ORM)
│   ├── schema.ts                       # مخطط قاعدة البيانات
│   ├── relations.ts                    # العلاقات بين الجداول
│   ├── migrations/                     # ملفات الهجرة
│   ├── meta/                           # بيانات وصفية للهجرات
│   ├── 0000_careful_snowbird.sql       # هجرة 1
│   ├── 0001_premium_proemial_gods.sql  # هجرة 2
│   ├── 0002_overconfident_ronan.sql    # هجرة 3
│   ├── 0003_magenta_juggernaut.sql     # هجرة 4
│   ├── 0004_perpetual_katie_power.sql  # هجرة 5
│   └── 0005_fine_next_avengers.sql     # هجرة 6
│
├── 📂 shared/                          # الكود المشترك
│   ├── const.ts                        # الثوابت المشتركة
│   ├── types.ts                        # الأنواع المشتركة
│   └── _core/
│       └── errors.ts                   # معالجة الأخطاء
│
├── 📂 scripts/                         # سكريبتات البناء والبيانات
│   └── seed-clubs.mjs                  # سكريبت بيانات النوادي
│
├── 📂 patches/                         # تصحيحات المكتبات
│   └── wouter@3.7.1.patch              # تصحيح مكتبة التوجيه
│
├── 📄 ملفات الإعدادات
│   ├── package.json                    # تبعيات المشروع
│   ├── pnpm-lock.yaml                  # قفل الإصدارات
│   ├── tsconfig.json                   # إعدادات TypeScript
│   ├── vite.config.ts                  # إعدادات Vite
│   ├── vitest.config.ts                # إعدادات Vitest
│   ├── drizzle.config.ts               # إعدادات Drizzle
│   └── components.json                 # إعدادات shadcn/ui
│
├── 📄 ملفات البيانات
│   ├── libyan_data.json                # بيانات ليبيا
│   ├── seed-clubs.sql                  # SQL بيانات النوادي
│   └── seed-matches.sql                # SQL بيانات المباريات
│
├── 📄 ملفات التوثيق
│   ├── README.md                       # الملف التعريفي الرئيسي
│   ├── todo.md                         # قائمة المهام
│   ├── PROJECT_STRUCTURE.md            # هذا الملف
│   ├── DEVELOPMENT_ROADMAP.md          # خارطة الطريق
│   ├── ADVANCED_SCORING_GUIDE.md       # دليل التصحيح المتقدم
│   ├── CHIPS_SYSTEM_GUIDE.md           # دليل نظام الرقائق
│   ├── CUP_SYSTEM_GUIDE.md             # دليل نظام الكأس
│   ├── H2H_LEAGUE_GUIDE.md             # دليل دوري المواجهات
│   └── TRANSFER_DEADLINE_GUIDE.md      # دليل موعد الانتقالات
│
└── 📄 ملفات أخرى
    ├── .gitignore
    ├── .env.example
    └── vite.config.ts
```

---

## 🎯 المكونات الرئيسية

### 1️⃣ الواجهة الأمامية (Client)
- **React 19** - مكتبة الواجهة الأمامية
- **Tailwind CSS 4** - نمط الواجهة
- **shadcn/ui** - مكونات واجهة المستخدم
- **Recharts** - رسوم بيانية
- **Wouter** - التوجيه
- **tRPC** - اتصال العميل بالخادم

### 2️⃣ الخادم (Server)
- **Express 4** - خادم الويب
- **tRPC 11** - API آمن النوع
- **Drizzle ORM** - إدارة قاعدة البيانات
- **MySQL/TiDB** - قاعدة البيانات

### 3️⃣ المصادقة (Authentication)
- **Manus OAuth** - نظام المصادقة المدمج
- **JWT** - توكنات الجلسة

### 4️⃣ الخدمات المدمجة
- **Google Maps** - خرائط التوجيه
- **LLM** - نماذج اللغة الكبيرة
- **Image Generation** - توليد الصور
- **Voice Transcription** - نسخ الصوت
- **S3 Storage** - تخزين الملفات
- **Notifications** - الإشعارات

---

## 📊 جداول قاعدة البيانات الرئيسية

```
┌─────────────────────┐
│      users          │ المستخدمون
├─────────────────────┤
│ id (PK)             │
│ openId              │
│ name                │
│ email               │
│ role (admin|user)   │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘

┌─────────────────────┐
│      players        │ اللاعبون
├─────────────────────┤
│ id (PK)             │
│ name                │
│ position            │
│ teamId (FK)         │
│ price               │
│ totalPoints         │
│ jerseyNumber        │
└─────────────────────┘

┌─────────────────────┐
│      teams          │ الفرق
├─────────────────────┤
│ id (PK)             │
│ name                │
│ shortName           │
│ logo                │
│ founded             │
└─────────────────────┘

┌─────────────────────┐
│    userTeams        │ فرق المستخدمين
├─────────────────────┤
│ id (PK)             │
│ userId (FK)         │
│ name                │
│ budget              │
│ createdAt           │
└─────────────────────┘

┌─────────────────────┐
│   userTeamPlayers   │ لاعبو فرق المستخدمين
├─────────────────────┤
│ id (PK)             │
│ userTeamId (FK)     │
│ playerId (FK)       │
│ position            │
│ purchasePrice       │
└─────────────────────┘

┌─────────────────────┐
│      matches        │ المباريات
├─────────────────────┤
│ id (PK)             │
│ homeTeamId (FK)     │
│ awayTeamId (FK)     │
│ homeScore           │
│ awayScore           │
│ date                │
│ status              │
└─────────────────────┘

┌─────────────────────┐
│   playerPerformance │ أداء اللاعبين
├─────────────────────┤
│ id (PK)             │
│ playerId (FK)       │
│ matchId (FK)        │
│ goals               │
│ assists             │
│ cleanSheets         │
│ yellowCards         │
│ redCards            │
│ points              │
└─────────────────────┘
```

---

## 🔄 تدفق البيانات

```
┌─────────────────────────────────────────────────────────┐
│                   المستخدم (Browser)                    │
└────────────────────────┬────────────────────────────────┘
                         │
                    React Component
                         │
                    tRPC Client Hook
                         │
                    HTTP Request
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    Express Server                   OAuth Server
        │                                 │
    tRPC Procedure                  Manus OAuth
        │                                 │
    Database Query                  JWT Token
        │                                 │
    Drizzle ORM                      Session
        │                                 │
    MySQL/TiDB                       Cookie
        │                                 │
        └────────────────┬────────────────┘
                         │
                   HTTP Response
                         │
                   tRPC Response
                         │
                   React State
                         │
        ┌────────────────┴────────────────┐
        │                                 │
    UI Update                      Cache Update
        │                                 │
    Re-render                      TRPC Cache
        │                                 │
    Display to User
```

---

## 🧪 الاختبارات

### ملفات الاختبار
- `server/scoring.test.ts` - اختبارات نظام التصحيح
- `server/transfers.test.ts` - اختبارات الانتقالات
- `server/chips.test.ts` - اختبارات الرقائق
- `server/h2h.test.ts` - اختبارات المواجهات
- `server/cup.test.ts` - اختبارات الكأس
- `server/fantasy.test.ts` - اختبارات الخيالية
- `client/src/pages/PlayerComparison.test.ts` - اختبارات المقارنة ⭐

### تشغيل الاختبارات
```bash
pnpm test                    # تشغيل جميع الاختبارات
pnpm test -- scoring.test    # تشغيل اختبار محدد
```

---

## 🚀 الميزات الرئيسية

### ✅ المنفذة
- ✅ نظام التصحيح المتقدم
- ✅ نظام الانتقالات مع موعد نهائي
- ✅ نظام الرقائق (Chips)
- ✅ دوري المواجهات (H2H)
- ✅ نظام الكأس
- ✅ إدارة الفرق
- ✅ ملف اللاعب الشخصي
- ✅ **مقارنة اللاعبين** ⭐ جديد

### 📋 قيد التطوير
- [ ] نظام الدوريات المتقدم
- [ ] نظام الإحصائيات المتقدم
- [ ] تحليل الأداء
- [ ] التنبؤات الذكية

---

## 📚 الموارد والأدلة

| الملف | الوصف |
|------|-------|
| `DEVELOPMENT_ROADMAP.md` | خارطة طريق التطوير |
| `ADVANCED_SCORING_GUIDE.md` | دليل نظام التصحيح المتقدم |
| `CHIPS_SYSTEM_GUIDE.md` | دليل نظام الرقائق |
| `CUP_SYSTEM_GUIDE.md` | دليل نظام الكأس |
| `H2H_LEAGUE_GUIDE.md` | دليل دوري المواجهات |
| `TRANSFER_DEADLINE_GUIDE.md` | دليل موعد الانتقالات |
| `todo.md` | قائمة المهام الكاملة |

---

## 🔧 الأوامر المهمة

```bash
# التثبيت والتطوير
pnpm install                 # تثبيت التبعيات
pnpm dev                     # تشغيل خادم التطوير

# قاعدة البيانات
pnpm db:push                 # دفع التغييرات إلى قاعدة البيانات
pnpm db:studio               # فتح استوديو Drizzle

# الاختبارات
pnpm test                    # تشغيل جميع الاختبارات
pnpm test -- --ui           # تشغيل الاختبارات مع واجهة رسومية

# البناء والنشر
pnpm build                   # بناء المشروع للإنتاج
pnpm preview                 # معاينة الإنتاج محلياً
```

---

## 📝 ملاحظات مهمة

1. **المصادقة**: يتم التعامل معها تلقائياً عبر Manus OAuth
2. **قاعدة البيانات**: MySQL/TiDB مع Drizzle ORM
3. **التخزين**: S3 للملفات الثابتة
4. **الاختبارات**: Vitest مع 467 اختبار حالياً
5. **الأداء**: Vite للتطوير السريع

---

**آخر تحديث:** 31 مايو 2026
**الإصدار:** da4ce864
**الحالة:** ✅ جاهز للإنتاج
