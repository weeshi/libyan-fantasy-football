import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Calendar, Clock, Trophy } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Matches() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "live" | "completed">("all");

  // Fetch all matches
  const { data: allMatches = [] } = trpc.matches.all.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Filter matches based on status
  const filteredMatches = filterStatus === "all" 
    ? allMatches 
    : allMatches.filter((match: any) => match.status === filterStatus);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold">مجدولة</span>;
      case "live":
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold animate-pulse">جارية</span>;
      case "completed":
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">انتهت</span>;
      case "postponed":
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">مؤجلة</span>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("ar-LY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-8 h-8 text-blue-400" />
                جدول المباريات
              </h1>
              <p className="text-slate-400">مباريات الدوري الليبي</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            جميع المباريات
          </button>
          <button
            onClick={() => setFilterStatus("scheduled")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "scheduled"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            مجدولة
          </button>
          <button
            onClick={() => setFilterStatus("live")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "live"
                ? "bg-red-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            جارية
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filterStatus === "completed"
                ? "bg-green-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            انتهت
          </button>
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {(filteredMatches as any[]).map((match: any) => (
              <Card key={match.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex-1 text-right">
                      <p className="text-white font-bold text-lg">{match.homeTeamId}</p>
                      <p className="text-slate-400 text-sm">الفريق الأول</p>
                    </div>

                    {/* Score or Status */}
                    <div className="flex-1 flex flex-col items-center gap-2 px-4">
                      {match.status === "completed" ? (
                        <div className="text-center">
                          <p className="text-white font-bold text-2xl">
                            {match.homeScore} - {match.awayScore}
                          </p>
                          <p className="text-slate-400 text-xs">النتيجة النهائية</p>
                        </div>
                      ) : match.status === "live" ? (
                        <div className="text-center">
                          <p className="text-red-400 font-bold text-2xl animate-pulse">جارية</p>
                          <p className="text-slate-400 text-xs">الآن</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-slate-400 text-sm">مجدولة</p>
                          <p className="text-slate-500 text-xs">
                            {new Date(match.matchDate).toLocaleDateString("ar-LY")}
                          </p>
                        </div>
                      )}
                      {getStatusBadge(match.status)}
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 text-left">
                      <p className="text-white font-bold text-lg">{match.awayTeamId}</p>
                      <p className="text-slate-400 text-sm">الفريق الثاني</p>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.matchDate).toLocaleDateString("ar-LY")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(match.matchDate).toLocaleTimeString("ar-LY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8">
              <p className="text-slate-400 text-center">لا توجد مباريات في هذه الفئة</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
