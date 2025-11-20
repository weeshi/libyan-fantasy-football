import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface PlayerPerformance {
  playerId: number;
  playerName: string;
  teamId: number;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCards: number;
  redCards: number;
  points: number;
}

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  status: "scheduled" | "live" | "completed";
  performances: PlayerPerformance[];
}

export default function ScoringSystem() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 1,
      homeTeam: "الأهلي بنغازي",
      awayTeam: "الهلال",
      homeScore: 2,
      awayScore: 1,
      matchDate: "2024-11-20",
      status: "completed",
      performances: [],
    },
  ]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    playerName: "",
    position: "midfielder" as const,
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    cleanSheet: false,
    yellowCards: 0,
    redCards: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900" dir="rtl">
        <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold text-white">صفحة غير متاحة</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8 text-center">
              <p className="text-slate-400 mb-4">هذه الصفحة متاحة للمسؤولين فقط</p>
              <Link href="/dashboard">
                <Button variant="outline">العودة</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const calculatePoints = (performance: Omit<PlayerPerformance, "points" | "playerId" | "playerName" | "teamId">): number => {
    let points = 0;
    const isDefender = performance.position === "goalkeeper" || performance.position === "defender";
    const isForward = performance.position === "forward";

    // Minutes played bonus
    if (performance.minutesPlayed >= 60) {
      points += 1;
    }

    // Goals
    if (isDefender) {
      points += performance.goals * 6;
    } else {
      points += performance.goals * 5;
    }

    // Assists
    points += performance.assists * 1;

    // Clean sheet
    if (performance.cleanSheet && performance.minutesPlayed >= 60) {
      if (isDefender) {
        points += 4;
      } else {
        points += 1;
      }
    }

    // Yellow cards
    points -= performance.yellowCards * 1;

    // Red cards
    points -= performance.redCards * 3;

    return Math.max(0, points);
  };

  const handleAddPerformance = () => {
    if (selectedMatch && formData.playerName) {
      const points = calculatePoints({
        position: formData.position,
        minutesPlayed: formData.minutesPlayed,
        goals: formData.goals,
        assists: formData.assists,
        cleanSheet: formData.cleanSheet,
        yellowCards: formData.yellowCards,
        redCards: formData.redCards,
      });

      const newPerformance: PlayerPerformance = {
        playerId: Math.random(),
        playerName: formData.playerName,
        teamId: 1,
        position: formData.position,
        minutesPlayed: formData.minutesPlayed,
        goals: formData.goals,
        assists: formData.assists,
        cleanSheet: formData.cleanSheet,
        yellowCards: formData.yellowCards,
        redCards: formData.redCards,
        points,
      };

      setMatches(matches.map(m =>
        m.id === selectedMatch.id
          ? { ...m, performances: [...m.performances, newPerformance] }
          : m
      ));

      setSelectedMatch({
        ...selectedMatch,
        performances: [...selectedMatch.performances, newPerformance],
      });

      resetForm();
    }
  };

  const handleRemovePerformance = (playerName: string) => {
    if (selectedMatch) {
      const updated = selectedMatch.performances.filter(p => p.playerName !== playerName);
      setSelectedMatch({ ...selectedMatch, performances: updated });
      setMatches(matches.map(m =>
        m.id === selectedMatch.id
          ? { ...m, performances: updated }
          : m
      ));
    }
  };

  const resetForm = () => {
    setFormData({
      playerName: "",
      position: "midfielder",
      minutesPlayed: 90,
      goals: 0,
      assists: 0,
      cleanSheet: false,
      yellowCards: 0,
      redCards: 0,
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">نظام حساب النقاط</h1>
              <p className="text-slate-400">إدخال نتائج المباريات وحساب نقاط اللاعبين</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">المباريات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matches.map(match => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`w-full text-right p-3 rounded border transition ${
                        selectedMatch?.id === match.id
                          ? "bg-blue-600 border-blue-500"
                          : "bg-slate-700 border-slate-600 hover:border-slate-500"
                      }`}
                    >
                      <p className="text-white font-semibold text-sm">
                        {match.homeTeam} vs {match.awayTeam}
                      </p>
                      <p className="text-slate-300 text-xs">
                        {match.homeScore} - {match.awayScore}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">{match.matchDate}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Entry */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <>
                {/* Match Header */}
                <Card className="bg-slate-800 border-slate-700 mb-8">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      النتيجة: {selectedMatch.homeScore} - {selectedMatch.awayScore}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Add Performance Form */}
                {showForm && (
                  <Card className="bg-slate-800 border-slate-700 mb-8">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white">إضافة أداء لاعب</CardTitle>
                        <button onClick={resetForm} className="text-slate-400 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="اسم اللاعب"
                          value={formData.playerName}
                          onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <select
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        >
                          <option value="goalkeeper">حارس مرمى</option>
                          <option value="defender">مدافع</option>
                          <option value="midfielder">لاعب وسط</option>
                          <option value="forward">مهاجم</option>
                        </select>
                        <input
                          type="number"
                          placeholder="دقائق اللعب"
                          value={formData.minutesPlayed}
                          onChange={(e) => setFormData({ ...formData, minutesPlayed: parseInt(e.target.value) })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <input
                          type="number"
                          placeholder="الأهداف"
                          value={formData.goals}
                          onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <input
                          type="number"
                          placeholder="التمريرات الحاسمة"
                          value={formData.assists}
                          onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <input
                          type="number"
                          placeholder="البطاقات الصفراء"
                          value={formData.yellowCards}
                          onChange={(e) => setFormData({ ...formData, yellowCards: parseInt(e.target.value) })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <input
                          type="number"
                          placeholder="البطاقات الحمراء"
                          value={formData.redCards}
                          onChange={(e) => setFormData({ ...formData, redCards: parseInt(e.target.value) })}
                          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                        />
                        <label className="flex items-center gap-2 text-slate-300 col-span-1 md:col-span-2">
                          <input
                            type="checkbox"
                            checked={formData.cleanSheet}
                            onChange={(e) => setFormData({ ...formData, cleanSheet: e.target.checked })}
                            className="w-4 h-4"
                          />
                          دفاع نظيف
                        </label>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={handleAddPerformance}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          إضافة
                        </Button>
                        <Button variant="outline" onClick={resetForm}>
                          إلغاء
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Performances List */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white">أداء اللاعبين</CardTitle>
                      {!showForm && (
                        <Button
                          onClick={() => setShowForm(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 ml-1" />
                          إضافة
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedMatch.performances.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400">لم يتم إضافة أي أداء بعد</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedMatch.performances.map((perf, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 bg-slate-700 rounded border border-slate-600"
                          >
                            <div className="flex-1">
                              <p className="text-white font-semibold">{perf.playerName}</p>
                              <p className="text-slate-400 text-sm">
                                {perf.goals} أهداف • {perf.assists} تمريرات • {perf.minutesPlayed} دقيقة
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-green-400 font-bold text-lg">{perf.points}</p>
                                <p className="text-slate-400 text-xs">نقاط</p>
                              </div>
                              <button
                                onClick={() => handleRemovePerformance(perf.playerName)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-8 text-center">
                  <p className="text-slate-400">اختر مباراة لإضافة أداء اللاعبين</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
