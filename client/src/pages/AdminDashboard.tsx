import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Trophy, TrendingUp, AlertCircle, Settings, Download,
  Edit2, Trash2, Plus, Search, Filter, CheckCircle, XCircle,
  Clock, DollarSign, Activity, BarChart3, PieChartIcon, ArrowUpDown, Calendar
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useToast } from '@/contexts/ToastContext';
import { usePagination } from '@/hooks/usePagination';
import { SearchFilterBar } from '@/components/admin/SearchFilterBar';
import { Pagination } from '@/components/admin/Pagination';
import {
  UserModal, TeamModal, PlayerModal, LeagueModal,
  DeleteConfirmDialog, ManageTeamPlayersModal
} from '@/components/admin/AdminModals';

// Mock data for demonstration
const mockStats = {
  totalUsers: 1250,
  activeTeams: 980,
  totalMatches: 156,
  totalPoints: 45320,
  usersGrowth: [
    { month: 'يناير', users: 450, teams: 380 },
    { month: 'فبراير', users: 620, teams: 510 },
    { month: 'مارس', users: 890, teams: 720 },
    { month: 'أبريل', users: 1100, teams: 890 },
    { month: 'مايو', users: 1250, teams: 980 },
  ],
  scoreDistribution: [
    { name: 'ممتاز (90+)', value: 250 },
    { name: 'جيد جداً (75-89)', value: 380 },
    { name: 'جيد (60-74)', value: 420 },
    { name: 'متوسط (45-59)', value: 150 },
    { name: 'ضعيف (<45)', value: 50 },
  ],
  recentUsers: [
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', joinDate: '2026-06-10', status: 'نشط', role: 'user', teams: 2 },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', joinDate: '2026-06-09', status: 'نشط', role: 'user', teams: 1 },
    { id: 3, name: 'محمود حسن', email: 'mahmoud@example.com', joinDate: '2026-06-08', status: 'غير نشط', role: 'admin', teams: 3 },
    { id: 4, name: 'ليلى محمد', email: 'layla@example.com', joinDate: '2026-06-07', status: 'نشط', role: 'user', teams: 1 },
  ],
  topPlayers: [
    { id: 1, name: 'محمد علي', position: 'مهاجم', team: 'الأهلي', points: 450, matches: 12, purchases: 245, transfers: 12 },
    { id: 2, name: 'علي حسن', position: 'وسط', team: 'الترجي', points: 420, matches: 12, purchases: 198, transfers: 8 },
    { id: 3, name: 'سارة محمود', position: 'مدافع', team: 'الهلال', points: 380, matches: 12, purchases: 167, transfers: 5 },
    { id: 4, name: 'خالد محمد', position: 'حارس', team: 'الزمالك', points: 320, matches: 12, purchases: 145, transfers: 3 },
  ],
  teams: [
    { id: 1, name: 'فريق النجموم', owner: 'أحمد محمد', players: 11, points: 2450, rank: 1, leagues: 2, status: 'نشط', joinDate: '2026-05-01' },
    { id: 2, name: 'فريق العربي', owner: 'فاطمة علي', players: 11, points: 2180, rank: 3, leagues: 1, status: 'نشط', joinDate: '2026-05-05' },
    { id: 3, name: 'فريق العابرون', owner: 'محمود حسن', players: 11, points: 2050, rank: 5, leagues: 3, status: 'نشط', joinDate: '2026-05-10' },
    { id: 4, name: 'فريق الأبطال', owner: 'ليلى محمد', players: 11, points: 1920, rank: 8, leagues: 2, status: 'نشط', joinDate: '2026-05-15' },
    { id: 5, name: 'فريق الفوز', owner: 'علي عبدالله', players: 10, points: 1850, rank: 12, leagues: 1, status: 'نشط', joinDate: '2026-05-20' },
  ],
  leagues: [
    { id: 1, name: 'الدوري الكلاسيكي', type: 'عام', members: 450, status: 'نشط', description: 'الدوري الرئيسي', teams: 450, avgPoints: 1850 },
    { id: 2, name: 'دوري الأصدقاء', type: 'خاص', members: 120, status: 'نشط', description: 'دوري خاص بالأصدقاء', teams: 120, avgPoints: 1650 },
    { id: 3, name: 'كأس الخيال', type: 'بطولة', members: 280, status: 'جاري', description: 'بطولة سنوية', teams: 280, avgPoints: 1920 },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // ============= Date Range Filter =============
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-06-30');

  // ============= Users Tab State =============
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [userSort, setUserSort] = useState<'name' | 'joinDate' | 'teams'>('joinDate');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [users, setUsers] = useState(mockStats.recentUsers);
  const userPagination = usePagination(users.length);

  // ============= Teams Tab State =============
  const [teamSearch, setTeamSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [teamSort, setTeamSort] = useState<'name' | 'points' | 'rank'>('rank');
  const [teamSortOrder, setTeamSortOrder] = useState<'asc' | 'desc'>('asc');
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
  const [managePlayersOpen, setManagePlayersOpen] = useState(false);
  const [teams, setTeams] = useState(mockStats.teams);
  const teamPagination = usePagination(teams.length);

  // ============= Players Tab State =============
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerFilter, setPlayerFilter] = useState('all');
  const [playerSort, setPlayerSort] = useState<'name' | 'points' | 'purchases'>('points');
  const [playerSortOrder, setPlayerSortOrder] = useState<'asc' | 'desc'>('desc');
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);
  const [players, setPlayers] = useState(mockStats.topPlayers);
  const playerPagination = usePagination(players.length);

  // ============= Leagues Tab State =============
  const [leagueSearch, setLeagueSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [leagueSort, setLeagueSort] = useState<'name' | 'members' | 'avgPoints'>('members');
  const [leagueSortOrder, setLeagueSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leagueModalOpen, setLeagueModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);
  const [leagues, setLeagues] = useState(mockStats.leagues);
  const leaguePagination = usePagination(leagues.length);

  // ============= Sorting and Filtering Logic =============
  const sortedUsers = useMemo(() => {
    let filtered = users.filter(u => 
      u.name.includes(userSearch) && (userFilter === 'all' || u.role === userFilter)
    );
    return filtered.sort((a, b) => {
      let aVal: any = a[userSort];
      let bVal: any = b[userSort];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return userSortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [users, userSearch, userFilter, userSort, userSortOrder]);

  const sortedTeams = useMemo(() => {
    let filtered = teams.filter(t => 
      t.name.includes(teamSearch) && (teamFilter === 'all' || t.status === teamFilter)
    );
    return filtered.sort((a, b) => {
      let aVal: any = a[teamSort];
      let bVal: any = b[teamSort];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return teamSortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [teams, teamSearch, teamFilter, teamSort, teamSortOrder]);

  const sortedPlayers = useMemo(() => {
    let filtered = players.filter(p => 
      p.name.includes(playerSearch) && (playerFilter === 'all' || p.position === playerFilter)
    );
    return filtered.sort((a, b) => {
      let aVal: any = a[playerSort];
      let bVal: any = b[playerSort];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return playerSortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [players, playerSearch, playerFilter, playerSort, playerSortOrder]);

  const sortedLeagues = useMemo(() => {
    let filtered = leagues.filter(l => 
      l.name.includes(leagueSearch) && (leagueFilter === 'all' || l.status === leagueFilter)
    );
    return filtered.sort((a, b) => {
      let aVal: any = a[leagueSort];
      let bVal: any = b[leagueSort];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      return leagueSortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [leagues, leagueSearch, leagueFilter, leagueSort, leagueSortOrder]);

  const paginatedUsers = sortedUsers.slice(
    (userPagination.currentPage - 1) * userPagination.itemsPerPage,
    userPagination.currentPage * userPagination.itemsPerPage
  );

  const paginatedTeams = sortedTeams.slice(
    (teamPagination.currentPage - 1) * teamPagination.itemsPerPage,
    teamPagination.currentPage * teamPagination.itemsPerPage
  );

  const paginatedPlayers = sortedPlayers.slice(
    (playerPagination.currentPage - 1) * playerPagination.itemsPerPage,
    playerPagination.currentPage * playerPagination.itemsPerPage
  );

  const paginatedLeagues = sortedLeagues.slice(
    (leaguePagination.currentPage - 1) * leaguePagination.itemsPerPage,
    leaguePagination.currentPage * leaguePagination.itemsPerPage
  );

  // ============= Handlers =============
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteUserOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      addToast('تم حذف المستخدم بنجاح', 'success');
      setDeleteUserOpen(false);
    }
  };

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setTeamModalOpen(true);
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setTeamModalOpen(true);
  };

  const handleDeleteTeam = (team: any) => {
    setSelectedTeam(team);
    setDeleteTeamOpen(true);
  };

  const confirmDeleteTeam = () => {
    if (selectedTeam) {
      setTeams(teams.filter(t => t.id !== selectedTeam.id));
      addToast('تم حذف الفريق بنجاح', 'success');
      setDeleteTeamOpen(false);
    }
  };

  const handleAddPlayer = () => {
    setSelectedPlayer(null);
    setPlayerModalOpen(true);
  };

  const handleEditPlayer = (player: any) => {
    setSelectedPlayer(player);
    setPlayerModalOpen(true);
  };

  const handleDeletePlayer = (player: any) => {
    setSelectedPlayer(player);
    setDeletePlayerOpen(true);
  };

  const confirmDeletePlayer = () => {
    if (selectedPlayer) {
      setPlayers(players.filter(p => p.id !== selectedPlayer.id));
      addToast('تم حذف اللاعب بنجاح', 'success');
      setDeletePlayerOpen(false);
    }
  };

  const handleAddLeague = () => {
    setSelectedLeague(null);
    setLeagueModalOpen(true);
  };

  const handleEditLeague = (league: any) => {
    setSelectedLeague(league);
    setLeagueModalOpen(true);
  };

  const handleDeleteLeague = (league: any) => {
    setSelectedLeague(league);
    setDeleteLeagueOpen(true);
  };

  const confirmDeleteLeague = () => {
    if (selectedLeague) {
      setLeagues(leagues.filter(l => l.id !== selectedLeague.id));
      addToast('تم حذف الدوري بنجاح', 'success');
      setDeleteLeagueOpen(false);
    }
  };

  // Check admin access
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8" dir="rtl">
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-bold text-red-500">لا توجد صلاحيات</h3>
                <p className="text-sm text-slate-300">هذه الصفحة مخصصة للمسؤولين فقط</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-slate-400">إدارة شاملة للنظام والمستخدمين والفرق واللاعبين</p>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              تصفية حسب الفترة الزمنية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-slate-300 block mb-2">من</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-slate-300 block mb-2">إلى</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-white">{mockStats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الفرق النشطة</p>
                  <p className="text-3xl font-bold text-white">{mockStats.activeTeams}</p>
                </div>
                <Trophy className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي المباريات</p>
                  <p className="text-3xl font-bold text-white">{mockStats.totalMatches}</p>
                </div>
                <Activity className="w-12 h-12 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي النقاط</p>
                  <p className="text-3xl font-bold text-white">{mockStats.totalPoints.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>نمو المستخدمين والفرق</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockStats.usersGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="المستخدمون" />
                  <Line type="monotone" dataKey="teams" stroke="#10b981" name="الفرق" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle>توزيع النقاط</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockStats.scoreDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockStats.scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="teams">الفرق</TabsTrigger>
            <TabsTrigger value="players">اللاعبون</TabsTrigger>
            <TabsTrigger value="leagues">الدوريات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>ملخص النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded">
                      <span className="text-slate-300">معدل النمو الشهري</span>
                      <span className="text-2xl font-bold text-green-400">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded">
                      <span className="text-slate-300">المستخدمون النشطون</span>
                      <span className="text-2xl font-bold text-blue-400">890</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded">
                      <span className="text-slate-300">متوسط نقاط الفريق</span>
                      <span className="text-2xl font-bold text-purple-400">1,890</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded">
                      <span className="text-slate-300">الفرق المعطلة</span>
                      <span className="text-2xl font-bold text-red-400">12</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة المستخدمين</CardTitle>
                  <Button onClick={handleAddUser} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة مستخدم
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="بحث عن مستخدم..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                  </div>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="all">جميع الأدوار</option>
                    <option value="user">مستخدم</option>
                    <option value="admin">مسؤول</option>
                  </select>
                  <select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value as any)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="name">الاسم</option>
                    <option value="joinDate">تاريخ الانضمام</option>
                    <option value="teams">عدد الفرق</option>
                  </select>
                  <button
                    onClick={() => setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white hover:bg-slate-600"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">الاسم</th>
                        <th className="text-right p-3 text-slate-300">البريد الإلكتروني</th>
                        <th className="text-right p-3 text-slate-300">تاريخ الانضمام</th>
                        <th className="text-right p-3 text-slate-300">الفرق</th>
                        <th className="text-right p-3 text-slate-300">الحالة</th>
                        <th className="text-right p-3 text-slate-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-3">{user.name}</td>
                          <td className="p-3 text-slate-400">{user.email}</td>
                          <td className="p-3">{user.joinDate}</td>
                          <td className="p-3">{user.teams}</td>
                          <td className="p-3">
                            <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={userPagination.currentPage}
                  totalPages={Math.ceil(sortedUsers.length / userPagination.itemsPerPage)}
                  onPageChange={userPagination.setCurrentPage}
                  itemsPerPage={userPagination.itemsPerPage}
                  onItemsPerPageChange={userPagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة الفرق</CardTitle>
                  <Button onClick={handleAddTeam} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة فريق
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="بحث عن فريق..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                  </div>
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="all">جميع الفرق</option>
                    <option value="نشط">نشط</option>
                    <option value="معطل">معطل</option>
                  </select>
                  <select
                    value={teamSort}
                    onChange={(e) => setTeamSort(e.target.value as any)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="name">الاسم</option>
                    <option value="points">النقاط</option>
                    <option value="rank">الترتيب</option>
                  </select>
                  <button
                    onClick={() => setTeamSortOrder(teamSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white hover:bg-slate-600"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">الاسم</th>
                        <th className="text-right p-3 text-slate-300">المالك</th>
                        <th className="text-right p-3 text-slate-300">اللاعبون</th>
                        <th className="text-right p-3 text-slate-300">النقاط</th>
                        <th className="text-right p-3 text-slate-300">الترتيب</th>
                        <th className="text-right p-3 text-slate-300">الدوريات</th>
                        <th className="text-right p-3 text-slate-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTeams.map((team) => (
                        <tr key={team.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-3">{team.name}</td>
                          <td className="p-3 text-slate-400">{team.owner}</td>
                          <td className="p-3">{team.players}</td>
                          <td className="p-3 font-bold text-green-400">{team.points}</td>
                          <td className="p-3">#{team.rank}</td>
                          <td className="p-3">{team.leagues}</td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={teamPagination.currentPage}
                  totalPages={Math.ceil(sortedTeams.length / teamPagination.itemsPerPage)}
                  onPageChange={teamPagination.setCurrentPage}
                  itemsPerPage={teamPagination.itemsPerPage}
                  onItemsPerPageChange={teamPagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة اللاعبين</CardTitle>
                  <Button onClick={handleAddPlayer} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة لاعب
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="بحث عن لاعب..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                  </div>
                  <select
                    value={playerFilter}
                    onChange={(e) => setPlayerFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="all">جميع المراكز</option>
                    <option value="مهاجم">مهاجم</option>
                    <option value="وسط">وسط</option>
                    <option value="مدافع">مدافع</option>
                    <option value="حارس">حارس</option>
                  </select>
                  <select
                    value={playerSort}
                    onChange={(e) => setPlayerSort(e.target.value as any)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="name">الاسم</option>
                    <option value="points">النقاط</option>
                    <option value="purchases">الشراء</option>
                  </select>
                  <button
                    onClick={() => setPlayerSortOrder(playerSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white hover:bg-slate-600"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">الاسم</th>
                        <th className="text-right p-3 text-slate-300">المركز</th>
                        <th className="text-right p-3 text-slate-300">الفريق</th>
                        <th className="text-right p-3 text-slate-300">النقاط</th>
                        <th className="text-right p-3 text-slate-300">المباريات</th>
                        <th className="text-right p-3 text-slate-300">الشراء</th>
                        <th className="text-right p-3 text-slate-300">الاستبدال</th>
                        <th className="text-right p-3 text-slate-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPlayers.map((player) => (
                        <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-3">{player.name}</td>
                          <td className="p-3">
                            <Badge variant="outline">{player.position}</Badge>
                          </td>
                          <td className="p-3 text-slate-400">{player.team}</td>
                          <td className="p-3 font-bold text-green-400">{player.points}</td>
                          <td className="p-3">{player.matches}</td>
                          <td className="p-3 text-blue-400">{player.purchases}</td>
                          <td className="p-3 text-purple-400">{player.transfers}</td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleEditPlayer(player)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={playerPagination.currentPage}
                  totalPages={Math.ceil(sortedPlayers.length / playerPagination.itemsPerPage)}
                  onPageChange={playerPagination.setCurrentPage}
                  itemsPerPage={playerPagination.itemsPerPage}
                  onItemsPerPageChange={playerPagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>إدارة الدوريات</CardTitle>
                  <Button onClick={handleAddLeague} className="gap-2">
                    <Plus className="w-4 h-4" />
                    إضافة دوري
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="بحث عن دوري..."
                      value={leagueSearch}
                      onChange={(e) => setLeagueSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                  </div>
                  <select
                    value={leagueFilter}
                    onChange={(e) => setLeagueFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="all">جميع الدوريات</option>
                    <option value="نشط">نشط</option>
                    <option value="جاري">جاري</option>
                  </select>
                  <select
                    value={leagueSort}
                    onChange={(e) => setLeagueSort(e.target.value as any)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    <option value="name">الاسم</option>
                    <option value="members">الأعضاء</option>
                    <option value="avgPoints">متوسط النقاط</option>
                  </select>
                  <button
                    onClick={() => setLeagueSortOrder(leagueSortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white hover:bg-slate-600"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-right p-3 text-slate-300">الاسم</th>
                        <th className="text-right p-3 text-slate-300">النوع</th>
                        <th className="text-right p-3 text-slate-300">الأعضاء</th>
                        <th className="text-right p-3 text-slate-300">الفرق</th>
                        <th className="text-right p-3 text-slate-300">متوسط النقاط</th>
                        <th className="text-right p-3 text-slate-300">الحالة</th>
                        <th className="text-right p-3 text-slate-300">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeagues.map((league) => (
                        <tr key={league.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="p-3">{league.name}</td>
                          <td className="p-3">
                            <Badge variant="outline">{league.type}</Badge>
                          </td>
                          <td className="p-3">{league.members}</td>
                          <td className="p-3">{league.teams}</td>
                          <td className="p-3 font-bold text-green-400">{league.avgPoints}</td>
                          <td className="p-3">
                            <Badge variant={league.status === 'نشط' ? 'default' : 'secondary'}>
                              {league.status}
                            </Badge>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={() => handleEditLeague(league)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteLeague(league)}
                              className="p-1 hover:bg-slate-700 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={leaguePagination.currentPage}
                  totalPages={Math.ceil(sortedLeagues.length / leaguePagination.itemsPerPage)}
                  onPageChange={leaguePagination.setCurrentPage}
                  itemsPerPage={leaguePagination.itemsPerPage}
                  onItemsPerPageChange={leaguePagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    النسخ الاحتياطية
                  </h3>
                  <Button className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    تحميل نسخة احتياطية
                  </Button>
                </div>
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5" />
                    إعادة تعيين البيانات
                  </h3>
                  <Button variant="destructive" className="w-full">
                    حذف جميع البيانات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <UserModal
          open={userModalOpen}
          onOpenChange={setUserModalOpen}
          user={selectedUser}
          onSave={(data) => {
            if (selectedUser) {
              setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
              addToast('تم تحديث المستخدم بنجاح', 'success');
            } else {
              setUsers([...users, { ...data, id: Math.max(...users.map(u => u.id)) + 1 }]);
              addToast('تم إضافة المستخدم بنجاح', 'success');
            }
            setUserModalOpen(false);
          }}
        />

        <DeleteConfirmDialog
          open={deleteUserOpen}
          onOpenChange={setDeleteUserOpen}
          title="حذف المستخدم"
          description={`هل تريد حذف ${selectedUser?.name}؟`}
          onConfirm={confirmDeleteUser}
        />

        <TeamModal
          open={teamModalOpen}
          onOpenChange={setTeamModalOpen}
          team={selectedTeam}
          onSave={(data) => {
            if (selectedTeam) {
              setTeams(teams.map(t => t.id === selectedTeam.id ? { ...t, ...data } : t));
              addToast('تم تحديث الفريق بنجاح', 'success');
            } else {
              setTeams([...teams, { ...data, id: Math.max(...teams.map(t => t.id)) + 1 }]);
              addToast('تم إضافة الفريق بنجاح', 'success');
            }
            setTeamModalOpen(false);
          }}
        />

        <DeleteConfirmDialog
          open={deleteTeamOpen}
          onOpenChange={setDeleteTeamOpen}
          title="حذف الفريق"
          description={`هل تريد حذف ${selectedTeam?.name}؟`}
          onConfirm={confirmDeleteTeam}
        />

        <PlayerModal
          open={playerModalOpen}
          onOpenChange={setPlayerModalOpen}
          player={selectedPlayer}
          onSave={(data) => {
            if (selectedPlayer) {
              setPlayers(players.map(p => p.id === selectedPlayer.id ? { ...p, ...data } : p));
              addToast('تم تحديث اللاعب بنجاح', 'success');
            } else {
              setPlayers([...players, { ...data, id: Math.max(...players.map(p => p.id)) + 1 }]);
              addToast('تم إضافة اللاعب بنجاح', 'success');
            }
            setPlayerModalOpen(false);
          }}
        />

        <DeleteConfirmDialog
          open={deletePlayerOpen}
          onOpenChange={setDeletePlayerOpen}
          title="حذف اللاعب"
          description={`هل تريد حذف ${selectedPlayer?.name}؟`}
          onConfirm={confirmDeletePlayer}
        />

        <LeagueModal
          open={leagueModalOpen}
          onOpenChange={setLeagueModalOpen}
          league={selectedLeague}
          onSave={(data) => {
            if (selectedLeague) {
              setLeagues(leagues.map(l => l.id === selectedLeague.id ? { ...l, ...data } : l));
              addToast('تم تحديث الدوري بنجاح', 'success');
            } else {
              setLeagues([...leagues, { ...data, id: Math.max(...leagues.map(l => l.id)) + 1 }]);
              addToast('تم إضافة الدوري بنجاح', 'success');
            }
            setLeagueModalOpen(false);
          }}
        />

        <DeleteConfirmDialog
          open={deleteLeagueOpen}
          onOpenChange={setDeleteLeagueOpen}
          title="حذف الدوري"
          description={`هل تريد حذف ${selectedLeague?.name}؟`}
          onConfirm={confirmDeleteLeague}
        />
      </div>
    </div>
  );
}
