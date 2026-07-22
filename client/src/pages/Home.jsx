import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { taskApi } from '../api/taskApi';
import { habitApi } from '../api/habitApi';
import { eventApi } from '../api/eventApi';
import { moodApi } from '../api/moodApi';
import { dailyNoteApi } from '../api/dailyNoteApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskModal from '../components/modals/TaskModal';
import {
  Sparkles,
  CheckSquare,
  Calendar as CalendarIcon,
  Smile,
  BookOpen,
  Plus,
  ArrowRight,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOOD_OPTIONS = [
  { value: 'amazing', label: 'Amazing', emoji: '😄', color: 'hover:bg-amber-100 dark:hover:bg-amber-950/60' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'hover:bg-sky-100 dark:hover:bg-sky-950/60' },
  { value: 'low', label: 'Low', emoji: '😔', color: 'hover:bg-purple-100 dark:hover:bg-purple-950/60' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'hover:bg-rose-100 dark:hover:bg-rose-950/60' }
];

const Home = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split('T')[0];
  const [dailyNoteText, setDailyNoteText] = useState('');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const isGta = theme === 'gta';

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Queries
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'today', todayStr],
    queryFn: () => taskApi.getTasks({ date: todayStr, view: 'today' })
  });

  const { data: habitsData, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits', todayStr],
    queryFn: () => habitApi.getHabits({ startDate: todayStr, endDate: todayStr })
  });

  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventApi.getEvents({ startDate: todayStr })
  });

  const { data: moodData } = useQuery({
    queryKey: ['mood', todayStr],
    queryFn: () => moodApi.getMoods({ date: todayStr })
  });

  const { data: dailyNoteData } = useQuery({
    queryKey: ['dailynote', todayStr],
    queryFn: () => dailyNoteApi.getDailyNote(todayStr)
  });

  useEffect(() => {
    if (dailyNoteData?.note) {
      setDailyNoteText(dailyNoteData.note.content || '');
    }
  }, [dailyNoteData]);

  // Task complete toggle mutation
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId) => taskApi.toggleTaskComplete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Habit completion toggle mutation
  const toggleHabitMutation = useMutation({
    mutationFn: ({ habitId }) => habitApi.toggleHabitCompletion(habitId, todayStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  // Mood update mutation
  const setMoodMutation = useMutation({
    mutationFn: (moodValue) => moodApi.setMood({ date: todayStr, mood: moodValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood', todayStr] });
      showSuccess('Mood updated! ✨');
    }
  });

  // Daily note save handler
  const handleSaveDailyNote = async () => {
    setIsNoteSaving(true);
    try {
      await dailyNoteApi.saveDailyNote(todayStr, dailyNoteText);
      queryClient.invalidateQueries({ queryKey: ['dailynote', todayStr] });
      showSuccess('Daily note saved! 📓');
    } catch (err) {
      showError('Failed to save daily note');
    } finally {
      setIsNoteSaving(false);
    }
  };

  const tasks = tasksData?.tasks || [];
  const habits = habitsData?.habits || [];
  const events = eventsData?.events || [];
  const currentMood = moodData?.mood?.mood || null;

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Greeting Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border border-planner-border shadow-cozy relative overflow-hidden ${
          isGta
            ? 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-900 text-white border-orange-500/40'
            : 'bg-gradient-to-r from-planner-secondary/80 via-planner-card to-planner-secondary/40'
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${
              isGta
                ? 'bg-slate-900/60 border-orange-400/40 text-emerald-400 font-bold'
                : 'bg-planner-card/80 text-planner-primary border-planner-border'
            }`}
          >
            {isGta ? <span>🌴 Vinewood Sunset</span> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{formattedDateStr}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name || 'Friend'} {isGta ? '🌴' : '🌷'}
          </h1>
          <p
            className={`text-sm sm:text-base mt-2 leading-relaxed ${
              isGta ? 'text-slate-200' : 'text-planner-muted'
            }`}
          >
            {isGta
              ? "Welcome to Los Santos. Complete your missions, build your habits, and own the day."
              : "Let's make today a little better than yesterday. Take things one gentle step at a time."}
          </p>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on Desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Today's Tasks Card */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">Today's Tasks</h2>
                  <p className="text-xs text-planner-muted">{completedTasksCount} of {totalTasksCount} completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsTaskModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
                <Link to="/tasks">
                  <Button variant="outline" size="sm">
                    View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {totalTasksCount > 0 && (
              <ProgressBar value={completedTasksCount} max={totalTasksCount} className="mb-4" />
            )}

            {isTasksLoading ? (
              <LoadingSpinner message="Loading today's tasks..." />
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-planner-primary" />
                <p className="text-sm font-medium">Nothing here yet. Your day is a blank page ✨</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-planner-bg/60 hover:bg-planner-secondary/40 border border-planner-border transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleTaskMutation.mutate(task._id)}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.dueTime && (
                          <span className="text-xs text-planner-muted">⏰ {task.dueTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {task.isTop3 && <Badge variant="primary">Top 3</Badge>}
                      <Badge variant={task.priority}>{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Habit Snapshot Widget */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">Habit Snapshot</h2>
                  <p className="text-xs text-planner-muted">Track today's routines</p>
                </div>
              </div>
              <Link to="/habits">
                <Button variant="ghost" size="sm">
                  View Tracker <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {isHabitsLoading ? (
              <LoadingSpinner message="Loading habits..." />
            ) : habits.length === 0 ? (
              <div className="text-center py-6 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                <p className="text-sm font-medium">Start with one tiny habit 🌱</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {habits.map((habit) => {
                  const isDoneToday = habit.completions?.includes(todayStr);
                  return (
                    <div
                      key={habit._id}
                      onClick={() => toggleHabitMutation.mutate({ habitId: habit._id })}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isDoneToday
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                          : 'bg-planner-bg/60 border-planner-border hover:border-planner-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{habit.emoji || '✨'}</span>
                        <div>
                          <p className="text-sm font-bold text-planner-text">{habit.name}</p>
                          <span className="text-xs text-planner-muted">🔥 {habit.currentStreak || 0} day streak</span>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          isDoneToday
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-planner-border bg-planner-card'
                        }`}
                      >
                        {isDoneToday && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-6">
          {/* Mood Tracker Widget */}
          <Card>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-planner-text">How are you feeling today?</h2>
                <p className="text-xs text-planner-muted">Log today's mood</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((item) => {
                const isSelected = currentMood === item.value;
                return (
                  <button
                    key={item.value}
                    onClick={() => setMoodMutation.mutate(item.value)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-planner-primary/15 border-planner-primary scale-105 shadow-xs'
                        : `bg-planner-bg/60 border-planner-border ${item.color}`
                    }`}
                  >
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-planner-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Events Widget */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">Upcoming Events</h2>
                  <p className="text-xs text-planner-muted">Nearest schedule</p>
                </div>
              </div>
              <Link to="/calendar">
                <Button variant="ghost" size="sm">
                  Calendar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {isEventsLoading ? (
              <LoadingSpinner message="Loading events..." />
            ) : events.length === 0 ? (
              <p className="text-xs text-planner-muted text-center py-4 bg-planner-bg/40 rounded-2xl">
                No upcoming events scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 3).map((event) => (
                  <div key={event._id} className="p-3 rounded-2xl bg-planner-bg/60 border border-planner-border">
                    <p className="text-sm font-bold text-planner-text">{event.title}</p>
                    <div className="flex items-center justify-between text-xs text-planner-muted mt-1">
                      <span>📅 {event.date}</span>
                      {event.startTime && <span>⏰ {event.startTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Daily Note Widget */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">Today's Daily Note</h2>
                  <p className="text-xs text-planner-muted">Persisted note for {todayStr}</p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={handleSaveDailyNote} isLoading={isNoteSaving}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
            </div>

            <textarea
              rows={4}
              value={dailyNoteText}
              onChange={(e) => setDailyNoteText(e.target.value)}
              placeholder="Jot down quick thoughts, ideas, or notes for today..."
              className="w-full bg-planner-bg/60 dark:bg-planner-card text-planner-text text-sm rounded-2xl border border-planner-border p-3 focus:outline-none focus:ring-2 focus:ring-planner-primary/40"
            />
          </Card>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={async (taskData) => {
          try {
            await taskApi.createTask(taskData);
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            showSuccess('Task added! 🌸');
            setIsTaskModalOpen(false);
          } catch (err) {
            showError(err.message || 'Failed to create task');
          }
        }}
      />
    </div>
  );
};

export default Home;
