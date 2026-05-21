/**
 * Match Management Component
 * Handles creation and management of matches
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
import { Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface MatchFormData {
  gameweekId: number;
  team1Id: number;
  team2Id: number;
  kickoffTime: string;
  venue: string;
}

const TEAMS = [
  { id: 1, name: "الأهلي بنغازي" },
  { id: 2, name: "الأهلي طرابلس" },
  { id: 3, name: "الهلال" },
  { id: 4, name: "الزاوية" },
  { id: 5, name: "اتحاد بنغازي" },
];

export default function MatchManagement() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MatchFormData>({
    gameweekId: 1,
    team1Id: 1,
    team2Id: 2,
    kickoffTime: "",
    venue: "",
  });

  const gameweeksQuery = trpc.admin.gameweek.getAll.useQuery({ leagueId: 1 });
  const matchesQuery = trpc.admin.match.getByGameweek.useQuery({
    gameweekId: formData.gameweekId,
  });
  const createMatchMutation = trpc.admin.match.create.useMutation();
  const updateStatusMutation = trpc.admin.match.updateStatus.useMutation();
  const deleteMatchMutation = trpc.admin.match.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.kickoffTime) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (formData.team1Id === formData.team2Id) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون الفريقان مختلفين",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createMatchMutation.mutateAsync({
        gameweekId: formData.gameweekId,
        team1Id: formData.team1Id,
        team2Id: formData.team2Id,
        kickoffTime: new Date(formData.kickoffTime),
        venue: formData.venue,
      });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        setFormData({
          gameweekId: formData.gameweekId,
          team1Id: 1,
          team2Id: 2,
          kickoffTime: "",
          venue: "",
        });
        matchesQuery.refetch();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المباراة",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (matchId: number, newStatus: "scheduled" | "live" | "completed") => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        matchId,
        status: newStatus,
      });

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
        description: "فشل في تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (matchId: number) => {
    if (!confirm("هل تريد حذف هذه المباراة؟")) return;

    try {
      const result = await deleteMatchMutation.mutateAsync({ matchId });

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
        description: "فشل في حذف المباراة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Match Form */}
      <Card>
        <CardHeader>
          <CardTitle>إضافة مباراة جديدة</CardTitle>
          <CardDescription>أضف مباراة جديدة للأسبوع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gameweekSelect">الأسبوع</Label>
              <Select
                value={formData.gameweekId.toString()}
                onValueChange={(value) => setFormData({ ...formData, gameweekId: parseInt(value) })}
              >
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
              <Label htmlFor="team1">الفريق الأول</Label>
              <Select
                value={formData.team1Id.toString()}
                onValueChange={(value) => setFormData({ ...formData, team1Id: parseInt(value) })}
              >
                <SelectTrigger id="team1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team2">الفريق الثاني</Label>
              <Select
                value={formData.team2Id.toString()}
                onValueChange={(value) => setFormData({ ...formData, team2Id: parseInt(value) })}
              >
                <SelectTrigger id="team2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="kickoffTime">موعد المباراة</Label>
              <Input
                id="kickoffTime"
                type="datetime-local"
                value={formData.kickoffTime}
                onChange={(e) => setFormData({ ...formData, kickoffTime: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="venue">الملعب</Label>
              <Input
                id="venue"
                type="text"
                placeholder="اسم الملعب"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={createMatchMutation.isPending}
            className="mt-4 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 ml-2" />
            {createMatchMutation.isPending ? "جاري الإضافة..." : "إضافة مباراة"}
          </Button>
        </CardContent>
      </Card>

      {/* Matches List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المباريات</CardTitle>
          <CardDescription>مباريات الأسبوع {formData.gameweekId}</CardDescription>
        </CardHeader>
        <CardContent>
          {matchesQuery.isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : matchesQuery.data && matchesQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">الفريق الأول</th>
                    <th className="text-right py-3 px-4">الفريق الثاني</th>
                    <th className="text-right py-3 px-4">الموعد</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {matchesQuery.data.map((match: any) => {
                    const team1 = TEAMS.find((t) => t.id === match.team1Id);
                    const team2 = TEAMS.find((t) => t.id === match.team2Id);

                    return (
                      <tr key={match.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{team1?.name}</td>
                        <td className="py-3 px-4">{team2?.name}</td>
                        <td className="py-3 px-4">
                          {new Date(match.kickoffTime).toLocaleString("ar-LY")}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={match.status}
                            onValueChange={(value) =>
                              handleStatusChange(match.id, value as "scheduled" | "live" | "completed")
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">مجدول</SelectItem>
                              <SelectItem value="live">جاري</SelectItem>
                              <SelectItem value="completed">انتهى</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(match.id)}
                            disabled={deleteMatchMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد مباريات</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
