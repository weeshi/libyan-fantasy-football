/**
 * Head-to-Head League Page
 * Display H2H league standings and matches
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Swords, TrendingUp, Users } from "lucide-react";

interface Standing {
  position: number;
  teamId: number;
  teamName: string;
  wins: number;
  draws: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsDifference: number;
  totalPoints: number;
}

interface Match {
  id: number;
  gameweekId: number;
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
  result: "WIN" | "DRAW" | "LOSS" | null;
  matchDate: string;
}

export default function H2HLeague() {
  // Mock data - replace with real API calls
  const [standings] = useState<Standing[]>([
    {
      position: 1,
      teamId: 1,
      teamName: "فريق النجم",
      wins: 8,
      draws: 1,
      losses: 1,
      pointsFor: 450,
      pointsAgainst: 380,
      pointsDifference: 70,
      totalPoints: 25,
    },
    {
      position: 2,
      teamId: 2,
      teamName: "فريق الصقور",
      wins: 7,
      draws: 2,
      losses: 1,
      pointsFor: 440,
      pointsAgainst: 390,
      pointsDifference: 50,
      totalPoints: 23,
    },
    {
      position: 3,
      teamId: 3,
      teamName: "فريق الأسود",
      wins: 6,
      draws: 2,
      losses: 2,
      pointsFor: 420,
      pointsAgainst: 410,
      pointsDifference: 10,
      totalPoints: 20,
    },
    {
      position: 4,
      teamId: 4,
      teamName: "فريق الشرقاوي",
      wins: 5,
      draws: 1,
      losses: 4,
      pointsFor: 400,
      pointsAgainst: 430,
      pointsDifference: -30,
      totalPoints: 16,
    },
  ]);

  const [matches] = useState<Match[]>([
    {
      id: 1,
      gameweekId: 10,
      team1Name: "فريق النجم",
      team2Name: "فريق الصقور",
      team1Points: 55,
      team2Points: 50,
      result: "WIN",
      matchDate: "2024-01-15",
    },
    {
      id: 2,
      gameweekId: 10,
      team1Name: "فريق الأسود",
      team2Name: "فريق الشرقاوي",
      team1Points: 48,
      team2Points: 48,
      result: "DRAW",
      matchDate: "2024-01-15",
    },
    {
      id: 3,
      gameweekId: 9,
      team1Name: "فريق الصقور",
      team2Name: "فريق الأسود",
      team1Points: 52,
      team2Points: 45,
      result: "WIN",
      matchDate: "2024-01-08",
    },
  ]);

  const getResultBadge = (result: string | null) => {
    switch (result) {
      case "WIN":
        return <Badge className="bg-green-600">فوز</Badge>;
      case "DRAW":
        return <Badge className="bg-yellow-600">تعادل</Badge>;
      case "LOSS":
        return <Badge className="bg-red-600">خسارة</Badge>;
      default:
        return <Badge variant="outline">قيد الانتظار</Badge>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-orange-50 border-orange-200";
      default:
        return "";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-lg font-semibold">{position}</span>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Swords className="w-8 h-8" />
          دوري المنافسة المباشرة
        </h1>
        <p className="text-muted-foreground">تنافس مباشر بين الفرق كل أسبوع</p>
      </div>

      {/* League Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الفرق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">فريق نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي المباريات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">مباراة مكتملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">متوسط النقاط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48.5</div>
            <p className="text-xs text-muted-foreground">لكل مباراة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الأسبوع الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">مباريات متبقية</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            الترتيب
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            المباريات
          </TabsTrigger>
        </TabsList>

        {/* Standings Tab */}
        <TabsContent value="standings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ترتيب الدوري</CardTitle>
              <CardDescription>ترتيب الفرق حسب النقاط والفارق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {standings.map((standing) => (
                  <div
                    key={standing.teamId}
                    className={`border rounded-lg p-4 ${getPositionColor(standing.position)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getPositionIcon(standing.position)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{standing.teamName}</p>
                          <p className="text-sm text-muted-foreground">
                            {standing.wins}ف - {standing.draws}ت - {standing.losses}خ
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">النقاط</p>
                          <p className="text-lg font-bold">{standing.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">الفارق</p>
                          <p
                            className={`text-lg font-bold ${
                              standing.pointsDifference > 0
                                ? "text-green-600"
                                : standing.pointsDifference < 0
                                  ? "text-red-600"
                                  : ""
                            }`}
                          >
                            {standing.pointsDifference > 0 ? "+" : ""}
                            {standing.pointsDifference}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">له/عليه</p>
                          <p className="text-lg font-bold">
                            {standing.pointsFor}/{standing.pointsAgainst}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>جدول مفصل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المركز</TableHead>
                      <TableHead className="text-right">الفريق</TableHead>
                      <TableHead className="text-center">ف</TableHead>
                      <TableHead className="text-center">ت</TableHead>
                      <TableHead className="text-center">خ</TableHead>
                      <TableHead className="text-center">له</TableHead>
                      <TableHead className="text-center">عليه</TableHead>
                      <TableHead className="text-center">الفارق</TableHead>
                      <TableHead className="text-center">النقاط</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((standing) => (
                      <TableRow key={standing.teamId}>
                        <TableCell className="font-semibold">{standing.position}</TableCell>
                        <TableCell className="font-medium">{standing.teamName}</TableCell>
                        <TableCell className="text-center text-green-600">{standing.wins}</TableCell>
                        <TableCell className="text-center text-yellow-600">{standing.draws}</TableCell>
                        <TableCell className="text-center text-red-600">{standing.losses}</TableCell>
                        <TableCell className="text-center">{standing.pointsFor}</TableCell>
                        <TableCell className="text-center">{standing.pointsAgainst}</TableCell>
                        <TableCell
                          className={`text-center font-semibold ${
                            standing.pointsDifference > 0
                              ? "text-green-600"
                              : standing.pointsDifference < 0
                                ? "text-red-600"
                                : ""
                          }`}
                        >
                          {standing.pointsDifference > 0 ? "+" : ""}
                          {standing.pointsDifference}
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">
                          {standing.totalPoints}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نتائج المباريات</CardTitle>
              <CardDescription>آخر المباريات والنتائج</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">الأسبوع {match.gameweekId}</span>
                    {getResultBadge(match.result)}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    {/* Team 1 */}
                    <div className="flex-1 text-right">
                      <p className="font-semibold">{match.team1Name}</p>
                      <p className="text-2xl font-bold text-blue-600">{match.team1Points}</p>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">ضد</span>
                      <Swords className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1">
                      <p className="font-semibold">{match.team2Name}</p>
                      <p className="text-2xl font-bold text-red-600">{match.team2Points}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    {new Date(match.matchDate).toLocaleDateString("ar-LY", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              💡 نصيحة: تابع المباريات الأسبوعية وحاول تحسين ترتيبك بالفوز على الفرق الأخرى!
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
