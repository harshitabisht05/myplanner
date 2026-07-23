import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useFocusTimer, TIMER_MODES } from '../context/FocusContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import CategoryModal from '../components/modals/CategoryModal';
import Analytics from './Analytics';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Crosshair, Eye, History, Trash2, Save, Plus, Tag, BarChart2, BookmarkCheck } from 'lucide-react';
import strangeOtherSideImg from '../assets/strange_otherside_bg.jpg';

const Focus = () => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const [activeTab, setActiveTab] = useState('timer'); // 'timer' or 'analytics'
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const {
    mode,
    customMinutes,
    timeLeft,
    elapsedSeconds,
    isRunning,
    selectedTaskId,
    selectedCategory,
    categories,
    history,
    isCategoryModalOpen,
    setIsRunning,
    setSelectedTaskId,
    setSelectedCategory,
    setIsCategoryModalOpen,
    handleModeSwitch,
    handleCustomMinutesChange,
    handleReset,
    clearHistory,
    deleteHistoryItem,
    saveCurrentSession,
    addCategory,
    deleteCategory
  } = useFocusTimer();

  // Fetch available tasks to select from
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'uncompleted'],
    queryFn: () => taskApi.getTasks({ completed: 'false' })
  });

  const tasks = tasksData?.tasks || [];
  const selectedTask = tasks.find((t) => t._id === selectedTaskId);

  // Automatically update category when task selected if task has category
  useEffect(() => {
    if (selectedTask && selectedTask.category) {
      const match = categories.find((c) => c.name.toLowerCase() === selectedTask.category.toLowerCase());
      if (match) {
        setSelectedCategory(match.name);
      } else {
        setSelectedCategory(selectedTask.category);
      }
    }
  }, [selectedTaskId, selectedTask, categories, setSelectedCategory]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

  const handleMidSessionSave = async () => {
    if (elapsedSeconds <= 0) return;
    const taskTitle = selectedTask ? selectedTask.title : '';
    const saved = await saveCurrentSession({
      taskTitleOverride: taskTitle,
      isMidSessionSave: true,
      resetTimer: true
    });

    if (saved) {
      setSaveSuccessMsg(`Saved ${saved.durationMins} min focus session under ${saved.category}! 🎉`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Header */}
      <PageHeader
        title={isStrange ? 'ENTERING THE OTHER SIDE' : isGta ? 'MISSION IN PROGRESS' : 'Focus & Time Tracker'}
        subtitle={
          isStrange
            ? 'Deep parallel dimension environment for uninterrupted deep work'
            : isGta
            ? 'Execute deep-work objectives and log time distribution per sector'
            : 'Distraction-free focus timer, mid-session saving & detailed category analytics'
        }
        icon={isStrange ? Eye : isGta ? Crosshair : Timer}
      />

      {/* Main View Tabs (Timer vs Analytics) */}
      <div className="flex items-center justify-between border-b border-planner-border pb-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'timer'
                ? isStrange
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-mono'
                  : 'bg-planner-primary text-white shadow-xs'
                : 'bg-planner-card text-planner-muted hover:text-planner-text border border-planner-border'
            }`}
          >
            <Timer className="w-4 h-4" /> ⏱️ Focus Timer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? isStrange
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] font-serif'
                  : isGta
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-mono'
                  : 'bg-planner-primary text-white shadow-xs'
                : 'bg-planner-card text-planner-muted hover:text-planner-text border border-planner-border'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> 📊 Analytics & Time Log
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCategoryModalOpen(true)}
          className="text-xs shrink-0"
        >
          <Tag className="w-3.5 h-3.5 mr-1 text-planner-primary" /> + Manage Categories
        </Button>
      </div>

      {activeTab === 'analytics' ? (
        <Analytics />
      ) : (
        <>
          {/* Mode Selector Tabs */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-2xl border shadow-cozy ${isStrange ? 'bg-slate-950 border-rose-900/50' : isGta ? 'bg-slate-950 border-emerald-900/40' : 'bg-planner-card border-planner-border'}`}>
            <button
              onClick={() => handleModeSwitch('focus')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'focus'
                  ? isStrange
                    ? 'bg-rose-600 text-white font-serif shadow-[0_0_20px_rgba(225,29,72,0.5)]'
                    : isGta
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-planner-primary text-white shadow-xs'
                  : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              {isStrange ? '25m OTHER SIDE 🌲' : isGta ? '25m MISSION 🎯' : '25m Focus 🎯'}
            </button>
            <button
              onClick={() => handleModeSwitch('shortBreak')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'shortBreak'
                  ? isStrange
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : isGta
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-emerald-500 text-white shadow-xs'
                  : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              {isStrange ? '5m SAFE ZONE ☕' : isGta ? '5m RECHARGE ☕' : '5m Short Break ☕'}
            </button>
            <button
              onClick={() => handleModeSwitch('longBreak')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'longBreak'
                  ? isStrange
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                    : isGta
                    ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                    : 'bg-sky-500 text-white shadow-xs'
                  : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              {isStrange ? '15m RETURN 🌿' : isGta ? '15m HQ REST 🌿' : '15m Long Break 🌿'}
            </button>
            <button
              onClick={() => handleModeSwitch('custom')}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                mode === 'custom'
                  ? isStrange
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : isGta
                    ? 'bg-purple-500 text-slate-950 font-black shadow-xs'
                    : 'bg-purple-600 text-white shadow-xs'
                  : 'text-planner-muted hover:text-planner-text'
              }`}
            >
              ⚙️ Custom
            </button>
          </div>

          {/* Custom Minutes Input when Custom Mode active */}
          {mode === 'custom' && (
            <div className="flex items-center justify-center gap-3 p-4 bg-planner-card rounded-2xl border border-planner-border shadow-xs max-w-sm mx-auto">
              <span className="text-xs font-bold text-planner-text">Custom Time (mins):</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutes}
                onChange={(e) => handleCustomMinutesChange(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-xl border border-planner-border bg-planner-bg text-planner-text font-bold text-center text-sm focus:outline-none focus:ring-2 focus:ring-planner-primary"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleModeSwitch('custom', customMinutes)}
              >
                Set Time
              </Button>
            </div>
          )}

          {/* Save Success Banner */}
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <BookmarkCheck className="w-5 h-5 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Main Timer Dial Card */}
          <Card
            className={`p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8 relative overflow-hidden ${
              isStrange
                ? 'strange-hud-card bg-slate-950 border-rose-600/40'
                : isGta
                ? 'gta-hud-card bg-gradient-to-b from-slate-950 via-slate-950/90 to-purple-950/30 border-emerald-500/30'
                : 'bg-gradient-to-b from-planner-card via-planner-card to-planner-secondary/30'
            }`}
          >
            {/* Background artwork overlay for Strange World */}
            {isStrange && (
              <div className="absolute inset-0 z-0">
                <img
                  src={strangeOtherSideImg}
                  alt="The Other Side"
                  className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
              </div>
            )}

            {/* Task & Category Pickers Grid */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 text-left">
              {/* Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-planner-muted">Select Category:</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[11px] font-bold text-planner-primary hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> New Category
                  </button>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-planner-border bg-planner-bg text-planner-text font-bold text-xs focus:outline-none focus:ring-2 focus:ring-planner-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon || '📌'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Selector */}
              <div>
                <label className="block text-xs font-bold text-planner-muted mb-1">Focusing On Task (Optional):</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-planner-border bg-planner-bg text-planner-text font-bold text-xs focus:outline-none focus:ring-2 focus:ring-planner-primary"
                >
                  <option value="">-- Select Task --</option>
                  {tasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} {t.category ? `[${t.category}]` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Task & Category Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-planner-secondary text-planner-primary border border-planner-border">
                <Tag className="w-3.5 h-3.5" />
                <span>Category: {selectedCategory}</span>
              </span>

              {selectedTask && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold border ${
                    isStrange
                      ? 'bg-rose-600/20 text-rose-400 border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                      : isGta
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-planner-secondary text-planner-text border-planner-border'
                  }`}
                >
                  {isStrange ? <Eye className="w-3.5 h-3.5" /> : isGta ? <Crosshair className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Task: {selectedTask.title}</span>
                </div>
              )}
            </div>

            {/* Circular Display Dial */}
            <div
              className={`relative z-10 w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center rounded-full border-8 shadow-cozy-lg transition-all ${
                isStrange
                  ? 'bg-slate-950 border-rose-600/60 shadow-[0_0_35px_rgba(225,29,72,0.3)]'
                  : isGta
                  ? 'bg-slate-950 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                  : 'bg-planner-bg/60 border-planner-secondary'
              }`}
            >
              <div className="text-center space-y-1">
                <span
                  className={`text-4xl sm:text-6xl font-black tracking-tight font-mono ${
                    isStrange ? 'text-rose-400' : isGta ? 'text-emerald-400' : 'text-planner-text'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>

                <p className="text-xs font-black uppercase tracking-widest text-planner-muted font-serif">
                  {TIMER_MODES[mode]?.label}
                </p>

                {/* Live Spent Time Counter */}
                {elapsedSeconds > 0 && (
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      ⏱️ {elapsedMins}m {elapsedSeconds % 60}s logged
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Action Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 relative z-10">
              <Button
                variant={isRunning ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => setIsRunning((prev) => !prev)}
                className="px-6 sm:px-8 shadow-cozy"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" /> PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2 fill-current" /> {isStrange ? 'CONNECT TO OTHER SIDE' : isGta ? 'START MISSION' : 'Start Focus'}
                  </>
                )}
              </Button>

              {/* MID-SESSION SAVE BUTTON */}
              <Button
                variant="accent"
                size="lg"
                onClick={handleMidSessionSave}
                disabled={elapsedSeconds <= 0}
                className={`px-5 sm:px-6 shadow-cozy transition-all ${
                  elapsedSeconds > 0
                    ? isStrange
                      ? 'bg-rose-600 hover:bg-rose-700 text-white font-serif'
                      : isGta
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title={elapsedSeconds > 0 ? `Save ${elapsedMins} mins logged so far` : 'Run timer to enable saving'}
              >
                <Save className="w-5 h-5 mr-2" />
                <span>Save Time {elapsedSeconds > 0 ? `(${elapsedMins}m)` : ''}</span>
              </Button>

              <Button variant="outline" size="lg" onClick={handleReset}>
                <RotateCcw className="w-5 h-5 mr-2" /> {isStrange ? 'ABORT / RESET' : 'Reset'}
              </Button>
            </div>
          </Card>

          {/* Timer History Log Section */}
          <Card className={`p-5 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-planner-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-planner-secondary text-planner-primary">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-planner-text">Recent Session History</h3>
                  <p className="text-xs text-planner-muted">Recent focus & break logs recorded under your categories</p>
                </div>
              </div>

              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearHistory} className="text-rose-500 hover:text-rose-600">
                  <Trash2 className="w-4 h-4 mr-1" /> Clear Log
                </Button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-planner-muted bg-planner-bg/40 rounded-2xl border border-dashed border-planner-border">
                <p className="text-sm font-medium">No focus sessions logged yet ✨</p>
                <p className="text-xs text-planner-muted mt-1">Start a timer and click "Save Time" or run to completion to record your time.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {history.map((item) => {
                  const sessionDate = new Date(item.completedAt);
                  const catInfo = categories.find((c) => c.name === item.category);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-planner-bg/60 border border-planner-border text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-planner-text truncate">
                              {item.taskTitle ? item.taskTitle : item.label || 'Focus Session'} ({item.durationMins} mins)
                            </p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-planner-secondary text-planner-text border border-planner-border shrink-0">
                              <span>{catInfo?.icon || '📌'}</span>
                              <span>{item.category || 'Personal'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-planner-muted mt-0.5">
                            {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1.5 text-planner-muted hover:text-rose-500 rounded-lg transition-colors ml-2"
                        title="Remove session log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
};

export default Focus;
