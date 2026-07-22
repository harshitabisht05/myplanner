import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../api/eventApi';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Badge from '../components/common/Badge';
import Checkbox from '../components/common/Checkbox';
import EventModal from '../components/modals/EventModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Clock } from 'lucide-react';

const CalendarPage = () => {
  const queryClient = useQueryClient();
  const { weekStart } = useTheme();
  const { showSuccess, showError } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Range for month query
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDateStr = firstDayOfMonth.toISOString().split('T')[0];
  const endDateStr = lastDayOfMonth.toISOString().split('T')[0];

  // Fetch events for month
  const { data: eventsData } = useQuery({
    queryKey: ['events', startDateStr, endDateStr],
    queryFn: () => eventApi.getEvents({ startDate: startDateStr, endDate: endDateStr })
  });

  // Fetch tasks for month
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', startDateStr, endDateStr],
    queryFn: () => taskApi.getTasks({ view: 'all' })
  });

  const events = eventsData?.events || [];
  const tasks = tasksData?.tasks || [];

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar calculations
  const daysInMonth = lastDayOfMonth.getDate();
  let startWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday
  if (weekStart === 'monday') {
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;
  }

  const daysArray = [];
  // Empty offset slots
  for (let i = 0; i < startWeekday; i++) {
    daysArray.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ day: d, dateStr: dStr });
  }

  const weekdays =
    weekStart === 'monday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Selected Day Items
  const selectedDayEvents = events.filter((e) => e.date === selectedDateStr);
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDateStr);

  // Mutations
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId) => taskApi.toggleTaskComplete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleEventSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        await eventApi.updateEvent(editingEvent._id, eventData);
        showSuccess('Event updated!');
      } else {
        await eventApi.createEvent(eventData);
        showSuccess('Event created! 📅');
      }
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEventModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save event');
    }
  };

  const handleDeleteEventConfirm = async () => {
    if (!deleteConfirmEvent) return;
    setIsDeleting(true);
    try {
      await eventApi.deleteEvent(deleteConfirmEvent._id);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess('Event deleted');
      setDeleteConfirmEvent(null);
    } catch (err) {
      showError(err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const monthNameStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Schedule"
        subtitle="Navigate monthly schedule, events and scheduled tasks"
        icon={CalendarIcon}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingEvent(null);
              setIsEventModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigable Calendar Grid (2 Cols on Desktop) */}
        <Card className="lg:col-span-2 p-4 sm:p-6">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-planner-text">{monthNameStr}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <IconButton size="sm" onClick={handlePrevMonth} title="Previous Month">
                <ChevronLeft className="w-5 h-5" />
              </IconButton>
              <IconButton size="sm" onClick={handleNextMonth} title="Next Month">
                <ChevronRight className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-planner-muted mb-2">
            {weekdays.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysArray.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-2xl bg-planner-bg/20" />;
              }

              const isSelected = item.dateStr === selectedDateStr;
              const isTodayStr = item.dateStr === new Date().toISOString().split('T')[0];

              const dayEvents = events.filter((e) => e.date === item.dateStr);
              const dayTasks = tasks.filter((t) => t.dueDate === item.dateStr);

              return (
                <div
                  key={item.dateStr}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-planner-primary bg-planner-secondary shadow-cozy font-bold'
                      : isTodayStr
                      ? 'border-planner-primary/40 bg-planner-primary/5'
                      : 'border-planner-border bg-planner-card hover:bg-planner-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-semibold inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isTodayStr ? 'bg-planner-primary text-white font-bold' : 'text-planner-text'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold px-1 py-0.5 rounded truncate">
                        🗓️ {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-1 py-0.5 rounded truncate">
                        ✓ {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details Panel */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-planner-border">
              <div>
                <h3 className="font-bold text-planner-text text-base">Selected Day</h3>
                <p className="text-xs text-planner-muted">{selectedDateStr}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Events for Selected Day */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-planner-muted uppercase tracking-wider mb-2">
                  Events ({selectedDayEvents.length})
                </h4>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-xs text-planner-muted italic bg-planner-bg/40 p-3 rounded-2xl">
                    No events scheduled for this day.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((evt) => (
                      <div
                        key={evt._id}
                        className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-sky-900 dark:text-sky-100">{evt.title}</p>
                          {evt.startTime && (
                            <span className="text-xs text-sky-700 dark:text-sky-300 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <IconButton
                            size="sm"
                            onClick={() => {
                              setEditingEvent(evt);
                              setIsEventModalOpen(true);
                            }}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-planner-muted" />
                          </IconButton>
                          <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmEvent(evt)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks for Selected Day */}
              <div>
                <h4 className="text-xs font-bold text-planner-muted uppercase tracking-wider mb-2">
                  Tasks ({selectedDayTasks.length})
                </h4>
                {selectedDayTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted italic bg-planner-bg/40 p-3 rounded-2xl">
                    No tasks due on this date.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayTasks.map((t) => (
                      <div
                        key={t._id}
                        className="p-3 rounded-2xl bg-planner-bg/60 border border-planner-border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={t.completed}
                            onChange={() => toggleTaskMutation.mutate(t._id)}
                          />
                          <span
                            className={`text-sm font-semibold truncate ${
                              t.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <Badge variant={t.priority}>{t.priority}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        event={editingEvent}
        initialDate={selectedDateStr}
      />

      {/* Event Delete Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmEvent}
        onClose={() => setDeleteConfirmEvent(null)}
        onConfirm={handleDeleteEventConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete event "${deleteConfirmEvent?.title}"?`}
        confirmText="Delete Event"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CalendarPage;
