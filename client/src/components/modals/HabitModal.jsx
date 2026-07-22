import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

const EMOJI_OPTIONS = ['✨', '💧', '🏃‍♀️', '📖', '🧘‍♀️', '🥗', '😴', '🎨', '💻', '🪴', '✍️', '🍎'];

const HabitModal = ({ isOpen, onClose, onSubmit, habit = null, isLoading = false }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setEmoji(habit.emoji || '✨');
      setDescription(habit.description || '');
    } else {
      setName('');
      setEmoji('✨');
      setDescription('');
    }
  }, [habit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, emoji, description });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit ✏️' : 'New Habit 🌱'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-planner-muted uppercase tracking-wider block mb-1.5">
            Choose Emoji
          </label>
          <div className="flex flex-wrap gap-2 p-2 bg-planner-bg/60 rounded-2xl border border-planner-border max-h-24 overflow-y-auto">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                  emoji === e ? 'bg-planner-primary text-white scale-110 shadow-xs' : 'hover:bg-planner-secondary'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Habit Name"
          placeholder="Drink 8 glasses of water, Read 15 mins..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description / Motivation (Optional)"
          placeholder="Why do you want to build this habit?"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {habit ? 'Save Habit' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HabitModal;
