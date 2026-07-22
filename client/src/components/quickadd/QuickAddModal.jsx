import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../../api/taskApi';
import { noteApi } from '../../api/noteApi';
import { eventApi } from '../../api/eventApi';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../components/../common/Select';
import Checkbox from '../components/../common/Checkbox';
import { CheckSquare, StickyNote, Calendar as CalendarIcon, Plus, Sparkles, Shield, Crosshair, MapPin } from 'lucide-react';

const QuickAddModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const { showSuccess, showError } = useToast();

  const isGta = theme === 'gta';

  const [activeTab, setActiveTab] = useState('task'); // 'task' | 'note' | 'event'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [isTop3, setIsTop3] = useState(false);
  const [noteColor, setNoteColor] = useState('lavender');
  const [tagsInput, setTagsInput] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('');
    setPriority('medium');
    setCategory('Personal');
    setIsTop3(false);
    setNoteColor('lavender');
    setTagsInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'task') {
        await taskApi.createTask({
          title,
          description,
          dueDate: date,
          dueTime: time,
          priority,
          category,
          isTop3
        });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        showSuccess(isGta ? 'MISSION ADDED TO LOG! 🎯' : 'Task added successfully! 🌸');
      } else if (activeTab === 'note') {
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        await noteApi.createNote({
          title,
          content: description,
          color: noteColor,
          tags
        });
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        showSuccess(isGta ? 'INTEL NOTE CREATED! 📓' : 'Note created successfully! 📝');
      } else if (activeTab === 'event') {
        await eventApi.createEvent({
          title,
          description,
          date,
          startTime: time,
          category
        });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        showSuccess(isGta ? 'EVENT SCHEDULED! 📅' : 'Event scheduled successfully! 📅');
      }

      resetForm();
      onClose();
    } catch (err) {
      showError(err.message || 'Failed to create item');
    } fontFinally: {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGta ? 'MISSION ACTION WHEEL' : 'Quick Add'}
      size="md"
    >
      {/* Action Wheel Tab Switcher */}
      <div className={`flex p-1.5 rounded-2xl border mb-6 ${isGta ? 'bg-slate-950 border-emerald-900/40' : 'bg-planner-secondary'}`}>
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'task'
              ? isGta
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{isGta ? 'MISSION (TASK)' : 'Task'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('note')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'note'
              ? isGta
                ? 'bg-orange-500 text-slate-950 font-black shadow-xs'
                : 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          <span>{isGta ? 'INTEL (NOTE)' : 'Note'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'event'
              ? isGta
                ? 'bg-sky-500 text-slate-950 font-black shadow-xs'
                : 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>{isGta ? 'SCHEDULE (EVENT)' : 'Event'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={activeTab === 'task' ? 'Mission Title' : activeTab === 'note' ? 'Intel Title' : 'Event Title'}
          placeholder={
            activeTab === 'task'
              ? 'e.g. Complete project proposal'
              : activeTab === 'note'
              ? 'e.g. Brainstorming campaign ideas'
              : 'e.g. Team sync meeting'
          }
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label={activeTab === 'note' ? 'Content' : 'Description (Optional)'}
          placeholder="Add details..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {activeTab !== 'note' && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Time (Optional)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'task' && (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low Priority 🌱' },
                { value: 'medium', label: 'Medium Priority 🌸' },
                { value: 'high', label: 'High Priority 🔥' }
              ]}
            />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Personal', label: 'Personal' },
                { value: 'Work', label: 'Work' },
                { value: 'Study', label: 'Study' },
                { value: 'Health', label: 'Health' }
              ]}
            />
          </div>
        )}

        {activeTab === 'task' && (
          <div className="p-3 bg-planner-secondary/60 rounded-2xl border border-planner-border flex items-center justify-between">
            <span className="text-sm font-semibold text-planner-text">
              {isGta ? 'Mark as MAIN MISSION (Top 3 Priority)' : 'Mark as Top 3 Priority for Today'}
            </span>
            <Checkbox checked={isTop3} onChange={setIsTop3} />
          </div>
        )}

        {activeTab === 'note' && (
          <Input
            label="Tags (comma separated)"
            placeholder="work, ideas, design"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-planner-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            <Plus className="w-4 h-4 mr-1.5" />
            {activeTab === 'task' ? 'Create Task' : activeTab === 'note' ? 'Save Note' : 'Schedule Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickAddModal;
