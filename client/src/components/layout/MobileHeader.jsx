import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileHeader = ({ onOpenQuickAdd }) => {
  const { user } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-planner-card/90 backdrop-blur-md border-b border-planner-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-xl">🌸</span>
        <span className="font-bold text-base text-planner-text tracking-tight">My Little Planner</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuickAdd}
          className="bg-planner-primary text-white p-2 rounded-xl shadow-xs active:scale-95 transition-transform"
          title="Quick Add"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
