import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { APP_LOGO, APP_TITLE, getLoginUrl } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';
import './Navigation.css';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="navigation-bar" dir="rtl">
      <div className="navigation-container">
        {/* Logo */}
        <Link href="/">
          <div className="navigation-logo">
            <span className="logo-text">{APP_TITLE}</span>
            <img src={APP_LOGO} alt="شعار" className="logo-image" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navigation-desktop">
          {isAuthenticated && (
            <>
              {/* الرئيسية */}
              <Link href="/create-team">
                <span className="nav-link">الرئيسية</span>
              </Link>

              {/* الترتيب */}
              <Link href="/leaderboard">
                <span className="nav-link">الترتيب</span>
              </Link>

              {/* المباريات */}
              <Link href="/matches">
                <span className="nav-link">المباريات</span>
              </Link>

              {/* لوحة التحكم - Dropdown */}
              <div className="nav-dropdown">
                <button className="nav-link dropdown-toggle">
                  لوحة التحكم
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="dropdown-menu">
                  <Link href="/transfers">
                    <span className="dropdown-item">الانتقالات</span>
                  </Link>
                  <Link href="/chips">
                    <span className="dropdown-item">الرقائق</span>
                  </Link>
                  <Link href="/player-comparison">
                    <span className="dropdown-item">مقارنة اللاعبين</span>
                  </Link>
                  <Link href="/h2h">
                    <span className="dropdown-item">المواجهات</span>
                  </Link>
                </div>
              </div>

              {/* الكأس */}
              <Link href="/cup">
                <span className="nav-link">الكأس</span>
              </Link>

              {/* الأسئلة الشائعة */}
              <Link href="/faq">
                <span className="nav-link">الأسئلة الشائعة</span>
              </Link>

              {/* الإدارة - Only for admins */}
              {user?.role === 'admin' && (
                <Link href="/admin">
                  <span className="nav-link admin-link">الإدارة</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Section */}
        <div className="navigation-user">
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <a href={getLoginUrl()}>
              <Button variant="default" size="sm">
                تسجيل الدخول
              </Button>
            </a>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="navigation-mobile">
          <Link href="/create-team">
            <span className="mobile-nav-item">الرئيسية</span>
          </Link>
          <Link href="/leaderboard">
            <span className="mobile-nav-item">الترتيب</span>
          </Link>
          <Link href="/matches">
            <span className="mobile-nav-item">المباريات</span>
          </Link>

          {/* Mobile Dropdown */}
          <div className="mobile-dropdown">
            <button
              className="mobile-nav-item dropdown-toggle"
              onClick={() => toggleDropdown('dashboard')}
            >
              لوحة التحكم
              <ChevronDown className={`w-4 h-4 transition ${openDropdown === 'dashboard' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'dashboard' && (
              <div className="mobile-dropdown-menu">
                <Link href="/transfers">
                  <span className="mobile-dropdown-item">الانتقالات</span>
                </Link>
                <Link href="/chips">
                  <span className="mobile-dropdown-item">الرقائق</span>
                </Link>
                <Link href="/player-comparison">
                  <span className="mobile-dropdown-item">مقارنة اللاعبين</span>
                </Link>
                <Link href="/h2h">
                  <span className="mobile-dropdown-item">المواجهات</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/cup">
            <span className="mobile-nav-item">الكأس</span>
          </Link>
          <Link href="/faq">
            <span className="mobile-nav-item">الأسئلة الشائعة</span>
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin">
              <span className="mobile-nav-item admin-link">الإدارة</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
