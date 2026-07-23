import React from 'react';
import { Plus, Download, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFocusTimer } from '../../context/FocusContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const MobileHeader = ({ onOpenQuickAdd }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isInstallable, promptInstall } = usePWAInstall();
  const { isRunning, timeLeft } = useFocusTimer();

  const isGta = theme === 'gta';

  const formatTimerMin = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header
      className={`md:hidden sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between ${
        isGta
          ? 'bg-slate-950/90 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card/90 border-planner-border'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{isGta ? '🌴' : '🌸'}</span>
        <div>
          <span className="font-extrabold text-sm text-planner-text tracking-tight block">
            {isGta ? 'MY LITTLE PLANNER' : 'My Little Planner'}
          </span>
          {isGta && (
            <span className="text-[9px] font-black text-orange-400 tracking-widest uppercase block -mt-1">
              CITY EDITION
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isRunning && (
          <Link
            to="/focus"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold border border-rose-500/30 animate-pulse"
            title="Focus Timer Active"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTimerMin(timeLeft)}</span>
          </Link>
        )}
        {isInstallable && (
          <button
            onClick={promptInstall}
            className="bg-planner-secondary text-planner-primary text-xs font-bold px-2.5 py-1.5 rounded-xl border border-planner-border flex items-center gap-1 active:scale-95 transition-transform"
            title="Install App"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onOpenQuickAdd}
          className={`p-2 rounded-xl shadow-xs active:scale-95 transition-transform ${
            isGta ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-planner-primary text-white'
          }`}
          title="Quick Add"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-planner-border">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
          ) : user?.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            'U'
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
