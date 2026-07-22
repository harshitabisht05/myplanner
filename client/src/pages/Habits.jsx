import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApi } from '../api/habitApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import ProgressBar from '../components/common/ProgressBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import HabitModal from '../components/modals/HabitModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { Sparkles, Plus, Edit2, Trash2, CheckCircle2, ChevronLeft, ChevronRight, Flame, Trophy } from 'lucide-react';

const Habits = () => {
  const queryClient = useQueryClient();
  const { weekStart } = useTheme();
  const { showSuccess, showError } = useToast();

  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = prev week, +1 = next week

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to generate dates array for target week (7 days)
  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon

    // Calculate start of week
    let diffToStart = currentDay;
    if (weekStart === 'monday') {
      diffToStart = currentDay === 0 ? 6 : currentDay - 1;
    }

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - diffToStart + offset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      dates.push({ dateStr, dayName, dayNumber });
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekOffset);
  const startDateStr = weekDates[0].dateStr;
  const endDateStr = weekDates[6].dateStr;

  const { data, isLoading } = useQuery({
    queryKey: ['habits', startDateStr, endDateStr],
    queryFn: () => habitApi.getHabits({ startDate: startDateStr, endDate: endDateStr })
  });

  const habits = data?.habits || [];

  // Toggle habit completion mutation
  const toggleHabitMutation = useMutation({
    mutationFn: ({ habitId, dateStr }) => habitApi.toggleHabitCompletion(habitId, dateStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  const handleFormSubmit = async (habitData) => {
    try {
      if (editingHabit) {
        await habitApi.updateHabit(editingHabit._id, habitData);
        showSuccess('Habit updated!');
      } else {
        await habitApi.createHabit(habitData);
        showSuccess('New habit created! 🌱');
      }
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save habit');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmHabit) return;
    setIsDeleting(true);
    try {
      await habitApi.deleteHabit(deleteConfirmHabit._id);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      showSuccess('Habit deleted');
      setDeleteConfirmHabit(null);
    } catch (err) {
      showError(err.message || 'Failed to delete habit');
    } finally {
      setIsDeleting(false);
    }
  };

  // Weekly Completion % calculation across active habits
  let totalPossibleCompletions = habits.length * 7;
  let actualCompletions = 0;

  habits.forEach((habit) => {
    weekDates.forEach((wDate) => {
      if (habit.completions?.includes(wDate.dateStr)) {
        actualCompletions += 1;
      }
    });
  });

  const weeklyCompletionPercentage =
    totalPossibleCompletions > 0 ? Math.round((actualCompletions / totalPossibleCompletions) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habit Tracker"
        subtitle="Build healthy daily routines with visual streaks & weekly tracking"
        icon={Sparkles}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingHabit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Habit
          </Button>
        }
      />

      {/* Stats Summary & Week Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-planner-card to-amber-500/5 border-amber-200 dark:border-amber-900/60">
          <ProgressBar
            value={weeklyCompletionPercentage}
            label="Weekly Completion Rate"
            showPercentage
            colorClass="bg-amber-500"
          />
        </Card>

        <Card className="md:col-span-2 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-planner-text text-base">Weekly Overview</h3>
            <p className="text-xs text-planner-muted">
              {weekDates[0].dateStr} to {weekDates[6].dateStr}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeekOffset(0)}
              disabled={currentWeekOffset === 0}
            >
              This Week
            </Button>
            <IconButton size="sm" onClick={() => setCurrentWeekOffset((prev) => prev - 1)}>
              <ChevronLeft className="w-5 h-5" />
            </IconButton>
            <IconButton size="sm" onClick={() => setCurrentWeekOffset((prev) => prev + 1)}>
              <ChevronRight className="w-5 h-5" />
            </IconButton>
          </div>
        </Card>
      </div>

      {/* Habits Grid / Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading habit tracker..." fullPage />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No habits created"
          message="Start with one tiny habit 🌱"
          actionText="Create a Habit"
          onAction={() => {
            setEditingHabit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <Card key={habit._id} className="p-4 sm:p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-planner-border">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-planner-secondary shrink-0">
                    {habit.emoji || '✨'}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-planner-text">{habit.name}</h3>
                    {habit.description && <p className="text-xs text-planner-muted mt-0.5">{habit.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Streak: {habit.currentStreak || 0}d</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold">
                    <Trophy className="w-4 h-4 text-purple-500" />
                    <span>Best: {habit.bestStreak || 0}d</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton size="sm" onClick={() => { setEditingHabit(habit); setIsModalOpen(true); }}>
                      <Edit2 className="w-4 h-4 text-planner-muted" />
                    </IconButton>
                    <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmHabit(habit)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>
              </div>

              {/* 7-Day Interactive Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((wDate) => {
                  const isDone = habit.completions?.includes(wDate.dateStr);
                  const isToday = wDate.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={wDate.dateStr}
                      type="button"
                      onClick={() =>
                        toggleHabitMutation.mutate({ habitId: habit._id, dateStr: wDate.dateStr })
                      }
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all active:scale-95 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : isToday
                          ? 'border-planner-primary bg-planner-primary/10 text-planner-text font-bold'
                          : 'border-planner-border bg-planner-bg/60 text-planner-muted hover:border-planner-primary/50'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider">{wDate.dayName}</span>
                      <span className="text-sm font-bold my-1">{wDate.dayNumber}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-current opacity-40" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        habit={editingHabit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmHabit}
        onClose={() => setDeleteConfirmHabit(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete habit "${deleteConfirmHabit?.name}" and its completion history?`}
        confirmText="Delete Habit"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Habits;
