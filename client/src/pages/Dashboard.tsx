import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Users, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user's teams from database
  const { data: userTeams = [], isLoading: teamsLoading } = trpc.userTeams.myTeams.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-slate-400">أهلاً بعودتك، {user?.name}!</p>
            </div>
            <Link href="/">
              <Button variant="outline">الرئيسية</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">إجمالي الفرق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userTeams.length}</div>
              <p className="text-xs text-slate-500 mt-1">الفرق المنشأة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">الدوريات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">انضم أو أنشئ دوري</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">إجمالي النقاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">النقاط هذا الموسم</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">أفضل ترتيب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
              <p className="text-xs text-slate-500 mt-1">أعلى مركز لك</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="teams" className="text-slate-300">فريقي</TabsTrigger>
            <TabsTrigger value="leagues" className="text-slate-300">الدوريات</TabsTrigger>
            <TabsTrigger value="players" className="text-slate-300">اللاعبون</TabsTrigger>
          </TabsList>

          {/* My Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">فريقي</h2>
              <Link href="/create-team">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء فريق
                </Button>
              </Link>
            </div>

            {teamsLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-400">جاري تحميل الفرق...</p>
              </div>
            ) : userTeams.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white">لا توجد فرق بعد</CardTitle>
                    <CardDescription className="text-slate-400">
                      أنشئ فريقك الأول في لعبة كرة القدم الخيالية للبدء
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/create-team">
                      <Button variant="outline" className="w-full">
                        إنشاء فريق
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTeams.map((team) => (
                  <Card key={team.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition">
                    <CardHeader>
                      <CardTitle className="text-white">{team.teamName}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {team.players?.length || 0} لاعب
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">النقاط:</span>
                          <span className="text-white font-semibold">{team.totalPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">الميزانية:</span>
                          <span className="text-white font-semibold">{(team.budget / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          عرض
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          تعديل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leagues Tab */}
          {/* Navigation Links */}
          <div className="mb-8 flex gap-2 flex-wrap">
            <Link href="/leaderboard">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                جدول الترتيب
              </Button>
            </Link>
          </div>

          {/* Admin Links */}
          {user?.role === 'admin' && (
            <div className="mb-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h3 className="text-white font-semibold mb-3">أدوات الإدارة</h3>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/player-prices">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    إدارة أسعار اللاعبين
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <TabsContent value="leagues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">الدوريات</h2>
              <Link href="/leagues">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  عرض الدوريات
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    لا توجد دوريات بعد
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    انضم إلى دوري موجود أو أنشئ واحداً جديداً
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-league">
                    <Button variant="outline" className="w-full">
                      إنشاء دوري
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">اللاعبون</h2>
              <div className="flex gap-2">
                <Link href="/player-trading">
                  <Button className="bg-green-600 hover:bg-green-700">
                    سوق اللاعبين
                  </Button>
                </Link>
                <Link href="/players">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    عرض اللاعبين
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  لاعبو الدوري الليبي
                </CardTitle>
                <CardDescription className="text-slate-400">
                  ابحث وصفي اللاعبين حسب الفريق والمركز
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4 flex-col md:flex-row">
                    <input
                      type="text"
                      placeholder="ابحث عن لاعب..."
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                    <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                      <option>جميع الفرق</option>
                      <option>الأهلي بنغازي</option>
                      <option>الأهلي طرابلس</option>
                      <option>الهلال</option>
                      <option>الزاوية</option>
                      <option>اتحاد بنغازي</option>
                    </select>
                    <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                      <option>جميع المراكز</option>
                      <option>حارس مرمى</option>
                      <option>مدافع</option>
                      <option>لاعب وسط</option>
                      <option>مهاجم</option>
                    </select>
                  </div>

                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">سيظهر اللاعبون هنا بعد إنشاء فريق</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
