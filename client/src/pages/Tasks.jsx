import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getLocalDateStr } from '../utils/dateUtils';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TaskModal from '../components/modals/TaskModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { CheckSquare, Plus, Search, Edit2, Trash2, Calendar, Star, Shield, Award } from 'lucide-react';

const Tasks = () => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const isGta = theme === 'gta';

  const [view, setView] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' | 'priority' | 'recentlyCreated'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const todayStr = getLocalDateStr();

  // Fetch tasks query
  const { data, isLoading } = useQuery({
    queryKey: ['tasks', view, search, categoryFilter, priorityFilter, sortBy, todayStr],
    queryFn: () =>
      taskApi.getTasks({
        view,
        search,
        category: categoryFilter,
        priority: priorityFilter,
        sortBy,
        date: todayStr
      })
  });

  const tasks = data?.tasks || [];

  // Mutations with Optimistic Updates
  const toggleCompleteMutation = useMutation({
    mutationFn: (id) => taskApi.toggleTaskComplete(id, getLocalDateStr()),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old) => {
        if (!old || !Array.isArray(old.tasks)) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t._id === id ? { ...t, completed: !t.completed } : t
          )
        };
      });
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

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask._id, taskData);
        showSuccess('Task updated! 🌸');
      } else {
        await taskApi.createTask(taskData);
        showSuccess('Task created! ✨');
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save task');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTask) return;
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(deleteConfirmTask._id);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccess('Task deleted!');
      setDeleteConfirmTask(null);
    } catch (err) {
      showError(err.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGta ? 'Mission Log' : 'Tasks & To-Dos'}
        subtitle={
          isGta
            ? 'Manage active city missions, side tasks, and objective priority levels'
            : 'Manage, filter and organize all your daily and upcoming tasks'
        }
        icon={isGta ? Shield : CheckSquare}
        action={
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> {isGta ? 'New Mission' : 'Add Task'}
          </Button>
        }
      />

      {/* Main View Tabs */}
      <div className={`flex p-1.5 rounded-2xl border shadow-cozy overflow-x-auto ${isGta ? 'bg-slate-950 border-emerald-900/40' : 'bg-planner-card border-planner-border'}`}>
        {[
          { key: 'all', label: isGta ? 'All Missions' : 'All Tasks' },
          { key: 'today', label: isGta ? "Today's Missions" : "Today's Tasks" },
          { key: 'upcoming', label: isGta ? 'Upcoming Heists' : 'Upcoming' },
          { key: 'completed', label: isGta ? 'Passed Missions' : 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              view === tab.key
                ? isGta
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-planner-primary text-white shadow-xs'
                : 'text-planner-muted hover:text-planner-text hover:bg-planner-secondary/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters & Search Controls Bar */}
      <Card className={`p-4 ${isGta ? 'gta-hud-card' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder={isGta ? 'Search mission name...' : 'Search tasks...'}
            leftIcon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Personal', label: 'Personal' },
              { value: 'Work', label: 'Work' },
              { value: 'Study', label: 'Study' },
              { value: 'Health', label: 'Health' }
            ]}
          />
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Priorities' },
              { value: 'high', label: 'High Priority 🔥' },
              { value: 'medium', label: 'Medium Priority 🌸' },
              { value: 'low', label: 'Low Priority 🌱' }
            ]}
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'dueDate', label: 'Sort by Due Date' },
              { value: 'priority', label: 'Sort by Priority' },
              { value: 'recentlyCreated', label: 'Sort by Recently Created' }
            ]}
          />
        </div>
      </Card>

      {/* Task List */}
      {isLoading ? (
        <LoadingSpinner message="Fetching tasks..." fullPage />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={isGta ? 'No active missions' : 'No tasks found'}
          message={isGta ? 'Your mission log is clear. Take on new city objectives!' : 'Nothing here yet. Your day is a blank page ✨'}
          actionText={isGta ? 'Create Mission' : 'Create Task'}
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task._id}
              hover
              className={`p-4 flex items-center justify-between gap-3 ${
                task.completed && isGta ? 'gta-mission-passed' : isGta ? 'gta-hud-card' : ''
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleCompleteMutation.mutate(task._id)}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-base font-bold truncate ${
                        task.completed ? 'line-through text-planner-muted' : 'text-planner-text'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.completed && isGta && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 uppercase tracking-widest">
                        <Award className="w-3 h-3" /> MISSION PASSED
                      </span>
                    )}
                    {task.isTop3 && (
                      <Badge variant="primary" className="text-[10px]">
                        <Star className="w-3 h-3 fill-planner-primary mr-1" /> {isGta ? 'MAIN MISSION' : 'Top 3'}
                      </Badge>
                    )}
                    {task.isRecurringDaily && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
                        Daily 🔄
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-planner-muted truncate mt-0.5 max-w-xl">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-planner-muted mt-1.5 flex-wrap">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {task.dueDate} {task.dueTime}
                      </span>
                    )}
                    {task.category && (
                      <span className="px-2 py-0.5 rounded-full bg-planner-secondary text-planner-muted">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={task.priority}>{task.priority}</Badge>
                <IconButton size="sm" onClick={() => handleOpenEdit(task)} title="Edit Task">
                  <Edit2 className="w-4 h-4 text-planner-muted hover:text-planner-primary" />
                </IconButton>
                <IconButton size="sm" variant="danger" onClick={() => setDeleteConfirmTask(task)} title="Delete Task">
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmTask}
        onClose={() => setDeleteConfirmTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirmTask?.title}"?`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Tasks;
