import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRouter } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, BarChart3, Trophy, Settings, Users, Zap } from "lucide-react";

export default function AdminDashboardEnhanced() {
  const { user } = useAuth();
  const [, navigate] = useRouter();
  const [activeTab, setActiveTab] = useState("gameweeks");

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ليس لديك صلاحيات الوصول إلى لوحة التحكم. يجب أن تكون مسؤولاً.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")} className="mt-4">
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            لوحة تحكم الإدارة
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            إدارة شاملة للمنصة والمسابقات والفرق
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                الأسابيع النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">أسبوع جاري</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                الكؤوس النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">بطولات جارية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                الدوريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">دوريات نشطة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                المباريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">مباراة هذا الأسبوع</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="gameweeks" className="text-xs md:text-sm">
              الأسابيع
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-xs md:text-sm">
              المباريات
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs md:text-sm">
              النتائج
            </TabsTrigger>
            <TabsTrigger value="scoring" className="text-xs md:text-sm">
              الترتيق
            </TabsTrigger>
            <TabsTrigger value="cup" className="text-xs md:text-sm">
              الكأس
            </TabsTrigger>
            <TabsTrigger value="leagues" className="text-xs md:text-sm">
              الدوريات
            </TabsTrigger>
          </TabsList>

          {/* Gameweeks Tab */}
          <TabsContent value="gameweeks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الأسابيع</CardTitle>
                <CardDescription>
                  إنشاء وتحديث الأسابيع وتعيين المواعيد النهائية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GameweekManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المباريات</CardTitle>
                <CardDescription>
                  إضافة وتحديث المباريات وتعيين المواعيد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MatchManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة النتائج</CardTitle>
                <CardDescription>
                  تحديث نتائج المباريات وأداء اللاعبين
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Rules Tab */}
          <TabsContent value="scoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>قواعس النقاط</CardTitle>
                <CardDescription>
                  إدارة قواعس حساب النقاط والترتيق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScoringRulesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cup Tab */}
          <TabsContent value="cup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الكأس</CardTitle>
                <CardDescription>
                  إدارة بطولات الكأس والقرعات والجولات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CupManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الدوريات</CardTitle>
                <CardDescription>
                  إدارة الدوريات الكلاسيكية والمباشرة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeagueManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>نصيحة:</strong> تأكد من حفظ جميع التغييرات قبل الخروج من لوحة التحكم
          </p>
        </div>
      </div>
    </div>
  );
}
