import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Activity as ActivityIcon, User, Clock } from 'lucide-react';

const ActivityTimeline = () => {
  const { currentWorkspaceId } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-activity', currentWorkspaceId],
    queryFn: () => workspaceApi.getActivities(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const activities = data?.activities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Audit & Activity Log"
        subtitle="Complete chronological timeline of all workspace events, task changes, comments, and member actions"
        icon={ActivityIcon}
      />

      {isLoading ? (
        <LoadingSpinner message="Loading activity log..." />
      ) : activities.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-planner-muted text-sm">No activity recorded in this workspace yet.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="relative border-l-2 border-planner-border ml-3 space-y-6">
            {activities.map((act) => (
              <div key={act._id} className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-planner-primary border-4 border-planner-card" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-planner-text">{act.user?.name || 'User'}</span>
                    <span className="text-xs text-planner-muted">{act.action?.replace('_', ' ')}</span>
                  </div>
                  {act.details && <p className="text-xs text-planner-text font-medium">{act.details}</p>}
                  <p className="text-[10px] text-planner-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(act.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ActivityTimeline;
