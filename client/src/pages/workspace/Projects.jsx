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
import ProgressBar from '../../components/common/ProgressBar';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Layers, Plus, Calendar, Users, Trash2, Edit2, CheckSquare, Clock } from 'lucide-react';

const Projects = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);

  // New task form inside project detail modal
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');

  // Fetch projects
  const { data, isLoading } = useQuery({
    queryKey: ['workspace-projects', currentWorkspaceId],
    queryFn: () => workspaceApi.getProjects(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  // Fetch tasks for selected project if open
  const { data: projectTasksData, refetch: refetchProjectTasks } = useQuery({
    queryKey: ['workspace-project-tasks', currentWorkspaceId, selectedProject?._id],
    queryFn: () => workspaceApi.getTasks(currentWorkspaceId, { project: selectedProject?._id }),
    enabled: !!currentWorkspaceId && !!selectedProject?._id
  });

  const projects = data?.projects || [];
  const projectTasks = projectTasksData?.tasks || [];

  const handleOpenCreate = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setStatus('in_progress');
    setPriority('medium');
    setDeadline('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
    setTitle(project.title || '');
    setDescription(project.description || '');
    setStatus(project.status || 'in_progress');
    setPriority(project.priority || 'medium');
    setDeadline(project.deadline || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingProject) {
        await workspaceApi.updateProject(currentWorkspaceId, editingProject._id, {
          title,
          description,
          status,
          priority,
          deadline
        });
        showSuccess('Project updated!');
      } else {
        await workspaceApi.createProject(currentWorkspaceId, {
          title,
          description,
          status,
          priority,
          deadline
        });
        showSuccess('Project created!');
      }
      queryClient.invalidateQueries({ queryKey: ['workspace-projects', currentWorkspaceId] });
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await workspaceApi.deleteProject(currentWorkspaceId, projectId);
      showSuccess('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['workspace-projects', currentWorkspaceId] });
      if (selectedProject?._id === projectId) setSelectedProject(null);
    } catch (err) {
      showError(err.message || 'Failed to delete project');
    }
  };

  const handleCreateTaskForProject = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedProject) return;

    try {
      await workspaceApi.createTask(currentWorkspaceId, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate,
        project: selectedProject._id,
        status: 'todo'
      });
      showSuccess('Task added to project!');
      setTaskTitle('');
      setTaskDesc('');
      setIsAddTaskOpen(false);
      refetchProjectTasks();
      queryClient.invalidateQueries({ queryKey: ['workspace-tasks', currentWorkspaceId] });
    } catch (err) {
      showError(err.message || 'Failed to add task');
    }
  };

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'timeline'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Projects & Timeline"
        subtitle="Manage team initiatives, Gantt chart milestone timelines, deadlines, and project progress"
        icon={Layers}
        action={
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xl bg-planner-secondary flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-planner-card text-planner-primary shadow-xs' : 'text-planner-muted hover:text-planner-text'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'timeline' ? 'bg-planner-card text-planner-primary shadow-xs' : 'text-planner-muted hover:text-planner-text'
                }`}
              >
                📊 Gantt Timeline
              </button>
            </div>
            <Button variant="primary" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-1.5" /> New Project
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          type="workspace"
          title="No projects found"
          message="Create your first team project or campaign to track progress."
          actionText="Create First Project"
          onAction={handleOpenCreate}
        />
      ) : viewMode === 'timeline' ? (
        /* Gantt Chart Timeline View */
        <Card className="p-6 space-y-6 overflow-x-auto">
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <h3 className="text-sm font-black text-planner-text uppercase tracking-wider">Project Timeline & Milestones</h3>
            <span className="text-xs text-planner-muted">{projects.length} Active Projects</span>
          </div>

          <div className="space-y-5 min-w-[700px]">
            {projects.map((project) => {
              const startStr = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Started';
              const endStr = project.deadline || 'Ongoing';
              return (
                <div key={project._id} className="space-y-2 p-3 rounded-2xl bg-planner-bg/60 border border-planner-border hover:bg-planner-secondary/20 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-planner-text text-sm">{project.title}</span>
                      <Badge variant={project.priority}>{project.priority}</Badge>
                      <span className="text-planner-muted capitalize">({project.status?.replace('_', ' ')})</span>
                    </div>
                    <div className="text-[11px] font-semibold text-planner-muted flex items-center gap-2">
                      <span>{startStr}</span>
                      <span>➔</span>
                      <span className="text-planner-primary font-bold">{endStr}</span>
                    </div>
                  </div>

                  {/* Gantt Bar Visualization */}
                  <div className="relative w-full h-7 bg-planner-card rounded-xl border border-planner-border overflow-hidden p-1">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 transition-all flex items-center justify-end px-2 text-[10px] font-bold text-white shadow-xs"
                      style={{ width: `${Math.max(project.progress || 0, 12)}%` }}
                    >
                      {project.progress || 0}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Card
              key={project._id}
              onClick={() => setSelectedProject(project)}
              className="p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-all cursor-pointer hover:border-planner-primary"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-planner-text leading-snug">{project.title}</h3>
                  <Badge variant={project.priority}>{project.priority}</Badge>
                </div>
                <p className="text-xs text-planner-muted line-clamp-3">{project.description || 'No description provided.'}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-planner-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-planner-muted">Status</span>
                  <span className="font-bold text-planner-text capitalize">{project.status?.replace('_', ' ')}</span>
                </div>

                {project.deadline && (
                  <div className="flex items-center justify-between text-xs text-planner-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Deadline
                    </span>
                    <span className="font-semibold text-planner-text">{project.deadline}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-planner-muted">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <ProgressBar value={project.progress || 0} max={100} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {project.members?.map((m) => (
                      <div
                        key={m._id || m}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-planner-card bg-planner-primary/20 text-planner-primary text-[10px] font-bold flex items-center justify-center"
                        title={m.name || 'Member'}
                      >
                        {m.name ? m.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(e, project)}
                      className="p-1.5 rounded-lg hover:bg-planner-secondary text-planner-muted hover:text-planner-text"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, project._id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-planner-muted hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project ✏️' : 'New Project 🚀'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'backlog', label: 'Backlog' },
                { value: 'planning', label: 'Planning' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'completed', label: 'Completed' },
                { value: 'on_hold', label: 'On Hold' }
              ]}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />
          </div>
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Project Detail & Tasks Modal */}
      {selectedProject && (
        <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={`Project: ${selectedProject.title}`} maxWidth="max-w-2xl">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={selectedProject.priority}>{selectedProject.priority} priority</Badge>
                <span className="text-xs font-bold text-planner-muted capitalize">Status: {selectedProject.status?.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-planner-text leading-relaxed">{selectedProject.description || 'No description.'}</p>
            </div>

            {/* Task List Header & Add Task Trigger */}
            <div className="flex items-center justify-between border-t border-planner-border pt-4">
              <h4 className="text-sm font-bold text-planner-text flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-500" /> Project Tasks ({projectTasks.length})
              </h4>
              <Button variant="primary" size="sm" onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Task to Project
              </Button>
            </div>

            {/* Inline Add Task Form */}
            {isAddTaskOpen && (
              <form onSubmit={handleCreateTaskForProject} className="p-3.5 rounded-2xl bg-planner-bg border border-planner-border space-y-3">
                <Input label="Task Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required autoFocus placeholder="Task title..." />
                <Textarea label="Description" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={2} placeholder="Optional notes..." />
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Priority"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' }
                    ]}
                  />
                  <Input label="Due Date" type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Task
                  </Button>
                </div>
              </form>
            )}

            {/* Tasks Listing */}
            {projectTasks.length === 0 ? (
              <p className="text-xs text-planner-muted text-center py-4 bg-planner-bg/40 rounded-xl">No tasks created for this project yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {projectTasks.map((t) => (
                  <div key={t._id} className="p-3 rounded-xl border border-planner-border bg-planner-bg/60 flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-bold text-planner-text truncate">{t.title}</p>
                      {t.dueDate && (
                        <p className="text-[10px] text-planner-muted flex items-center gap-1">
                          <Clock className="w-3 h-3 text-planner-primary" /> Due: {t.dueDate}
                        </p>
                      )}
                    </div>
                    <Badge variant={t.status === 'done' ? 'success' : 'primary'}>{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
