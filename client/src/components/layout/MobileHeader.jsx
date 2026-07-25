import React from 'react';
import { Plus, Download, Timer, Sparkles, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useFocusTimer } from '../../context/FocusContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import NotificationBell from '../common/NotificationBell';
import appLogo from '../../assets/logo.png';

const MobileHeader = ({ onOpenQuickAdd }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { mode, setMode, currentWorkspace } = useWorkspace();
  const { isInstallable, promptInstall } = usePWAInstall();
  const { isRunning, timeLeft } = useFocusTimer();
  const navigate = useNavigate();

  const isGta = theme === 'gta';

  const formatTimerMin = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'personal' ? 'workspace' : 'personal';
    setMode(nextMode);
    navigate(nextMode === 'workspace' ? '/workspace' : '/today');
  };

  return (
    <header
      className={`md:hidden sticky top-0 z-30 backdrop-blur-md border-b px-4 py-2.5 flex items-center justify-between ${
        isGta ? 'bg-slate-950/90 border-emerald-900/40 text-slate-100' : 'bg-planner-card/90 border-planner-border'
      }`}
    >
      <div className="flex items-center gap-2">
        <img src={appLogo} alt="Logo" className="w-7 h-7 object-contain rounded-lg shrink-0" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-planner-text tracking-tight">
              {isGta ? 'MY LITTLE PLANNER' : 'My Little Planner'}
            </span>
          </div>

          <button
            onClick={handleToggleMode}
            className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
              mode === 'workspace' ? 'bg-purple-600 text-white shadow-xs' : 'bg-planner-primary/10 text-planner-primary'
            }`}
          >
            {mode === 'workspace' ? (
              <>
                <Users className="w-2.5 h-2.5" /> 👥 {currentWorkspace?.name || 'Workspace'}
              </>
            ) : (
              <>
                <Sparkles className="w-2.5 h-2.5" /> 🏠 Personal Space
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning && (
          <Link
            to="/focus"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 text-[10px] font-bold border border-rose-500/30 animate-pulse"
            title="Focus Timer Active"
          >
            <Timer className="w-3 h-3" />
            <span>{formatTimerMin(timeLeft)}</span>
          </Link>
        )}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="bg-planner-secondary text-planner-primary text-xs font-bold p-1.5 rounded-xl border border-planner-border flex items-center gap-1 active:scale-95 transition-transform"
            title="Install App"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        <NotificationBell />
        <button
          onClick={onOpenQuickAdd}
          className={`p-1.5 rounded-xl shadow-xs active:scale-95 transition-transform ${
            isGta ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-planner-primary text-white'
          }`}
          title="Quick Add"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;
