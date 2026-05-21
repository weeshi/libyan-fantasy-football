/**
 * Result Management Component
 * Handles match results and player statistics
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Undo2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface ResultFormData {
  matchId: number;
  team1Score: number;
  team2Score: number;
}

const TEAMS = [
  { id: 1, name: "الأهلي بنغازي" },
  { id: 2, name: "الأهلي طرابلس" },
  { id: 3, name: "الهلال" },
  { id: 4, name: "الزاوية" },
  { id: 5, name: "اتحاد بنغازي" },
];

export default function ResultManagement() {
  const { toast } = useToast();
  const [gameweekId, setGameweekId] = useState(1);
  const [formData, setFormData] = useState<ResultFormData>({
    matchId: 0,
    team1Score: 0,
    team2Score: 0,
  });

  const gameweeksQuery = trpc.admin.gameweek.getAll.useQuery({ leagueId: 1 });
  const matchesQuery = trpc.admin.match.getByGameweek.useQuery({ gameweekId });
  const updateResultMutation = trpc.admin.result.updateMatchResult.useMutation();
  const undoResultMutation = trpc.admin.result.undoMatchResult.useMutation();

  const handleUpdateResult = async () => {
    if (formData.matchId === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار مباراة",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await updateResultMutation.mutateAsync({
        matchId: formData.matchId,
        team1Score: formData.team1Score,
        team2Score: formData.team2Score,
      });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        matchesQuery.refetch();
        setFormData({ matchId: 0, team1Score: 0, team2Score: 0 });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث النتيجة",
        variant: "destructive",
      });
    }
  };

  const handleUndoResult = async (matchId: number) => {
    if (!confirm("هل تريد إلغاء نتيجة هذه المباراة؟")) return;

    try {
      const result = await undoResultMutation.mutateAsync({ matchId });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        matchesQuery.refetch();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء النتيجة",
        variant: "destructive",
      });
    }
  };

  const selectedMatch = matchesQuery.data?.find((m: any) => m.id === formData.matchId);
  const team1 = TEAMS.find((t) => t.id === selectedMatch?.team1Id);
  const team2 = TEAMS.find((t) => t.id === selectedMatch?.team2Id);

  return (
    <div className="space-y-6">
      {/* Update Result Form */}
      <Card>
        <CardHeader>
          <CardTitle>تحديث نتيجة مباراة</CardTitle>
          <CardDescription>أدخل نتيجة المباراة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gameweekSelect">الأسبوع</Label>
              <Select value={gameweekId.toString()} onValueChange={(value) => {
                setGameweekId(parseInt(value));
                setFormData({ matchId: 0, team1Score: 0, team2Score: 0 });
              }}>
                <SelectTrigger id="gameweekSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gameweeksQuery.data?.map((gw: any) => (
                    <SelectItem key={gw.id} value={gw.id.toString()}>
                      الأسبوع {gw.gameweekNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="matchSelect">المباراة</Label>
              <Select
                value={formData.matchId.toString()}
                onValueChange={(value) => {
                  const matchId = parseInt(value);
                  const match = matchesQuery.data?.find((m: any) => m.id === matchId);
                  setFormData({
                    matchId,
                    team1Score: match?.team1Score || 0,
                    team2Score: match?.team2Score || 0,
                  });
                }}
              >
                <SelectTrigger id="matchSelect">
                  <SelectValue placeholder="اختر مباراة" />
                </SelectTrigger>
                <SelectContent>
                  {matchesQuery.data?.map((match: any) => {
                    const t1 = TEAMS.find((t) => t.id === match.team1Id);
                    const t2 = TEAMS.find((t) => t.id === match.team2Id);
                    return (
                      <SelectItem key={match.id} value={match.id.toString()}>
                        {t1?.name} ضد {t2?.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedMatch && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{team1?.name}</p>
                  <Input
                    type="number"
                    min="0"
                    value={formData.team1Score}
                    onChange={(e) =>
                      setFormData({ ...formData, team1Score: parseInt(e.target.value) || 0 })
                    }
                    className="text-center text-2xl font-bold"
                  />
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold">-</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{team2?.name}</p>
                  <Input
                    type="number"
                    min="0"
                    value={formData.team2Score}
                    onChange={(e) =>
                      setFormData({ ...formData, team2Score: parseInt(e.target.value) || 0 })
                    }
                    className="text-center text-2xl font-bold"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleUpdateResult}
                  disabled={updateResultMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {updateResultMutation.isPending ? "جاري الحفظ..." : "حفظ النتيجة"}
                </Button>

                {selectedMatch.status === "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => handleUndoResult(selectedMatch.id)}
                    disabled={undoResultMutation.isPending}
                  >
                    <Undo2 className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>نتائج المباريات</CardTitle>
          <CardDescription>نتائج مباريات الأسبوع {gameweekId}</CardDescription>
        </CardHeader>
        <CardContent>
          {matchesQuery.isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : matchesQuery.data && matchesQuery.data.length > 0 ? (
            <div className="space-y-3">
              {matchesQuery.data.map((match: any) => {
                const t1 = TEAMS.find((t) => t.id === match.team1Id);
                const t2 = TEAMS.find((t) => t.id === match.team2Id);

                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{t1?.name} ضد {t2?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.kickoffTime).toLocaleString("ar-LY")}
                      </p>
                    </div>

                    <div className="text-center mx-4">
                      {match.status === "completed" ? (
                        <div className="text-2xl font-bold">
                          {match.team1Score} - {match.team2Score}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">لم تبدأ</div>
                      )}
                    </div>

                    <div className="text-sm">
                      <span
                        className={`px-3 py-1 rounded-full ${
                          match.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : match.status === "live"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {match.status === "completed"
                          ? "انتهت"
                          : match.status === "live"
                            ? "جاري"
                            : "مجدول"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد مباريات</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
