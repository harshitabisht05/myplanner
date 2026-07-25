import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Mail, Timer, CheckSquare, Flame, Info, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';

const TYPE_ICONS = {
  timer: { icon: Timer, color: 'text-rose-500 bg-rose-500/10' },
  task: { icon: CheckSquare, color: 'text-emerald-500 bg-emerald-500/10' },
  digest: { icon: Mail, color: 'text-purple-500 bg-purple-500/10' },
  streak: { icon: Flame, color: 'text-amber-500 bg-amber-500/10' },
  system: { icon: Info, color: 'text-sky-500 bg-sky-500/10' }
};

const NotificationBell = ({ align = 'right' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);

  const isStrange = theme === 'strange';
  const isGta = theme === 'gta';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n._id || n.id);
    }
    if (n.link) {
      navigate(n.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2 rounded-xl transition-all active:scale-95 border ${
          isStrange
            ? 'bg-slate-900 border-rose-900/60 text-rose-400 hover:bg-rose-950/40'
            : isGta
            ? 'bg-slate-900 border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/40'
            : 'bg-planner-card border-planner-border text-planner-muted hover:text-planner-text hover:bg-planner-secondary'
        }`}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute mt-3 w-80 sm:w-96 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
            align === 'left' ? 'left-0' : 'right-0 sm:-right-10'
          } ${
            isStrange
              ? 'bg-[#0f0a15] text-slate-100 border-rose-600/60'
              : isGta
              ? 'bg-[#0a1510] text-slate-100 border-emerald-500/60'
              : 'bg-[#13111c] text-slate-100 border-purple-500/40 shadow-purple-500/20'
          }`}
        >
          {/* Panel Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#1a1626]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 py-2 border-b border-slate-800 text-xs font-bold gap-2 bg-[#0d0b14]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'unread' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-2 bg-[#13111c]">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
                <p className="text-base">🔔</p>
                <p className="text-white font-bold">No notifications found</p>
                <p className="text-[11px] text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              filtered.map((n) => {
                const typeStyle = TYPE_ICONS[n.type] || TYPE_ICONS.system;
                const Icon = typeStyle.icon;
                const isUnread = !n.isRead;
                const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

                return (
                  <div
                    key={n._id || n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isUnread
                        ? 'bg-[#211a33] border-purple-500/60 text-white shadow-md'
                        : 'bg-[#181524] border-slate-800 text-slate-300 hover:bg-[#231e33]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${typeStyle.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{dateStr}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                      {n.link && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-400 mt-1">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n._id || n.id);
                      }}
                      className="absolute top-2.5 right-2 p-1 text-planner-muted opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
