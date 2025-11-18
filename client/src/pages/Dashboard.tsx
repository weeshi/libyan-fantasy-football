import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Users, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">Welcome back, {user?.name}!</p>
            </div>
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Create your first team</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Join or create a league</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-slate-500 mt-1">Points this season</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Best Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
              <p className="text-xs text-slate-500 mt-1">Your highest position</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="teams" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="teams" className="text-slate-300">My Teams</TabsTrigger>
            <TabsTrigger value="leagues" className="text-slate-300">Leagues</TabsTrigger>
            <TabsTrigger value="players" className="text-slate-300">Players</TabsTrigger>
          </TabsList>

          {/* My Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">My Teams</h2>
              <Link href="/create-team">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-white">No Teams Yet</CardTitle>
                  <CardDescription className="text-slate-400">
                    Create your first fantasy football team to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-team">
                    <Button variant="outline" className="w-full">
                      Create Team
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Leagues</h2>
              <Link href="/create-league">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create League
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    No Leagues Yet
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Join an existing league or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/create-league">
                    <Button variant="outline" className="w-full">
                      Create League
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Browse Players</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Libyan Football League Players
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Search and filter players by team and position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Search players..."
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
                    />
                    <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                      <option>All Teams</option>
                      <option>Al-Ahly Benghazi</option>
                      <option>Al-Ahly Tripoli</option>
                      <option>Al-Hilal</option>
                      <option>Al-Zawiya</option>
                      <option>Ittihad Benghazi</option>
                    </select>
                    <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white">
                      <option>All Positions</option>
                      <option>Goalkeeper</option>
                      <option>Defender</option>
                      <option>Midfielder</option>
                      <option>Forward</option>
                    </select>
                  </div>

                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400">Players will appear here once you create a team</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
