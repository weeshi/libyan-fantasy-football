import { useState } from 'react';
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
  Clock, DollarSign, Activity, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { SearchFilterBar } from '@/components/admin/SearchFilterBar';
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
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', joinDate: '2026-06-10', status: 'نشط', role: 'user' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', joinDate: '2026-06-09', status: 'نشط', role: 'user' },
    { id: 3, name: 'محمود حسن', email: 'mahmoud@example.com', joinDate: '2026-06-08', status: 'غير نشط', role: 'admin' },
    { id: 4, name: 'ليلى محمد', email: 'layla@example.com', joinDate: '2026-06-07', status: 'نشط', role: 'user' },
  ],
  topPlayers: [
    { id: 1, name: 'محمد علي', position: 'مهاجم', team: 'الأهلي', points: 450, matches: 12 },
    { id: 2, name: 'علي حسن', position: 'وسط', team: 'الترجي', points: 420, matches: 12 },
    { id: 3, name: 'سارة محمود', position: 'مدافع', team: 'الهلال', points: 380, matches: 12 },
  ],
  teams: [
    { id: 1, name: 'فريق النجموم', owner: 'أحمد محمد', players: 11, points: 2450, rank: 1, leagues: 2, status: 'نشط' },
    { id: 2, name: 'فريق العربي', owner: 'فاطمة علي', players: 11, points: 2180, rank: 3, leagues: 1, status: 'نشط' },
    { id: 3, name: 'فريق العابرون', owner: 'محمود حسن', players: 11, points: 2050, rank: 5, leagues: 3, status: 'نشط' },
    { id: 4, name: 'فريق الأبطال', owner: 'ليلى محمد', players: 11, points: 1920, rank: 8, leagues: 2, status: 'نشط' },
    { id: 5, name: 'فريق الفوز', owner: 'علي عبدالله', players: 10, points: 1850, rank: 12, leagues: 1, status: 'نشط' },
  ],
  leagues: [
    { id: 1, name: 'الدوري الكلاسيكي', type: 'عام', members: 450, status: 'نشط', description: 'الدوري الرئيسي' },
    { id: 2, name: 'دوري الأصدقاء', type: 'خاص', members: 120, status: 'نشط', description: 'دوري خاص بالأصدقاء' },
    { id: 3, name: 'كأس الخيال', type: 'بطولة', members: 280, status: 'جاري', description: 'بطولة سنوية' },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // ============= Users Tab State =============
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [users, setUsers] = useState(mockStats.recentUsers);

  // ============= Teams Tab State =============
  const [teamSearch, setTeamSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
  const [managePlayersOpen, setManagePlayersOpen] = useState(false);
  const [teams, setTeams] = useState(mockStats.teams);

  // ============= Players Tab State =============
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerFilter, setPlayerFilter] = useState('all');
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);
  const [players, setPlayers] = useState(mockStats.topPlayers);

  // ============= Leagues Tab State =============
  const [leagueSearch, setLeagueSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [leagueModalOpen, setLeagueModalOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [deleteLeagueOpen, setDeleteLeagueOpen] = useState(false);
  const [leagues, setLeagues] = useState(mockStats.leagues);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              وصول مرفوض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              عذراً، لا تملك صلاحيات للوصول إلى لوحة التحكم. يجب أن تكون مسؤولاً.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              العودة إلى الرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============= Filter Functions =============
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.includes(userSearch) || u.email.includes(userSearch);
    const matchesFilter = userFilter === 'all' || u.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTeams = teams.filter(t => {
    const matchesSearch = t.name.includes(teamSearch) || t.owner.includes(teamSearch);
    const matchesFilter = teamFilter === 'all' || t.status === teamFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.includes(playerSearch) || p.team.includes(playerSearch);
    const matchesFilter = playerFilter === 'all' || p.position === playerFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLeagues = leagues.filter(l => {
    const matchesSearch = l.name.includes(leagueSearch) || l.description.includes(leagueSearch);
    const matchesFilter = leagueFilter === 'all' || l.type === leagueFilter;
    return matchesSearch && matchesFilter;
  });

  // ============= User Handlers =============
  const handleAddUser = (data: any) => {
    const newUser = { id: users.length + 1, ...data, joinDate: new Date().toISOString().split('T')[0], status: 'نشط' };
    setUsers([...users, newUser]);
    setUserModalOpen(false);
  };

  const handleEditUser = (data: any) => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
    setUserModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setDeleteUserOpen(false);
    setSelectedUser(null);
  };

  // ============= Team Handlers =============
  const handleAddTeam = (data: any) => {
    const newTeam = { id: teams.length + 1, ...data, players: 0, points: 0, rank: teams.length + 1, leagues: 0, status: 'نشط' };
    setTeams([...teams, newTeam]);
    setTeamModalOpen(false);
  };

  const handleEditTeam = (data: any) => {
    setTeams(teams.map(t => t.id === selectedTeam.id ? { ...t, ...data } : t));
    setTeamModalOpen(false);
    setSelectedTeam(null);
  };

  const handleDeleteTeam = () => {
    setTeams(teams.filter(t => t.id !== selectedTeam.id));
    setDeleteTeamOpen(false);
    setSelectedTeam(null);
  };

  // ============= Player Handlers =============
  const handleAddPlayer = (data: any) => {
    const newPlayer = { id: players.length + 1, ...data, matches: 0 };
    setPlayers([...players, newPlayer]);
    setPlayerModalOpen(false);
  };

  const handleEditPlayer = (data: any) => {
    setPlayers(players.map(p => p.id === selectedPlayer.id ? { ...p, ...data } : p));
    setPlayerModalOpen(false);
    setSelectedPlayer(null);
  };

  const handleDeletePlayer = () => {
    setPlayers(players.filter(p => p.id !== selectedPlayer.id));
    setDeletePlayerOpen(false);
    setSelectedPlayer(null);
  };

  // ============= League Handlers =============
  const handleAddLeague = (data: any) => {
    const newLeague = { id: leagues.length + 1, ...data, members: 0, status: 'نشط' };
    setLeagues([...leagues, newLeague]);
    setLeagueModalOpen(false);
  };

  const handleEditLeague = (data: any) => {
    setLeagues(leagues.map(l => l.id === selectedLeague.id ? { ...l, ...data } : l));
    setLeagueModalOpen(false);
    setSelectedLeague(null);
  };

  const handleDeleteLeague = () => {
    setLeagues(leagues.filter(l => l.id !== selectedLeague.id));
    setDeleteLeagueOpen(false);
    setSelectedLeague(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8" dir="rtl">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">مرحباً بك {user?.name}، إدارة شاملة للتطبيق</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString('ar-LY')}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الفرق النشطة</p>
                  <p className="text-2xl font-bold">{mockStats.activeTeams.toLocaleString('ar-LY')}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المباريات</p>
                  <p className="text-2xl font-bold">{mockStats.totalMatches.toLocaleString('ar-LY')}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي النقاط</p>
                  <p className="text-2xl font-bold">{mockStats.totalPoints.toLocaleString('ar-LY')}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="teams">الفرق</TabsTrigger>
            <TabsTrigger value="players">اللاعبون</TabsTrigger>
            <TabsTrigger value="leagues">الدوريات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Users Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    نمو المستخدمين والفرق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockStats.usersGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#3b82f6" name="المستخدمون" />
                      <Bar dataKey="teams" fill="#10b981" name="الفرق" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    توزيع النقاط
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={mockStats.scoreDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>عرض وإدارة جميع مستخدمي النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchPlaceholder="ابحث عن مستخدم..."
                  searchValue={userSearch}
                  onSearchChange={setUserSearch}
                  filterOptions={[
                    { label: 'الكل', value: 'all' },
                    { label: 'مستخدم', value: 'user' },
                    { label: 'مسؤول', value: 'admin' },
                  ]}
                  filterValue={userFilter}
                  onFilterChange={setUserFilter}
                  onAddClick={() => {
                    setSelectedUser(null);
                    setUserModalOpen(true);
                  }}
                  addButtonLabel="مستخدم جديد"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right py-3 px-4">الاسم</th>
                        <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4">الدور</th>
                        <th className="text-right py-3 px-4">تاريخ الانضمام</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{u.name}</td>
                          <td className="py-3 px-4">{u.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{u.joinDate}</td>
                          <td className="py-3 px-4">
                            <Badge variant={u.status === 'نشط' ? 'default' : 'secondary'}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setUserModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDeleteUserOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الفرق</CardTitle>
                <CardDescription>عرض وإدارة الفرق المسجلة وإضافة اللاعبين</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchPlaceholder="ابحث عن فريق..."
                  searchValue={teamSearch}
                  onSearchChange={setTeamSearch}
                  filterOptions={[
                    { label: 'الكل', value: 'all' },
                    { label: 'نشط', value: 'نشط' },
                    { label: 'غير نشط', value: 'غير نشط' },
                  ]}
                  filterValue={teamFilter}
                  onFilterChange={setTeamFilter}
                  onAddClick={() => {
                    setSelectedTeam(null);
                    setTeamModalOpen(true);
                  }}
                  addButtonLabel="فريق جديد"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right py-3 px-4">اسم الفريق</th>
                        <th className="text-right py-3 px-4">المالك</th>
                        <th className="text-right py-3 px-4">اللاعبون</th>
                        <th className="text-right py-3 px-4">النقاط</th>
                        <th className="text-right py-3 px-4">الرتبة</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTeams.map((t) => (
                        <tr key={t.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{t.name}</td>
                          <td className="py-3 px-4">{t.owner}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{t.players}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{t.points}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-600">#{t.rank}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={t.status === 'نشط' ? 'default' : 'secondary'}>
                              {t.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTeam(t);
                                  setManagePlayersOpen(true);
                                }}
                                title="إدارة اللاعبين"
                              >
                                <Users className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTeam(t);
                                  setTeamModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedTeam(t);
                                  setDeleteTeamOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة اللاعبين</CardTitle>
                <CardDescription>عرض وإدارة بيانات اللاعبين</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchPlaceholder="ابحث عن لاعب..."
                  searchValue={playerSearch}
                  onSearchChange={setPlayerSearch}
                  filterOptions={[
                    { label: 'الكل', value: 'all' },
                    { label: 'حارس', value: 'حارس' },
                    { label: 'مدافع', value: 'مدافع' },
                    { label: 'وسط', value: 'وسط' },
                    { label: 'مهاجم', value: 'مهاجم' },
                  ]}
                  filterValue={playerFilter}
                  onFilterChange={setPlayerFilter}
                  onAddClick={() => {
                    setSelectedPlayer(null);
                    setPlayerModalOpen(true);
                  }}
                  addButtonLabel="لاعب جديد"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right py-3 px-4">الاسم</th>
                        <th className="text-right py-3 px-4">المركز</th>
                        <th className="text-right py-3 px-4">الفريق</th>
                        <th className="text-right py-3 px-4">النقاط</th>
                        <th className="text-right py-3 px-4">المباريات</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlayers.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{p.name}</td>
                          <td className="py-3 px-4">{p.position}</td>
                          <td className="py-3 px-4">{p.team}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{p.points}</Badge>
                          </td>
                          <td className="py-3 px-4">{p.matches}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPlayer(p);
                                  setPlayerModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedPlayer(p);
                                  setDeletePlayerOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الدوريات</CardTitle>
                <CardDescription>عرض وإدارة الدوريات والبطولات</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilterBar
                  searchPlaceholder="ابحث عن دوري..."
                  searchValue={leagueSearch}
                  onSearchChange={setLeagueSearch}
                  filterOptions={[
                    { label: 'الكل', value: 'all' },
                    { label: 'عام', value: 'عام' },
                    { label: 'خاص', value: 'خاص' },
                    { label: 'بطولة', value: 'بطولة' },
                  ]}
                  filterValue={leagueFilter}
                  onFilterChange={setLeagueFilter}
                  onAddClick={() => {
                    setSelectedLeague(null);
                    setLeagueModalOpen(true);
                  }}
                  addButtonLabel="دوري جديد"
                />

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right py-3 px-4">اسم الدوري</th>
                        <th className="text-right py-3 px-4">النوع</th>
                        <th className="text-right py-3 px-4">الأعضاء</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeagues.map((l) => (
                        <tr key={l.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{l.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{l.type}</Badge>
                          </td>
                          <td className="py-3 px-4">{l.members}</td>
                          <td className="py-3 px-4">
                            <Badge variant={l.status === 'نشط' ? 'default' : 'secondary'}>
                              {l.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedLeague(l);
                                  setLeagueModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedLeague(l);
                                  setDeleteLeagueOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>إدارة إعدادات التطبيق</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">النسخ الاحتياطية</p>
                      <p className="text-sm text-muted-foreground">قم بإنشاء نسخة احتياطية من البيانات</p>
                    </div>
                    <Button>
                      <Download className="w-4 h-4 ml-2" />
                      تحميل النسخة
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">إعادة تعيين البيانات</p>
                      <p className="text-sm text-muted-foreground">احذر: هذا الإجراء لا يمكن التراجع عنه</p>
                    </div>
                    <Button variant="destructive">إعادة تعيين</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">تحديث النظام</p>
                      <p className="text-sm text-muted-foreground">تحقق من التحديثات المتاحة</p>
                    </div>
                    <Button variant="outline">التحقق</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={selectedUser ? handleEditUser : handleAddUser}
        initialData={selectedUser}
      />

      <TeamModal
        isOpen={teamModalOpen}
        onClose={() => {
          setTeamModalOpen(false);
          setSelectedTeam(null);
        }}
        onSubmit={selectedTeam ? handleEditTeam : handleAddTeam}
        initialData={selectedTeam}
      />

      <PlayerModal
        isOpen={playerModalOpen}
        onClose={() => {
          setPlayerModalOpen(false);
          setSelectedPlayer(null);
        }}
        onSubmit={selectedPlayer ? handleEditPlayer : handleAddPlayer}
        initialData={selectedPlayer}
      />

      <LeagueModal
        isOpen={leagueModalOpen}
        onClose={() => {
          setLeagueModalOpen(false);
          setSelectedLeague(null);
        }}
        onSubmit={selectedLeague ? handleEditLeague : handleAddLeague}
        initialData={selectedLeague}
      />

      <DeleteConfirmDialog
        isOpen={deleteUserOpen}
        onClose={() => {
          setDeleteUserOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="حذف المستخدم"
        description={`هل تريد حذف المستخدم "${selectedUser?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      <DeleteConfirmDialog
        isOpen={deleteTeamOpen}
        onClose={() => {
          setDeleteTeamOpen(false);
          setSelectedTeam(null);
        }}
        onConfirm={handleDeleteTeam}
        title="حذف الفريق"
        description={`هل تريد حذف الفريق "${selectedTeam?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      <DeleteConfirmDialog
        isOpen={deletePlayerOpen}
        onClose={() => {
          setDeletePlayerOpen(false);
          setSelectedPlayer(null);
        }}
        onConfirm={handleDeletePlayer}
        title="حذف اللاعب"
        description={`هل تريد حذف اللاعب "${selectedPlayer?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      <DeleteConfirmDialog
        isOpen={deleteLeagueOpen}
        onClose={() => {
          setDeleteLeagueOpen(false);
          setSelectedLeague(null);
        }}
        onConfirm={handleDeleteLeague}
        title="حذف الدوري"
        description={`هل تريد حذف الدوري "${selectedLeague?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      <ManageTeamPlayersModal
        isOpen={managePlayersOpen}
        onClose={() => {
          setManagePlayersOpen(false);
          setSelectedTeam(null);
        }}
        teamName={selectedTeam?.name || ''}
        currentPlayers={players.slice(0, 3)}
        availablePlayers={players}
        onAddPlayer={() => {}}
        onRemovePlayer={() => {}}
      />
    </div>
  );
}
