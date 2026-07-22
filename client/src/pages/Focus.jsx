import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Shield, Flame, Crosshair } from 'lucide-react';

const TIMER_MODES = {
  focus: { label: 'MISSION FOCUS', minutes: 25, color: 'text-emerald-400 border-emerald-500' },
  shortBreak: { label: 'RECHARGE BREAK', minutes: 5, color: 'text-amber-400 border-amber-500' },
  longBreak: { label: 'HQ REST', minutes: 15, color: 'text-sky-400 border-sky-500' }
};

const Focus = () => {
  const { theme } = useTheme();
  const isGta = theme === 'gta';

  const [mode, setMode] = useState('focus');
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
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[newMode].minutes * 60);
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
        new Notification(isGta ? 'MISSION COMPLETED! 🎯' : 'Focus Timer Finished! 🎉', {
          body: `Completed ${TIMER_MODES[mode].label}`
        });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, isGta]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[mode].minutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = TIMER_MODES[mode].minutes * 60;
  const progressPercentage = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={isGta ? 'MISSION IN PROGRESS' : 'Focus Mode'}
        subtitle={
          isGta
            ? 'Execute deep-work objectives without distraction'
            : 'Distraction-free timer for deep work and mindful breaks'
        }
        icon={isGta ? Crosshair : Timer}
      />

      {/* Mode Selector Tabs */}
      <div className={`flex p-1.5 rounded-2xl border shadow-cozy ${isGta ? 'bg-slate-950 border-emerald-900/40' : 'bg-planner-card border-planner-border'}`}>
        <button
          onClick={() => handleModeSwitch('focus')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'focus'
              ? isGta
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-planner-primary text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          {isGta ? '25m MISSION 🎯' : '25m Focus 🎯'}
        </button>
        <button
          onClick={() => handleModeSwitch('shortBreak')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak'
              ? isGta
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'bg-emerald-500 text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          {isGta ? '5m RECHARGE ☕' : '5m Short Break ☕'}
        </button>
        <button
          onClick={() => handleModeSwitch('longBreak')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak'
              ? isGta
                ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                : 'bg-sky-500 text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          {isGta ? '15m HQ REST 🌿' : '15m Long Break 🌿'}
        </button>
      </div>

      {/* Main Timer Dial */}
      <Card
        className={`p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-8 ${
          isGta
            ? 'gta-hud-card bg-gradient-to-b from-slate-950 via-slate-950/90 to-purple-950/30 border-emerald-500/30'
            : 'bg-gradient-to-b from-planner-card via-planner-card to-planner-secondary/30'
        }`}
      >
        {/* Task Selector */}
        <div className="w-full max-w-md">
          <Select
            label={isGta ? 'CURRENT MISSION OBJECTIVE:' : 'Focusing On Task:'}
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            options={[
              { value: '', label: isGta ? 'Select a mission objective...' : 'Select a task to focus on (Optional)...' },
              ...tasks.map((t) => ({ value: t._id, label: t.title }))
            ]}
          />
        </div>

        {/* Selected Task Highlight */}
        {selectedTask && (
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${
              isGta
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-planner-secondary text-planner-primary border-planner-border'
            }`}
          >
            {isGta ? <Crosshair className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{selectedTask.title}</span>
          </div>
        )}

        {/* Circular Display Dial */}
        <div
          className={`relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center rounded-full border-8 shadow-cozy-lg ${
            isGta
              ? 'bg-slate-950 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
              : 'bg-planner-bg/60 border-planner-secondary'
          }`}
        >
          <div className="text-center">
            <span
              className={`text-5xl sm:text-6xl font-black tracking-tight font-mono ${
                isGta ? 'text-emerald-400 text-shadow-emerald' : 'text-planner-text'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-planner-muted mt-2">
              {TIMER_MODES[mode].label}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-center gap-4 pt-4">
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
                <Play className="w-5 h-5 mr-2 fill-current" /> START MISSION
              </>
            )}
          </Button>

          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="w-5 h-5 mr-2" /> RESET
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Focus;
