import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Users, Trophy, Lock, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface League {
  id: number;
  name: string;
  description: string;
  creatorId: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "draft" | "active" | "completed";
  isPrivate: boolean;
}

export default function LeaguesManagement() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [leagues, setLeagues] = useState<League[]>([
    {
      id: 1,
      name: "دوري الأصدقاء",
      description: "دوري خاص بين الأصدقاء",
      creatorId: 1,
      maxParticipants: 10,
      currentParticipants: 5,
      status: "active",
      isPrivate: false,
    },
    {
      id: 2,
      name: "دوري العائلة",
      description: "دوري عائلي",
      creatorId: 2,
      maxParticipants: 8,
      currentParticipants: 4,
      status: "active",
      isPrivate: true,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxParticipants: 20,
    isPrivate: false,
  });
  const [joinedLeagues, setJoinedLeagues] = useState<number[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleCreateLeague = () => {
    if (formData.name && user) {
      const newLeague: League = {
        id: Math.max(...leagues.map(l => l.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        creatorId: user.id,
        maxParticipants: formData.maxParticipants,
        currentParticipants: 1,
        status: "draft",
        isPrivate: formData.isPrivate,
      };
      setLeagues([...leagues, newLeague]);
      resetForm();
    }
  };

  const handleJoinLeague = (leagueId: number) => {
    if (!joinedLeagues.includes(leagueId)) {
      setJoinedLeagues([...joinedLeagues, leagueId]);
      setLeagues(leagues.map(l =>
        l.id === leagueId
          ? { ...l, currentParticipants: l.currentParticipants + 1 }
          : l
      ));
    }
  };

  const handleLeaveLeague = (leagueId: number) => {
    setJoinedLeagues(joinedLeagues.filter(id => id !== leagueId));
    setLeagues(leagues.map(l =>
      l.id === leagueId
        ? { ...l, currentParticipants: Math.max(0, l.currentParticipants - 1) }
        : l
    ));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      maxParticipants: 20,
      isPrivate: false,
    });
    setShowCreateForm(false);
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || league.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return null;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-900" dir="rtl">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">الدوريات</h1>
              <p className="text-slate-400">انضم إلى دوري أو أنشئ واحداً جديداً</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">العودة</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create League Form - Admin Only */}
        {isAdmin && showCreateForm && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">إنشاء دوري جديد</CardTitle>
                <button onClick={resetForm} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="اسم الدوري"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
                <input
                  type="number"
                  placeholder="عدد المشاركين الأقصى"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
                <textarea
                  placeholder="وصف الدوري"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-1 md:col-span-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                  rows={3}
                />
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    className="w-4 h-4"
                  />
                  دوري خاص (يتطلب دعوة للانضمام)
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleCreateLeague}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  إنشاء
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن دوري..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="draft">قيد الإعداد</option>
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
              </select>
              {isAdmin && !showCreateForm && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء دوري
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Leagues */}
        {joinedLeagues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">دورياتي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues
                .filter(l => joinedLeagues.includes(l.id))
                .map(league => (
                  <Card key={league.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {league.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400 mt-1">
                            {league.description}
                          </CardDescription>
                        </div>
                        {league.isPrivate && (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {league.currentParticipants} / {league.maxParticipants} مشارك
                        </p>
                        <p className="text-sm text-slate-400">
                          الحالة: <span className="text-blue-400">{league.status === "active" ? "نشط" : league.status === "draft" ? "قيد الإعداد" : "مكتمل"}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleLeaveLeague(league.id)}
                      >
                        مغادرة الدوري
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Available Leagues */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">دوريات متاحة</h2>
          {filteredLeagues.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-8 text-center">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">لا توجد دوريات متاحة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeagues
                .filter(l => !joinedLeagues.includes(l.id))
                .map(league => (
                  <Card key={league.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {league.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400 mt-1">
                            {league.description}
                          </CardDescription>
                        </div>
                        {league.isPrivate && (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {league.currentParticipants} / {league.maxParticipants} مشارك
                        </p>
                        <p className="text-sm text-slate-400">
                          الحالة: <span className="text-blue-400">{league.status === "active" ? "نشط" : league.status === "draft" ? "قيد الإعداد" : "مكتمل"}</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => handleJoinLeague(league.id)}
                        disabled={league.currentParticipants >= league.maxParticipants}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {league.currentParticipants >= league.maxParticipants ? "الدوري ممتلئ" : "الانضمام"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
