import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import Skeleton from '../../components/common/Skeleton';
import {
  Layout,
  Layers,
  CheckSquare,
  Clock,
  Zap,
  Users,
  MessageSquare,
  Activity,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle,
  Building
} from 'lucide-react';

const WorkspaceHome = () => {
  const { currentWorkspace, currentWorkspaceId, createWorkspace } = useWorkspace();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const [isAddWsModalOpen, setIsAddWsModalOpen] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [wsIcon, setWsIcon] = useState('👥');
  const [wsColor, setWsColor] = useState('#8B5CF6');

  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-stats', currentWorkspaceId],
    queryFn: () => workspaceApi.getWorkspaceStats(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const stats = data?.stats || {};
  const assignedTasks = stats.assignedTasks || [];
  const todayDeadlines = stats.todayDeadlines || [];
  const recentProjects = stats.recentProjects || [];
  const recentActivities = stats.recentActivities || [];

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    try {
      await createWorkspace({
        name: wsName.trim(),
        description: wsDescription.trim(),
        icon: wsIcon,
        color: wsColor
      });
      showSuccess(`Workspace "${wsName}" created! 🎉`);
      setIsAddWsModalOpen(false);
      setWsName('');
      setWsDescription('');
    } catch (err) {
      showError(err.message || 'Failed to create workspace');
    }
  };

  if (!currentWorkspaceId) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-planner-text">No Workspace Selected</h2>
        <p className="text-sm text-planner-muted">Create a new workspace to start collaborating with your team.</p>
        <Button variant="primary" onClick={() => setIsAddWsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> ADD WORKSPACE
        </Button>

        {/* Add Workspace Modal */}
        <Modal isOpen={isAddWsModalOpen} onClose={() => setIsAddWsModalOpen(false)} title="Add New Workspace 🏢">
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <Input label="Workspace Name" placeholder="e.g. Frontend Team, Startup, Hackathon" value={wsName} onChange={(e) => setWsName(e.target.value)} required autoFocus />
            <Textarea label="Description (Optional)" placeholder="What is this workspace for?" value={wsDescription} onChange={(e) => setWsDescription(e.target.value)} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Icon / Emoji" value={wsIcon} onChange={(e) => setWsIcon(e.target.value)} />
              <div>
                <label className="text-xs font-bold text-planner-muted block mb-1">Accent Color</label>
                <input type="color" value={wsColor} onChange={(e) => setWsColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-planner-bg border border-planner-border p-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsAddWsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Workspace
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Workspace Header */}
      <PageHeader
        title={isStrange ? `COMMAND HUB: ${currentWorkspace?.name || 'Workspace'}` : isGta ? `HQ: ${currentWorkspace?.name || 'Workspace'}` : `${currentWorkspace?.name || 'Workspace'} Dashboard`}
        subtitle={currentWorkspace?.description || 'Collaborative team workspace overview & project progress'}
        icon={Layout}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" size="sm" onClick={() => setIsAddWsModalOpen(true)}>
              <Building className="w-4 h-4 mr-1.5" /> ADD WORKSPACE
            </Button>
            <Link to="/workspace/projects">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Project
              </Button>
            </Link>
            <Link to="/workspace/kanban">
              <Button variant="ghost" size="sm">
                Kanban Board
              </Button>
            </Link>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : (
        <>
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-planner-muted uppercase">Active Projects</p>
                <p className="text-2xl font-extrabold text-planner-text">{stats.projectsCount || 0}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-planner-muted uppercase">Assigned To You</p>
                <p className="text-2xl font-extrabold text-planner-text">{stats.assignedTasksCount || 0}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-planner-muted uppercase">Today's Deadlines</p>
                <p className="text-2xl font-extrabold text-planner-text">{stats.todayDeadlinesCount || 0}</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-planner-muted uppercase">Team Members</p>
                <p className="text-2xl font-extrabold text-planner-text">{currentWorkspace?.members?.length || 0}</p>
              </div>
            </Card>
          </div>

          {/* Main 2-Column Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Projects & Assigned Tasks */}
            <div className="lg:col-span-2 space-y-6">

              {/* Recent Projects */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-500" /> Recent Projects
                  </h3>
                  <Link to="/workspace/projects">
                    <Button variant="ghost" size="sm">
                      All Projects <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
                {recentProjects.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-4">No projects yet. Create your first project!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recentProjects.map((p) => (
                      <div key={p._id} className="p-3.5 rounded-2xl border border-planner-border bg-planner-bg/60 hover:bg-planner-secondary/30 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-planner-text truncate">{p.title}</h4>
                          <Badge variant={p.priority}>{p.priority}</Badge>
                        </div>
                        <p className="text-xs text-planner-muted line-clamp-2 mb-3">{p.description || 'No description'}</p>
                        <ProgressBar value={p.progress || 0} max={100} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Assigned Tasks */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-blue-500" /> Assigned To You
                  </h3>
                  <Link to="/workspace/kanban">
                    <Button variant="ghost" size="sm">
                      Kanban Board <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
                {assignedTasks.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-4">No tasks assigned to you right now! 🎉</p>
                ) : (
                  <div className="space-y-2">
                    {assignedTasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-3 rounded-xl border border-planner-border bg-planner-bg/40">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-sm font-bold text-planner-text truncate">{task.title}</p>
                          <p className="text-xs text-planner-muted">
                            Project: <span className="font-semibold text-planner-text">{task.project?.title || 'General'}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={task.status === 'done' ? 'success' : 'primary'}>{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Deadlines, Team Members & Activity */}
            <div className="space-y-6">
              {/* Today's Deadlines */}
              <Card className="p-5">
                <h3 className="text-base font-bold text-planner-text mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" /> Today's Deadlines
                </h3>
                {todayDeadlines.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-3">No workspace deadlines today ✨</p>
                ) : (
                  <div className="space-y-2">
                    {todayDeadlines.map((t) => (
                      <div key={t._id} className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-planner-text truncate">{t.title}</span>
                        <Badge variant="high">Due Today</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Members Roster */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" /> Team Members
                  </h3>
                  <Link to="/workspace/members">
                    <Button variant="ghost" size="sm">
                      Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {currentWorkspace?.members?.map((m) => (
                    <div key={m.user?._id || m.user} className="flex items-center justify-between p-2 rounded-xl bg-planner-bg/40">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-bold text-xs">
                          {m.user?.name ? m.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-planner-text truncate">{m.user?.name || 'Member'}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-planner-secondary text-planner-muted capitalize">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Team Activity */}
              <Card className="p-5">
                <h3 className="text-base font-bold text-planner-text mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-500" /> Recent Team Activity
                </h3>
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-planner-muted text-center py-3">No activity logged yet.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {recentActivities.map((act) => (
                      <div key={act._id} className="text-xs space-y-0.5 border-b border-planner-border/50 pb-2">
                        <p className="font-medium text-planner-text">
                          <span className="font-bold">{act.user?.name || 'User'}</span> {act.details || act.action}
                        </p>
                        <p className="text-[10px] text-planner-muted">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Add Workspace Modal */}
      <Modal isOpen={isAddWsModalOpen} onClose={() => setIsAddWsModalOpen(false)} title="Add New Workspace 🏢">
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input label="Workspace Name" placeholder="e.g. Frontend Team, Startup, Hackathon" value={wsName} onChange={(e) => setWsName(e.target.value)} required autoFocus />
          <Textarea label="Description (Optional)" placeholder="What is this workspace for?" value={wsDescription} onChange={(e) => setWsDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Icon / Emoji" value={wsIcon} onChange={(e) => setWsIcon(e.target.value)} />
            <div>
              <label className="text-xs font-bold text-planner-muted block mb-1">Accent Color</label>
              <input type="color" value={wsColor} onChange={(e) => setWsColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-planner-bg border border-planner-border p-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddWsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WorkspaceHome;
