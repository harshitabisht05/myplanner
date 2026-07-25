import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Layers, Zap } from 'lucide-react';
import { getLocalDateStr } from '../../utils/dateUtils';

const TeamCalendar = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['workspace-tasks', currentWorkspaceId],
    queryFn: () => workspaceApi.getTasks(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const { data: projectsData } = useQuery({
    queryKey: ['workspace-projects', currentWorkspaceId],
    queryFn: () => workspaceApi.getProjects(currentWorkspaceId),
    enabled: !!currentWorkspaceId
  });

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate calendar days grid
  const daysGrid = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    daysGrid.push({ day, dateStr });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Calendar"
        subtitle="Dedicated workspace calendar displaying sprint deadlines, project milestones, meetings & releases"
        icon={CalendarIcon}
      />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-planner-text">
            {monthName} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-xl border border-planner-border hover:bg-planner-secondary text-planner-text">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold rounded-xl border border-planner-border hover:bg-planner-secondary text-planner-text">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-xl border border-planner-border hover:bg-planner-secondary text-planner-text">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isTasksLoading ? (
          <LoadingSpinner message="Loading team schedule..." />
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-bold text-planner-muted py-2 border-b border-planner-border">
                {d}
              </div>
            ))}

            {daysGrid.map((item, index) => {
              if (!item) {
                return <div key={`empty-${index}`} className="min-h-[90px] bg-planner-bg/20 rounded-xl" />;
              }

              const isToday = item.dateStr === getLocalDateStr();
              const dayTasks = tasks.filter((t) => t.dueDate === item.dateStr);
              const dayProjects = projects.filter((p) => p.deadline === item.dateStr);

              return (
                <div
                  key={item.dateStr}
                  className={`min-h-[90px] p-2 rounded-xl border transition-all space-y-1 overflow-hidden ${
                    isToday ? 'border-planner-primary bg-planner-primary/5 font-bold' : 'border-planner-border bg-planner-bg/40'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'text-planner-primary font-black' : 'text-planner-text'}`}>{item.day}</span>

                  <div className="space-y-1 overflow-y-auto max-h-16">
                    {dayProjects.map((p) => (
                      <div key={p._id} className="text-[10px] p-1 rounded bg-purple-500/10 text-purple-600 font-bold truncate">
                        🎯 {p.title}
                      </div>
                    ))}
                    {dayTasks.map((t) => (
                      <div key={t._id} className="text-[10px] p-1 rounded bg-blue-500/10 text-blue-600 font-medium truncate">
                        📌 {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeamCalendar;
