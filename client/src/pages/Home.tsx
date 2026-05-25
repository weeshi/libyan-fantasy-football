import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Users, Trophy, Zap, BarChart3, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{APP_TITLE}</span>
              <img src={APP_LOGO} alt="شعار" className="w-8 h-8" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {isAuthenticated && (
                <>
                  <Link href="/create-team">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">إنشاء فريق</span>
                  </Link>
                  <Link href="/leaderboard">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">الترتيب</span>
                  </Link>
                  <Link href="/matches">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">المباريات</span>
                  </Link>
                  <Link href="/transfers">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">الانتقالات</span>
                  </Link>
                  <Link href="/chips">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">الرقائق</span>
                  </Link>
                  <Link href="/h2h">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">المواجهات</span>
                  </Link>
                  <Link href="/cup">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">الكأس</span>
                  </Link>
                  <Link href="/admin">
                    <span className="text-slate-300 hover:text-white cursor-pointer transition">الإدارة</span>
                  </Link>
                </>
              )}
            </div>
            
            {/* User Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-slate-300 hidden sm:inline">{user?.name}</span>
                  <Button variant="outline" size="sm" onClick={logout}>تسجيل الخروج</Button>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="default" size="sm">تسجيل الدخول</Button>
                </a>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isAuthenticated && (
            <div className="md:hidden mt-4 flex flex-wrap gap-2">
              <Link href="/create-team">
                <Button variant="ghost" size="sm" className="text-xs">إنشاء فريق</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="ghost" size="sm" className="text-xs">الترتيب</Button>
              </Link>
              <Link href="/matches">
                <Button variant="ghost" size="sm" className="text-xs">المباريات</Button>
              </Link>
              <Link href="/transfers">
                <Button variant="ghost" size="sm" className="text-xs">الانتقالات</Button>
              </Link>
              <Link href="/chips">
                <Button variant="ghost" size="sm" className="text-xs">الرقائق</Button>
              </Link>
              <Link href="/h2h">
                <Button variant="ghost" size="sm" className="text-xs">المواجهات</Button>
              </Link>
              <Link href="/cup">
                <Button variant="ghost" size="sm" className="text-xs">الكأس</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-xs">الإدارة</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            طَلْبه
          </h1>
          <p className="text-2xl text-blue-400 mb-4 font-semibold">لعبة كرة القدم الخيالية الليبية</p>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            اختر أفضل اللاعبين من الدوري الليبي لكرة القدم. تنافس مع أصدقائك، أدر ميزانيتك، واصعد إلى قمة الترتيب.
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                ابدأ اللعب الآن
              </Button>
            </a>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                انتقل إلى لوحة التحكم
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">كيفية اللعب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Users className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">اختر فريقك</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                اختر 11 لاعباً من الدوري الليبي ضمن ميزانيتك. امزج بين المراكز المختلفة بذكاء.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">تنافس</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                انضم إلى دوري مع أصدقائك أو أنشئ واحداً جديداً. تنافس أسبوعياً بناءً على أداء اللاعبين الحقيقي.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <Zap className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">احصل على نقاط</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                اكسب نقاطاً بناءً على الأهداف والتمريرات الحاسمة والدفاع النظيف. اجعل قائدك يحصل على نقاط مضاعفة.
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">اصعد الترتيب</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                تابع تقدمك في الترتيب. قم بعمليات نقل أسبوعية لتحسين فريقك والتفوق على منافسيك.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">نظام النقاط</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">حراس المرمى والمدافعون</h3>
            <ul className="space-y-2 text-slate-300">
              <li>الدفاع النظيف (90 دقيقة): <span className="text-green-400 font-semibold">+4 نقاط</span></li>
              <li>الهدف: <span className="text-green-400 font-semibold">+6 نقاط</span></li>
              <li>التمريرة الحاسمة: <span className="text-green-400 font-semibold">+1 نقطة</span></li>
              <li>البطاقة الصفراء: <span className="text-red-400 font-semibold">-1 نقطة</span></li>
              <li>البطاقة الحمراء: <span className="text-red-400 font-semibold">-3 نقاط</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">لاعبو الوسط والمهاجمون</h3>
            <ul className="space-y-2 text-slate-300">
              <li>الهدف: <span className="text-green-400 font-semibold">+5 نقاط</span></li>
              <li>التمريرة الحاسمة: <span className="text-green-400 font-semibold">+1 نقطة</span></li>
              <li>الدفاع النظيف: <span className="text-green-400 font-semibold">+1 نقطة</span></li>
              <li>البطاقة الصفراء: <span className="text-red-400 font-semibold">-1 نقطة</span></li>
              <li>البطاقة الحمراء: <span className="text-red-400 font-semibold">-3 نقاط</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل أنت مستعد للعب؟</h2>
          <p className="text-lg text-blue-100 mb-8">
            انضم إلى آلاف عشاق كرة القدم الخيالية الذين يتنافسون في الدوري الليبي.
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button size="lg" variant="secondary">
                إنشاء حسابك
              </Button>
            </a>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                ابدأ رحلتك
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400">© 2024 طَلْبه - لعبة كرة القدم الخيالية الليبية. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition">عن اللعبة</a>
              <a href="#" className="hover:text-white transition">القواعد</a>
              <a href="#" className="hover:text-white transition">التواصل</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
