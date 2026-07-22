import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';

const GoalModal = ({ isOpen, onClose, onSubmit, goal = null, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('in_progress');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setTargetDate(goal.targetDate || '');
      setStatus(goal.status || 'in_progress');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate('');
      setStatus('in_progress');
    }
  }, [goal, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, targetDate, status });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Edit Goal ✏️' : 'New Goal 🎯'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Goal Title"
          placeholder="Launch my website, Read 12 books..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          label="Description & Why it matters"
          placeholder="Detailed objective or action plan..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress 🚀' },
              { value: 'completed', label: 'Completed 🎉' },
              { value: 'paused', label: 'Paused ⏸️' }
            ]}
          />
        </div>
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {goal ? 'Save Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalModal;
