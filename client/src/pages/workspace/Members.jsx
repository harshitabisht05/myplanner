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
import { Users, UserPlus, Shield, Trash2, Mail, Calendar, CheckCircle2, User } from 'lucide-react';

const Members = () => {
  const { currentWorkspace, currentWorkspaceId, refetchWorkspaces } = useWorkspace();
  const { showSuccess, showError } = useToast();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedProfileMember, setSelectedProfileMember] = useState(null);
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
      if (selectedProfileMember?.user?._id === userId) {
        setSelectedProfileMember(null);
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  const members = currentWorkspace?.members || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Members"
        subtitle="Manage workspace roster, member profiles, role permissions, and invitations"
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
            <Card
              key={userObj._id || m.user}
              hover
              onClick={() => setSelectedProfileMember(m)}
              className="p-4 flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden border border-planner-border/50 group-hover:scale-105 transition-transform">
                  {userObj.avatar ? (
                    <img src={userObj.avatar} alt={userObj.name} className="w-full h-full object-cover" />
                  ) : userObj.name ? (
                    userObj.name.charAt(0).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-planner-text truncate group-hover:text-planner-primary transition-colors">
                    {userObj.name || 'User'}
                  </p>
                  <p className="text-xs text-planner-muted truncate">{userObj.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
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

      {/* Member Profile Modal */}
      {selectedProfileMember && (
        <Modal
          isOpen={Boolean(selectedProfileMember)}
          onClose={() => setSelectedProfileMember(null)}
          title="Member Profile Details 👤"
        >
          {(() => {
            const memberUser = selectedProfileMember.user || {};
            const isOwner =
              currentWorkspace?.owner?._id === memberUser._id || currentWorkspace?.owner === memberUser._id;

            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-planner-bg/60 border border-planner-border/50">
                  <div className="w-16 h-16 rounded-full bg-planner-primary/20 text-planner-primary flex items-center justify-center font-extrabold text-2xl shrink-0 overflow-hidden border border-planner-primary/30">
                    {memberUser.avatar ? (
                      <img src={memberUser.avatar} alt={memberUser.name} className="w-full h-full object-cover" />
                    ) : memberUser.name ? (
                      memberUser.name.charAt(0).toUpperCase()
                    ) : (
                      'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold text-planner-text truncate">{memberUser.name || 'Team Member'}</h3>
                    <p className="text-xs text-planner-muted flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-planner-primary" /> {memberUser.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={isOwner ? 'primary' : 'info'}>
                        {isOwner ? 'Workspace Owner' : `Role: ${selectedProfileMember.role || 'Member'}`}
                      </Badge>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Teammate
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-planner-muted tracking-wider">Member Actions & Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-planner-card border border-planner-border/50 space-y-1">
                      <span className="font-bold text-planner-muted block">Workspace ID</span>
                      <span className="font-mono text-planner-text text-[11px] truncate block">{currentWorkspaceId}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-planner-card border border-planner-border/50 space-y-1">
                      <span className="font-bold text-planner-muted block">Direct Contact</span>
                      <a
                        href={`mailto:${memberUser.email}`}
                        className="text-planner-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" /> Send Email
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setSelectedProfileMember(null)}>
                    Close Profile
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

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
