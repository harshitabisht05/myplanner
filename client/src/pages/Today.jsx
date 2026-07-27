import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Checkbox from '../components/common/Checkbox';
import Badge from '../components/common/Badge';
import Skeleton from '../components/common/Skeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import TaskModal from '../components/modals/TaskModal';
import DeleteTaskModal from '../components/modals/DeleteTaskModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { Sun, Star, Plus, Sunrise, Sunset, Moon, Shield, ChevronLeft, ChevronRight, Edit2, Trash2, Clock, Sparkles } from 'lucide-react';
import { getLocalDateStr } from '../utils/dateUtils';

const Today = () => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();
  const todayStr = getLocalDateStr();
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateStr());

  const isGta = theme === 'gta';

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultTimeBlock, setDefaultTimeBlock] = useState('none');

  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);
  const [isClearingCompleted, setIsClearingCompleted] = useState(false);

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalDateStr(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(getLocalDateStr(d));
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  // Fetch tasks for selected date
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', 'today', selectedDate],
    queryFn: () => taskApi.getTasks({ date: selectedDate, view: 'today' })
  });

  const tasks = data?.tasks || [];
  const hasCompletedTasks = tasks.some((t) => t.completed);

  const top3Tasks = tasks.filter((t) => t.isTop3);
  const morningTasks = tasks.filter((t) => t.timeBlock === 'morning');
  const afternoonTasks = tasks.filter((t) => t.timeBlock === 'afternoon');
  const eveningTasks = tasks.filter((t) => t.timeBlock === 'evening');
  const nightTasks = tasks.filter((t) => t.timeBlock === 'night');
  const midnightTasks = tasks.filter((t) => t.timeBlock === 'midnight');
  const untimedTasks = tasks.filter((t) => !t.timeBlock || t.timeBlock === 'none');

  // Toggle complete mutation with Optimistic Updates
  const toggleCompleteMutation = useMutation({
    mutationFn: (taskId) => taskApi.toggleTaskComplete(taskId, selectedDate),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasksData = queryClient.getQueryData(['tasks', 'today', selectedDate]);

      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) => {
        if (!old || !Array.isArray(old.tasks)) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t._id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      });

      return { previousTasksData };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasksData) {
        queryClient.setQueryData(['tasks', 'today', selectedDate], context.previousTasksData);
      }
    },
    onSuccess: (resData) => {
      if (isGta && resData.task?.completed) {
        showSuccess('MISSION PASSED! 🎯');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
          dueDate: taskData.dueDate || selectedDate,
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

  const handleDeleteConfirm = async (mode = 'single') => {
    if (!deleteConfirmTask) return;
    setIsDeleting(true);
    const taskIdToDelete = deleteConfirmTask._id;
    try {
      const params = mode === 'all' ? { deleteAll: 'true', date: selectedDate } : { date: selectedDate };
      await taskApi.deleteTask(taskIdToDelete, params);
      
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) => {
        if (!old || !Array.isArray(old.tasks)) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t) => t._id !== taskIdToDelete)
        };
      });

      showSuccess(mode === 'all' ? 'Entire task series deleted!' : 'Task deleted for today!');
      setDeleteConfirmTask(null);
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  const handleClearCompletedConfirm = async () => {
    setIsClearingCompleted(true);
    try {
      await taskApi.clearCompleted({ date: selectedDate, view: 'today' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Completed tasks cleared! 🧹');
      setIsClearCompletedOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to clear completed tasks');
    } finally {
      setIsClearingCompleted(false);
    }
  };

  const renderTaskItem = (task) => (
    <div
      key={task._id}
      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
        task.completed && isGta
          ? 'gta-mission-passed'
          : 'bg-planner-bg/60 border-planner-border hover:border-planner-primary/40'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Checkbox
          checked={task.completed}
          onChange={() => toggleCompleteMutation.mutate(task._id)}
        />
        <span
          onClick={() => handleOpenEditTask(task)}
          className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:text-planner-primary transition-colors ${
            task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
          }`}
          title="Click to edit task"
        >
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <IconButton size="sm" onClick={() => handleOpenEditTask(task)} title="Edit Task">
          <Edit2 className="w-3.5 h-3.5 text-planner-muted hover:text-planner-primary" />
        </IconButton>
        <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmTask(task)} title="Delete Task">
          <Trash2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGta ? 'Main Missions Schedule' : "Daily Planner"}
        subtitle={
          isGta
            ? 'Execute top city objectives and daily timeline operations'
            : `Plan and focus on tasks for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}`
        }
        icon={isGta ? Shield : Sun}
        action={
          <div className="flex items-center gap-2">
            {hasCompletedTasks && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearCompletedOpen(true)}
                className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Clear Completed
              </Button>
            )}
            <Button variant="primary" onClick={() => handleOpenNewTask('none')}>
              <Plus className="w-4 h-4 mr-1.5" /> {isGta ? 'New Mission' : 'Add Task'}
            </Button>
          </div>
        }
      />

      {/* Date Navigation Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border shadow-cozy ${isGta ? 'bg-slate-950 border-emerald-900/40' : 'bg-planner-card border-planner-border'}`}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevDay} title="Previous Day">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-planner-text min-w-[140px] text-center">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNextDay} title="Next Day">
            <ChevronRight className="w-4 h-4" />
          </Button>
          {selectedDate !== todayStr && (
            <Button variant="outline" size="sm" onClick={handleGoToday}>
              Today
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-planner-border bg-planner-bg text-planner-text text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-planner-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="card" />
          <Skeleton variant="task" count={5} />
        </div>
      ) : isError ? (
        <ErrorMessage
          message="Failed to load daily schedule."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
        />
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
                          className={`text-sm font-bold truncate cursor-pointer hover:text-planner-primary transition-colors ${
                            task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                          }`}
                          title="Click to edit task"
                        >
                          {task.title}
                        </p>
                        {task.category && <span className="text-[10px] text-planner-muted">🏷️ {task.category}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleCompleteMutation.mutate(task._id)}
                      />
                      <IconButton size="sm" onClick={() => handleOpenEditTask(task)} title="Edit Task">
                        <Edit2 className="w-3.5 h-3.5 text-planner-muted hover:text-planner-primary" />
                      </IconButton>
                      <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmTask(task)} title="Delete Task">
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Daily Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-planner-text tracking-tight flex items-center gap-2">
                <span>{isGta ? 'TIMELINE OPERATIONS' : 'Daily Timeline'}</span>
              </h2>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${untimedTasks.length > 0 ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-5'} gap-4 sm:gap-6`}>
              {/* Morning Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-5 h-5 text-amber-500 shrink-0" />
                    <h3 className="font-bold text-planner-text text-sm sm:text-base">
                      {isGta ? 'MORNING OPS' : 'Morning 🌅'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('morning')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {morningTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No morning tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {morningTasks.map(renderTaskItem)}
                  </div>
                )}
              </Card>

              {/* Afternoon Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-sky-500 shrink-0" />
                    <h3 className="font-bold text-planner-text text-sm sm:text-base">
                      {isGta ? 'AFTERNOON HEISTS' : 'Afternoon ☀️'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('afternoon')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {afternoonTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No afternoon tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {afternoonTasks.map(renderTaskItem)}
                  </div>
                )}
              </Card>

              {/* Evening Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Sunset className="w-5 h-5 text-orange-500 shrink-0" />
                    <h3 className="font-bold text-planner-text text-sm sm:text-base">
                      {isGta ? 'EVENING OPS' : 'Evening 🌆'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('evening')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {eveningTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No evening tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {eveningTasks.map(renderTaskItem)}
                  </div>
                )}
              </Card>

              {/* Night Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-400 shrink-0" />
                    <h3 className="font-bold text-planner-text text-sm sm:text-base">
                      {isGta ? 'NIGHT OUT' : 'Night 🌃'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('night')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {nightTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No night tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {nightTasks.map(renderTaskItem)}
                  </div>
                )}
              </Card>

              {/* Midnight Timeline */}
              <Card className={isGta ? 'gta-hud-card' : ''}>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-400 shrink-0" />
                    <h3 className="font-bold text-planner-text text-sm sm:text-base">
                      {isGta ? 'MIDNIGHT OPS' : 'Midnight 🌌'}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('midnight')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {midnightTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-6 bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                    No midnight tasks.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {midnightTasks.map(renderTaskItem)}
                  </div>
                )}
              </Card>

              {/* Untimed / General Tasks (if any) */}
              {untimedTasks.length > 0 && (
                <Card className={isGta ? 'gta-hud-card' : ''}>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-planner-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                      <h3 className="font-bold text-planner-text text-sm sm:text-base">
                        {isGta ? 'UNTIMED OPS' : 'Anytime 📌'}
                      </h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenNewTask('none')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {untimedTasks.map(renderTaskItem)}
                  </div>
                </Card>
              )}
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

      {/* Delete Task Modal with Recurring Options */}
      <DeleteTaskModal
        isOpen={!!deleteConfirmTask}
        onClose={() => setDeleteConfirmTask(null)}
        onConfirm={handleDeleteConfirm}
        task={deleteConfirmTask}
        date={selectedDate}
        isLoading={isDeleting}
      />

      {/* Clear Completed Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isClearCompletedOpen}
        onClose={() => setIsClearCompletedOpen(false)}
        onConfirm={handleClearCompletedConfirm}
        title="Clear Completed Tasks"
        message="Are you sure you want to remove all completed tasks for this day?"
        confirmText="Clear Completed"
        isLoading={isClearingCompleted}
      />
    </div>
  );
};

export default Today;
