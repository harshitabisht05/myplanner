import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { taskApi } from '../api/taskApi';
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
  CheckCircle2,
  Radio,
  RadioTower,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

import gtaSunsetImg from '../assets/gta_sunset.jpg';
import gtaCharacterImg from '../assets/gta_character.jpg';
import strangeHeroImg from '../assets/strange_hero_bg.jpg';
import { getLocalDateStr } from '../utils/dateUtils';

const MOOD_OPTIONS = [
  { value: 'amazing', label: 'CLEAR', emoji: '😄', color: 'hover:bg-amber-100 dark:hover:bg-amber-950/60' },
  { value: 'good', label: 'STABLE', emoji: '🙂', color: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60' },
  { value: 'okay', label: 'UNCERTAIN', emoji: '😐', color: 'hover:bg-sky-100 dark:hover:bg-sky-950/60' },
  { value: 'low', label: 'LOW SIGNAL', emoji: '😔', color: 'hover:bg-purple-100 dark:hover:bg-purple-950/60' },
  { value: 'tired', label: 'OFFLINE', emoji: '😴', color: 'hover:bg-rose-100 dark:hover:bg-rose-950/60' }
];

const Home = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const todayStr = getLocalDateStr();
  const [dailyNoteText, setDailyNoteText] = useState('');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (isStrange && data.task?.completed) {
        showSuccess('CASE CLOSED / OBJECTIVE COMPLETE 🎯');
      } else if (isGta && data.task?.completed) {
        showSuccess('MISSION PASSED! 🎯 +100 EXP');
      }
    }
  });



  // Mood update mutation
  const setMoodMutation = useMutation({
    mutationFn: (moodValue) => moodApi.setMood({ date: todayStr, mood: moodValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood', todayStr] });
      showSuccess('Signal Status updated!');
    }
  });

  // Daily note save handler
  const handleSaveDailyNote = async () => {
    setIsNoteSaving(true);
    try {
      await dailyNoteApi.saveDailyNote(todayStr, dailyNoteText);
      queryClient.invalidateQueries({ queryKey: ['dailynote', todayStr] });
      showSuccess('Field log saved! 📓');
    } catch (err) {
      showError('Failed to save daily note');
    } finally {
      setIsNoteSaving(false);
    }
  };

  const tasks = tasksData?.tasks || [];
  const events = eventsData?.events || [];
  const currentMood = moodData?.mood?.mood || null;

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Greeting Hero Banner */}
      {isStrange ? (
        <div className="relative rounded-3xl overflow-hidden border border-rose-600/50 shadow-2xl bg-slate-950">
          <div className="absolute inset-0 z-0">
            <img
              src={strangeHeroImg}
              alt="Strange World Hero"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-600/40 text-xs font-bold tracking-wider uppercase flex items-center gap-1 font-mono">
                  <RadioTower className="w-3.5 h-3.5" /> SIGNAL STATUS: CONNECTED
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold tracking-wider uppercase font-mono">
                  1980 SMALL TOWN HAWKINS DIST
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-serif">
                {getGreeting()}, {user?.name || 'Operative'} 🚲
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                Your planner exists between two worlds. Track mysterious cases, monitor walkie-talkie signals, and investigate local incidents.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-rose-400">
                <span>DATE: {formattedDateStr}</span>
                <span>•</span>
                <span>FREQUENCY: 140.85 MHz</span>
              </div>
            </div>

            {/* Christmas Light String Banner Decor */}
            <div className="shrink-0 p-4 rounded-2xl bg-slate-900/80 border border-rose-900/60 text-center space-y-2">
              <span className="text-xs font-mono text-amber-400 block font-bold">DECORATIVE SIGNAL LIGHTS</span>
              <div className="christmas-lights-bar justify-center">
                <span className="bulb-red" />
                <span className="bulb-amber" />
                <span className="bulb-green" />
                <span className="bulb-blue" />
              </div>
            </div>
          </div>
        </div>
      ) : isGta ? (
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-slate-950">
          <div className="absolute inset-0 z-0">
            <img
              src={gtaSunsetImg}
              alt="Vinewood Sunset"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black tracking-widest uppercase">
                  PLAYER: {user?.name || 'BOSS'}
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold tracking-wider uppercase">
                  LOS SANTOS
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {getGreeting()}, {user?.name || 'Player'} 🌴
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Welcome to Los Santos District. Complete your daily missions, build your street reputation, and execute your campaign goals.
              </p>
            </div>

            <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <img
                src={gtaCharacterImg}
                alt="Los Santos Character"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-planner-secondary/80 via-planner-card to-planner-secondary/40 rounded-3xl p-6 sm:p-8 border border-planner-border shadow-cozy relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-planner-card/80 text-planner-primary text-xs font-semibold mb-3 border border-planner-border">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{formattedDateStr}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-planner-text tracking-tight">
              {getGreeting()}, {user?.name || 'Friend'} 🌷
            </h1>
            <p className="text-planner-muted text-sm sm:text-base mt-2 leading-relaxed">
              Let's make today a little better than yesterday. Take things one gentle step at a time.
            </p>
          </div>
        </div>
      )}

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Today's Tasks / Cases Card */}
          <Card className={`p-5 sm:p-6 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl shrink-0 ${isStrange ? 'bg-rose-600/20 text-rose-400' : isGta ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300'}`}>
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-planner-text">
                    {isStrange ? "Today's Active Cases" : isGta ? "Today's Active Missions" : "Today's Tasks"}
                  </h2>
                  <p className="text-xs text-planner-muted">{completedTasksCount} of {totalTasksCount} completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
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
              <LoadingSpinner message="Loading tasks..." />
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                <p className="text-sm font-medium">No active cases logged today ✨</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border gap-2.5 transition-all group ${
                      task.completed && isStrange
                        ? 'strange-case-closed'
                        : task.completed && isGta
                        ? 'gta-mission-passed'
                        : 'bg-planner-bg/60 hover:bg-planner-secondary/40 border-planner-border shadow-xs'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="mt-0.5 sm:mt-0">
                        <Checkbox
                          checked={task.completed}
                          onChange={() => toggleTaskMutation.mutate(task._id)}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-bold text-planner-text leading-snug ${
                              task.completed ? 'line-through text-planner-muted' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.completed && isStrange && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-600 text-white uppercase tracking-wider font-mono">
                              CASE CLOSED
                            </span>
                          )}
                        </div>
                        {task.dueTime && (
                          <span className="text-xs text-planner-muted block">⏰ {task.dueTime}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
                      {task.isTop3 && <Badge variant="primary">{isStrange ? 'CRITICAL CASE' : isGta ? 'MAIN MISSION' : 'Top 3'}</Badge>}
                      <Badge variant={task.priority}>{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mood / Signal Status Widget */}
          <Card className={isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-planner-text">
                  {isStrange ? 'Signal Status' : 'How are you feeling today?'}
                </h2>
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
                    <span className="text-[9px] font-semibold text-planner-text truncate max-w-full">
                      {isStrange ? item.label : item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Events / Incidents */}
          <Card className={isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">
                    {isStrange ? 'Upcoming Incidents' : 'Upcoming Events'}
                  </h2>
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

          {/* Daily Note / Field Log */}
          <Card className={isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">
                    {isStrange ? 'Field Journal Log' : "Today's Daily Note"}
                  </h2>
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
              placeholder={isStrange ? 'Record observations, walkie-talkie logs, or strange occurrences for today...' : 'Jot down quick thoughts, ideas, or notes for today...'}
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
