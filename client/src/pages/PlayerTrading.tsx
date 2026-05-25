import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { ShoppingCart, History } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function PlayerTrading() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  // Fetch user's teams
  const { data: userTeams = [] } = trpc.userTeams.myTeams.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch all players
  const { data: allPlayers = [] } = trpc.players.list.useQuery() as any;

  // Fetch transactions
  const { data: transactions = [] } = trpc.userTeams.getTransactions.useQuery(
    { userTeamId: selectedTeamId || 0 },
    { enabled: !!selectedTeamId }
  );

  // Buy player mutation
  const buyPlayerMutation = trpc.userTeams.buyPlayer.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedPlayerId(null);
    },
    onError: (error) => {
      toast.error(error.message || "فشل شراء اللاعب");
    },
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const currentTeam = selectedTeamId
    ? userTeams.find((t) => t.id === selectedTeamId)
    : null;

  const handleBuyPlayer = (playerId: number) => {
    if (!selectedTeamId) {
      toast.error("اختر فريقك أولاً");
      return;
    }

    buyPlayerMutation.mutate({
      userTeamId: selectedTeamId,
      playerId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">سوق اللاعبين</h1>
              <p className="text-slate-400">شراء وبيع اللاعبين</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Team Selection */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">اختر فريقك</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedTeamId === team.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                  }`}
                >
                  <p className="text-white font-semibold">{team.teamName}</p>
                  <p className="text-slate-400 text-sm">
                    الميزانية: {(team.budget / 1000000).toFixed(2)}M
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentTeam && (
          <Tabs defaultValue="market" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="market" className="text-slate-300">
                <ShoppingCart className="w-4 h-4 ml-2" />
                سوق اللاعبين
              </TabsTrigger>
              <TabsTrigger value="history" className="text-slate-300">
                <History className="w-4 h-4 ml-2" />
                السجل
              </TabsTrigger>
            </TabsList>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(allPlayers || []).map((player: any) => (
                  <Card key={player.id} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white">{player.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {player.position}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">السعر:</span>
                          <span className="text-white font-semibold">
                            {((player?.marketValue || 0) / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">النقاط:</span>
                          <span className="text-white font-semibold">
                            {player?.totalPoints || 0}
                          </span>
                        </div>
                        <Button
                          onClick={() => handleBuyPlayer(player.id)}
                          disabled={
                            currentTeam.budget < player.marketValue ||
                            buyPlayerMutation.isPending
                          }
                          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          <ShoppingCart className="w-4 h-4 ml-2" />
                          شراء
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 mt-6">
              {transactions.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="py-8">
                    <p className="text-slate-400 text-center">
                      لا توجد معاملات بعد
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="bg-slate-800 border-slate-700"
                    >
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-semibold">
                              {transaction.transactionType === "buy"
                                ? "شراء"
                                : "بيع"}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {new Date(transaction.createdAt).toLocaleDateString(
                                "ar-EG"
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                transaction.transactionType === "buy"
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}
                            >
                              {transaction.transactionType === "buy" ? "-" : "+"}
                              {(transaction.price / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-slate-400 text-sm">
                              الرصيد: {(transaction.budgetAfter / 1000000).toFixed(2)}M
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
