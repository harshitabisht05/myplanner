import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import QuickAddModal from '../quickadd/QuickAddModal';
import { Plus } from 'lucide-react';

const AppLayout = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-planner-bg text-planner-text flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-8">
        {/* Mobile Header */}
        <MobileHeader onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Page View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsQuickAddOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-planner-primary text-white p-4 rounded-full shadow-cozy-lg active:scale-95 transition-transform"
        title="Quick Add"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Bar Navigation */}
      <MobileBottomNav />

      {/* Global Quick Add Modal */}
      <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};

export default AppLayout;
