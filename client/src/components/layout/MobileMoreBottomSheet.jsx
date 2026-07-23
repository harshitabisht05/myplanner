import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  StickyNote,
  Target,
  Brain,
  Timer,
  Heart,
  Settings,
  X,
  Smartphone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import appLogo from '../../assets/logo.png';

const moreItems = [
  { name: 'Notes', path: '/notes', icon: StickyNote, gtaName: 'PHONE' },
  { name: 'Focus', path: '/focus', icon: Timer, gtaName: 'MISSION MODE' },
  { name: 'Settings', path: '/settings', icon: Settings, gtaName: 'OPTIONS' },
];

const MobileMoreBottomSheet = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative rounded-t-3xl p-6 border-t shadow-cozy-lg space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 ${
          isGta
            ? 'bg-slate-950 border-emerald-900/60 text-slate-100'
            : 'bg-planner-card border-planner-border'
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
              {isGta ? 'iFruit Phone Launcher' : 'Planner Features'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-planner-secondary text-planner-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {moreItems.map((item) => {
            const Icon = item.icon;
            const label = isGta ? item.gtaName : item.name;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-bold transition-all ${
                    isActive
                      ? isGta
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
                        : 'bg-planner-secondary text-planner-primary border-planner-border'
                      : 'bg-planner-bg/60 border-planner-border text-planner-text hover:bg-planner-secondary/40'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={isGta ? 'font-mono text-xs tracking-wider' : ''}>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMoreBottomSheet;
