import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import MobileMoreBottomSheet from './MobileMoreBottomSheet';
import QuickAddModal from '../quickadd/QuickAddModal';
import { Plus } from 'lucide-react';

const AppLayout = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-planner-bg text-planner-text flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-28 md:pb-8">
        {/* Mobile Header */}
        <MobileHeader onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Page View */}
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsQuickAddOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-planner-primary text-white p-3.5 rounded-full shadow-lg border-2 border-white/20 active:scale-95 transition-transform"
        title="Quick Add"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav onOpenMore={() => setIsMoreOpen((prev) => !prev)} />

      {/* Mobile More Bottom Sheet */}
      <MobileMoreBottomSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />

      {/* Global Quick Add Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};

export default AppLayout;
