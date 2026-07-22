import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Sun,
  CheckSquare,
  Calendar as CalendarIcon,
  Sparkles,
  StickyNote,
  Target,
  Brain,
  Timer,
  Heart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  User as UserIcon,
  Radio,
  RadioTower
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import gtaLogoV from '../../assets/gta_logo_v.svg';
import strangeLogo from '../../assets/strange_logo.svg';

const navItems = [
  { name: 'Home', path: '/', icon: Home, gtaName: 'PLAYER', strangeName: 'CONTROL CENTER' },
  { name: 'Today', path: '/today', icon: Sun, gtaName: 'ACTIVE MISSIONS', strangeName: 'CURRENT CASE' },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, gtaName: 'MISSIONS', strangeName: 'OBJECTIVES' },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon, gtaName: 'MAP', strangeName: 'INCIDENT MAP' },
  { name: 'Habits', path: '/habits', icon: Sparkles, gtaName: 'STATS', strangeName: 'SURVIVAL STATS' },
  { name: 'Notes', path: '/notes', icon: StickyNote, gtaName: 'PHONE', strangeName: 'CASE FILES' },
  { name: 'Goals', path: '/goals', icon: Target, gtaName: 'CAMPAIGN', strangeName: 'INVESTIGATION' },
  { name: 'Brain Dump', path: '/braindump', icon: Brain, gtaName: 'PLANNING', strangeName: 'SIGNAL LOG' },
  { name: 'Focus', path: '/focus', icon: Timer, gtaName: 'MISSION MODE', strangeName: 'OTHER SIDE' },
  { name: 'Reflections', path: '/reflections', icon: Heart, gtaName: 'JOURNAL', strangeName: 'JOURNAL' },
  { name: 'Settings', path: '/settings', icon: Settings, gtaName: 'OPTIONS', strangeName: 'SYSTEM' },
];

const Sidebar = ({ onOpenQuickAdd }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('planner_sidebar_collapsed') === 'true';
  });
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('planner_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 z-30 ${
        isStrange
          ? 'bg-slate-950/95 border-rose-900/50 text-slate-100'
          : isGta
          ? 'bg-slate-950/95 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card border-planner-border'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-planner-border flex-wrap gap-2">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            {isStrange ? (
              <div className="h-11 w-48 overflow-hidden">
                <img src={strangeLogo} alt="STRANGE WORLD" className="w-full h-full object-contain" />
              </div>
            ) : isGta ? (
              <div className="h-10 w-44 overflow-hidden">
                <img src={gtaLogoV} alt="PLANNER CITY V" className="w-full h-full object-contain" />
              </div>
            ) : (
              <>
                <span className="text-xl">🌸</span>
                <span className="font-extrabold text-sm tracking-tight text-planner-text">
                  My Little Planner
                </span>
              </>
            )}
          </div>
        )}
        {collapsed && <div className="mx-auto text-xl">{isStrange ? '🚲' : isGta ? '🌴' : '🌸'}</div>}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Decorative Christmas Light Easter Egg Bulbs in Strange World */}
        {!collapsed && isStrange && (
          <div className="w-full flex items-center justify-center pt-1">
            <div className="christmas-lights-bar">
              <span className="bulb-red" title="Light" />
              <span className="bulb-amber" title="Light" />
              <span className="bulb-green" title="Light" />
              <span className="bulb-blue" title="Light" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={onOpenQuickAdd}
          className={`w-full p-3 font-bold shadow-cozy flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isStrange
              ? 'bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] uppercase font-serif'
              : isGta
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] uppercase font-mono'
              : 'bg-planner-primary hover:bg-planner-primaryHover text-white rounded-2xl'
          } ${collapsed ? 'px-0' : ''}`}
          title="Global Communication Device"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {!collapsed && <span>{isStrange ? 'NEW OBJECTIVE' : isGta ? 'NEW MISSION' : 'Quick Add'}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = isStrange ? item.strangeName : isGta ? item.gtaName : item.name;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? isStrange
                      ? 'bg-rose-600/20 text-rose-400 font-extrabold border border-rose-600/50 shadow-xs'
                      : isGta
                      ? 'bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/40 shadow-xs'
                      : 'bg-planner-secondary text-planner-primary font-bold'
                    : 'text-planner-muted hover:text-planner-text hover:bg-planner-secondary/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className={isStrange ? 'font-serif text-xs tracking-wider' : isGta ? 'font-black font-mono text-xs' : ''}>
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-planner-border">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl ${
            isStrange || isGta ? 'bg-slate-900/80 border border-slate-800' : 'bg-planner-bg/60'
          } ${collapsed ? 'justify-center p-2' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase text-planner-text truncate font-serif">
                {isStrange ? `OPERATIVE: ${user?.name}` : isGta ? `PLAYER: ${user?.name}` : user?.name || 'User'}
              </p>
              <p className="text-[10px] text-planner-muted truncate">{user?.email || ''}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-planner-muted hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
