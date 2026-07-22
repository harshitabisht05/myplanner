import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';

const EventModal = ({ isOpen, onClose, onSubmit, event = null, initialDate = '', isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setDate(event.date || initialDate || new Date().toISOString().split('T')[0]);
      setStartTime(event.startTime || '09:00');
      setEndTime(event.endTime || '10:00');
      setCategory(event.category || 'General');
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('General');
    }
  }, [event, initialDate, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSubmit({ title, description, date, startTime, endTime, category });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event ✏️' : 'New Calendar Event 📅'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event Title"
          placeholder="Meeting, Doctor Visit, Party..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
        <Textarea
          label="Description"
          placeholder="Location, details, links..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Event Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <Input
          label="Category"
          placeholder="General, Work, Social, Family..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {event ? 'Save Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EventModal;
