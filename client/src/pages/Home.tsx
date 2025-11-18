import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Users, Trophy, Zap, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt="Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-white">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-slate-300">{user?.name}</span>
                <Link href="/dashboard">
                  <Button variant="default" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" size="sm">Login</Button>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Libyan Fantasy Football
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Build your dream team from the best players in the Libyan Football League. Compete with friends, manage your budget, and climb the leaderboard.
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Playing Now
              </Button>
            </a>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Users className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Build Your Team</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Select 11 players from the Libyan Football League within your budget. Mix and match different positions strategically.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Compete</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Join leagues with friends or create your own. Compete weekly as players score points based on their real-world performance.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Zap className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Score Points</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Earn points based on goals, assists, clean sheets, and other match statistics. Captain your best player for double points.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Climb Rankings</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Track your progress on the leaderboard. Make transfers each week to improve your team and outscore your opponents.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Scoring System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Goalkeeper & Defenders</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Clean Sheet (90 mins): <span className="text-green-400 font-semibold">+4 pts</span></li>
              <li>Goal: <span className="text-green-400 font-semibold">+6 pts</span></li>
              <li>Assist: <span className="text-green-400 font-semibold">+1 pt</span></li>
              <li>Yellow Card: <span className="text-red-400 font-semibold">-1 pt</span></li>
              <li>Red Card: <span className="text-red-400 font-semibold">-3 pts</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Midfielders & Forwards</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Goal: <span className="text-green-400 font-semibold">+5 pts</span></li>
              <li>Assist: <span className="text-green-400 font-semibold">+1 pt</span></li>
              <li>Clean Sheet: <span className="text-green-400 font-semibold">+1 pt</span></li>
              <li>Yellow Card: <span className="text-red-400 font-semibold">-1 pt</span></li>
              <li>Red Card: <span className="text-red-400 font-semibold">-3 pts</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of fantasy football fans competing in the Libyan Football League.
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">
                Create Your Account
              </Button>
            </a>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                Start Your Journey
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-slate-400">© 2024 Libyan Fantasy Football. All rights reserved.</p>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition">About</a>
              <a href="#" className="hover:text-white transition">Rules</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
