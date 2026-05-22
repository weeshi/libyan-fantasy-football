/**
 * Chips Page
 * Manage and use special power-up chips
 */

import { useState } from "react";
import ChipsSelector from "@/components/ChipsSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Zap, Sparkles, Users, Shield } from "lucide-react";

interface Chip {
  type: string;
  name: string;
  description: string;
  isUsed: boolean;
  usedInGameweek?: number;
}

export default function Chips() {
  // Mock data - replace with real API calls
  const [availableChips] = useState<Chip[]>([
    {
      type: "TRIPLE_CAPTAIN",
      name: "الكابتن الثلاثي",
      description: "مضاعفة نقاط الكابتن 3 مرات",
      isUsed: false,
    },
    {
      type: "WILDCARD",
      name: "البطاقة البرية",
      description: "تغيير الفريق بالكامل بدون عقوبة",
      isUsed: false,
    },
    {
      type: "BENCH_BOOST",
      name: "تعزيز البدلاء",
      description: "استخدام جميع لاعبي البدلاء",
      isUsed: false,
    },
    {
      type: "FREE_HIT",
      name: "الضربة الحرة",
      description: "تغيير مؤقت للفريق (يعود بعد الأسبوع)",
      isUsed: false,
    },
  ]);

  const [activeChip] = useState<string | null>(null);

  const handleUseChip = async (chipType: string) => {
    console.log(`Using chip: ${chipType}`);
    // TODO: Call API to use chip
  };

  const chipStats = [
    {
      icon: <Zap className="w-6 h-6" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      title: "الكابتن الثلاثي",
      description: "مضاعفة نقاط الكابتن 3 مرات",
      uses: "1 مرة فقط",
      impact: "تأثير عالي جداً",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      title: "البطاقة البرية",
      description: "تغيير الفريق بالكامل بدون عقوبة",
      uses: "مرتان",
      impact: "تأثير عالي",
    },
    {
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      title: "تعزيز البدلاء",
      description: "استخدام جميع لاعبي البدلاء",
      uses: "1 مرة فقط",
      impact: "تأثير متوسط",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      title: "الضربة الحرة",
      description: "تغيير مؤقت للفريق (يعود بعد الأسبوع)",
      uses: "1 مرة فقط",
      impact: "تأثير متوسط",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">الرقائق الخاصة</h1>
        <p className="text-muted-foreground">استخدم الرقائق الاستراتيجية لتعزيز فريقك</p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          💡 نصيحة: استخدم الرقائق بحكمة! كل رقاقة لها عدد محدود من الاستخدامات هذا الموسم.
        </AlertDescription>
      </Alert>

      {/* Tabs */}
      <Tabs defaultValue="selector" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="selector">استخدام الرقائق</TabsTrigger>
          <TabsTrigger value="guide">دليل الرقائق</TabsTrigger>
        </TabsList>

        {/* Chips Selector Tab */}
        <TabsContent value="selector" className="space-y-6">
          <ChipsSelector
            availableChips={availableChips}
            activeChip={activeChip}
            onUseChip={handleUseChip}
          />
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chipStats.map((stat) => (
              <Card key={stat.title} className={`border-2 ${stat.bgColor}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={stat.color}>{stat.icon}</div>
                      <div>
                        <CardTitle className="text-base">{stat.title}</CardTitle>
                        <CardDescription>{stat.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">عدد الاستخدامات:</span>
                    <span className="font-semibold">{stat.uses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">التأثير:</span>
                    <span className="font-semibold">{stat.impact}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Guide */}
          <Card>
            <CardHeader>
              <CardTitle>شرح مفصل للرقائق</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Triple Captain */}
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-600" />
                  الكابتن الثلاثي
                </h3>
                <p className="text-muted-foreground mb-3">
                  تضاعف نقاط الكابتن 3 مرات بدلاً من المرتين العادية. هذه الرقاقة لها تأثير عالي جداً
                  وتستحق الاستخدام في الأسابيع التي تتوقع فيها أداء استثنائية من الكابتن.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-semibold mb-1">مثال:</p>
                  <p>إذا سجل الكابتن 20 نقطة:</p>
                  <p className="text-gray-600">• بدون رقاقة: 40 نقطة (20 × 2)</p>
                  <p className="text-green-600 font-semibold">• مع الكابتن الثلاثي: 60 نقطة (20 × 3)</p>
                </div>
              </div>

              {/* Wildcard */}
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  البطاقة البرية
                </h3>
                <p className="text-muted-foreground mb-3">
                  تسمح لك بتغيير الفريق بالكامل بدون عقوبة. يمكنك إجراء انتقالات غير محدودة دون خصم نقاط.
                  لديك مرتان لاستخدام هذه الرقاقة هذا الموسم.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-semibold mb-1">متى تستخدمها:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>عندما يكون لديك عدة لاعبين مصابين</li>
                    <li>عند تغيير كبير في جدول المباريات</li>
                    <li>عندما تريد إعادة هيكلة الفريق بالكامل</li>
                  </ul>
                </div>
              </div>

              {/* Bench Boost */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  تعزيز البدلاء
                </h3>
                <p className="text-muted-foreground mb-3">
                  تسمح لك باستخدام جميع لاعبي البدلاء في الأسبوع. بدلاً من استخدام 11 لاعب فقط، ستحصل على
                  نقاط من جميع اللاعبين في فريقك.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-semibold mb-1">متى تستخدمها:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>عندما يكون لديك بدلاء بأداء جيد</li>
                    <li>في الأسابيع التي تتوقع فيها نتائج عالية</li>
                    <li>عندما يكون لديك فريق متوازن</li>
                  </ul>
                </div>
              </div>

              {/* Free Hit */}
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  الضربة الحرة
                </h3>
                <p className="text-muted-foreground mb-3">
                  تسمح لك بتغيير الفريق مؤقتاً للأسبوع الحالي فقط. بعد انتهاء الأسبوع، سيعود فريقك إلى حالته
                  السابقة.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-semibold mb-1">متى تستخدمها:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>للاختبار السريع للاعبين</li>
                    <li>عند عدم تأكدك من الانتقالات</li>
                    <li>للاستفادة من مباريات سهلة مؤقتاً</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                نصائح استراتيجية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="font-semibold">1. التوقيت مهم:</span> استخدم الرقائق في الأسابيع التي تتوقع
                فيها أداء عالية من فريقك
              </p>
              <p>
                <span className="font-semibold">2. خطط مسبقاً:</span> فكر في متى ستحتاج إلى الرقائق قبل
                استخدامها
              </p>
              <p>
                <span className="font-semibold">3. راقب الإصابات:</span> احفظ البطاقة البرية للأسابيع التي
                تتوقع فيها إصابات كبيرة
              </p>
              <p>
                <span className="font-semibold">4. استفد من الفرص:</span> استخدم الكابتن الثلاثي عندما يكون
                لديك كابتن في حالة ممتازة
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
