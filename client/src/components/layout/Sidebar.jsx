import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Sun,
  CheckSquare,
  Calendar as CalendarIcon,
  StickyNote,
  Timer,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  User as UserIcon,
  Users,
  Layout,
  Kanban,
  Zap,
  Folder,
  Activity as ActivityIcon,
  MessageSquare,
  Layers,
  PlusCircle,
  Building,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import gtaLogoV from '../../assets/gta_logo_v.svg';
import strangeLogo from '../../assets/strange_logo.svg';
import appLogo from '../../assets/logo.png';

const personalNavItems = [
  { name: 'Home', path: '/', icon: Home, gtaName: 'PLAYER', strangeName: 'CONTROL CENTER' },
  { name: 'Today', path: '/today', icon: Sun, gtaName: 'ACTIVE MISSIONS', strangeName: 'CURRENT CASE' },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, gtaName: 'MISSIONS', strangeName: 'OBJECTIVES' },
  { name: 'Calendar', path: '/calendar', icon: CalendarIcon, gtaName: 'MAP', strangeName: 'INCIDENT MAP' },
  { name: 'Notes', path: '/notes', icon: StickyNote, gtaName: 'PHONE', strangeName: 'CASE FILES' },
  { name: 'Focus', path: '/focus', icon: Timer, gtaName: 'MISSION MODE', strangeName: 'OTHER SIDE' },
  { name: 'Analytics', path: '/analytics', icon: BarChart2, gtaName: 'STATS & LOGS', strangeName: 'TIME DOSSIER' },
  { name: 'Settings', path: '/settings', icon: Settings, gtaName: 'OPTIONS', strangeName: 'SYSTEM' },
];

const workspaceNavItems = [
  { name: 'Workspace Home', path: '/workspace', icon: Layout, gtaName: 'HQ DASHBOARD', strangeName: 'COMMAND HUB' },
  { name: 'Projects', path: '/workspace/projects', icon: Layers, gtaName: 'OPERATIONS', strangeName: 'SECTOR PROJECTS' },
  { name: 'Kanban Board', path: '/workspace/kanban', icon: Kanban, gtaName: 'TACTICAL BOARD', strangeName: 'SITUATION BOARD' },
  { name: 'Sprint', path: '/workspace/sprint', icon: Zap, gtaName: 'SURGE SPRINT', strangeName: 'PHASE RUN' },
  { name: 'Members', path: '/workspace/members', icon: Users, gtaName: 'CREW MEMBERS', strangeName: 'AGENTS' },
  { name: 'Team Calendar', path: '/workspace/calendar', icon: CalendarIcon, gtaName: 'CREW SCHEDULE', strangeName: 'TIMELINE' },
  { name: 'Files', path: '/workspace/files', icon: Folder, gtaName: 'INTEL FILES', strangeName: 'DOCUMENT VAULT' },
  { name: 'Activity', path: '/workspace/activity', icon: ActivityIcon, gtaName: 'LOG AUDIT', strangeName: 'SIGNAL LOGS' },
  { name: 'Chat', path: '/workspace/chat', icon: MessageSquare, gtaName: 'RADIO COMM', strangeName: 'WALKIE-TALKIE' },
  { name: 'Workspace Settings', path: '/workspace/settings', icon: Settings, gtaName: 'HQ OPTIONS', strangeName: 'HUB SETTINGS' },
];

const Sidebar = ({ onOpenQuickAdd }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('planner_sidebar_collapsed') === 'true';
  });
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { mode, setMode, workspaces, currentWorkspace, setCurrentWorkspaceId, createWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [isCreatingWs, setIsCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState('');

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

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      await createWorkspace({ name: newWsName.trim() });
      setNewWsName('');
      setIsCreatingWs(false);
    } catch (err) {
      console.error('Failed to create workspace:', err);
    }
  };

  const currentNavItems = mode === 'workspace' ? workspaceNavItems : personalNavItems;

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
      <div className={`p-3 border-b border-planner-border flex ${collapsed ? 'flex-col items-center gap-2.5 py-3' : 'items-center justify-between flex-wrap gap-2'}`}>
        {!collapsed ? (
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
                <img src={appLogo} alt="My Little Planner Logo" className="w-8 h-8 object-contain rounded-xl shadow-xs" />
                <span className="font-extrabold text-sm tracking-tight text-planner-text">
                  My Little Planner
                </span>
              </>
            )}
          </div>
        ) : (
          <img src={appLogo} alt="Logo" className="w-8 h-8 object-contain rounded-lg shrink-0" />
        )}

        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Mode Switcher Pill */}
      <div className="p-3 pb-1">
        <div className={`p-1 rounded-2xl flex items-center gap-1 ${isStrange ? 'bg-slate-900 border border-slate-800' : isGta ? 'bg-slate-900 border border-slate-800' : 'bg-planner-secondary/80'}`}>
          <button
            onClick={() => {
              setMode('personal');
              navigate('/');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'personal'
                ? isStrange
                  ? 'bg-rose-600 text-white shadow-xs'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-planner-card text-planner-primary shadow-xs'
                : 'text-planner-muted hover:text-planner-text'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {!collapsed && <span>Personal</span>}
          </button>

          <button
            onClick={() => {
              setMode('workspace');
              navigate('/workspace');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'workspace'
                ? isStrange
                  ? 'bg-rose-600 text-white shadow-xs'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-planner-card text-planner-primary shadow-xs'
                : 'text-planner-muted hover:text-planner-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {!collapsed && <span>Workspace</span>}
          </button>
        </div>
      </div>

      {/* Workspace Selector Dropdown (Shown in Workspace Mode) */}
      {mode === 'workspace' && !collapsed && (
        <div className="px-3 py-1">
          <div className="relative">
            <select
              value={currentWorkspace?._id || ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsCreatingWs(true);
                } else {
                  setCurrentWorkspaceId(e.target.value);
                }
              }}
              className={`w-full text-xs font-bold py-2 px-3 rounded-xl border appearance-none truncate cursor-pointer transition-colors ${
                isStrange
                  ? 'bg-slate-900 border-rose-900/50 text-rose-300'
                  : isGta
                  ? 'bg-slate-900 border-emerald-900/50 text-emerald-300'
                  : 'bg-planner-bg border-planner-border text-planner-text'
              }`}
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.icon || '👥'} {w.name}
                </option>
              ))}
              <option value="new">+ Create New Workspace</option>
            </select>
          </div>

          {isCreatingWs && (
            <form onSubmit={handleCreateWorkspace} className="mt-2 p-2 rounded-xl bg-planner-bg border border-planner-border space-y-2">
              <input
                type="text"
                placeholder="Workspace name..."
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="w-full text-xs p-1.5 rounded-lg border border-planner-border bg-planner-card text-planner-text"
                autoFocus
              />
              <div className="flex gap-1">
                <button type="submit" className="flex-1 py-1 text-[11px] font-bold bg-planner-primary text-white rounded-lg">
                  Save
                </button>
                <button type="button" onClick={() => setIsCreatingWs(false)} className="px-2 py-1 text-[11px] text-planner-muted">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Quick Add Button */}
      <div className="p-3 py-2">
        <button
          onClick={onOpenQuickAdd}
          className={`w-full p-3 font-bold shadow-cozy flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isStrange
              ? 'bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)] uppercase font-serif'
              : isGta
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] uppercase font-mono'
              : 'bg-planner-primary hover:bg-planner-primaryHover text-white rounded-2xl'
          } ${collapsed ? 'px-0' : ''}`}
          title="Quick Add Task or Event"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {!collapsed && <span>{isStrange ? 'NEW OBJECTIVE' : isGta ? 'NEW MISSION' : 'Quick Add'}</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const label = isStrange ? item.strangeName : isGta ? item.gtaName : item.name;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/' || item.path === '/workspace'}
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
          <div className="w-9 h-9 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold shrink-0 overflow-hidden border border-planner-border">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
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
