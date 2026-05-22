/**
 * Cup Tournament Page
 * Display cup bracket and matches
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Swords, TrendingUp, Users, ChevronRight } from "lucide-react";

interface CupMatch {
  id: number;
  round: number;
  team1Name: string;
  team2Name: string;
  team1Points: number;
  team2Points: number;
  winner: string | null;
  status: "PENDING" | "COMPLETED" | "WALKOVER";
  matchDate: string;
}

interface CupStanding {
  position: number;
  teamName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  status: "ACTIVE" | "ELIMINATED" | "CHAMPION";
}

export default function CupTournament() {
  // Mock data - replace with real API calls
  const [tournament] = useState({
    name: "كأس الدوري الليبي",
    status: "ACTIVE",
    currentRound: 2,
    totalRounds: 3,
    totalTeams: 8,
  });

  const [standings] = useState<CupStanding[]>([
    {
      position: 1,
      teamName: "فريق النجم",
      wins: 2,
      losses: 0,
      pointsFor: 105,
      pointsAgainst: 85,
      status: "ACTIVE",
    },
    {
      position: 2,
      teamName: "فريق الصقور",
      wins: 1,
      losses: 1,
      pointsFor: 95,
      pointsAgainst: 100,
      status: "ELIMINATED",
    },
    {
      position: 3,
      teamName: "فريق الأسود",
      wins: 1,
      losses: 0,
      pointsFor: 98,
      pointsAgainst: 90,
      status: "ACTIVE",
    },
    {
      position: 4,
      teamName: "فريق الشرقاوي",
      wins: 0,
      losses: 1,
      pointsFor: 80,
      pointsAgainst: 88,
      status: "ELIMINATED",
    },
  ]);

  const [matches] = useState<CupMatch[]>([
    {
      id: 1,
      round: 1,
      team1Name: "فريق النجم",
      team2Name: "فريق الشرقاوي",
      team1Points: 55,
      team2Points: 40,
      winner: "فريق النجم",
      status: "COMPLETED",
      matchDate: "2024-01-15",
    },
    {
      id: 2,
      round: 1,
      team1Name: "فريق الصقور",
      team2Name: "فريق الأسود",
      team1Points: 50,
      team2Points: 48,
      winner: "فريق الصقور",
      status: "COMPLETED",
      matchDate: "2024-01-15",
    },
    {
      id: 3,
      round: 2,
      team1Name: "فريق النجم",
      team2Name: "فريق الصقور",
      team1Points: 50,
      team2Points: 45,
      winner: "فريق النجم",
      status: "COMPLETED",
      matchDate: "2024-01-22",
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-600">نشط</Badge>;
      case "ELIMINATED":
        return <Badge className="bg-red-600">مستبعد</Badge>;
      case "CHAMPION":
        return <Badge className="bg-yellow-600">بطل</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-600">مكتملة</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-600">قيد الانتظار</Badge>;
      case "WALKOVER":
        return <Badge className="bg-blue-600">تمريرة</Badge>;
      default:
        return <Badge variant="outline">غير معروفة</Badge>;
    }
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1:
        return "ربع النهائي";
      case 2:
        return "نصف النهائي";
      case 3:
        return "النهائي";
      default:
        return `الجولة ${round}`;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
          {tournament.name}
        </h1>
        <p className="text-muted-foreground">
          الجولة {tournament.currentRound} من {tournament.totalRounds}
        </p>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الفرق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournament.totalTeams}</div>
            <p className="text-xs text-muted-foreground">فريق في البطولة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الفرق النشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {standings.filter((s) => s.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-muted-foreground">فريق متبقي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الفرق المستبعدة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {standings.filter((s) => s.status === "ELIMINATED").length}
            </div>
            <p className="text-xs text-muted-foreground">فريق خرج من البطولة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الجولة الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRoundName(tournament.currentRound)}</div>
            <p className="text-xs text-muted-foreground">
              {tournament.currentRound}/{tournament.totalRounds}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bracket" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bracket" className="flex items-center gap-2">
            <Swords className="w-4 h-4" />
            القوس
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            الترتيب
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            المباريات
          </TabsTrigger>
        </TabsList>

        {/* Bracket Tab */}
        <TabsContent value="bracket" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قوس البطولة</CardTitle>
              <CardDescription>تطور الفرق عبر الجولات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Round 1 */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">ربع النهائي</h3>
                  <div className="space-y-2">
                    {matches
                      .filter((m) => m.round === 1)
                      .map((match) => (
                        <div key={match.id} className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{match.team1Name}</p>
                              <p className="text-xs text-muted-foreground">
                                {match.team1Points} نقطة
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-semibold">vs</span>
                              {match.status === "COMPLETED" && (
                                <ChevronRight className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-medium text-sm">{match.team2Name}</p>
                              <p className="text-xs text-muted-foreground">
                                {match.team2Points} نقطة
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Round 2 */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">نصف النهائي</h3>
                  <div className="space-y-2">
                    {matches
                      .filter((m) => m.round === 2)
                      .map((match) => (
                        <div key={match.id} className="border rounded-lg p-3 bg-muted/50">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{match.team1Name}</p>
                              <p className="text-xs text-muted-foreground">
                                {match.team1Points} نقطة
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-semibold">vs</span>
                              {match.status === "COMPLETED" && (
                                <ChevronRight className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1 text-right">
                              <p className="font-medium text-sm">{match.team2Name}</p>
                              <p className="text-xs text-muted-foreground">
                                {match.team2Points} نقطة
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Standings Tab */}
        <TabsContent value="standings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ترتيب البطولة</CardTitle>
              <CardDescription>ترتيب الفرق حسب الأداء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {standings.map((standing) => (
                  <div key={standing.teamName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-lg font-bold text-muted-foreground">
                          {standing.position}
                        </div>
                        <div>
                          <p className="font-semibold">{standing.teamName}</p>
                          <p className="text-sm text-muted-foreground">
                            {standing.wins}ف - {standing.losses}خ
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">له/عليه</p>
                          <p className="font-semibold">
                            {standing.pointsFor}/{standing.pointsAgainst}
                          </p>
                        </div>
                        {getStatusBadge(standing.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>جميع المباريات</CardTitle>
              <CardDescription>نتائج جميع مباريات البطولة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{getRoundName(match.round)}</span>
                    {getMatchStatusBadge(match.status)}
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

                  {match.winner && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-center">
                        <span className="font-semibold text-green-600">الفائز: </span>
                        {match.winner}
                      </p>
                    </div>
                  )}

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
            <Trophy className="h-4 w-4" />
            <AlertDescription>
              💡 نصيحة: تابع تطور الفرق عبر الجولات واستمتع بمشاهدة أفضل الفرق تتنافس على البطولة!
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
