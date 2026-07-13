import { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Building2, BarChart3, AlertTriangle,
  QrCode, Users, UserX, Package, Bell, LogOut,
  Menu, X, ChevronRight, ShieldCheck, Sun, Moon, Globe, Heart, MessageSquare, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard'), color: 'text-blue-600' },
    {
      path: '/shelters',
      icon: Building2,
      label: t('shelter_management'),
      color: 'text-green-600'
    },
    { path: '/capacity', icon: BarChart3, label: t('capacity_management'), color: 'text-purple-600' },
    { path: '/emergency', icon: AlertTriangle, label: t('emergency_management'), color: 'text-red-600', show: user?.role !== 'staff' },
    { path: '/qr-logs', icon: QrCode, label: t('qr_logs'), color: 'text-indigo-600' },
    {
      path: '/families',
      icon: Users,
      label: t('family_management'),
      color: 'text-pink-600',
      show: user?.role !== 'staff'
    },
    {
      path: '/unregistered',
      icon: UserX,
      label: t('unregistered_management'),
      color: 'text-purple-600'
    },
    {
      path: '/resources',
      icon: Package,
      label: t('resource_management'),
      color: 'text-orange-600'
    },
    {
      path: '/notifications',
      icon: Bell,
      label: t('notification_management'),
      color: 'text-yellow-600',
      show: user?.role !== 'staff'
    },
    {
      path: '/donations',
      icon: Heart,
      label: t('donation_management'),
      color: 'text-red-600',
      show: user?.role !== 'staff'
    },
    { 
      path: '/comments', 
      icon: MessageSquare, 
      label: t('comments_management'), 
      color: 'text-indigo-600',
      show: user?.role !== 'staff'
    },
    {
      path: '/invite',
      icon: ShieldCheck,
      label: 'Invite',
      color: 'text-green-600',
      show: user?.role === 'super_admin'
    }
  ].filter(item => item.show === undefined || item.show === true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentItem = menuItems.find(item => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">

      {/* Sidebar - FORCED LIGHT MODE */}
      <aside className={`bg-card border-r border-border shadow-[4px_0_24px_rgba(0,0,0,0.01)] transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8 text-white" stroke="white" />
            </div>
            {sidebarOpen && (
              <span className="font-montserrat font-semibold text-2xl leading-none tracking-tight">
                <span className="text-blue-600">Safe</span>
                <span className="text-slate-900">Shelter</span>
              </span>
            )}
          </div>
          {/* TOGGLE */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 hover:scale-110 active:scale-90 transition-all duration-300 rounded-xl text-gray-400">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-6 px-6 py-4 rounded-2xl transition-all duration-300 sidebar-item-hover ${active
                  ? 'bg-blue-600/10 border-l-4 border-blue-600'
                  : 'text-gray-500'
                  }`}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-blue-600' : item.color}`} />
                {sidebarOpen && (
                  <span className={`flex-1 text-left text-base font-bold whitespace-nowrap ${active ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 space-y-2">
          {sidebarOpen && user && (
            <div className="mx-4 p-4 flex items-center gap-4 bg-blue-50/40 dark:bg-blue-900/10 rounded-full border-2 border-blue-100 dark:border-blue-800/40 shadow-sm mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight whitespace-nowrap truncate">
                  {user.username}
                </h2>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-6 px-5 py-4 text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20 active:scale-95 transition-all duration-300 rounded-2xl"
          >
            <LogOut className="w-6 h-6" />
            {sidebarOpen && <span className="text-sm font-bold uppercase tracking-wider">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ">
        {/* Top Navbar - Clean White Background */}
        <header className="h-20 bg-card shadow-[0_1px_5px_rgba(0,0,0,0.02)] flex items-center justify-between px-12 border-b border-border">
          <div className=''></div>            <h2 
              className="ml-6 text-xl font-black text-black uppercase tracking-tight whitespace-nowrap"
              style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
            >
              {t('welcome')} <span className="text-blue-600">{user?.username}</span> &nbsp; 
              <span className="text-gray-400 dark:text-gray-500 font-bold">
                {user?.role === 'super_admin' ? t('super_admin_label') :
                  user?.role === 'admin' ? t('central_admin') :
                    t('shelter_staff')}
              </span>
            </h2>

          <div className="mr-12 flex items-center gap-4">
            {/* Minimalist Theme Cycle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-xl border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 active:scale-90 group flex items-center gap-3"
            >
              <div className={`p-2 rounded-xl shadow-lg transition-transform duration-700 ease-in-out ${theme === 'dark' ? 'bg-indigo-600 shadow-indigo-500/20 rotate-[360deg]' : 'bg-slate-500 shadow-slate-500/20 rotate-0'
                }`}>
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-indigo-50 dark:text-indigo-300" />
                ) : (
                  <Sun className="w-5 h-5 text-white" stroke="white" />
                )}
              </div>
              <span 
                className="text-[9px] font-black text-black mr-1 uppercase tracking-widest pl-1 border-l border-border/50"
                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
              >MOD</span>
            </button>

            {/* Minimalist Language Cycler */}
            <button
              onClick={() => {
                const langs = ['tr', 'en', 'ar'] as const;
                const idx = langs.indexOf(language as any);
                const next = langs[(idx + 1) % langs.length];
                setLanguage(next);
              }}
              className="px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-xl border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 active:scale-90 group flex items-center gap-3"
            >
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:rotate-[360deg] transition-transform duration-700 ease-in-out">
                <Globe className="w-5 h-5 text-white" stroke="white" />
              </div>
              <span 
                className="text-[9px] font-black text-black mr-1 uppercase tracking-widest pl-1 border-l border-border/50"
                style={{ textShadow: '0.4px 0 0 currentColor, -0.4px 0 0 currentColor' }}
              >DİL</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT - FORCED WHITE */}
        <main className="flex-1 p-8 overflow-y-auto bg-background transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
