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
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Layers, Plus, Calendar, Users, Trash2, Edit2 } from 'lucide-react';

const Projects = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-projects', currentWorkspaceId],
    queryFn: () => workspaceApi.getProjects(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const projects = data?.projects || [];

  const handleOpenCreate = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setStatus('in_progress');
    setPriority('medium');
    setDeadline('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
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

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await workspaceApi.deleteProject(currentWorkspaceId, projectId);
      showSuccess('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['workspace-projects', currentWorkspaceId] });
    } catch (err) {
      showError(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Projects"
        subtitle="Manage team initiatives, milestones, deadlines, and project statuses"
        icon={Layers}
        action={
          <Button variant="primary" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" /> New Project
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-planner-muted text-sm">No projects found in this workspace yet.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={handleOpenCreate}>
            Create First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Card key={project._id} className="p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
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
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 rounded-lg hover:bg-planner-secondary text-planner-muted hover:text-planner-text"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
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
    </div>
  );
};

export default Projects;
