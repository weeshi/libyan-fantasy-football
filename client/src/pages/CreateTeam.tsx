import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface Player {
  id: number;
  name: string;
  teamName: string;
  position: string;
  price: number;
}

export default function CreateTeam() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [formData, setFormData] = useState({
    teamName: "",
    teamDescription: "",
    selectedPlayers: [] as number[],
  });

  // Fetch all players from database
  const { data: playersData } = trpc.players.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (playersData) {
      const formattedPlayers = playersData.map((p: any) => ({
        id: p.id,
        name: p.name,
        teamName: p.team?.name || "Unknown",
        position: p.position,
        price: p.price,
      }));
      setPlayers(formattedPlayers);
      setLoadingPlayers(false);
    }
  }, [playersData]);

  const createTeamMutation = trpc.userTeams.create.useMutation({
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (error) => {
      setError(error.message || "فشل في إنشاء الفريق");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSelectPlayer = (playerId: number) => {
    if (formData.selectedPlayers.includes(playerId)) {
      setFormData({
        ...formData,
        selectedPlayers: formData.selectedPlayers.filter(id => id !== playerId),
      });
    } else {
      if (formData.selectedPlayers.length < 11) {
        setFormData({
          ...formData,
          selectedPlayers: [...formData.selectedPlayers, playerId],
        });
      }
    }
  };

  const handleCreateTeam = async () => {
    if (formData.teamName && formData.selectedPlayers.length >= 11) {
      setIsLoading(true);
      setError("");
      try {
        await createTeamMutation.mutateAsync({
          teamName: formData.teamName,
          teamDescription: formData.teamDescription,
          selectedPlayerIds: formData.selectedPlayers,
          leagueId: 1,
        });
      } catch (err) {
        setIsLoading(false);
      }
    }
  };

  const getPositionArabic = (position: string) => {
    const positionMap: Record<string, string> = {
      "GK": "حارس مرمى",
      "DEF": "مدافع",
      "MID": "لاعب وسط",
      "FWD": "مهاجم",
    };
    return positionMap[position] || position;
  };

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">إنشاء فريق جديد</h1>
              <p className="text-slate-400">الخطوة {step} من 3</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="bg-red-900/20 border-red-700 mb-8">
            <CardContent className="py-4">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Team Info */}
        {step === 1 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">معلومات الفريق</CardTitle>
              <CardDescription className="text-slate-400">
                أدخل اسم وصف فريقك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    اسم الفريق
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فريق الأحلام"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    وصف الفريق (اختياري)
                  </label>
                  <textarea
                    placeholder="اكتب وصفاً قصيراً عن فريقك..."
                    value={formData.teamDescription}
                    onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.teamName}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    التالي
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Players */}
        {step === 2 && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">اختيار اللاعبين</CardTitle>
                <CardDescription className="text-slate-400">
                  اختر 11 لاعباً على الأقل لفريقك ({formData.selectedPlayers.length}/11)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlayers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-slate-400 mr-2">جاري تحميل اللاعبين...</span>
                  </div>
                ) : players.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">لا توجد لاعبين متاحين</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleSelectPlayer(player.id)}
                        className={`w-full text-right p-3 rounded border transition ${
                          formData.selectedPlayers.includes(player.id)
                            ? "bg-green-600 border-green-500"
                            : "bg-slate-700 border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-semibold">{player.name}</p>
                            <p className="text-slate-300 text-sm">{getPositionArabic(player.position)}</p>
                            <p className="text-slate-400 text-xs">{player.teamName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-200 text-sm font-semibold">{player.price.toFixed(1)}M</p>
                            {formData.selectedPlayers.includes(player.id) && (
                              <span className="text-white font-bold">✓</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                السابق
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={formData.selectedPlayers.length < 11}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                التالي
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">مراجعة الفريق</CardTitle>
                <CardDescription className="text-slate-400">
                  تحقق من معلومات فريقك قبل الإنشاء
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm">اسم الفريق</p>
                    <p className="text-white font-semibold">{formData.teamName}</p>
                  </div>
                  {formData.teamDescription && (
                    <div>
                      <p className="text-slate-400 text-sm">الوصف</p>
                      <p className="text-white">{formData.teamDescription}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-400 text-sm">عدد اللاعبين</p>
                    <p className="text-white font-semibold">{formData.selectedPlayers.length} لاعب</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">اللاعبون المختارون</p>
                    <div className="space-y-2">
                      {formData.selectedPlayers.map(playerId => {
                        const player = players.find(p => p.id === playerId);
                        return player ? (
                          <div key={playerId} className="bg-slate-700 p-2 rounded text-sm text-slate-300">
                            <span>{player.name}</span>
                            <span className="text-slate-500 mr-2">({getPositionArabic(player.position)})</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
              >
                السابق
              </Button>
              <Button
                onClick={handleCreateTeam}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء الفريق"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
