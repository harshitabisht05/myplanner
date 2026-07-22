import React from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  StickyNote,
  Target,
  Brain,
  Timer,
  Heart,
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const moreItems = [
  { name: 'Habits', path: '/habits', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' },
  { name: 'Notes', path: '/notes', icon: StickyNote, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50' },
  { name: 'Goals', path: '/goals', icon: Target, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50' },
  { name: 'Brain Dump', path: '/braindump', icon: Brain, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50' },
  { name: 'Focus', path: '/focus', icon: Timer, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' },
  { name: 'Reflections', path: '/reflections', icon: Heart, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/50' },
  { name: 'Settings', path: '/settings', icon: Settings, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
];

const MobileMoreBottomSheet = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative bg-planner-card rounded-t-3xl border-t border-planner-border p-6 shadow-cozy-lg z-10 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-planner-border rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-planner-text">More Tools & Pages</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-planner-muted hover:bg-planner-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-planner-primary bg-planner-secondary font-bold text-planner-primary'
                          : 'border-planner-border bg-planner-card text-planner-text hover:bg-planner-secondary/50'
                      }`
                    }
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMoreBottomSheet;
