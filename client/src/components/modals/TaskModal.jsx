import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';
import { getLocalDateStr } from '../../utils/dateUtils';

const TaskModal = ({ isOpen, onClose, onSubmit, task = null, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [timeBlock, setTimeBlock] = useState('none');
  const [isTop3, setIsTop3] = useState(false);
  const [isRecurringDaily, setIsRecurringDaily] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
      setDueTime(task.dueTime || '');
      setPriority(task.priority || 'medium');
      setCategory(task.category || 'Personal');
      setTimeBlock(task.timeBlock || 'none');
      setIsTop3(!!task.isTop3);
      setIsRecurringDaily(!!task.isRecurringDaily);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getLocalDateStr());
      setDueTime('');
      setPriority('medium');
      setCategory('Personal');
      setTimeBlock('none');
      setIsTop3(false);
      setIsRecurringDaily(false);
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      dueDate,
      dueTime,
      priority,
      category,
      timeBlock,
      isTop3,
      isRecurringDaily,
      top3Date: dueDate || new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task ✏️' : 'New Task 🌸'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          label="Description"
          placeholder="Add details, notes or subtasks..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Due Time (Optional)"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <Select
            label="Time Block"
            value={timeBlock}
            onChange={(e) => setTimeBlock(e.target.value)}
            options={[
              { value: 'none', label: 'None' },
              { value: 'morning', label: 'Morning 🌅' },
              { value: 'afternoon', label: 'Afternoon ☀️' },
              { value: 'evening', label: 'Evening 🌆' },
              { value: 'night', label: 'Night 🌃' }
            ]}
          />
        </div>
        <Input
          label="Category"
          placeholder="Personal, Work, Study..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="space-y-2">
          <div className="p-3 bg-planner-secondary/50 rounded-2xl border border-planner-border flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-planner-text">Repeat Daily 🔄</span>
              <p className="text-xs text-planner-muted">Task will repeat every single day</p>
            </div>
            <Checkbox checked={isRecurringDaily} onChange={setIsRecurringDaily} />
          </div>

          <div className="p-3 bg-planner-secondary/50 rounded-2xl border border-planner-border flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-planner-text">Mark as Top 3 Priority</span>
              <p className="text-xs text-planner-muted">Enforced max 3 priorities per day</p>
            </div>
            <Checkbox checked={isTop3} onChange={setIsTop3} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
