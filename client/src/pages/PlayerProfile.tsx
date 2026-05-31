import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';

interface PlayerStats {
  playerId: number;
  playerName: string;
  teamName: string;
  position: string;
  number: number;
  totalPoints: number;
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  averagePoints: number;
  lastGamePoints: number;
  trend: 'up' | 'down' | 'stable';
}

export default function PlayerProfile() {
  const [match, params] = useRoute('/player/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match) return;

    // Simulate fetching player data
    // In real app, this would call an API endpoint
    const mockPlayer: PlayerStats = {
      playerId: parseInt(params?.id || '1'),
      playerName: 'محمد نشنوش',
      teamName: 'الأهلي طرابلس',
      position: 'حارس مرمى',
      number: 1,
      totalPoints: 287,
      gamesPlayed: 12,
      goalsScored: 0,
      assists: 0,
      cleanSheets: 6,
      yellowCards: 1,
      redCards: 0,
      averagePoints: 23.9,
      lastGamePoints: 28,
      trend: 'up'
    };

    setPlayer(mockPlayer);
    setLoading(false);
  }, [match, params]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
            <CardDescription>تحتاج إلى تسجيل الدخول لعرض ملف تعريفي للاعب</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>اللاعب غير موجود</CardTitle>
            <CardDescription>لم نتمكن من العثور على اللاعب المطلوب</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPositionColor = (position: string) => {
    if (position.includes('حارس')) return 'bg-blue-500';
    if (position.includes('مدافع')) return 'bg-green-500';
    if (position.includes('وسط')) return 'bg-yellow-500';
    if (position.includes('مهاجم')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  return (
      <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation('/')} className="mb-4">
            ← العودة
          </Button>
        </div>

        {/* Player Card */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-white text-2xl font-bold`}>
                    {player.number}
                  </div>
                  <div>
                    <CardTitle className="text-3xl mb-2">{player.playerName}</CardTitle>
                    <CardDescription className="text-lg">{player.teamName}</CardDescription>
                  </div>
                </div>
              </div>
              <Badge className={`${getPositionColor(player.position)} text-white`}>
                {player.position}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Points */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي النقاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {getTrendIcon(player.trend)} {player.trend === 'up' ? 'صاعد' : player.trend === 'down' ? 'هابط' : 'مستقر'}
              </p>
            </CardContent>
          </Card>

          {/* Average Points */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">متوسط النقاط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.averagePoints.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-2">لكل مباراة</p>
            </CardContent>
          </Card>

          {/* Games Played */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">المباريات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.gamesPlayed}</div>
              <p className="text-xs text-muted-foreground mt-2">مباراة</p>
            </CardContent>
          </Card>

          {/* Last Game */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">آخر مباراة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.lastGamePoints}</div>
              <p className="text-xs text-muted-foreground mt-2">نقطة</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الأداء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">الأهداف</span>
                  <span className="font-semibold text-lg">⚽ {player.goalsScored}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">التمريرات الحاسمة</span>
                  <span className="font-semibold text-lg">🎯 {player.assists}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">الأوراق النظيفة</span>
                  <span className="font-semibold text-lg">🛡️ {player.cleanSheets}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">البطاقات الصفراء</span>
                  <span className="font-semibold text-lg">🟨 {player.yellowCards}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">البطاقات الحمراء</span>
                  <span className="font-semibold text-lg">🟥 {player.redCards}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Season Overview */}
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة على الموسم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">معدل الأداء</span>
                    <span className="text-sm font-semibold">{Math.round((player.averagePoints / 30) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.round((player.averagePoints / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    🏆 لاعب متميز مع أداء مستقر وموثوق
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ✅ يوصى باختياره في فريقك
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1">أضف إلى فريقي</Button>
          <Button variant="outline" className="flex-1" onClick={() => setLocation(`/player-comparison?player=${player?.playerId}`)}>قارن مع لاعب آخر</Button>
        </div>
      </div>
    </div>
  );
}
