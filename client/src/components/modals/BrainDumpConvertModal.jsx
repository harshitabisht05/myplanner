import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { CheckSquare, StickyNote, Calendar as CalendarIcon } from 'lucide-react';

const BrainDumpConvertModal = ({ isOpen, onClose, onConvert, item, isLoading = false }) => {
  const [targetType, setTargetType] = useState('task');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('medium');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');

  useEffect(() => {
    setDueDate(new Date().toISOString().split('T')[0]);
    setDate(new Date().toISOString().split('T')[0]);
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConvert({
      targetType,
      dueDate,
      priority,
      date,
      startTime
    });
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convert Brain Dump Item ✨" maxWidth="max-w-md">
      <div className="p-3 bg-planner-secondary/60 rounded-2xl border border-planner-border mb-4">
        <span className="text-xs font-semibold text-planner-muted uppercase tracking-wider block mb-1">
          Original Thought:
        </span>
        <p className="text-sm font-medium text-planner-text italic">"{item.content}"</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider block mb-1.5">
            Convert To:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('task')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1 ${
                targetType === 'task'
                  ? 'border-planner-primary bg-planner-secondary text-planner-primary shadow-xs'
                  : 'border-planner-border bg-planner-card text-planner-muted hover:text-planner-text'
              }`}
            >
              <CheckSquare className="w-5 h-5" /> Task
            </button>
            <button
              type="button"
              onClick={() => setTargetType('note')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1 ${
                targetType === 'note'
                  ? 'border-planner-primary bg-planner-secondary text-planner-primary shadow-xs'
                  : 'border-planner-border bg-planner-card text-planner-muted hover:text-planner-text'
              }`}
            >
              <StickyNote className="w-5 h-5" /> Note
            </button>
            <button
              type="button"
              onClick={() => setTargetType('event')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-xs font-bold gap-1 ${
                targetType === 'event'
                  ? 'border-planner-primary bg-planner-secondary text-planner-primary shadow-xs'
                  : 'border-planner-border bg-planner-card text-planner-muted hover:text-planner-text'
              }`}
            >
              <CalendarIcon className="w-5 h-5" /> Event
            </button>
          </div>
        </div>

        {targetType === 'task' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low 🌱' },
                { value: 'medium', label: 'Medium 🌸' },
                { value: 'high', label: 'High 🔥' }
              ]}
            />
          </div>
        )}

        {targetType === 'event' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Event Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Convert & Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BrainDumpConvertModal;
