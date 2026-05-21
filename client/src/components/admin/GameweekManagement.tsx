/**
 * Gameweek Management Component
 * Handles creation and management of gameweeks
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
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface GameweekFormData {
  leagueId: number;
  gameweekNumber: number;
  startDate: string;
  endDate: string;
  transferDeadline: string;
}

export default function GameweekManagement() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<GameweekFormData>({
    leagueId: 1,
    gameweekNumber: 1,
    startDate: "",
    endDate: "",
    transferDeadline: "",
  });

  const gameweeksQuery = trpc.admin.gameweek.getAll.useQuery({ leagueId: 1 });
  const createGameweekMutation = trpc.admin.gameweek.create.useMutation();
  const updateStatusMutation = trpc.admin.gameweek.updateStatus.useMutation();
  const deleteGameweekMutation = trpc.admin.gameweek.delete.useMutation();

  const handleCreate = async () => {
    if (!formData.startDate || !formData.endDate || !formData.transferDeadline) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createGameweekMutation.mutateAsync({
        leagueId: formData.leagueId,
        gameweekNumber: formData.gameweekNumber,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        transferDeadline: new Date(formData.transferDeadline),
      });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        setFormData({
          leagueId: 1,
          gameweekNumber: (formData.gameweekNumber || 0) + 1,
          startDate: "",
          endDate: "",
          transferDeadline: "",
        });
        gameweeksQuery.refetch();
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الأسبوع",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (gameweekId: number, newStatus: "upcoming" | "active" | "completed") => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        gameweekId,
        status: newStatus,
      });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        gameweeksQuery.refetch();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (gameweekId: number) => {
    if (!confirm("هل تريد حذف هذا الأسبوع؟")) return;

    try {
      const result = await deleteGameweekMutation.mutateAsync({ gameweekId });

      if (result.success) {
        toast({
          title: "نجح",
          description: result.message,
        });
        gameweeksQuery.refetch();
      } else {
        toast({
          title: "خطأ",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الأسبوع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Gameweek Form */}
      <Card>
        <CardHeader>
          <CardTitle>إنشاء أسبوع جديد</CardTitle>
          <CardDescription>أضف أسبوع جديد للموسم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gameweekNumber">رقم الأسبوع</Label>
              <Input
                id="gameweekNumber"
                type="number"
                min="1"
                max="38"
                value={formData.gameweekNumber}
                onChange={(e) =>
                  setFormData({ ...formData, gameweekNumber: parseInt(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="leagueId">الدوري</Label>
              <Select value={formData.leagueId.toString()} onValueChange={(value) =>
                setFormData({ ...formData, leagueId: parseInt(value) })
              }>
                <SelectTrigger id="leagueId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">الدوري الليبي الممتاز</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">تاريخ البداية</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">تاريخ النهاية</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="transferDeadline">الموعد النهائي للانتقالات</Label>
              <Input
                id="transferDeadline"
                type="datetime-local"
                value={formData.transferDeadline}
                onChange={(e) => setFormData({ ...formData, transferDeadline: e.target.value })}
              />
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={createGameweekMutation.isPending}
            className="mt-4 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 ml-2" />
            {createGameweekMutation.isPending ? "جاري الإنشاء..." : "إنشاء أسبوع"}
          </Button>
        </CardContent>
      </Card>

      {/* Gameweeks List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأسابيع</CardTitle>
          <CardDescription>جميع أسابيع الموسم</CardDescription>
        </CardHeader>
        <CardContent>
          {gameweeksQuery.isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : gameweeksQuery.data && gameweeksQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">رقم الأسبوع</th>
                    <th className="text-right py-3 px-4">تاريخ البداية</th>
                    <th className="text-right py-3 px-4">تاريخ النهاية</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {gameweeksQuery.data.map((gw: any) => (
                    <tr key={gw.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">الأسبوع {gw.gameweekNumber}</td>
                      <td className="py-3 px-4">
                        {new Date(gw.startDate).toLocaleDateString("ar-LY")}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(gw.endDate).toLocaleDateString("ar-LY")}
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={gw.status}
                          onValueChange={(value) =>
                            handleStatusChange(gw.id, value as "upcoming" | "active" | "completed")
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">قادم</SelectItem>
                            <SelectItem value="active">جاري</SelectItem>
                            <SelectItem value="completed">انتهى</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(gw.id)}
                          disabled={deleteGameweekMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">لا توجد أسابيع</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
