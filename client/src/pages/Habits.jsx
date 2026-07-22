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
import { Sparkles, Plus, Edit2, Trash2, Flame, Trophy, Check, Zap } from 'lucide-react';

const Habits = () => {
  const queryClient = useQueryClient();
  const { weekStart, theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const isGta = theme === 'gta';

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 7-day range calculation
  const today = new Date();
  const datesArray = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    datesArray.push(d.toISOString().split('T')[0]);
  }

  const startDate = datesArray[0];
  const endDate = datesArray[6];

  const { data, isLoading } = useQuery({
    queryKey: ['habits', startDate, endDate],
    queryFn: () => habitApi.getHabits({ startDate, endDate })
  });

  const habits = data?.habits || [];

  // Toggle habit completion mutation
  const toggleHabitMutation = useMutation({
    mutationFn: ({ habitId, date }) => habitApi.toggleHabitCompletion(habitId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      if (isGta) {
        showSuccess('STAT INCREASED! 🔥 +50 EXP');
      }
    }
  });

  const handleHabitSubmit = async (habitData) => {
    try {
      if (editingHabit) {
        await habitApi.updateHabit(editingHabit._id, habitData);
        showSuccess('Habit updated!');
      } else {
        await habitApi.createHabit(habitData);
        showSuccess('Habit created! 🌸');
      }
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      setIsHabitModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save habit');
    }
  };

  const handleDeleteHabitConfirm = async () => {
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

  // Overall weekly percentage
  let totalPossible = habits.length * 7;
  let totalCompleted = 0;
  habits.forEach((h) => {
    if (h.completions) totalCompleted += h.completions.length;
  });

  const weeklyRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGta ? 'PLAYER STATS & ROUTINES' : 'Habit Tracker'}
        subtitle={
          isGta
            ? 'Build your player attributes, daily strength, and streak consistency'
            : 'Build consistency, track daily streaks, and celebrate small wins'
        }
        icon={isGta ? Zap : Sparkles}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingHabit(null);
              setIsHabitModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> {isGta ? 'New Player Stat' : 'New Habit'}
          </Button>
        }
      />

      {/* Weekly Progress Rate Overview */}
      <Card className={`p-5 ${isGta ? 'gta-hud-card' : ''}`}>
        <ProgressBar
          value={weeklyRate}
          label={isGta ? 'PLAYER STAT CONSISTENCY RATE' : 'Weekly Habit Completion Rate'}
          showPercentage
        />
      </Card>

      {/* Habits List & 7-Day Matrix */}
      {isLoading ? (
        <LoadingSpinner message="Fetching habits..." fullPage />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={isGta ? 'No player stats tracked' : 'No habits tracked yet'}
          message={isGta ? 'Define your daily player routines to level up your strength and focus attributes.' : 'Consistency starts with small steps. Create your first habit!'}
          actionText={isGta ? 'Add Player Stat' : 'Add Habit'}
          onAction={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <Card key={habit._id} className={`p-4 sm:p-5 ${isGta ? 'gta-hud-card' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Habit Info & Streaks */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl shrink-0">{habit.emoji || '🌱'}</span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-planner-text truncate">{habit.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-planner-muted mt-1">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-current" /> {isGta ? 'CURRENT STREAK:' : 'Current:'} {habit.currentStreak || 0}d
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Trophy className="w-3.5 h-3.5 text-purple-500" /> {isGta ? 'BEST STREAK:' : 'Best:'} {habit.bestStreak || 0}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Grid Circles */}
                <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end shrink-0">
                  {datesArray.map((dateStr) => {
                    const isCompleted = habit.completions?.includes(dateStr);
                    const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'narrow'
                    });

                    return (
                      <button
                        key={dateStr}
                        onClick={() => toggleHabitMutation.mutate({ habitId: habit._id, date: dateStr })}
                        className={`w-9 h-11 sm:w-10 sm:h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition-all active:scale-95 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'bg-planner-bg/60 border-planner-border hover:border-planner-primary/40'
                        }`}
                        title={dateStr}
                      >
                        <span className="text-[9px] font-bold text-planner-muted uppercase">{dayLabel}</span>
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-planner-border" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Action Menu */}
                <div className="flex items-center gap-1 shrink-0 justify-end">
                  <IconButton
                    size="sm"
                    onClick={() => {
                      setEditingHabit(habit);
                      setIsHabitModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 text-planner-muted" />
                  </IconButton>
                  <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmHabit(habit)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => setIsHabitModalOpen(false)}
        onSubmit={handleHabitSubmit}
        habit={editingHabit}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmHabit}
        onClose={() => setDeleteConfirmHabit(null)}
        onConfirm={handleDeleteHabitConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${deleteConfirmHabit?.name}"?`}
        confirmText="Delete Habit"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Habits;
