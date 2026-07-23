import React, { createContext, useContext, useState, useEffect } from 'react';

const FocusContext = createContext(null);

export const TIMER_MODES = {
  focus: { label: 'THE OTHER SIDE', minutes: 25, color: 'text-rose-500 border-rose-600' },
  shortBreak: { label: 'SAFE ZONE', minutes: 5, color: 'text-emerald-400 border-emerald-500' },
  longBreak: { label: 'RETURN TO NORMAL', minutes: 15, color: 'text-sky-400 border-sky-500' },
  custom: { label: 'CUSTOM SESSION', minutes: 45, color: 'text-purple-400 border-purple-500' }
};

export const FocusProvider = ({ children }) => {
  const [mode, setMode] = useState('focus');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('myplanner_focus_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('myplanner_focus_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save focus history', err);
    }
  }, [history]);

  // Background timer ticker
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      // Log history
      const durationMins = mode === 'custom' ? customMinutes : TIMER_MODES[mode]?.minutes || 25;
      const newSession = {
        id: Date.now().toString(),
        mode,
        label: TIMER_MODES[mode]?.label || 'Focus Session',
        durationMins,
        completedAt: new Date().toISOString(),
        taskId: selectedTaskId || null
      };

      setHistory((prev) => [newSession, ...prev]);

      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification('Focus Timer Completed! 🎉', {
          body: `Completed ${durationMins} min ${TIMER_MODES[mode]?.label || 'session'}`
        });
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, customMinutes, selectedTaskId]);

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

  const handleReset = () => {
    setIsRunning(false);
    const targetMins = mode === 'custom' ? customMinutes : TIMER_MODES[mode].minutes;
    setTimeLeft(targetMins * 60);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <FocusContext.Provider
      value={{
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
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocusTimer = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusProvider');
  }
  return context;
};
