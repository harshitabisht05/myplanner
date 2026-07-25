import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  StickyNote,
  Timer,
  BarChart2,
  Settings,
  X,
  Smartphone,
  Users,
  Kanban,
  Layers,
  MessageSquare,
  Folder,
  Activity,
  Building,
  ChevronRight
} from 'lucide-react';
import appLogo from '../../assets/logo.png';

const personalItems = [
  { name: 'Notes', path: '/notes', icon: StickyNote, gtaName: 'PHONE' },
  { name: 'Focus', path: '/focus', icon: Timer, gtaName: 'MISSION MODE' },
  { name: 'Analytics', path: '/analytics', icon: BarChart2, gtaName: 'STATS & LOGS' },
  { name: 'Settings', path: '/settings', icon: Settings, gtaName: 'OPTIONS' }
];

const workspaceItems = [
  { name: 'Workspace Overview', path: '/workspace', icon: Users },
  { name: 'Kanban Board', path: '/workspace/kanban', icon: Kanban },
  { name: 'Projects & Gantt', path: '/workspace/projects', icon: Layers },
  { name: 'Document Vault', path: '/workspace/files', icon: Folder },
  { name: 'Audit Log', path: '/workspace/activity', icon: Activity },
  { name: 'Workspace Settings', path: '/workspace/settings', icon: Settings }
];

const MobileMoreBottomSheet = ({ isOpen, onClose }) => {
  const { mode, setMode, currentWorkspace, workspaces, setCurrentWorkspaceId } = useWorkspace();
  const { theme } = useTheme();
  const isGta = theme === 'gta';
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative rounded-t-3xl p-6 border-t shadow-cozy-lg space-y-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ${
          isGta ? 'bg-slate-950 border-emerald-900/60 text-slate-100' : 'bg-planner-card border-planner-border'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-planner-border">
          <div className="flex items-center gap-2">
            {isGta ? (
              <Smartphone className="w-5 h-5 text-emerald-400" />
            ) : (
              <img src={appLogo} alt="Logo" className="w-5 h-5 object-contain rounded-md" />
            )}
            <span className="font-extrabold text-base text-planner-text tracking-tight">
              {isGta ? 'iFruit Phone Launcher' : 'Planner Features & Mode'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Pill */}
        <div className="p-1 rounded-2xl bg-planner-bg border border-planner-border flex gap-1">
          <button
            onClick={() => {
              setMode('personal');
              navigate('/today');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'personal'
                ? 'bg-planner-primary text-white shadow-xs'
                : 'text-planner-muted hover:text-planner-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 🏠 Personal Space
          </button>
          <button
            onClick={() => {
              setMode('workspace');
              navigate('/workspace');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'workspace'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-planner-muted hover:text-planner-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 👥 Team Workspace
          </button>
        </div>

        {/* Workspace Dropdown if Workspace Mode is active */}
        {mode === 'workspace' && (
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Active Workspace</span>
              <span className="text-[10px] font-mono font-bold text-planner-muted">{workspaces.length} Workspaces</span>
            </div>
            <select
              value={currentWorkspace?._id || ''}
              onChange={(e) => setCurrentWorkspaceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-planner-card text-planner-text border border-planner-border font-bold text-xs focus:outline-none"
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.icon || '👥'} {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Workspace Links List */}
        {mode === 'workspace' ? (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-planner-muted uppercase tracking-wider">👥 Team Workspace Features</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {workspaceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                          : 'bg-planner-bg/60 border-planner-border text-planner-text hover:bg-planner-secondary/40'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-planner-muted uppercase tracking-wider">🏠 Personal Space Features</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {personalItems.map((item) => {
                const Icon = item.icon;
                const label = isGta ? item.gtaName : item.name;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        isActive
                          ? isGta
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
                            : 'bg-planner-secondary text-planner-primary border-planner-border'
                          : 'bg-planner-bg/60 border-planner-border text-planner-text hover:bg-planner-secondary/40'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMoreBottomSheet;
