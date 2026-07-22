import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Checkbox from '../common/Checkbox';

const NoteModal = ({ isOpen, onClose, onSubmit, note = null, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('lavender');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setIsPinned(!!note.isPinned);
      setColor(note.color || 'lavender');
      setTagsInput(note.tags ? note.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setIsPinned(false);
      setColor('lavender');
      setTagsInput('');
    }
  }, [note, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title || 'Untitled Note',
      content,
      isPinned,
      color,
      tags
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? 'Edit Note ✏️' : 'New Note 📝'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <Textarea
          label="Content"
          placeholder="Write your note here..."
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Color Card"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            options={[
              { value: 'lavender', label: 'Lavender 🪻' },
              { value: 'pink', label: 'Baby Pink 🌸' },
              { value: 'blue', label: 'Sky Blue ☁️' },
              { value: 'peach', label: 'Peach 🍑' },
              { value: 'mint', label: 'Mint 🌿' },
              { value: 'yellow', label: 'Sunshine ☀️' }
            ]}
          />
          <Input
            label="Tags (comma separated)"
            placeholder="ideas, work, recipe..."
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>
        <div className="p-3 bg-planner-secondary/50 rounded-2xl border border-planner-border flex items-center justify-between">
          <span className="text-sm font-semibold text-planner-text">Pin to top of list</span>
          <Checkbox checked={isPinned} onChange={setIsPinned} />
        </div>
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {note ? 'Save Note' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteModal;
