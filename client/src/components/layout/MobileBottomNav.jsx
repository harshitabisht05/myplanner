import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sun, CheckSquare, Calendar, MoreHorizontal } from 'lucide-react';
import MobileMoreBottomSheet from './MobileMoreBottomSheet';

const mainTabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Today', path: '/today', icon: Sun },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
];

const MobileBottomNav = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-planner-card/95 backdrop-blur-md border-t border-planner-border px-2 py-1.5 flex items-center justify-around">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-planner-primary font-bold scale-105'
                    : 'text-planner-muted hover:text-planner-text'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-xs font-medium transition-all ${
            isMoreOpen ? 'text-planner-primary font-bold' : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      <MobileMoreBottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
