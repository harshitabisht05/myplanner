import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Shield, Flame, Crosshair, Eye } from 'lucide-react';
import strangeOtherSideImg from '../assets/strange_otherside_bg.jpg';

const TIMER_MODES = {
  focus: { label: 'THE OTHER SIDE', minutes: 25, color: 'text-rose-500 border-rose-600' },
  shortBreak: { label: 'SAFE ZONE', minutes: 5, color: 'text-emerald-400 border-emerald-500' },
  longBreak: { label: 'RETURN TO NORMAL', minutes: 15, color: 'text-sky-400 border-sky-500' },
  custom: { label: 'CUSTOM SESSION', minutes: 45, color: 'text-purple-400 border-purple-500' }
};

const Focus = () => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';
  const isStrange = theme === 'strange';

  const [mode, setMode] = useState('focus');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Fetch available tasks to select from
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'uncompleted'],
    queryFn: () => taskApi.getTasks({ completed: 'false' })
  });

  const tasks = tasksData?.tasks || [];
  const selectedTask = tasks.find((t) => t._id === selectedTaskId);

  // Mode switch
  const handleModeSwitch = (newMode, minutesOverride) => {
    setMode(newMode);
    setIsRunning(false);
    const targetMins = minutesOverride || (newMode === 'custom' ? customMinutes : TIMER_MODES[newMode].minutes);
    setTimeLeft(targetMins * 60);
  };

  const handleCustomMinutesChange = (newMins) => {
    const mins = Math.max(1, Math.min(180, Number(newMins) || 1));
    setCustomMinutes(mins);
    if (mode === 'custom') {
      setIsRunning(false);
      setTimeLeft(mins * 60);
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification(isStrange ? 'OBJECTIVE COMPLETE! 🌲' : isGta ? 'MISSION COMPLETED! 🎯' : 'Focus Timer Finished! 🎉', {
          body: `Completed ${TIMER_MODES[mode].label}`
        });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, isGta, isStrange]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[mode].minutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
        className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-8 relative overflow-hidden ${
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
          className={`relative z-10 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center rounded-full border-8 shadow-cozy-lg ${
            isStrange
              ? 'bg-slate-950 border-rose-600/60 shadow-[0_0_35px_rgba(225,29,72,0.3)]'
              : isGta
              ? 'bg-slate-950 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : 'bg-planner-bg/60 border-planner-secondary'
          }`}
        >
          <div className="text-center">
            <span
              className={`text-5xl sm:text-6xl font-black tracking-tight font-mono ${
                isStrange ? 'text-rose-400' : isGta ? 'text-emerald-400' : 'text-planner-text'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-planner-muted mt-2 font-serif">
              {TIMER_MODES[mode].label}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-4 pt-4 relative z-10">
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="lg"
            onClick={() => setIsRunning((prev) => !prev)}
            className="px-8 shadow-cozy"
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
    </div>
  );
};

export default Focus;
