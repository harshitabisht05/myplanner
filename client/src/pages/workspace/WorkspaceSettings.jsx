import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import { Settings, Shield, Trash2, Save } from 'lucide-react';

const WorkspaceSettings = () => {
  const { currentWorkspace, currentWorkspaceId, refetchWorkspaces, setMode } = useWorkspace();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('👥');
  const [color, setColor] = useState('#8B5CF6');

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
    try {
      await workspaceApi.updateWorkspace(currentWorkspaceId, {
        name,
        description,
        icon,
        color
      });
      showSuccess('Workspace settings saved!');
      refetchWorkspaces();
    } catch (err) {
      showError('Failed to update workspace settings');
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
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Workspace Settings"
        subtitle="Manage workspace profile, color themes, icon badges, role permissions, and workspace deletion"
        icon={Settings}
      />

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="Workspace Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Icon / Emoji" value={icon} onChange={(e) => setIcon(e.target.value)} />
            <div>
              <label className="text-xs font-bold text-planner-muted block mb-1">Theme Accent Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer bg-planner-bg border border-planner-border p-1" />
            </div>
          </div>
          <Button type="submit" variant="primary">
            <Save className="w-4 h-4 mr-1.5" /> Save Workspace Settings
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-rose-500/30 bg-rose-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-xs text-planner-muted mt-1">Permanently delete this workspace, all its projects, tasks, sprints, and files.</p>
          </div>
          <Button variant="ghost" className="text-rose-500 border border-rose-500/30 hover:bg-rose-500/10" onClick={handleDeleteWorkspace}>
            Delete Workspace
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WorkspaceSettings;
