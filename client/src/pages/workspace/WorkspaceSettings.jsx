import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Badge from '../../components/common/Badge';
import { Settings as SettingsIcon, Building, Shield, Trash2, Save, Sparkles, Palette, Users, Sliders } from 'lucide-react';

const WORKSPACE_COLOR_PALETTES = [
  { id: 'purple', label: 'Violet Purple', hex: '#8B5CF6', bg: 'bg-purple-500' },
  { id: 'emerald', label: 'Emerald City', hex: '#10B981', bg: 'bg-emerald-500' },
  { id: 'sky', label: 'Sky Blue', hex: '#0284C7', bg: 'bg-sky-500' },
  { id: 'rose', label: 'Rose Pink', hex: '#F43F5E', bg: 'bg-rose-500' },
  { id: 'amber', label: 'Amber Gold', hex: '#F59E0B', bg: 'bg-amber-500' },
  { id: 'indigo', label: 'Indigo Night', hex: '#6366F1', bg: 'bg-indigo-500' }
];

const WorkspaceSettings = () => {
  const { currentWorkspace, currentWorkspaceId, refetchWorkspaces, setMode } = useWorkspace();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('👥');
  const [color, setColor] = useState('#8B5CF6');
  const [isSaving, setIsSaving] = useState(false);

  const isStrange = theme === 'strange';

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name || '');
      setDescription(currentWorkspace.description || '');
      setIcon(currentWorkspace.icon || '👥');
      setColor(currentWorkspace.color || '#8B5CF6');
    }
  }, [currentWorkspace]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await workspaceApi.updateWorkspace(currentWorkspaceId, {
        name,
        description,
        icon,
        color
      });
      showSuccess('Workspace profile & theme updated! 🌸');
      refetchWorkspaces();
    } catch (err) {
      showError('Failed to update workspace settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm(`Are you sure you want to delete "${currentWorkspace?.name}"? This action cannot be undone.`)) return;
    try {
      await workspaceApi.deleteWorkspace(currentWorkspaceId);
      showSuccess('Workspace deleted');
      refetchWorkspaces();
      setMode('personal');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete workspace');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={isStrange ? 'HQ COMMAND SETTINGS' : 'Workspace Settings'}
        subtitle="Customize team workspace profile, theme accent colors, icon badges, and workspace permissions"
        icon={SettingsIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Card & Stats */}
        <div className="space-y-6 md:col-span-1">
          <Card className="p-6 text-center space-y-4 shadow-cozy border-planner-border">
            <div
              className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md border-2 border-white/20 transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-planner-text">{currentWorkspace?.name || 'Workspace'}</h3>
              <p className="text-xs text-planner-muted line-clamp-2 mt-1">{currentWorkspace?.description || 'Team Workspace'}</p>
            </div>
            <div className="pt-2 border-t border-planner-border flex items-center justify-around text-xs text-planner-muted">
              <div>
                <span className="font-bold text-planner-text block text-sm">{currentWorkspace?.members?.length || 1}</span>
                <span>Members</span>
              </div>
              <div className="h-6 w-px bg-planner-border" />
              <div>
                <span className="font-bold text-planner-text block text-sm">Active</span>
                <span>Status</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h4 className="text-xs font-bold text-planner-muted uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-500" /> Role Permissions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-planner-bg/60">
                <span className="font-semibold text-planner-text">Owner</span>
                <Badge variant="high">Full Control</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-planner-bg/60">
                <span className="font-semibold text-planner-text">Admin</span>
                <Badge variant="medium">Manage & Invite</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-planner-bg/60">
                <span className="font-semibold text-planner-text">Developer</span>
                <Badge variant="primary">Create & Edit</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="space-y-6 md:col-span-2">
          {/* Workspace Profile Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-planner-border pb-3">
              <Building className="w-5 h-5 text-planner-primary" />
              <h3 className="text-sm font-extrabold text-planner-text">Workspace Profile</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Workspace Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the workspace purpose..." />

              {/* Icon & Color */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-planner-muted block">Theme Accent Palette</label>
                <div className="flex gap-2 flex-wrap">
                  {WORKSPACE_COLOR_PALETTES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={`w-8 h-8 rounded-full ${c.bg} transition-all flex items-center justify-center text-white font-bold text-xs ${
                        color === c.hex ? 'ring-4 ring-planner-primary/40 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {color === c.hex ? '✓' : ''}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Input label="Icon / Emoji" value={icon} onChange={(e) => setIcon(e.target.value)} />
                  <div>
                    <label className="text-xs font-bold text-planner-muted block mb-1">Custom Color Hex</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-xl cursor-pointer bg-planner-bg border border-planner-border p-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-planner-border flex justify-end">
                <Button type="submit" variant="primary" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1.5" /> {isSaving ? 'Saving...' : 'Save Workspace Settings'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Granular Permissions Matrix Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-planner-border pb-3">
              <Shield className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-extrabold text-planner-text">Granular Role Permissions Matrix</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-planner-border text-planner-muted uppercase font-mono text-[10px]">
                    <th className="py-2 px-3">Capability / Feature</th>
                    <th className="py-2 px-2 text-center">Owner</th>
                    <th className="py-2 px-2 text-center">Admin</th>
                    <th className="py-2 px-2 text-center">Manager</th>
                    <th className="py-2 px-2 text-center">Developer</th>
                    <th className="py-2 px-2 text-center">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-planner-border/50 font-medium">
                  <tr>
                    <td className="py-2.5 px-3 text-planner-text">Create Projects & Tasks</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-planner-text">Invite Team Members</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-planner-text">Upload & Delete Vault Files</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-planner-text">Manage Channels & DMs</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-planner-text">Delete Workspace</td>
                    <td className="text-center py-2 text-emerald-500">✓</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                    <td className="text-center py-2 text-planner-muted">✗</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Danger Zone Card */}
          <Card className="p-6 border-rose-500/30 bg-rose-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-xs text-planner-muted mt-1 leading-relaxed">
                  Permanently delete this workspace, all projects, Kanban tasks, document vault files, and audit logs.
                </p>
              </div>
              <Button variant="ghost" className="text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 shrink-0" onClick={handleDeleteWorkspace}>
                Delete Workspace
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
