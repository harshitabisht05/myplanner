import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { focusApi } from '../api/focusApi';
import { categoryApi } from '../api/categoryApi';

const FocusContext = createContext(null);

export const TIMER_MODES = {
  focus: { label: 'THE OTHER SIDE', minutes: 25, color: 'text-rose-500 border-rose-600' },
  shortBreak: { label: 'SAFE ZONE', minutes: 5, color: 'text-emerald-400 border-emerald-500' },
  longBreak: { label: 'RETURN TO NORMAL', minutes: 15, color: 'text-sky-400 border-sky-500' },
  custom: { label: 'CUSTOM SESSION', minutes: 45, color: 'text-purple-400 border-purple-500' }
};

export const DEFAULT_CATEGORIES = [
  { name: 'Personal', icon: '🏠', color: 'indigo', isSystem: true },
  { name: 'Work', icon: '💼', color: 'emerald', isSystem: true },
  { name: 'Study', icon: '📚', color: 'purple', isSystem: true },
  { name: 'Break', icon: '☕', color: 'teal', isSystem: true },
  { name: 'Health & Fitness', icon: '🏋️', color: 'rose', isSystem: true },
  { name: 'Creative', icon: '🎨', color: 'amber', isSystem: true },
  { name: 'Other', icon: '📌', color: 'slate', isSystem: true }
];

export const FocusProvider = ({ children }) => {
  const [mode, setMode] = useState('focus');
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Personal');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Categories list state
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('myplanner_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('myplanner_focus_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load categories from API if available
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getCategories();
        if (res?.categories?.length) {
          setCategories(res.categories);
          localStorage.setItem('myplanner_categories', JSON.stringify(res.categories));
        }
      } catch (err) {
        // Fallback to local storage
      }
    };
    fetchCategories();
  }, []);

  // Save history & categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('myplanner_focus_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save focus history', err);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('myplanner_categories', JSON.stringify(categories));
    } catch (err) {
      console.error('Failed to save categories', err);
    }
  }, [categories]);

  // Load focus sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await focusApi.getSessions({});
        if (res?.sessions) {
          const formatted = res.sessions.map((s) => ({
            id: s._id || s.id,
            mode: s.mode || 'focus',
            label: s.category ? `${s.category} Session` : 'Focus Session',
            category: s.category || 'Personal',
            durationMins: s.durationMins || Math.round((s.elapsedSeconds || 0) / 60),
            elapsedSeconds: s.elapsedSeconds || 0,
            completedAt: s.completedAt || new Date().toISOString(),
            taskId: s.task || null,
            taskTitle: s.taskTitle || '',
            isMidSessionSave: !!s.isMidSessionSave
          }));
          setHistory(formatted);
        }
      } catch (err) {
        // Keep current local history
      }
    };
    fetchSessions();
  }, []);

  // Timer ticker
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft <= 0 && isRunning) {
      setIsRunning(false);
      // Auto-save on completion
      saveCurrentSession({ isMidSessionSave: false, isAutoCompletion: true });
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  // Save session (mid-session or completed)
  const saveCurrentSession = async (options = {}) => {
    const { taskTitleOverride, categoryOverride, isMidSessionSave = true, resetTimer = true } = options;

    const sessionElapsedSecs = elapsedSeconds > 0 ? elapsedSeconds : (TIMER_MODES[mode]?.minutes || 25) * 60 - timeLeft;
    if (sessionElapsedSecs <= 0 && !options.isAutoCompletion) {
      return null;
    }

    const durationMins = Math.max(1, Math.round(sessionElapsedSecs / 60));
    const activeCategory = categoryOverride || selectedCategory || 'Personal';

    const newSession = {
      id: Date.now().toString(),
      mode,
      label: `${activeCategory} (${durationMins}m)`,
      category: activeCategory,
      durationMins,
      elapsedSeconds: sessionElapsedSecs,
      completedAt: new Date().toISOString(),
      taskId: selectedTaskId || null,
      taskTitle: taskTitleOverride || '',
      isMidSessionSave
    };

    // Update local state immediately
    setHistory((prev) => [newSession, ...prev]);

    // Send to backend API
    try {
      await focusApi.createSession({
        task: selectedTaskId || null,
        taskTitle: taskTitleOverride || '',
        category: activeCategory,
        mode,
        durationMins,
        elapsedSeconds: sessionElapsedSecs,
        isMidSessionSave,
        completedAt: newSession.completedAt
      });
    } catch (err) {
      console.warn('Saved focus session locally, server sync failed', err);
    }

    // Trigger Notification
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
      new Notification('Focus Session Saved! 🎯', {
        body: `Recorded ${durationMins} min session for ${activeCategory}`
      });
    }

    // Reset elapsed timer counter if requested
    if (resetTimer) {
      setElapsedSeconds(0);
      setIsRunning(false);
      const targetMins = mode === 'custom' ? customMinutes : TIMER_MODES[mode]?.minutes || 25;
      setTimeLeft(targetMins * 60);
    }

    return newSession;
  };

  const handleModeSwitch = (newMode, minutesOverride) => {
    setMode(newMode);
    setIsRunning(false);
    setElapsedSeconds(0);
    const targetMins = minutesOverride || (newMode === 'custom' ? customMinutes : TIMER_MODES[newMode].minutes);
    setTimeLeft(targetMins * 60);
  };

  const handleCustomMinutesChange = (newMins) => {
    const mins = Math.max(1, Math.min(180, Number(newMins) || 1));
    setCustomMinutes(mins);
    if (mode === 'custom') {
      setIsRunning(false);
      setElapsedSeconds(0);
      setTimeLeft(mins * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    const targetMins = mode === 'custom' ? customMinutes : TIMER_MODES[mode].minutes;
    setTimeLeft(targetMins * 60);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = async (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    try {
      await focusApi.deleteSession(id);
    } catch (err) {
      // Ignored
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const res = await categoryApi.createCategory(categoryData);
      if (res?.category) {
        setCategories((prev) => [...prev, res.category]);
        return res.category;
      }
    } catch (err) {
      // Fallback local
      const newCat = {
        _id: Date.now().toString(),
        name: categoryData.name,
        icon: categoryData.icon || '📌',
        color: categoryData.color || 'indigo',
        isSystem: false
      };
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    }
  };

  const deleteCategory = async (id) => {
    setCategories((prev) => prev.filter((c) => c._id !== id));
    try {
      await categoryApi.deleteCategory(id);
    } catch (err) {
      // Ignored
    }
  };

  return (
    <FocusContext.Provider
      value={{
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
