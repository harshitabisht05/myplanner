import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Users, UserPlus, Shield, Trash2, Mail } from 'lucide-react';

const Members = () => {
  const { currentWorkspace, currentWorkspaceId, refetchWorkspaces } = useWorkspace();
  const { showSuccess, showError } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await workspaceApi.addMember(currentWorkspaceId, { email, role });
      showSuccess(`Added ${email} to workspace!`);
      refetchWorkspaces();
      setIsInviteModalOpen(false);
      setEmail('');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to add member');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await workspaceApi.updateMemberRole(currentWorkspaceId, userId, { role: newRole });
      showSuccess('Member role updated!');
      refetchWorkspaces();
    } catch (err) {
      showError('Failed to update role');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove member from workspace?')) return;
    try {
      await workspaceApi.removeMember(currentWorkspaceId, userId);
      showSuccess('Member removed');
      refetchWorkspaces();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  const members = currentWorkspace?.members || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Members"
        subtitle="Manage workspace roster, role permissions (Owner, Admin, Manager, Developer, Viewer), and invitations"
        icon={Users}
        action={
          <Button variant="primary" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-1.5" /> Invite Member
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const userObj = m.user || {};
          const isOwner = currentWorkspace?.owner?._id === userObj._id || currentWorkspace?.owner === userObj._id;
          return (
            <Card key={userObj._id || m.user} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden border border-planner-border">
                  {userObj.avatar ? (
                    <img src={userObj.avatar} alt={userObj.name} className="w-full h-full object-cover" />
                  ) : userObj.name ? (
                    userObj.name.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-planner-text truncate">{userObj.name || 'User'}</p>
                  <p className="text-xs text-planner-muted truncate">{userObj.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isOwner ? (
                  <Badge variant="primary">Owner</Badge>
                ) : (
                  <select
                    value={m.role}
                    onChange={(e) => handleUpdateRole(userObj._id, e.target.value)}
                    className="text-xs font-bold py-1 px-2 rounded-lg bg-planner-secondary text-planner-text border border-planner-border cursor-pointer capitalize"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Developer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                )}

                {!isOwner && (
                  <button
                    onClick={() => handleRemoveMember(userObj._id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 text-planner-muted hover:text-rose-500 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member ✉️">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="User Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <Select
            label="Workspace Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'admin', label: 'Admin (Full Settings & Management)' },
              { value: 'manager', label: 'Manager (Manage Projects & Sprints)' },
              { value: 'developer', label: 'Developer (Create & Edit Tasks)' },
              { value: 'viewer', label: 'Viewer (Read-Only Access)' }
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
