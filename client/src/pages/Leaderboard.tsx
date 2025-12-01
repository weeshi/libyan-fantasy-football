import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Trophy, TrendingUp, Target, Users } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);

  // Fetch user's leagues
  const { data: userLeagues = [] } = trpc.leagues.myLeagues.useQuery(undefined, {
    enabled: isAuthenticated,
  }) as any;

  // Fetch leaderboard for selected league
  const { data: leaderboard = [] } = trpc.leaderboard.getLeagueRankings.useQuery(
    { leagueId: selectedLeagueId || 0 },
    { enabled: !!selectedLeagueId }
  );

  if (!isAuthenticated) {
    navigate("/");
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
                <Trophy className="w-8 h-8 text-yellow-400" />
                جدول الترتيب
              </h1>
              <p className="text-slate-400">ترتيب الفرق في الدوري</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* League Selection */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">اختر الدوري</CardTitle>
          </CardHeader>
          <CardContent>
            {userLeagues.length === 0 ? (
              <p className="text-slate-400">لا توجد دوريات</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(userLeagues || []).map((league: any) => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeagueId(league.id)}
                    className={`p-4 rounded-lg border-2 transition text-right ${
                      selectedLeagueId === league.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <p className="text-white font-semibold">{league.leagueName}</p>
                    <p className="text-slate-400 text-sm">
                      {league.description || "دوري بدون وصف"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Table */}
        {selectedLeagueId && leaderboard.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">ترتيب الفرق</CardTitle>
              <CardDescription className="text-slate-400">
                ترتيب الفرق حسب النقاط الإجمالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-right text-slate-300 font-semibold">
                        المركز
                      </th>
                      <th className="px-4 py-3 text-right text-slate-300 font-semibold">
                        اسم الفريق
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          النقاط
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          <Target className="w-4 h-4" />
                          أهداف
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4" />
                          تمريرات
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        الفرق
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        التعادلات
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        الخسائر
                      </th>
                      <th className="px-4 py-3 text-center text-slate-300 font-semibold">
                        الفارق
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leaderboard || []).map((team: any) => (
                      <tr
                        key={team.id}
                        className={`border-b border-slate-700 transition hover:bg-slate-700/50 ${
                          team.rank === 1
                            ? "bg-yellow-500/10"
                            : team.rank === 2
                            ? "bg-gray-400/10"
                            : team.rank === 3
                            ? "bg-orange-500/10"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {team.rank === 1 && (
                              <Trophy className="w-5 h-5 text-yellow-400" />
                            )}
                            {team.rank === 2 && (
                              <Trophy className="w-5 h-5 text-gray-400" />
                            )}
                            {team.rank === 3 && (
                              <Trophy className="w-5 h-5 text-orange-400" />
                            )}
                            <span className="text-white font-bold text-lg">
                              {team.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-semibold">{team.teamName}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-green-400 font-bold text-lg">
                            {team.totalPoints}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-blue-400 font-semibold">
                            {team.goalsFor}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-purple-400 font-semibold">
                            {team.assists}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-green-400 font-semibold">
                            {team.wins}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-yellow-400 font-semibold">
                            {team.draws}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-red-400 font-semibold">
                            {team.losses}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-semibold ${
                              team.goalDifference > 0
                                ? "text-green-400"
                                : team.goalDifference < 0
                                ? "text-red-400"
                                : "text-slate-400"
                            }`}
                          >
                            {team.goalDifference > 0 ? "+" : ""}
                            {team.goalDifference}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedLeagueId && leaderboard.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8">
              <p className="text-slate-400 text-center">
                لا توجد فرق في هذا الدوري بعد
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
