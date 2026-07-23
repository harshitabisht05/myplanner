import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import { useFocusTimer, TIMER_MODES } from '../context/FocusContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Crosshair, Eye, History, Trash2 } from 'lucide-react';
import strangeOtherSideImg from '../assets/strange_otherside_bg.jpg';

const Focus = () => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const {
    mode,
    customMinutes,
    timeLeft,
    isRunning,
    selectedTaskId,
    history,
    setIsRunning,
    setSelectedTaskId,
    handleModeSwitch,
    handleCustomMinutesChange,
    handleReset,
    clearHistory,
    deleteHistoryItem
  } = useFocusTimer();

  // Fetch available tasks to select from
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'uncompleted'],
    queryFn: () => taskApi.getTasks({ completed: 'false' })
  });

  const tasks = tasksData?.tasks || [];
  const selectedTask = tasks.find((t) => t._id === selectedTaskId);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      <PageHeader
        title={isStrange ? 'ENTERING THE OTHER SIDE' : isGta ? 'MISSION IN PROGRESS' : 'Focus Mode'}
        subtitle={
          isStrange
            ? 'Deep parallel dimension environment for uninterrupted deep work'
            : isGta
            ? 'Execute deep-work objectives without distraction'
            : 'Distraction-free timer for deep work and mindful breaks'
        }
        icon={isStrange ? Eye : isGta ? Crosshair : Timer}
      />

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

      {/* Main Timer Dial */}
      <Card
        className={`p-6 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8 relative overflow-hidden ${
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

        {/* Task Selector */}
        <div className="w-full max-w-md relative z-10">
          <Select
            label={isStrange ? 'CURRENT CASE OBJECTIVE:' : isGta ? 'CURRENT MISSION OBJECTIVE:' : 'Focusing On Task:'}
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            options={[
              { value: '', label: isStrange ? 'Select a case objective...' : isGta ? 'Select a mission objective...' : 'Select a task to focus on (Optional)...' },
              ...tasks.map((t) => ({ value: t._id, label: t.title }))
            ]}
          />
        </div>

        {/* Selected Task Highlight */}
        {selectedTask && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border relative z-10 ${
              isStrange
                ? 'bg-rose-600/20 text-rose-400 border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                : isGta
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-planner-secondary text-planner-primary border-planner-border'
            }`}
          >
            {isStrange ? <Eye className="w-4 h-4" /> : isGta ? <Crosshair className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{selectedTask.title}</span>
          </div>
        )}

        {/* Circular Display Dial */}
        <div
          className={`relative z-10 w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center rounded-full border-8 shadow-cozy-lg ${
            isStrange
              ? 'bg-slate-950 border-rose-600/60 shadow-[0_0_35px_rgba(225,29,72,0.3)]'
              : isGta
              ? 'bg-slate-950 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : 'bg-planner-bg/60 border-planner-secondary'
          }`}
        >
          <div className="text-center">
            <span
              className={`text-4xl sm:text-6xl font-black tracking-tight font-mono ${
                isStrange ? 'text-rose-400' : isGta ? 'text-emerald-400' : 'text-planner-text'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-planner-muted mt-2 font-serif">
              {TIMER_MODES[mode]?.label}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
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

          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="w-5 h-5 mr-2" /> {isStrange ? 'ABORT / RESET' : 'Reset'}
          </Button>
        </div>
      </Card>

      {/* Focus Timer History Log Section */}
      <Card className={`p-5 ${isStrange ? 'strange-hud-card' : isGta ? 'gta-hud-card' : ''}`}>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-planner-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-planner-secondary text-planner-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-planner-text">Timer Session History</h3>
              <p className="text-xs text-planner-muted">Log of completed focus and break sessions</p>
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
            <p className="text-sm font-medium">No completed focus sessions logged yet ✨</p>
            <p className="text-xs text-planner-muted mt-1">Start a timer and run it to completion to record history.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {history.map((item) => {
              const sessionDate = new Date(item.completedAt);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-planner-bg/60 border border-planner-border text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-planner-text truncate">
                        {item.label} ({item.durationMins} mins)
                      </p>
                      <p className="text-[11px] text-planner-muted">
                        {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-1.5 text-planner-muted hover:text-rose-500 rounded-lg transition-colors"
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
    </div>
  );
};

export default Focus;
