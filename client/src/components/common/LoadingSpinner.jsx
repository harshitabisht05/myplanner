import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import gtaSunsetImg from '../../assets/gta_sunset.jpg';
import gtaCharacterImg from '../../assets/gta_character.jpg';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';

  if (fullPage && isGta) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0">
          <img
            src={gtaSunsetImg}
            alt="Loading Sunset"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
        </div>

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌴</span>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wider block">
                MY LITTLE PLANNER
              </span>
              <span className="text-xs font-black text-orange-400 tracking-widest uppercase block -mt-1">
                LOS SANTOS EDITION
              </span>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            SESSION: CONNECTING...
          </div>
        </div>

        {/* Center Character Art Frame */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <img src={gtaCharacterImg} alt="GTA Character" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm font-mono text-slate-300 max-w-sm text-center">
            "Complete your daily missions in Los Santos to rank up your productivity stats."
          </p>
        </div>

        {/* Bottom Loading Bar */}
        <div className="relative z-10 space-y-3 max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between text-xs font-bold font-mono text-emerald-400">
            <span>LOADING LOS SANTOS SESSION...</span>
            <span className="animate-pulse">PLEASE WAIT</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/40">
            <div className="h-full bg-gradient-to-r from-orange-500 via-emerald-400 to-emerald-500 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-planner-muted">
        <div className="w-10 h-10 border-4 border-planner-primary/30 border-t-planner-primary rounded-full animate-spin" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4 text-planner-muted">
      <div className="w-5 h-5 border-2 border-planner-primary/30 border-t-planner-primary rounded-full animate-spin" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
