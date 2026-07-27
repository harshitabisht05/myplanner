import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Search,
  Calendar,
  CheckSquare,
  Timer,
  MessageSquare,
  Folder,
  Settings,
  Palette,
  Users,
  Kanban,
  Sparkles,
  Command
} from 'lucide-react';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { mode, setMode } = useWorkspace();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const COMMAND_ITEMS = [
    {
      category: 'Navigation Shortcuts',
      items: [
        { label: 'Today Planner & Tasks', icon: CheckSquare, action: () => navigate('/today') },
        { label: 'Calendar View', icon: Calendar, action: () => navigate('/calendar') },
        { label: 'Focus Timer & Soundscapes', icon: Timer, action: () => navigate('/focus') },
        { label: 'Workspace Home', icon: Users, action: () => { setMode('workspace'); navigate('/workspace'); } },
        { label: 'Kanban Board', icon: Kanban, action: () => { setMode('workspace'); navigate('/workspace/kanban'); } },
        { label: 'Document Vault & Files', icon: Folder, action: () => { setMode('workspace'); navigate('/workspace/files'); } },
        { label: 'Personal Settings', icon: Settings, action: () => navigate('/settings') }
      ]
    },
    {
      category: 'Theme Accent Quick Switcher',
      items: [
        { label: 'Lavender Theme 🪻', icon: Palette, action: () => setTheme('lavender') },
        { label: 'Baby Pink Theme 🌸', icon: Palette, action: () => setTheme('pink') },
        { label: 'Sky Blue Theme ☁️', icon: Palette, action: () => setTheme('blue') },
        { label: 'GTA Urban Theme 🌴', icon: Palette, action: () => setTheme('gta') },
        { label: 'Strange World Theme 🚲', icon: Palette, action: () => setTheme('strange') }
      ]
    },
    {
      category: 'Platform Mode',
      items: [
        { label: 'Switch to Personal Space 🏠', icon: Sparkles, action: () => { setMode('personal'); navigate('/today'); } },
        { label: 'Switch to Team Workspace 👥', icon: Users, action: () => { setMode('workspace'); navigate('/workspace'); } }
      ]
    }
  ];

  const filteredGroups = COMMAND_ITEMS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
  })).filter((group) => group.items.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-planner-card rounded-2xl border border-planner-border shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-planner-border bg-planner-bg/60">
          <Search className="w-5 h-5 text-planner-primary shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search... (Press Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-bold bg-transparent text-planner-text focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-planner-secondary text-planner-muted border border-planner-border">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredGroups.length === 0 ? (
            <p className="text-xs text-planner-muted text-center py-6">No matching commands found</p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <h4 className="text-[10px] font-black text-planner-muted uppercase tracking-wider px-2 mb-1">
                  {group.category}
                </h4>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-planner-text hover:bg-planner-primary hover:text-white transition-all group text-left"
                    >
                      <Icon className="w-4 h-4 text-planner-primary group-hover:text-white shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-planner-border bg-planner-bg/40 text-[10px] text-planner-muted flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" /> Quick Command Palette
          </span>
          <span>Tip: Press <kbd className="font-mono bg-planner-secondary px-1 rounded">Ctrl</kbd> + <kbd className="font-mono bg-planner-secondary px-1 rounded">K</kbd> anytime</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
