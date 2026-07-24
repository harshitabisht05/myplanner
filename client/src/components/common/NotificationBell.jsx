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

const NotificationBell = () => {
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
    <div className="relative" ref={dropdownRef}>
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
          className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
            isStrange
              ? 'bg-slate-950/95 border-rose-900/60 text-slate-100'
              : isGta
              ? 'bg-slate-950/95 border-emerald-900/60 text-slate-100'
              : 'bg-planner-card/95 border-planner-border text-planner-text'
          }`}
        >
          {/* Panel Header */}
          <div className="p-3.5 border-b border-planner-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-planner-primary" />
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-planner-primary text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-planner-primary hover:bg-planner-secondary transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Read All
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-planner-muted hover:text-planner-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 py-1.5 border-b border-planner-border/50 text-xs font-bold gap-2 bg-planner-bg/40">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-planner-primary text-white' : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'unread' ? 'bg-planner-primary text-white' : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-planner-muted text-xs font-medium space-y-1">
                <p className="text-base">🔔</p>
                <p>No notifications found</p>
                <p className="text-[11px] text-planner-muted/70">You're all caught up!</p>
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
                        ? 'bg-planner-primary/10 border-planner-primary/30 font-semibold'
                        : 'bg-planner-bg/40 border-planner-border/60 hover:bg-planner-secondary/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${typeStyle.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-planner-text truncate">{n.title}</h4>
                        <span className="text-[10px] text-planner-muted shrink-0">{dateStr}</span>
                      </div>
                      <p className="text-xs text-planner-muted mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                      {n.link && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-planner-primary mt-1">
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
