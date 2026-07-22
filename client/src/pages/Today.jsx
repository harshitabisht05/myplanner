import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskModal from '../components/modals/TaskModal';
import { Sun, Star, Plus, Sunrise, Sunset, Moon, Shield, Flame } from 'lucide-react';

const Today = () => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const todayStr = new Date().toISOString().split('T')[0];

  const isGta = theme === 'gta';

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultTimeBlock, setDefaultTimeBlock] = useState('none');

  // Fetch Today's tasks
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', 'today', todayStr],
    queryFn: () => taskApi.getTasks({ date: todayStr, view: 'today' })
  });

  const tasks = data?.tasks || [];

  // Filter top 3 tasks for today
  const top3Tasks = tasks.filter((t) => t.isTop3);
  const morningTasks = tasks.filter((t) => t.timeBlock === 'morning');
  const afternoonTasks = tasks.filter((t) => t.timeBlock === 'afternoon');
  const eveningTasks = tasks.filter((t) => t.timeBlock === 'evening');

  // Toggle complete mutation
  const toggleCompleteMutation = useMutation({
    mutationFn: (taskId) => taskApi.toggleTaskComplete(taskId),
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (isGta && resData.task?.completed) {
        showSuccess('MISSION PASSED! 🎯');
      }
    }
  });

  const handleOpenNewTask = (timeBlock = 'none') => {
    setEditingTask(null);
    setDefaultTimeBlock(timeBlock);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask._id, taskData);
        showSuccess('Task updated! ✨');
      } else {
        await taskApi.createTask({
          ...taskData,
          dueDate: todayStr,
          timeBlock: taskData.timeBlock !== 'none' ? taskData.timeBlock : defaultTimeBlock
        });
        showSuccess('Task created! 🌸');
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalOpen(false);
    } catch (err) {
      showError(err.message || 'Error saving task');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGta ? 'Main Missions Schedule' : "Today's Planner"}
        subtitle={
          isGta
            ? 'Execute top city objectives and daily timeline operations'
            : `Focus on what matters most for ${new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}`
        }
        icon={isGta ? Shield : Sun}
        action={
          <Button variant="primary" onClick={() => handleOpenNewTask('none')}>
            <Plus className="w-4 h-4 mr-1.5" /> {isGta ? 'New Mission' : 'Add Task'}
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading daily schedule..." fullPage />
      ) : isError ? (
        <p className="text-center text-rose-500 font-semibold py-8">Failed to load today's tasks.</p>
      ) : (
        <>
          {/* Today's Top 3 Priority Section */}
          <Card
            className={`${
              isGta
                ? 'gta-hud-card border-orange-500/40 bg-slate-950/80'
                : 'bg-gradient-to-r from-amber-500/10 via-planner-card to-amber-500/5 border-amber-200 dark:border-amber-900/60'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isGta ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-planner-text">
                    {isGta ? 'MAIN MISSIONS (TOP 3)' : "Today's Top 3 Priorities"}
                  </h2>
                  <p className="text-xs text-planner-muted">Maximum 3 priorities per day (Enforced)</p>
                </div>
              </div>
              <Badge variant="medium">{top3Tasks.length} / 3 Selected</Badge>
            </div>

            {top3Tasks.length === 0 ? (
              <div className="text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                <p className="text-sm font-medium text-planner-muted">
                  {isGta
                    ? 'No Main Missions selected yet. Assign Top 3 priorities to take control of Los Santos!'
                    : 'No Top 3 priorities selected yet. Mark tasks as Top 3 to stay laser focused! ⭐'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {top3Tasks.map((task, idx) => (
                  <div
                    key={task._id}
                    className={`p-4 rounded-2xl border shadow-cozy flex items-start justify-between gap-2 ${
                      task.completed && isGta
                        ? 'gta-mission-passed'
                        : isGta
                        ? 'bg-slate-900/90 border-orange-500/40 text-slate-100'
                        : 'bg-planner-card border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                          isGta ? 'bg-orange-500 text-slate-950' : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p
                          onClick={() => handleOpenEditTask(task)}
                          className={`text-sm font-bold truncate cursor-pointer hover:text-planner-primary ${
                            task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.category && <span className="text-[10px] text-planner-muted">🏷️ {task.category}</span>}
                      </div>
                    </div>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => toggleCompleteMutation.mutate(task._id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Daily Timeline Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-planner-text tracking-tight flex items-center gap-2">
              <span>{isGta ? 'TIMELINE OPERATIONS' : 'Daily Timeline'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Morning Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-planner-text">
                      {isGta ? 'MORNING OPS' : 'Morning'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('morning')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {morningTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No morning tasks block.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {morningTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          task.completed && isGta
                            ? 'gta-mission-passed'
                            : 'bg-planner-bg/60 border-planner-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleCompleteMutation.mutate(task._id)}
                          />
                          <span
                            onClick={() => handleOpenEditTask(task)}
                            className={`text-sm font-semibold truncate cursor-pointer ${
                              task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Afternoon Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-sky-500" />
                    <h3 className="font-bold text-planner-text">
                      {isGta ? 'AFTERNOON HEISTS' : 'Afternoon'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('afternoon')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {afternoonTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No afternoon tasks block.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {afternoonTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          task.completed && isGta
                            ? 'gta-mission-passed'
                            : 'bg-planner-bg/60 border-planner-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleCompleteMutation.mutate(task._id)}
                          />
                          <span
                            onClick={() => handleOpenEditTask(task)}
                            className={`text-sm font-semibold truncate cursor-pointer ${
                              task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Evening Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-planner-text">
                      {isGta ? 'NIGHT OUT' : 'Evening'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('evening')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {eveningTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No evening tasks block.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eveningTasks.map((task) => (
                      <div
                        key={task._id}
                        className={`p-3 rounded-2xl border flex items-center justify-between ${
                          task.completed && isGta
                            ? 'gta-mission-passed'
                            : 'bg-planner-bg/60 border-planner-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleCompleteMutation.mutate(task._id)}
                          />
                          <span
                            onClick={() => handleOpenEditTask(task)}
                            className={`text-sm font-semibold truncate cursor-pointer ${
                              task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Task Edit / Create Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />
    </div>
  );
};

export default Today;
