import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Skeleton from '../../components/common/Skeleton';
import { useSocket } from '../../hooks/useSocket';
import {
  Kanban,
  Plus,
  Clock,
  CheckSquare,
  MessageSquare,
  User,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Send,
  Paperclip
} from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'review', label: 'Review', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'testing', label: 'Testing', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
];

const KanbanBoard = () => {
  const { currentWorkspaceId, currentWorkspace } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('todo');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [commentText, setCommentText] = useState('');

  // Connect socket for real-time live Kanban card movements
  useSocket(currentWorkspaceId, (event) => {
    if (event === 'task_updated' || event === 'task_created') {
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
    }
  });

  // Fetch tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['workspace-tasks', currentWorkspaceId],
    queryFn: () => workspaceApi.getTasks(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['workspace-projects', currentWorkspaceId],
    queryFn: () => workspaceApi.getProjects(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];

  // Update status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => workspaceApi.updateTask(currentWorkspaceId, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
      showSuccess('Task status updated!');
    }
  });

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await workspaceApi.createTask(currentWorkspaceId, {
        title: newTitle,
        description: newDesc,
        status: newStatus,
        priority: newPriority,
        dueDate: newDueDate,
        project: newProjectId || null,
        assignees: newAssigneeId ? [newAssigneeId] : []
      });
      showSuccess('Workspace task created!');
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewAssigneeId('');
    } catch (err) {
      showError(err.message || 'Failed to create task');
    }
  };

  const handleOpenDetail = async (task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;

    try {
      await workspaceApi.addComment(currentWorkspaceId, selectedTask._id, { content: commentText });
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
      showSuccess('Comment added');
    } catch (err) {
      showError('Failed to add comment');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await workspaceApi.deleteTask(currentWorkspaceId, taskId);
      showSuccess('Task deleted');
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
      setIsTaskDetailOpen(false);
    } catch (err) {
      showError('Failed to delete task');
    }
  };

  const [mobileActiveCol, setMobileActiveCol] = useState('all');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban Board"
        subtitle="Manage sprint workflow across Backlog, To Do, In Progress, Review, Testing, and Done"
        icon={Kanban}
        action={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Task
          </Button>
        }
      />

      {/* Mobile Column Navigation Tabs */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-2 border-b border-planner-border">
        <button
          onClick={() => setMobileActiveCol('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
            mobileActiveCol === 'all' ? 'bg-planner-primary text-white' : 'bg-planner-card text-planner-muted'
          }`}
        >
          All ({tasks.length})
        </button>
        {KANBAN_COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setMobileActiveCol(col.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                mobileActiveCol === col.id ? 'bg-planner-primary text-white' : 'bg-planner-card text-planner-muted'
              }`}
            >
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {isTasksLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {KANBAN_COLUMNS.filter((col) => mobileActiveCol === 'all' || mobileActiveCol === col.id).map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="w-72 shrink-0 bg-planner-bg/60 border border-planner-border rounded-2xl p-3 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.color}`}>
                    {col.label} ({colTasks.length})
                  </span>
                  <button
                    onClick={() => {
                      setNewStatus(col.id);
                      setIsCreateModalOpen(true);
                    }}
                    className="p-1 text-planner-muted hover:text-planner-text rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 min-h-[400px]">
                  {colTasks.map((task) => (
                    <Card
                      key={task._id}
                      onClick={() => handleOpenDetail(task)}
                      className="p-3.5 cursor-pointer hover:border-planner-primary transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-planner-text line-clamp-2">{task.title}</h4>
                        <Badge variant={task.priority}>{task.priority}</Badge>
                      </div>

                      {task.description && <p className="text-[11px] text-planner-muted line-clamp-2">{task.description}</p>}

                      <div className="flex items-center justify-between text-[10px] text-planner-muted pt-2 border-t border-planner-border">
                        <div className="flex items-center gap-2">
                          {task.dueDate && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-planner-primary" /> {task.dueDate}
                            </span>
                          )}
                          {task.assignees && task.assignees.length > 0 && (
                            <span className="flex items-center gap-1 font-bold text-planner-primary" title={task.assignees[0]?.name || 'Assignee'}>
                              <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px]">
                                {task.assignees[0]?.name ? task.assignees[0].name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              {task.assignees[0]?.name?.split(' ')[0]}
                            </span>
                          )}
                        </div>

                        {/* Column shift controls */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {col.id !== 'backlog' && (
                            <button
                              onClick={() => {
                                const idx = KANBAN_COLUMNS.findIndex((c) => c.id === col.id);
                                if (idx > 0) updateTaskStatusMutation.mutate({ taskId: task._id, status: KANBAN_COLUMNS[idx - 1].id });
                              }}
                              className="p-1 rounded bg-planner-secondary text-planner-muted hover:text-planner-text"
                              title="Move left"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => {
                                const idx = KANBAN_COLUMNS.findIndex((c) => c.id === col.id);
                                if (idx < KANBAN_COLUMNS.length - 1)
                                  updateTaskStatusMutation.mutate({ taskId: task._id, status: KANBAN_COLUMNS[idx + 1].id });
                              }}
                              className="p-1 rounded bg-planner-secondary text-planner-muted hover:text-planner-text"
                              title="Move right"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Workspace Task 📝">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required autoFocus />
          <Textarea label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Column / Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={KANBAN_COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
            />
            <Select
              label="Priority"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due Date" type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
            <Select
              label="Project (Optional)"
              value={newProjectId}
              onChange={(e) => setNewProjectId(e.target.value)}
              options={[{ value: '', label: 'None (General)' }, ...projects.map((p) => ({ value: p._id, label: p.title }))]}
            />
          </div>
          <Select
            label="Assign To Team Member 👤"
            value={newAssigneeId}
            onChange={(e) => setNewAssigneeId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned' },
              ...(currentWorkspace?.members || []).map((m) => ({
                value: m.user?._id || m.user,
                label: `${m.user?.name || 'Member'} (${m.role})`
              }))
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rich Task Detail Modal */}
      {selectedTask && (
        <Modal isOpen={isTaskDetailOpen} onClose={() => setIsTaskDetailOpen(false)} title={selectedTask.title} maxWidth="max-w-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-planner-border pb-3">
              <div className="flex items-center gap-2">
                <Badge variant={selectedTask.priority}>{selectedTask.priority}</Badge>
                <span className="text-xs font-bold text-planner-muted uppercase">Status: {selectedTask.status}</span>
              </div>
              <button onClick={() => handleDeleteTask(selectedTask._id)} className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Delete Task
              </button>
            </div>

            <p className="text-sm text-planner-text leading-relaxed">{selectedTask.description || 'No description added.'}</p>

            {/* Comments Section */}
            <div className="space-y-3 pt-3 border-t border-planner-border">
              <h4 className="text-xs font-bold text-planner-text flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-500" /> Team Comments
              </h4>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <Input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1" />
                <Button type="submit" variant="primary" size="sm">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KanbanBoard;
