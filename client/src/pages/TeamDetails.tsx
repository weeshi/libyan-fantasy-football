import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation, useRoute } from "wouter";
import { ArrowRight, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Pitch from "@/components/Pitch";

export default function TeamDetails() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/team/:id");
  const teamId = params?.id ? parseInt(params.id) : null;

  if (!isAuthenticated || !teamId) {
    navigate("/");
    return null;
  }

  const { data: team, isLoading } = trpc.userTeams.getById.useQuery(
    { id: teamId },
    { enabled: !!teamId }
  );

  const deleteTeamMutation = trpc.userTeams.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفريق بنجاح");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف الفريق");
    },
  });

  const handleDeleteTeam = () => {
    if (confirm("هل أنت متأكد من حذف هذا الفريق؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteTeamMutation.mutate({ id: teamId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" dir="rtl">
        <p className="text-white">جاري التحميل...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-white text-lg mb-4">لم يتم العثور على الفريق</p>
          <Link href="/dashboard">
            <Button>العودة إلى الملعب</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">تفاصيل الفريق</h1>
            </div>
            <div className="flex gap-2">
              <Link href={`/team/${teamId}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700">تعديل</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDeleteTeam}
                disabled={deleteTeamMutation.isPending}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف الفريق
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pitch Display */}
        <div className="mb-8">
          <Pitch players={team.players || []} teamName={(team as any).teamName || "فريقي"} />
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">عدد اللاعبين</p>
                <p className="text-3xl font-bold text-green-400">{team.players?.length || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">إجمالي النقاط</p>
                <p className="text-3xl font-bold text-blue-400">{(team as any).totalPoints || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">الميزانية المتبقية</p>
                <p className="text-3xl font-bold text-purple-400">
                  {(((team as any).budget || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm">الترتيب</p>
                <p className="text-3xl font-bold text-yellow-400">-</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Players List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-white mb-4">قائمة اللاعبين</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-right py-2 px-4 text-slate-400">الاسم</th>
                    <th className="text-right py-2 px-4 text-slate-400">المركز</th>
                    <th className="text-right py-2 px-4 text-slate-400">الفريق</th>
                    <th className="text-right py-2 px-4 text-slate-400">النقاط</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players && team.players.length > 0 ? (
                    team.players.map((player, idx) => {
                      const playerName = (player as any).name || "لاعب";
                      const playerPosition = (player as any).position || "-";
                      const playerTeam = (player as any).teamId || "-";
                      const playerPoints = (player as any).totalPoints || 0;
                      return (
                      <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700">
                        <td className="py-3 px-4 text-white">{playerName}</td>
                        <td className="py-3 px-4 text-slate-400">{playerPosition}</td>
                        <td className="py-3 px-4 text-slate-400">{playerTeam}</td>
                        <td className="py-3 px-4 text-green-400 font-semibold">{playerPoints}</td>
                      </tr>
                    );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        لا توجد بيانات لاعبين
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
