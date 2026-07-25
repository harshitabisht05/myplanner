import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sun, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MobileBottomNav = memo(({ onOpenMore }) => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';

  const navs = [
    { name: isGta ? 'PLAYER' : 'Home', path: '/', icon: Home },
    { name: isGta ? 'ACTIVE' : 'Today', path: '/today', icon: Sun },
    { name: isGta ? 'MISSIONS' : 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: isGta ? 'MAP' : 'Calendar', path: '/calendar', icon: Calendar },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-cozy-lg ${
        isGta
          ? 'bg-slate-950/95 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card/95 border-planner-border'
      }`}
    >
      {navs.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-bold transition-all min-h-[44px] min-w-[48px] select-none ${
                isActive
                  ? isGta
                    ? 'text-emerald-400 bg-emerald-500/10 font-extrabold scale-105'
                    : 'text-planner-primary bg-planner-primary/10 font-extrabold scale-105'
                  : 'text-planner-muted hover:text-planner-text active:scale-95'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0 stroke-[2.2]" />
            <span className="tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        aria-label="More navigation options"
        onClick={(e) => {
          e.preventDefault();
          onOpenMore && onOpenMore();
        }}
        className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-bold text-planner-muted hover:text-planner-text cursor-pointer select-none active:scale-95 transition-all min-h-[44px] min-w-[48px] touch-manipulation"
      >
        <MoreHorizontal className="w-5 h-5 shrink-0 stroke-[2.2]" />
        <span className="tracking-tight">{isGta ? 'PHONE' : 'More'}</span>
      </button>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';

export default MobileBottomNav;
