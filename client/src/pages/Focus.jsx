import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, Sparkles } from 'lucide-react';

const TIMER_MODES = {
  focus: { label: 'Focus Session', minutes: 25, color: 'text-planner-primary border-planner-primary' },
  shortBreak: { label: 'Short Break', minutes: 5, color: 'text-emerald-500 border-emerald-500' },
  longBreak: { label: 'Long Break', minutes: 15, color: 'text-sky-500 border-sky-500' }
};

const Focus = () => {
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
      // Play alert chime or trigger completion
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification('Focus Timer Finished! 🎉', { body: `Completed ${TIMER_MODES[mode].label}` });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode]);

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
        title="Focus Mode"
        subtitle="Distraction-free timer for deep work and mindful breaks"
        icon={Timer}
      />

      {/* Mode Selector Tabs */}
      <div className="flex bg-planner-card p-1.5 rounded-2xl border border-planner-border shadow-cozy">
        <button
          onClick={() => handleModeSwitch('focus')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'focus'
              ? 'bg-planner-primary text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          25m Focus 🎯
        </button>
        <button
          onClick={() => handleModeSwitch('shortBreak')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'shortBreak'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          5m Short Break ☕
        </button>
        <button
          onClick={() => handleModeSwitch('longBreak')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'longBreak'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          15m Long Break 🌿
        </button>
      </div>

      {/* Main Timer Dial */}
      <Card className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-planner-card via-planner-card to-planner-secondary/30">
        {/* Task Selector */}
        <div className="w-full max-w-md">
          <Select
            label="Focusing On Task:"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            options={[
              { value: '', label: 'Select a task to focus on (Optional)...' },
              ...tasks.map((t) => ({ value: t._id, label: t.title }))
            ]}
          />
        </div>

        {/* Selected Task Highlight */}
        {selectedTask && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-planner-secondary text-planner-primary text-sm font-bold border border-planner-border">
            <Sparkles className="w-4 h-4" />
            <span>{selectedTask.title}</span>
          </div>
        )}

        {/* Circular Display Dial */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center rounded-full bg-planner-bg/60 border-8 border-planner-secondary shadow-cozy-lg">
          <div className="text-center">
            <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-planner-text font-mono">
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-planner-muted mt-2">
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
                <Pause className="w-5 h-5 mr-2" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2 fill-current" /> Start
              </>
            )}
          </Button>

          <Button variant="outline" size="lg" onClick={handleReset}>
            <RotateCcw className="w-5 h-5 mr-2" /> Reset
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Focus;
