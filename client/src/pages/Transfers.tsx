/**
 * Transfers Page
 * Manage player transfers with deadline countdown
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TransferDeadlineCountdown from "@/components/TransferDeadlineCountdown";
import { AlertCircle, Plus, Minus, Search } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
  price: number;
  totalPoints: number;
  status: "available" | "owned" | "unavailable";
}

interface TransferAction {
  type: "buy" | "sell";
  player: Player;
  price: number;
  timestamp: Date;
}

export default function Transfers() {
  // const { toast } = useToast();
  const toast = (config: any) => console.log(config);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [transfers, setTransfers] = useState<TransferAction[]>([]);
  const [budget, setBudget] = useState(100000000); // 100M budget

  // Mock deadline - replace with real data from API
  const deadline = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  const isDeadlineOpen = true;

  // Mock players data
  const mockPlayers: Player[] = [
    {
      id: 1,
      name: "محمود الشرقاوي",
      position: "goalkeeper",
      team: "الأهلي",
      price: 5000000,
      totalPoints: 245,
      status: "available",
    },
    {
      id: 2,
      name: "أحمد الفايد",
      position: "defender",
      team: "الأهلي",
      price: 6500000,
      totalPoints: 189,
      status: "available",
    },
    {
      id: 3,
      name: "عماد متعب",
      position: "midfielder",
      team: "الأهلي",
      price: 8000000,
      totalPoints: 267,
      status: "owned",
    },
    {
      id: 4,
      name: "محمود كهربا",
      position: "forward",
      team: "الأهلي",
      price: 9500000,
      totalPoints: 312,
      status: "available",
    },
    {
      id: 5,
      name: "علي معلول",
      position: "defender",
      team: "الترجي",
      price: 5500000,
      totalPoints: 156,
      status: "available",
    },
  ];

  const filteredPlayers = mockPlayers.filter((player) => {
    const matchesSearch =
      player.name.includes(searchTerm) ||
      player.team.includes(searchTerm);
    const matchesPosition =
      selectedPosition === "all" || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const handleBuyPlayer = (player: Player) => {
    if (budget < player.price) {
    console.log("ميزانية غير كافية");
      return;
    }

    setTransfers([...transfers, { type: "buy", player, price: player.price, timestamp: new Date() }]);
    setBudget(budget - player.price);

    console.log(`تم شراء ${player.name} بنجاح`);
  };

  const handleSellPlayer = (player: Player) => {
    setTransfers([...transfers, { type: "sell", player, price: player.price, timestamp: new Date() }]);
    setBudget(budget + player.price);

    console.log(`تم بيع ${player.name} بنجاح`);
  };

  const handleConfirmTransfers = () => {
    if (transfers.length === 0) {
      console.log("لا توجد انتقالات");
      return;
    }

    // Simulate API call
    console.log(`تم تأكيد ${transfers.length} انتقالات بنجاح`);

    setTransfers([]);
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      goalkeeper: "حارس",
      defender: "مدافع",
      midfielder: "وسط",
      forward: "مهاجم",
    };
    return labels[position] || position;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">الانتقالات</h1>
        <p className="text-muted-foreground">أدر فريقك وقم بالانتقالات المطلوبة</p>
      </div>

      {/* Deadline Countdown */}
      <TransferDeadlineCountdown
        deadline={deadline}
        isOpen={isDeadlineOpen}
        gameweekNumber={1}
      />

      {/* Budget Info */}
      <Card>
        <CardHeader>
          <CardTitle>الميزانية المتبقية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {(budget / 1000000).toFixed(1)}M
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            الميزانية الكلية: 100M
          </p>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن لاعب أو فريق..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedPosition === "all" ? "default" : "outline"}
              onClick={() => setSelectedPosition("all")}
            >
              الكل
            </Button>
            <Button
              variant={selectedPosition === "goalkeeper" ? "default" : "outline"}
              onClick={() => setSelectedPosition("goalkeeper")}
            >
              حراس
            </Button>
            <Button
              variant={selectedPosition === "defender" ? "default" : "outline"}
              onClick={() => setSelectedPosition("defender")}
            >
              مدافعون
            </Button>
            <Button
              variant={selectedPosition === "midfielder" ? "default" : "outline"}
              onClick={() => setSelectedPosition("midfielder")}
            >
              وسط
            </Button>
            <Button
              variant={selectedPosition === "forward" ? "default" : "outline"}
              onClick={() => setSelectedPosition("forward")}
            >
              مهاجمون
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card>
        <CardHeader>
          <CardTitle>اللاعبون المتاحون</CardTitle>
          <CardDescription>
            {filteredPlayers.length} لاعب متاح
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {player.team} • {getPositionLabel(player.position)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">{(player.price / 1000000).toFixed(1)}M</p>
                    <p className="text-sm text-muted-foreground">
                      {player.totalPoints} نقطة
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {player.status === "available" && (
                      <Button
                        size="sm"
                        onClick={() => handleBuyPlayer(player)}
                        disabled={budget < player.price}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    {player.status === "owned" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSellPlayer(player)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Transfers */}
      {transfers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>الانتقالات المعلقة ({transfers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transfers.map((transfer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  {transfer.type === "buy" ? (
                    <Plus className="w-4 h-4 text-green-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{transfer.player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transfer.type === "buy" ? "شراء" : "بيع"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {transfer.type === "buy" ? "-" : "+"}
                    {(transfer.price / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            ))}

            <Button
              onClick={handleConfirmTransfers}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              تأكيد الانتقالات
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Warning Alert */}
      {!isDeadlineOpen && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            نافذة الانتقالات مغلقة حالياً. لا يمكن إجراء أي انتقالات حتى فتح النافذة التالية.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
