import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', joinDate: '2026-06-10', status: 'نشط' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', joinDate: '2026-06-09', status: 'نشط' },
    { id: 3, name: 'محمود حسن', email: 'mahmoud@example.com', joinDate: '2026-06-08', status: 'غير نشط' },
    { id: 4, name: 'ليلى محمد', email: 'layla@example.com', joinDate: '2026-06-07', status: 'نشط' },
  ],
  topPlayers: [
    { id: 1, name: 'محمد علي', position: 'مهاجم', team: 'الأهلي', points: 450, matches: 12 },
    { id: 2, name: 'علي حسن', position: 'وسط', team: 'الترجي', points: 420, matches: 12 },
    { id: 3, name: 'سارة محمود', position: 'مدافع', team: 'الهلال', points: 380, matches: 12 },
  ],
  leagues: [
    { id: 1, name: 'الدوري الكلاسيكي', type: 'عام', members: 450, status: 'نشط' },
    { id: 2, name: 'دوري الأصدقاء', type: 'خاص', members: 120, status: 'نشط' },
    { id: 3, name: 'كأس الخيال', type: 'بطولة', members: 280, status: 'جاري' },
  ],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  const filteredUsers = mockStats.recentUsers.filter(user =>
    user.name.includes(searchTerm) || user.email.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8" dir="rtl">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground">مرحباً بك {user?.name}، إدارة شاملة للتطبيق</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString('ar-LY')}</div>
              <p className="text-xs text-green-600 mt-1">↑ 12% من الشهر الماضي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                الفرق النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.activeTeams.toLocaleString('ar-LY')}</div>
              <p className="text-xs text-green-600 mt-1">↑ 8% من الشهر الماضي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                إجمالي المباريات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalMatches.toLocaleString('ar-LY')}</div>
              <p className="text-xs text-blue-600 mt-1">هذا الموسم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                إجمالي النقاط
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalPoints.toLocaleString('ar-LY')}</div>
              <p className="text-xs text-purple-600 mt-1">توزيع شامل</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>أحدث النشاط</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'مستخدم جديد', description: 'أحمد محمد انضم للتطبيق', time: 'منذ 5 دقائق', icon: Plus },
                    { action: 'مباراة جديدة', description: 'تم إضافة مباراة الأهلي vs الترجي', time: 'منذ ساعة', icon: Trophy },
                    { action: 'فريق جديد', description: 'فاطمة علي أنشأت فريقاً جديداً', time: 'منذ ساعتين', icon: Users },
                    { action: 'نقاط محدثة', description: 'تم تحديث نقاط 45 لاعب', time: 'منذ 3 ساعات', icon: TrendingUp },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.action}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة المستخدمين</CardTitle>
                    <CardDescription>عرض وإدارة جميع مستخدمي التطبيق</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    مستخدم جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Input
                    placeholder="ابحث عن مستخدم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-right py-3 px-4">الاسم</th>
                        <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4">تاريخ الانضمام</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-3 px-4">{user.joinDate}</td>
                          <td className="py-3 px-4">
                            <Badge variant={user.status === 'نشط' ? 'default' : 'secondary'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة اللاعبين</CardTitle>
                    <CardDescription>عرض وإدارة بيانات اللاعبين</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    لاعب جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                      {mockStats.topPlayers.map((player) => (
                        <tr key={player.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{player.name}</td>
                          <td className="py-3 px-4">{player.position}</td>
                          <td className="py-3 px-4">{player.team}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{player.points}</Badge>
                          </td>
                          <td className="py-3 px-4">{player.matches}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة الدوريات</CardTitle>
                    <CardDescription>عرض وإدارة جميع الدوريات والبطولات</CardDescription>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    دوري جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockStats.leagues.map((league) => (
                    <Card key={league.id} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{league.name}</CardTitle>
                            <CardDescription className="text-xs">{league.type}</CardDescription>
                          </div>
                          <Badge variant={league.status === 'نشط' ? 'default' : 'secondary'}>
                            {league.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">الأعضاء</span>
                          <span className="font-medium">{league.members}</span>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold">الإعدادات العامة</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">اسم التطبيق</label>
                      <Input defaultValue="Libyan Fantasy Football" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">البريد الإلكتروني للدعم</label>
                      <Input defaultValue="support@example.com" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">الموسم الحالي</label>
                      <Input defaultValue="2025-2026" className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Game Settings */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">إعدادات اللعبة</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">الميزانية الأولية</label>
                      <Input defaultValue="10000000" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">التبديلات المجانية الأسبوعية</label>
                      <Input defaultValue="1" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">تكلفة التبديل الإضافي</label>
                      <Input defaultValue="4" className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Backup */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">النسخ الاحتياطية</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 ml-2" />
                      إنشاء نسخة احتياطية
                    </Button>
                    <Button variant="outline" className="flex-1">
                      استعادة من نسخة
                    </Button>
                  </div>
                </div>

                {/* Save */}
                <div className="flex gap-2 border-t pt-4">
                  <Button className="flex-1">
                    <CheckCircle className="w-4 h-4 ml-2" />
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline" className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
