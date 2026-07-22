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
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Today', path: '/today', icon: Sun },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
  { name: 'Habits', path: '/habits', icon: Sparkles },
  { name: 'Notes', path: '/notes', icon: StickyNote },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Brain Dump', path: '/braindump', icon: Brain },
  { name: 'Focus', path: '/focus', icon: Timer },
  { name: 'Reflections', path: '/reflections', icon: Heart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ onOpenQuickAdd }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('planner_sidebar_collapsed') === 'true';
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-planner-card border-r border-planner-border transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-planner-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🌸</span>
            <span className="font-bold text-lg text-planner-text tracking-tight">My Little Planner</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto text-xl">🌸</div>
        )}
        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3">
        <button
          onClick={onOpenQuickAdd}
          className={`w-full bg-planner-primary hover:bg-planner-primaryHover text-white rounded-2xl p-3 font-semibold shadow-cozy flex items-center justify-center gap-2 transition-all active:scale-95 ${
            collapsed ? 'px-0' : ''
          }`}
          title="Global Quick Add"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {!collapsed && <span>Quick Add</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-planner-secondary text-planner-primary font-bold shadow-xs'
                    : 'text-planner-muted hover:text-planner-text hover:bg-planner-secondary/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-planner-border">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl bg-planner-bg/60 ${
            collapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-planner-text truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-planner-muted truncate">{user?.email || ''}</p>
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
