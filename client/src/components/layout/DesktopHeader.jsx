import React from 'react';
import { Plus, Timer, Download, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFocusTimer } from '../../context/FocusContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import NotificationBell from '../common/NotificationBell';

const DesktopHeader = ({ onOpenQuickAdd }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isRunning, timeLeft } = useFocusTimer();
  const { isInstallable, promptInstall } = usePWAInstall();
  const navigate = useNavigate();

  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const formatTimerMin = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header
      className={`hidden md:flex items-center justify-end px-8 py-3 border-b backdrop-blur-md sticky top-0 z-20 transition-all ${
        isStrange
          ? 'bg-slate-950/80 border-rose-900/40 text-slate-100'
          : isGta
          ? 'bg-slate-950/80 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card/80 border-planner-border text-planner-text'
      }`}
    >
      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Active Focus Timer Badge */}
        {isRunning && (
          <Link
            to="/focus"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-500/15 text-rose-500 text-xs font-bold border border-rose-500/30 animate-pulse hover:bg-rose-500/25 transition-colors"
            title="Focus Session Active"
          >
            <Timer className="w-4 h-4" />
            <span>{formatTimerMin(timeLeft)}</span>
          </Link>
        )}

        {/* PWA Install Button */}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="bg-planner-secondary hover:bg-planner-secondary/80 text-planner-primary text-xs font-bold px-3 py-1.5 rounded-2xl border border-planner-border flex items-center gap-1.5 active:scale-95 transition-all"
            title="Install Mobile App"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-bold text-xs shadow-xs active:scale-95 transition-all ${
            isStrange
              ? 'bg-rose-600 hover:bg-rose-700 text-white font-serif'
              : isGta
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
              : 'bg-planner-primary hover:bg-planner-primaryHover text-white'
          }`}
          title="Quick Add Task or Note"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Quick Add</span>
        </button>

        {/* Global Notification Bell */}
        <NotificationBell align="right" />

        {/* User Profile Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-2 cursor-pointer group"
          title="Go to Settings"
        >
          <div className="w-8 h-8 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-planner-border group-hover:ring-2 group-hover:ring-planner-primary transition-all">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              'U'
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
