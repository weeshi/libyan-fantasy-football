import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface Player {
  id: number;
  name: string;
  teamId: number;
  position: "goalkeeper" | "defender" | "midfielder" | "forward";
  jerseyNumber: number;
  marketValue: number;
  totalPoints: number;
}

export default function PlayersManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    teamId: number;
    position: "goalkeeper" | "defender" | "midfielder" | "forward";
    jerseyNumber: number;
    marketValue: number;
  }>({
    name: "",
    teamId: 1,
    position: "midfielder",
    jerseyNumber: 0,
    marketValue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const teams = [
    { id: 1, name: "الأهلي بنغازي" },
    { id: 2, name: "الأهلي طرابلس" },
    { id: 3, name: "الهلال" },
    { id: 4, name: "الزاوية" },
    { id: 5, name: "اتحاد بنغازي" },
  ];

  const positions = [
    { value: "goalkeeper", label: "حارس مرمى" },
    { value: "defender", label: "مدافع" },
    { value: "midfielder", label: "لاعب وسط" },
    { value: "forward", label: "مهاجم" },
  ];

  const handleAddPlayer = () => {
    if (formData.name && formData.jerseyNumber > 0) {
      const newPlayer: Player = {
        id: Math.max(...players.map(p => p.id), 0) + 1,
        ...formData,
        totalPoints: 0,
      };
      setPlayers([...players, newPlayer]);
      resetForm();
    }
  };

  const handleUpdatePlayer = () => {
    if (editingPlayer && formData.name && formData.jerseyNumber > 0) {
      setPlayers(players.map(p => 
        p.id === editingPlayer.id 
          ? { ...p, ...formData }
          : p
      ));
      resetForm();
    }
  };

  const handleDeletePlayer = (id: number) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      teamId: player.teamId,
      position: player.position,
      jerseyNumber: player.jerseyNumber,
      marketValue: player.marketValue,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      teamId: 1,
      position: "midfielder" as "goalkeeper" | "defender" | "midfielder" | "forward",
      jerseyNumber: 0,
      marketValue: 0,
    });
    setEditingPlayer(null);
    setShowForm(false);
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition === "all" || player.position === filterPosition;
    const matchesTeam = filterTeam === "all" || player.teamId === parseInt(filterTeam);
    return matchesSearch && matchesPosition && matchesTeam;
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">إدارة اللاعبين</h1>
              <p className="text-slate-400">أضف وعدّل وحذف لاعبي الدوري الليبي</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Player Form */}
        {showForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  {editingPlayer ? "تعديل اللاعب" : "إضافة لاعب جديد"}
                </CardTitle>
                <button onClick={resetForm} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="اسم اللاعب"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as "goalkeeper" | "defender" | "midfielder" | "forward" })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  {positions.map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="رقم القميص"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
                <input
                  type="number"
                  placeholder="القيمة السوقية"
                  value={formData.marketValue}
                  onChange={(e) => setFormData({ ...formData, marketValue: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingPlayer ? "تحديث" : "إضافة"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
              </div>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="all">جميع الفرق</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="all">جميع المراكز</option>
                {positions.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة لاعب
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Players Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">قائمة اللاعبين ({filteredPlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-300">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="text-right py-3 px-4">الاسم</th>
                    <th className="text-right py-3 px-4">الفريق</th>
                    <th className="text-right py-3 px-4">المركز</th>
                    <th className="text-right py-3 px-4">رقم القميص</th>
                    <th className="text-right py-3 px-4">القيمة السوقية</th>
                    <th className="text-right py-3 px-4">النقاط</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        لا توجد لاعبين
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map(player => (
                      <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        <td className="py-3 px-4">{player.name}</td>
                        <td className="py-3 px-4">
                          {teams.find(t => t.id === player.teamId)?.name}
                        </td>
                        <td className="py-3 px-4">
                          {positions.find(p => p.value === player.position)?.label}
                        </td>
                        <td className="py-3 px-4">{player.jerseyNumber}</td>
                        <td className="py-3 px-4">{player.marketValue.toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-400">{player.totalPoints}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPlayer(player)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
