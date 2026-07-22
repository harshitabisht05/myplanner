import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sun, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MobileBottomNav = ({ onOpenMore }) => {
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
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t px-2 py-1.5 flex items-center justify-around ${
        isGta
          ? 'bg-slate-950/95 border-emerald-900/40 text-slate-100'
          : 'bg-planner-card/95 border-planner-border shadow-cozy-lg'
      }`}
    >
      {navs.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? isGta
                    ? 'text-emerald-400 font-extrabold scale-105'
                    : 'text-planner-primary font-extrabold scale-105'
                  : 'text-planner-muted hover:text-planner-text'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onOpenMore && onOpenMore();
        }}
        className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold text-planner-muted hover:text-planner-text cursor-pointer select-none active:scale-95 transition-all touch-manipulation"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span>{isGta ? 'PHONE' : 'More'}</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
