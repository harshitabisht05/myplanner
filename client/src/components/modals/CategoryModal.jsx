import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { Tag, Plus, Trash2, Check, Sparkles } from 'lucide-react';

const EMOJI_OPTIONS = ['🏠', '💼', '📚', '☕', '🏋️', '🎨', '📌', '🎮', '🎵', '🎯', '💡', '💻', '🚀', '🌿', '🌟', '🧘'];

const COLOR_OPTIONS = [
  { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-400' },
  { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400' },
  { name: 'Rose', value: 'rose', bg: 'bg-rose-500', text: 'text-rose-400' },
  { name: 'Amber', value: 'amber', bg: 'bg-amber-500', text: 'text-amber-400' },
  { name: 'Sky', value: 'sky', bg: 'bg-sky-500', text: 'text-sky-400' },
  { name: 'Purple', value: 'purple', bg: 'bg-purple-500', text: 'text-purple-400' },
  { name: 'Teal', value: 'teal', bg: 'bg-teal-500', text: 'text-teal-400' },
  { name: 'Pink', value: 'pink', bg: 'bg-pink-500', text: 'text-pink-400' },
  { name: 'Slate', value: 'slate', bg: 'bg-slate-500', text: 'text-slate-400' }
];

const CategoryModal = ({ isOpen, onClose, categories = [], onCreateCategory, onDeleteCategory }) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📌');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onCreateCategory({
        name: name.trim(),
        icon: selectedEmoji,
        color: selectedColor
      });
      setName('');
      setSelectedEmoji('📌');
      setSelectedColor('indigo');
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Categories 🏷️"
      maxWidth="max-w-lg"
    >
      <div className="space-y-6">
        {/* Create Form */}
        <form onSubmit={handleCreate} className="space-y-4 p-4 rounded-2xl bg-planner-bg/60 border border-planner-border">
          <h4 className="text-sm font-bold text-planner-text flex items-center gap-2">
            <Plus className="w-4 h-4 text-planner-primary" /> Create New Category
          </h4>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <Input
            label="Category Name"
            placeholder="e.g. Project X, Reading, Fitness..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            required
          />

          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-bold text-planner-muted mb-1.5">Choose Icon</label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-planner-primary text-white scale-110 shadow-xs'
                      : 'bg-planner-card hover:bg-planner-secondary text-planner-text'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Badge Picker */}
          <div>
            <label className="block text-xs font-bold text-planner-muted mb-1.5">Badge Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setSelectedColor(col.value)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${col.bg} transition-all ${
                    selectedColor === col.value ? 'ring-2 ring-offset-2 ring-planner-primary scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={col.name}
                >
                  {selectedColor === col.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Tag */}
          {name.trim() && (
            <div className="pt-2">
              <span className="text-[11px] text-planner-muted block mb-1">Preview:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-planner-secondary text-planner-text border border-planner-border shadow-xs">
                <span>{selectedEmoji}</span>
                <span>{name}</span>
              </span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Add Category
            </Button>
          </div>
        </form>

        {/* Existing Categories List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-planner-muted flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Existing Categories ({categories.length})
          </h4>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat._id || cat.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-planner-bg/40 border border-planner-border text-xs font-semibold text-planner-text"
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon || '📌'}</span>
                  <span>{cat.name}</span>
                  {cat.isSystem && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-planner-secondary text-planner-muted">
                      Built-in
                    </span>
                  )}
                </div>

                {!cat.isSystem && (
                  <button
                    type="button"
                    onClick={() => onDeleteCategory && onDeleteCategory(cat._id)}
                    className="p-1 text-planner-muted hover:text-rose-500 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryModal;
