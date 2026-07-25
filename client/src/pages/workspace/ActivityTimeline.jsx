import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Activity as ActivityIcon, User, Clock, Download, Printer } from 'lucide-react';

const ActivityTimeline = () => {
  const { currentWorkspaceId, currentWorkspace } = useWorkspace();

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-activity', currentWorkspaceId],
    queryFn: () => workspaceApi.getActivities(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const activities = data?.activities || [];

  const handleExportCSV = () => {
    if (activities.length === 0) return;

    const headers = ['User,Action,Details,Timestamp\n'];
    const rows = activities.map((act) => {
      const u = `"${act.user?.name || 'User'}"`;
      const a = `"${act.action || ''}"`;
      const d = `"${(act.details || '').replace(/"/g, '""')}"`;
      const t = `"${new Date(act.createdAt).toLocaleString()}"`;
      return `${u},${a},${d},${t}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentWorkspace?.name || 'Workspace'}_Activity_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Audit & Activity Log"
        subtitle="Complete chronological timeline of all workspace events, task changes, comments, and member actions"
        icon={ActivityIcon}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={activities.length === 0}>
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrintPDF} disabled={activities.length === 0}>
              <Printer className="w-4 h-4 mr-1.5" /> Print / Export PDF
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton variant="task" count={5} />
      ) : activities.length === 0 ? (
        <EmptyState
          type="workspace"
          title="No Audit Activity Recorded"
          message="Workspace actions, file uploads, and project updates will appear in this timeline."
        />
      ) : (
        <Card className="p-6 print:shadow-none print:border-none">
          <div className="relative border-l-2 border-planner-border ml-3 space-y-6">
            {activities.map((act) => (
              <div key={act._id} className="relative pl-6">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-planner-primary border-4 border-planner-card" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-planner-text">{act.user?.name || 'User'}</span>
                    <span className="text-xs text-planner-muted font-mono">{act.action?.replace('_', ' ')}</span>
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
