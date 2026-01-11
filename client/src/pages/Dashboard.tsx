import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Users, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Pitch from "@/components/Pitch";

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
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-8 h-8 text-green-400" />
                الملعب
              </h1>
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
              <CardTitle className="text-sm font-medium text-slate-400">رصيدك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">0</div>
              <p className="text-xs text-slate-500 mt-1">النقاط هذا الموسم</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">الترتيب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
              <p className="text-xs text-slate-500 mt-1">ترتيبك في الدوري</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="teams" className="text-white">
              فريقي
            </TabsTrigger>
            <TabsTrigger value="leagues" className="text-white">
              الدوريات
            </TabsTrigger>
            <TabsTrigger value="market" className="text-white">
              السوق
            </TabsTrigger>
          </TabsList>

          {/* My Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">فريقي</h2>
              <Link href="/create-team">
                <Button className="bg-green-600 hover:bg-green-700">
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
              <div className="space-y-8">
                {userTeams.map((team) => (
                  <div key={team.id} className="space-y-4">
                    <Pitch 
                      players={team.players || []} 
                      teamName={team.teamName}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">النقاط</p>
                            <p className="text-2xl font-bold text-green-400">{team.totalPoints}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">الميزانية</p>
                            <p className="text-2xl font-bold text-blue-400">{(team.budget / 1000000).toFixed(1)}M</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="pt-4">
                          <div className="text-center">
                            <p className="text-slate-400 text-sm">اللاعبين</p>
                            <p className="text-2xl font-bold text-purple-400">{team.players?.length || 0}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/team/${team.id}`} className="flex-1">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          عرض التفاصيل
                        </Button>
                      </Link>
                      <Link href={`/team/${team.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          تعديل
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="px-3"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الفريق؟')) {
                            trpc.userTeams.delete.useMutation({
                              onSuccess: () => {
                                window.location.reload();
                              }
                            }).mutate({ id: team.id });
                          }
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
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
            <Link href="/matches">
              <Button className="bg-purple-600 hover:bg-purple-700">
                جدول المباريات
              </Button>
            </Link>
            <Link href="/players">
              <Button className="bg-blue-600 hover:bg-blue-700">
                إدارة اللاعبين
              </Button>
            </Link>
            <Link href="/leagues">
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                الدوريات
              </Button>
            </Link>
            <Link href="/player-trading">
              <Button className="bg-orange-600 hover:bg-orange-700">
                سوق اللاعبين
              </Button>
            </Link>
            {user?.role === "admin" && (
              <>
                <Link href="/admin-prices">
                  <Button className="bg-red-600 hover:bg-red-700">
                    سوق الانتقالات
                  </Button>
                </Link>
                <Link href="/scoring">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    نظام النقاط
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
