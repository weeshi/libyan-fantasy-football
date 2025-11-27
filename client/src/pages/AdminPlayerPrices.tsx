import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PlayerPrice {
  id: number;
  name: string;
  position: string;
  currentPrice: number;
  newPrice?: number;
}

export default function AdminPlayerPrices() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPrices, setNewPrices] = useState<Record<number, number>>({});

  // Fetch all players
  const { data: players = [], isLoading } = trpc.adminPlayers.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const updatePriceMutation = trpc.adminPlayers.updatePrice.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث السعر بنجاح");
      setEditingId(null);
      setNewPrices({});
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث السعر");
    },
  });

  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSavePrice = (playerId: number) => {
    const newPrice = newPrices[playerId];
    if (!newPrice || newPrice < 0) {
      toast.error("السعر غير صحيح");
      return;
    }

    updatePriceMutation.mutate({
      playerId,
      newPrice,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewPrices({});
  };

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">إدارة أسعار اللاعبين</h1>
              <p className="text-slate-400">تحديث أسعار اللاعبين في السوق</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">جاري تحميل اللاعبين...</p>
          </div>
        ) : players.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-8">
              <p className="text-slate-400 text-center">لا توجد لاعبون</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {players.map((player) => (
              <Card key={player.id} className="bg-slate-800 border-slate-700">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{player.name}</h3>
                      <p className="text-slate-400 text-sm">{player.position}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {editingId === player.id ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">السعر الجديد:</span>
                            <input
                              type="number"
                              value={newPrices[player.id] || player.marketValue}
                              onChange={(e) =>
                                setNewPrices({
                                  ...newPrices,
                                  [player.id]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-24 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSavePrice(player.id)}
                            disabled={updatePriceMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4 ml-1" />
                            حفظ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="w-4 h-4 ml-1" />
                            إلغاء
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              {(player.marketValue / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-slate-400 text-xs">السعر الحالي</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingId(player.id);
                              setNewPrices({ [player.id]: player.marketValue });
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit2 className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
