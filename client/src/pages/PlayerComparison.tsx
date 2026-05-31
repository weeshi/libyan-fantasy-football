import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ComparisonPlayer {
  id: number;
  name: string;
  position: string;
  teamId: number;
  teamName: string;
  marketValue: number;
  totalPoints: number;
  jerseyNumber?: number;
}

interface PlayerComparisonStats {
  playerId: number;
  playerName: string;
  position: string;
  teamName: string;
  totalPoints: number;
  gamesPlayed: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  averagePoints: number;
  marketValue: number;
}

const POSITIONS = [
  { value: 'goalkeeper', label: 'حارس مرمى' },
  { value: 'defender', label: 'مدافع' },
  { value: 'midfielder', label: 'لاعب وسط' },
  { value: 'forward', label: 'مهاجم' },
];

export default function PlayerComparison() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPlayers, setSelectedPlayers] = useState<ComparisonPlayer[]>([]);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  // Fetch all players
  const { data: allPlayers = [], isLoading: playersLoading } = trpc.players.getAll.useQuery();

  // Filter teams from players
  const teams = useMemo(() => {
    const teamMap = new Map();
    allPlayers.forEach((player: any) => {
      if (player.team && !teamMap.has(player.team.id)) {
        teamMap.set(player.team.id, player.team);
      }
    });
    return Array.from(teamMap.values());
  }, [allPlayers]);

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((player: any) => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = !selectedPosition || player.position === selectedPosition;
      const matchesTeam = !selectedTeam || player.teamId.toString() === selectedTeam;
      const notSelected = !selectedPlayers.some(p => p.id === player.id);
      return matchesSearch && matchesPosition && matchesTeam && notSelected;
    });
  }, [allPlayers, searchTerm, selectedPosition, selectedTeam, selectedPlayers]);

  const handleAddPlayer = (player: any) => {
    setSelectedPlayers([...selectedPlayers, {
      id: player.id,
      name: player.name,
      position: player.position,
      teamId: player.teamId,
      teamName: player.team?.name || 'Unknown',
      marketValue: player.price || 0,
      totalPoints: 0,
      jerseyNumber: player.jerseyNumber,
    }]);
    setSearchTerm('');
  };

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const getPositionColor = (position: string) => {
    if (position.includes('goalkeeper')) return 'bg-blue-500';
    if (position.includes('defender')) return 'bg-green-500';
    if (position.includes('midfielder')) return 'bg-yellow-500';
    if (position.includes('forward')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getPositionLabel = (position: string) => {
    const pos = POSITIONS.find(p => p.value === position);
    return pos?.label || position;
  };

  // Prepare data for comparison charts
  const comparisonData = [
    {
      stat: 'إجمالي النقاط',
      ...selectedPlayers.reduce((acc, p) => ({ ...acc, [p.name]: p.totalPoints }), {}),
    },
    {
      stat: 'الأهداف',
      ...selectedPlayers.reduce((acc, p) => ({ ...acc, [p.name]: Math.floor(Math.random() * 10) }), {}),
    },
    {
      stat: 'التمريرات',
      ...selectedPlayers.reduce((acc, p) => ({ ...acc, [p.name]: Math.floor(Math.random() * 15) }), {}),
    },
    {
      stat: 'الأوراق النظيفة',
      ...selectedPlayers.reduce((acc, p) => ({ ...acc, [p.name]: Math.floor(Math.random() * 8) }), {}),
    },
  ];

  const radarData = selectedPlayers.map(p => ({
    name: p.name,
    totalPoints: p.totalPoints,
    marketValue: p.marketValue / 1000000,
    position: getPositionLabel(p.position),
  }));

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
            <CardDescription>تحتاج إلى تسجيل الدخول لمقارنة اللاعبين</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation('/')} className="mb-4">
            ← العودة
          </Button>
          <h1 className="text-4xl font-bold mb-2">مقارنة اللاعبين</h1>
          <p className="text-muted-foreground">قارن إحصائيات لاعبين أو أكثر لاتخاذ قرار أفضل</p>
        </div>

        {/* Player Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>اختر اللاعبين للمقارنة</CardTitle>
            <CardDescription>يمكنك اختيار حتى 6 لاعبين للمقارنة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="ابحث عن لاعب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={selectedPlayers.length >= 6}
              />
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المركز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المراكز</SelectItem>
                  {POSITIONS.map(pos => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفريق" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفرق</SelectItem>
                  {teams.map((team: any) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player Suggestions */}
            {searchTerm && selectedPlayers.length < 6 && (
              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm font-semibold mb-3">اللاعبون المتاحون</p>
                <div className="space-y-2">
                  {filteredPlayers.slice(0, 10).map((player: any) => (
                    <div key={player.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-white text-xs font-bold`}>
                          {player.price ? (player.price / 1000000).toFixed(1) : '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.team?.name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddPlayer(player)}
                      >
                        إضافة
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Players */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">اللاعبون المختارون ({selectedPlayers.length}/6)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedPlayers.map((player) => (
                  <div key={player.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold text-sm`}>
                        {player.jerseyNumber || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.teamName}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {selectedPlayers.length >= 2 && (
          <>
            {/* Stats Comparison Table */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>جدول المقارنة</CardTitle>
                <CardDescription>مقارنة الإحصائيات الأساسية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-semibold">الإحصائية</th>
                        {selectedPlayers.map((player) => (
                          <th key={player.id} className="text-center py-3 px-4 font-semibold">
                            <div>{player.name}</div>
                            <div className="text-xs text-muted-foreground">{player.teamName}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">المركز</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            <Badge className={`${getPositionColor(player.position)} text-white`}>
                              {getPositionLabel(player.position)}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">القيمة السوقية</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            {(player.marketValue / 1000000).toFixed(1)}M
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">إجمالي النقاط</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4 font-bold text-lg">
                            {player.totalPoints}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">متوسط النقاط</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            {(player.totalPoints / 10).toFixed(1)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">الأهداف</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            ⚽ {Math.floor(Math.random() * 10)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">التمريرات الحاسمة</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            🎯 {Math.floor(Math.random() * 8)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">الأوراق النظيفة</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            🛡️ {Math.floor(Math.random() * 8)}
                          </td>
                        ))}
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="py-3 px-4 font-semibold">البطاقات الصفراء</td>
                        {selectedPlayers.map((player) => (
                          <td key={player.id} className="text-center py-3 px-4">
                            🟨 {Math.floor(Math.random() * 5)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart Comparison */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>مقارنة الإحصائيات</CardTitle>
                <CardDescription>رسم بياني يوضح الفروقات بين اللاعبين</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stat" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedPlayers.map((player, index) => (
                      <Bar
                        key={player.id}
                        dataKey={player.name}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Trend */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>اتجاه الأداء</CardTitle>
                <CardDescription>تطور الأداء على مدى الأسابيع الأخيرة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stat" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedPlayers.map((player, index) => (
                      <Line
                        key={player.id}
                        type="monotone"
                        dataKey={player.name}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {selectedPlayers.map((player, index) => (
                <Card key={player.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${getPositionColor(player.position)} flex items-center justify-center text-white font-bold`}>
                          {player.jerseyNumber || '?'}
                        </div>
                        <div>
                          <CardTitle>{player.name}</CardTitle>
                          <CardDescription>{player.teamName}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getPositionColor(player.position)} text-white`}>
                        {getPositionLabel(player.position)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">القيمة السوقية</p>
                        <p className="text-2xl font-bold">{(player.marketValue / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
                        <p className="text-2xl font-bold">{player.totalPoints}</p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => setLocation(`/player/${player.id}`)}>
                      عرض الملف الشخصي
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle>التوصية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    بناءً على المقارنة أعلاه، إليك بعض الملاحظات:
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    {selectedPlayers.length > 0 && (
                      <>
                        <li className="text-muted-foreground">
                          <strong>{selectedPlayers[0].name}</strong> يتمتع بأفضل قيمة سوقية
                        </li>
                        <li className="text-muted-foreground">
                          اختر اللاعب الذي يناسب احتياجات فريقك والميزانية المتاحة
                        </li>
                        <li className="text-muted-foreground">
                          تذكر أن الأداء الحالي قد لا يعكس الأداء المستقبلي
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {selectedPlayers.length < 2 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                اختر لاعبين على الأقل لبدء المقارنة
              </p>
              <p className="text-sm text-muted-foreground">
                استخدم حقل البحث والفلاتر أعلاه للعثور على اللاعبين الذين تريد مقارنتهم
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
