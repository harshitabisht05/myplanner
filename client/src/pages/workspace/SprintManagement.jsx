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
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Zap, Plus, Play, CheckCircle2, Calendar } from 'lucide-react';

const SprintManagement = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-sprints', currentWorkspaceId],
    queryFn: () => workspaceApi.getSprints(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const sprints = data?.sprints || [];

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await workspaceApi.createSprint(currentWorkspaceId, {
        name,
        goal,
        startDate,
        endDate
      });
      showSuccess('Sprint created!');
      queryClient.invalidateQueries({ queryKey: ['workspace-sprints', currentWorkspaceId] });
      setIsModalOpen(false);
      setName('');
      setGoal('');
    } catch (err) {
      showError(err.message || 'Failed to create sprint');
    }
  };

  const handleStatusChange = async (sprintId, status) => {
    try {
      await workspaceApi.updateSprint(currentWorkspaceId, sprintId, { status });
      showSuccess(`Sprint ${status}!`);
      queryClient.invalidateQueries({ queryKey: ['workspace-sprints', currentWorkspaceId] });
    } catch (err) {
      showError('Failed to update sprint status');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprint Management"
        subtitle="Plan sprint cycles, set sprint goals, track burndown progress, and manage active runs"
        icon={Zap}
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Plan New Sprint
          </Button>
        }
      />

      {isLoading ? (
        <LoadingSpinner message="Loading sprints..." />
      ) : sprints.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-planner-muted text-sm">No sprints planned for this workspace yet.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setIsModalOpen(true)}>
            Plan First Sprint
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => (
            <Card key={sprint._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-planner-text truncate">{sprint.name}</h3>
                  <Badge variant={sprint.status === 'active' ? 'success' : sprint.status === 'completed' ? 'primary' : 'secondary'}>
                    {sprint.status}
                  </Badge>
                </div>
                {sprint.goal && <p className="text-xs text-planner-muted">{sprint.goal}</p>}
                {(sprint.startDate || sprint.endDate) && (
                  <div className="flex items-center gap-1.5 text-xs text-planner-muted pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{sprint.startDate || 'TBD'} to {sprint.endDate || 'TBD'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sprint.status === 'planned' && (
                  <Button variant="primary" size="sm" onClick={() => handleStatusChange(sprint._id, 'active')}>
                    <Play className="w-3.5 h-3.5 mr-1" /> Start Sprint
                  </Button>
                )}
                {sprint.status === 'active' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange(sprint._id, 'completed')}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete Sprint
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Sprint Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Plan New Sprint ⚡">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <Input label="Sprint Name" placeholder="e.g. Sprint 1 - Core MVP" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          <Textarea label="Sprint Goal" placeholder="What is the key objective of this sprint?" value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SprintManagement;
