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
  Shield,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { name: 'Home', path: '/', icon: Home, gtaName: 'HQ / Profile' },
  { name: 'Today', path: '/today', icon: Sun, gtaName: 'Main Missions' },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, gtaName: 'Mission Log' },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon, gtaName: 'City Schedule' },
  { name: 'Habits', path: '/habits', icon: Sparkles, gtaName: 'Daily Routines' },
  { name: 'Notes', path: '/notes', icon: StickyNote, gtaName: 'Intel & Notes' },
  { name: 'Goals', path: '/goals', icon: Target, gtaName: 'Campaign Goals' },
  { name: 'Brain Dump', path: '/braindump', icon: Brain, gtaName: 'Raw Ideas' },
  { name: 'Focus', path: '/focus', icon: Timer, gtaName: 'Mission Focus' },
  { name: 'Reflections', path: '/reflections', icon: Heart, gtaName: 'Journal' },
  { name: 'Settings', path: '/settings', icon: Settings, gtaName: 'System / Themes' },
];

const Sidebar = ({ onOpenQuickAdd }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('planner_sidebar_collapsed') === 'true';
  });
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isGta = theme === 'gta';

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
        isGta
          ? 'bg-slate-950/95 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card border-planner-border'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-planner-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{isGta ? '🌴' : '🌸'}</span>
            <div>
              <span className={`font-black text-sm tracking-wider uppercase block ${isGta ? 'text-emerald-400 font-mono' : 'text-planner-text'}`}>
                {isGta ? 'My Little Planner' : 'My Little Planner'}
              </span>
              {isGta && (
                <span className="text-[10px] font-extrabold tracking-widest text-orange-400 uppercase block -mt-0.5">
                  Los Santos Edition
                </span>
              )}
            </div>
          </div>
        )}
        {collapsed && <div className="mx-auto text-xl">{isGta ? '🌴' : '🌸'}</div>}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={onOpenQuickAdd}
          className={`w-full rounded-2xl p-3 font-bold shadow-cozy flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isGta
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-planner-primary hover:bg-planner-primaryHover text-white'
          } ${collapsed ? 'px-0' : ''}`}
          title="Global Quick Add"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {!collapsed && <span>{isGta ? 'Quick Mission' : 'Quick Add'}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = isGta ? item.gtaName : item.name;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? isGta
                      ? 'bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/30'
                      : 'bg-planner-secondary text-planner-primary font-bold'
                    : 'text-planner-muted hover:text-planner-text hover:bg-planner-secondary/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-planner-border">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl ${
            isGta ? 'bg-slate-900/80 border border-slate-800' : 'bg-planner-bg/60'
          } ${collapsed ? 'justify-center p-2' : ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase text-planner-text truncate">
                {isGta ? `PLAYER: ${user?.name}` : user?.name || 'User'}
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
