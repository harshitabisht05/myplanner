import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { focusApi } from '../api/focusApi';
import { useFocusTimer } from '../context/FocusContext';
import { useTheme } from '../context/ThemeContext';
import { getLocalDateStr } from '../utils/dateUtils';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { BarChart3, Clock, Flame, Calendar, Tag, CheckCircle2, Trash2, Filter, Search, Award, TrendingUp } from 'lucide-react';

const CATEGORY_COLORS = {
  Personal: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/40', lightBg: 'bg-indigo-500/10' },
  Work: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40', lightBg: 'bg-emerald-500/10' },
  Study: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/40', lightBg: 'bg-purple-500/10' },
  Break: { bg: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/40', lightBg: 'bg-teal-500/10' },
  'Health & Fitness': { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40', lightBg: 'bg-rose-500/10' },
  Creative: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40', lightBg: 'bg-amber-500/10' },
  Other: { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500/40', lightBg: 'bg-slate-500/10' }
};

const Analytics = () => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const { history, categories, deleteHistoryItem, clearHistory } = useFocusTimer();
  const [timeRange, setTimeRange] = useState('7days'); // 'today', '7days', '30days', 'all'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch analytics from backend
  const { data: apiAnalyticsData } = useQuery({
    queryKey: ['focusAnalytics'],
    queryFn: () => focusApi.getAnalytics(),
    staleTime: 30000
  });

  const formatHoursMins = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  // Filter history based on time range, category, and search query
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return history.filter((item) => {
      const itemDate = new Date(item.completedAt);
      
      // Time range filter
      if (timeRange === 'today') {
        const todayStr = getLocalDateStr(now);
        const itemDateStr = getLocalDateStr(itemDate);
        if (itemDateStr !== todayStr) return false;
      } else if (timeRange === '7days') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        if (itemDate < sevenDaysAgo) return false;
      } else if (timeRange === '30days') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (itemDate < thirtyDaysAgo) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesTask = item.taskTitle?.toLowerCase().includes(q);
        const matchesLabel = item.label?.toLowerCase().includes(q);
        if (!matchesCategory && !matchesTask && !matchesLabel) return false;
      }

      return true;
    });
  }, [history, timeRange, selectedCategoryFilter, searchQuery]);

  // Aggregate stats from filtered sessions
  const stats = useMemo(() => {
    let totalMins = 0;
    const catMap = {};
    const taskMap = {};
    const dailyMap = {};

    filteredSessions.forEach((s) => {
      const mins = s.durationMins || Math.round((s.elapsedSeconds || 0) / 60) || 0;
      totalMins += mins;

      // Category map
      const cat = s.category || 'Personal';
      catMap[cat] = (catMap[cat] || 0) + mins;

      // Task map
      const taskName = s.taskTitle || (s.taskId ? 'Associated Task' : null);
      if (taskName) {
        taskMap[taskName] = (taskMap[taskName] || 0) + mins;
      }

      // Daily map
      const dateStr = getLocalDateStr(s.completedAt);
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + mins;
    });

    // Sort category breakdown
    const categoryList = Object.entries(catMap)
      .map(([name, mins]) => {
        const catInfo = categories.find((c) => c.name === name) || {};
        return {
          name,
          mins,
          icon: catInfo.icon || '📌',
          color: catInfo.color || 'indigo',
          percentage: totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0
        };
      })
      .sort((a, b) => b.mins - a.mins);

    // Sort task breakdown
    const taskList = Object.entries(taskMap)
      .map(([title, mins]) => ({ title, mins }))
      .sort((a, b) => b.mins - a.mins);

    // Get last 7 days chart data
    const last7DaysChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      last7DaysChart.push({
        dateStr,
        dayLabel,
        mins: dailyMap[dateStr] || 0
      });
    }

    const maxChartMins = Math.max(...last7DaysChart.map((d) => d.mins), 60);

    return {
      totalMins,
      sessionCount: filteredSessions.length,
      avgMins: filteredSessions.length > 0 ? Math.round(totalMins / filteredSessions.length) : 0,
      topCategory: categoryList[0] || null,
      categoryList,
      taskList,
      last7DaysChart,
      maxChartMins
    };
  }, [filteredSessions, categories]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title={isStrange ? 'PARALLEL TIME DOSSIER & ANALYTICS' : isGta ? 'MISSION PERFORMANCE & ANALYTICS' : 'Time & Focus Analytics 📊'}
        subtitle={
          isStrange
            ? 'Deep temporal statistics and category allocation across dimensions'
            : isGta
            ? 'Track mission statistics, time distribution per sector, and objective productivity'
            : 'Detailed insights on how much time you invest in tasks, projects, and categories'
        }
        icon={BarChart3}
      />

      {/* Time Range Selector & Controls */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isStrange
          ? 'bg-slate-950 border-rose-900/50'
          : isGta
          ? 'bg-slate-950 border-emerald-900/40'
          : 'bg-planner-card border-planner-border'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-planner-muted mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-planner-primary" /> Time Range:
          </span>
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'today'
                ? isStrange
                  ? 'bg-rose-600 text-white font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-planner-primary text-white'
                : 'bg-planner-bg/60 text-planner-muted hover:text-planner-text'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '7days'
                ? isStrange
                  ? 'bg-rose-600 text-white font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-planner-primary text-white'
                : 'bg-planner-bg/60 text-planner-muted hover:text-planner-text'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === '30days'
                ? isStrange
                  ? 'bg-rose-600 text-white font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-planner-primary text-white'
                : 'bg-planner-bg/60 text-planner-muted hover:text-planner-text'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              timeRange === 'all'
                ? isStrange
                  ? 'bg-rose-600 text-white font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-planner-primary text-white'
                : 'bg-planner-bg/60 text-planner-muted hover:text-planner-text'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-auto min-w-[160px]">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl text-xs font-bold border border-planner-border bg-planner-bg text-planner-text focus:outline-none focus:ring-2 focus:ring-planner-primary"
          >
            <option value="all">All Categories 🏷️</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.icon || '📌'} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <Card className={`p-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-planner-muted">Total Time Logged</p>
              <h3 className={`text-2xl font-extrabold mt-1 font-mono ${isStrange ? 'text-rose-400' : isGta ? 'text-emerald-400' : 'text-planner-text'}`}>
                {formatHoursMins(stats.totalMins)}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${isStrange ? 'bg-rose-950 text-rose-400' : isGta ? 'bg-emerald-950 text-emerald-400' : 'bg-indigo-500/10 text-indigo-500'}`}>
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Sessions Completed */}
        <Card className={`p-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-planner-muted">Total Sessions</p>
              <h3 className="text-2xl font-extrabold text-planner-text mt-1 font-mono">
                {stats.sessionCount}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${isStrange ? 'bg-amber-950 text-amber-400' : isGta ? 'bg-purple-950 text-purple-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Avg Session Duration */}
        <Card className={`p-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-planner-muted">Avg Session Time</p>
              <h3 className="text-2xl font-extrabold text-planner-text mt-1 font-mono">
                {stats.avgMins} mins
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${isStrange ? 'bg-purple-950 text-purple-400' : isGta ? 'bg-sky-950 text-sky-400' : 'bg-purple-500/10 text-purple-500'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Top Category */}
        <Card className={`p-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-planner-muted">Top Category</p>
              <h3 className="text-lg font-extrabold text-planner-text mt-1 truncate">
                {stats.topCategory ? `${stats.topCategory.icon} ${stats.topCategory.name}` : 'N/A'}
              </h3>
              {stats.topCategory && (
                <p className="text-xs text-planner-muted">{formatHoursMins(stats.topCategory.mins)} ({stats.topCategory.percentage}%)</p>
              )}
            </div>
            <div className={`p-3 rounded-2xl ${isStrange ? 'bg-sky-950 text-sky-400' : isGta ? 'bg-amber-950 text-amber-400' : 'bg-amber-500/10 text-amber-500'}`}>
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid: Category Breakdown + Daily Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Time Distribution */}
        <Card className={`p-5 space-y-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
              <Tag className="w-5 h-5 text-planner-primary" /> Time Spent by Category
            </h3>
            <span className="text-xs text-planner-muted font-mono">{stats.categoryList.length} Categories</span>
          </div>

          {stats.categoryList.length === 0 ? (
            <div className="text-center py-8 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
              <p className="text-sm font-medium">No session data logged for this period ⏱️</p>
              <p className="text-xs mt-1">Start a timer or log progress to see your breakdown!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.categoryList.map((cat) => {
                const colorStyle = CATEGORY_COLORS[cat.name] || { bg: 'bg-planner-primary', text: 'text-planner-primary' };
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-planner-text">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-planner-muted">{formatHoursMins(cat.mins)}</span>
                        <span className="font-mono font-extrabold text-planner-primary min-w-[36px] text-right">{cat.percentage}%</span>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="h-3.5 w-full bg-planner-bg/80 rounded-full overflow-hidden border border-planner-border p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorStyle.bg}`}
                        style={{ width: `${Math.max(4, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Daily Focus Activity Bar Chart */}
        <Card className={`p-5 space-y-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-planner-primary" /> Daily Focus Activity (Last 7 Days)
            </h3>
            <span className="text-xs text-planner-muted font-mono">Daily Total</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {stats.last7DaysChart.map((day) => {
              const heightPct = stats.maxChartMins > 0 ? (day.mins / stats.maxChartMins) * 100 : 0;
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip / Label */}
                  <span className="text-[10px] font-mono font-bold text-planner-muted opacity-80 group-hover:opacity-100 transition-opacity">
                    {day.mins > 0 ? `${day.mins}m` : '-'}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[36px] bg-planner-bg/60 rounded-xl h-full flex items-end overflow-hidden border border-planner-border/50">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isStrange
                          ? 'bg-gradient-to-t from-rose-700 to-rose-400'
                          : isGta
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : 'bg-gradient-to-t from-planner-primary to-planner-accent'
                      } ${day.mins > 0 ? 'opacity-100' : 'opacity-20'}`}
                      style={{ height: `${Math.max(day.mins > 0 ? 8 : 4, heightPct)}%` }}
                    />
                  </div>

                  {/* Day Name */}
                  <span className="text-xs font-bold text-planner-text font-mono mt-1">{day.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Task Time Distribution (if tasks logged) */}
      {stats.taskList.length > 0 && (
        <Card className={`p-5 space-y-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
          <div className="flex items-center justify-between pb-3 border-b border-planner-border">
            <h3 className="text-base font-bold text-planner-text flex items-center gap-2">
              <Award className="w-5 h-5 text-planner-primary" /> Top Tasks Invested In
            </h3>
            <span className="text-xs text-planner-muted font-mono">{stats.taskList.length} Tasks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.taskList.slice(0, 8).map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between p-3 rounded-2xl bg-planner-bg/60 border border-planner-border text-xs sm:text-sm font-semibold text-planner-text"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-planner-primary shrink-0" />
                  <span className="truncate">{task.title}</span>
                </div>
                <span className="font-mono text-planner-primary font-bold ml-2 shrink-0">{formatHoursMins(task.mins)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filterable Session History Table / List */}
      <Card className={`p-5 space-y-4 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-planner-border">
          <div>
            <h3 className="text-base font-bold text-planner-text">Detailed Session Logs</h3>
            <p className="text-xs text-planner-muted">Complete record of saved focus and break sessions</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-planner-muted" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-planner-border bg-planner-bg text-planner-text text-xs focus:outline-none focus:ring-2 focus:ring-planner-primary"
              />
            </div>

            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-rose-500 hover:text-rose-600 shrink-0">
                <Trash2 className="w-4 h-4 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
            <p className="text-sm font-medium">No matching session logs found 🔍</p>
            <p className="text-xs text-planner-muted mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredSessions.map((item) => {
              const sessionDate = new Date(item.completedAt);
              const catInfo = categories.find((c) => c.name === item.category);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-planner-bg/60 border border-planner-border text-xs sm:text-sm hover:border-planner-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-planner-text truncate">
                          {item.taskTitle ? item.taskTitle : item.label || 'Focus Session'}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-planner-secondary text-planner-text border border-planner-border">
                          <span>{catInfo?.icon || '📌'}</span>
                          <span>{item.category || 'Personal'}</span>
                        </span>
                        {item.isMidSessionSave && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                            Mid-Session Saved 💾
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-planner-muted mt-0.5">
                        {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Duration: {item.durationMins} mins
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1.5 text-planner-muted hover:text-rose-500 rounded-lg transition-colors ml-2 shrink-0"
                    title="Delete log entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
