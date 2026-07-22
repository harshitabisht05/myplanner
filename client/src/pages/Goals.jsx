import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '../api/goalApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Input from '../components/common/Input';
import ProgressBar from '../components/common/ProgressBar';
import Badge from '../components/common/Badge';
import Checkbox from '../components/common/Checkbox';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import GoalModal from '../components/modals/GoalModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { Target, Plus, Edit2, Trash2, Calendar, Trophy, Shield } from 'lucide-react';

const Goals = () => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const isGta = theme === 'gta';

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [newMilestoneText, setNewMilestoneText] = useState({});

  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalApi.getGoals()
  });

  const goals = data?.goals || [];

  const handleGoalSubmit = async (goalData) => {
    try {
      if (editingGoal) {
        await goalApi.updateGoal(editingGoal._id, goalData);
        showSuccess('Goal updated!');
      } else {
        await goalApi.createGoal(goalData);
        showSuccess('Goal created! 🎯');
      }
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsGoalModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save goal');
    }
  };

  const handleDeleteGoalConfirm = async () => {
    if (!deleteConfirmGoal) return;
    setIsDeleting(true);
    try {
      await goalApi.deleteGoal(deleteConfirmGoal._id);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccess('Goal deleted');
      setDeleteConfirmGoal(null);
    } catch (err) {
      showError(err.message || 'Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  // Milestone Mutations
  const addMilestoneMutation = useMutation({
    mutationFn: ({ goalId, title }) => goalApi.addMilestone(goalId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccess('Milestone added!');
    }
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ goalId, milestoneId, completed }) =>
      goalApi.updateMilestone(goalId, milestoneId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: ({ goalId, milestoneId }) => goalApi.deleteMilestone(goalId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccess('Milestone removed');
    }
  });

  const handleAddMilestoneSubmit = (e, goalId) => {
    e.preventDefault();
    const title = newMilestoneText[goalId];
    if (!title || !title.trim()) return;

    addMilestoneMutation.mutate({ goalId, title: title.trim() });
    setNewMilestoneText((prev) => ({ ...prev, [goalId]: '' }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGta ? 'Campaign Goals & Milestones' : 'Goals & Milestones'}
        subtitle={
          isGta
            ? 'Track overall campaign progression and game completion statistics'
            : 'Set long-term objectives, break them down into actionable milestones, and track your progress'
        }
        icon={isGta ? Trophy : Target}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> {isGta ? 'New Campaign Goal' : 'New Goal'}
          </Button>
        }
      />

      {/* Goal Cards Grid */}
      {isLoading ? (
        <LoadingSpinner message="Fetching goals..." fullPage />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={isGta ? 'No campaign goals set' : 'No goals set yet'}
          message={isGta ? 'Start a campaign! Define your major objectives and milestones.' : 'Dream big! Create your first objective and track your milestones.'}
          actionText={isGta ? 'Create Campaign Goal' : 'Create Goal'}
          onAction={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => (
            <Card key={goal._id} className={`p-5 sm:p-6 space-y-4 ${isGta ? 'gta-hud-card' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-planner-border">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-planner-text">{goal.title}</h3>
                    <Badge variant={goal.status === 'completed' ? 'success' : 'primary'}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {goal.description && <p className="text-sm text-planner-muted mt-1">{goal.description}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {goal.targetDate && (
                    <span className="text-xs text-planner-muted flex items-center gap-1 bg-planner-secondary px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" /> Target: {goal.targetDate}
                    </span>
                  )}
                  <IconButton onClick={() => { setEditingGoal(goal); setIsGoalModalOpen(true); }}>
                    <Edit2 className="w-4 h-4 text-planner-muted" />
                  </IconButton>
                  <IconButton variant="danger" onClick={() => setDeleteConfirmGoal(goal)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                value={goal.progress || 0}
                label={
                  isGta
                    ? `CAMPAIGN STATS (${goal.completedMilestones || 0}/${goal.totalMilestones || 0} MILESTONES PASSED)`
                    : `Milestones Completed (${goal.completedMilestones || 0}/${goal.totalMilestones || 0})`
                }
                showPercentage
              />

              {/* Milestones Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-planner-muted uppercase tracking-wider">
                  {isGta ? 'CAMPAIGN CHECKPOINTS' : 'Milestones Checklist'}
                </h4>

                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-2">
                    {goal.milestones.map((m) => (
                      <div
                        key={m._id}
                        className={`flex items-center justify-between p-3 rounded-2xl border ${
                          m.completed && isGta
                            ? 'gta-mission-passed'
                            : 'bg-planner-bg/60 border-planner-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Checkbox
                            checked={m.completed}
                            onChange={(val) =>
                              toggleMilestoneMutation.mutate({
                                goalId: goal._id,
                                milestoneId: m._id,
                                completed: val
                              })
                            }
                          />
                          <span
                            className={`text-sm font-semibold truncate ${
                              m.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                        <IconButton
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            deleteMilestoneMutation.mutate({ goalId: goal._id, milestoneId: m._id })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Milestone Inline Form */}
                <form
                  onSubmit={(e) => handleAddMilestoneSubmit(e, goal._id)}
                  className="flex items-center gap-2 pt-1"
                >
                  <Input
                    placeholder={isGta ? 'Add campaign checkpoint...' : 'Add a milestone step...'}
                    value={newMilestoneText[goal._id] || ''}
                    onChange={(e) =>
                      setNewMilestoneText((prev) => ({ ...prev, [goal._id]: e.target.value }))
                    }
                  />
                  <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                    <Plus className="w-4 h-4 mr-1" /> Add Step
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleGoalSubmit}
        goal={editingGoal}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmGoal}
        onClose={() => setDeleteConfirmGoal(null)}
        onConfirm={handleDeleteGoalConfirm}
        title="Delete Goal"
        message={`Are you sure you want to delete goal "${deleteConfirmGoal?.title}"?`}
        confirmText="Delete Goal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Goals;
