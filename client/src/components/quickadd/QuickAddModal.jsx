import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { useToast } from '../../context/ToastContext';
import { taskApi } from '../../api/taskApi';
import { noteApi } from '../../api/noteApi';
import { eventApi } from '../../api/eventApi';
import { CheckSquare, StickyNote, Calendar as CalendarIcon } from 'lucide-react';

const QuickAddModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('task'); // 'task' | 'note' | 'event'
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskCategory, setTaskCategory] = useState('Personal');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('lavender');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');

  const resetForms = () => {
    setTaskTitle('');
    setTaskDesc('');
    setNoteTitle('');
    setNoteContent('');
    setEventTitle('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'task') {
        if (!taskTitle.trim()) {
          showError('Task title is required');
          setLoading(false);
          return;
        }
        await taskApi.createTask({
          title: taskTitle,
          description: taskDesc,
          dueDate: taskDueDate,
          priority: taskPriority,
          category: taskCategory
        });
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        showSuccess('Task created! 🌸');
      } else if (activeTab === 'note') {
        if (!noteTitle.trim() && !noteContent.trim()) {
          showError('Please write something for your note');
          setLoading(false);
          return;
        }
        await noteApi.createNote({
          title: noteTitle || 'Untitled Note',
          content: noteContent,
          color: noteColor
        });
        await queryClient.invalidateQueries({ queryKey: ['notes'] });
        showSuccess('Note saved! 📝');
      } else if (activeTab === 'event') {
        if (!eventTitle.trim()) {
          showError('Event title is required');
          setLoading(false);
          return;
        }
        await eventApi.createEvent({
          title: eventTitle,
          date: eventDate,
          startTime: eventStartTime,
          endTime: eventEndTime
        });
        await queryClient.invalidateQueries({ queryKey: ['events'] });
        showSuccess('Event added to calendar! 📅');
      }
      handleClose();
    } catch (error) {
      showError(error.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Add ✨" maxWidth="max-w-md">
      {/* Tab Switcher */}
      <div className="flex bg-planner-secondary/60 p-1 rounded-2xl mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'task'
              ? 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Task
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('note')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'note'
              ? 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <StickyNote className="w-4 h-4" /> Note
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'event'
              ? 'bg-planner-card text-planner-primary shadow-xs'
              : 'text-planner-muted hover:text-planner-text'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Event
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {activeTab === 'task' && (
          <>
            <Input
              label="Task Title"
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              autoFocus
            />
            <Textarea
              label="Description (Optional)"
              placeholder="Add details or subtasks..."
              rows={2}
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Due Date"
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
              <Select
                label="Priority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                options={[
                  { value: 'low', label: 'Low 🌱' },
                  { value: 'medium', label: 'Medium 🌸' },
                  { value: 'high', label: 'High 🔥' }
                ]}
              />
            </div>
            <Input
              label="Category"
              placeholder="Personal, Work, Health..."
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value)}
            />
          </>
        )}

        {activeTab === 'note' && (
          <>
            <Input
              label="Note Title"
              placeholder="Title for your note..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              label="Content"
              placeholder="Write your thoughts..."
              rows={4}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <Select
              label="Color Theme"
              value={noteColor}
              onChange={(e) => setNoteColor(e.target.value)}
              options={[
                { value: 'lavender', label: 'Lavender 🪻' },
                { value: 'pink', label: 'Baby Pink 🌸' },
                { value: 'blue', label: 'Sky Blue ☁️' },
                { value: 'peach', label: 'Peach 🍑' },
                { value: 'mint', label: 'Mint 🌿' },
                { value: 'yellow', label: 'Sunshine ☀️' }
              ]}
            />
          </>
        )}

        {activeTab === 'event' && (
          <>
            <Input
              label="Event Title"
              placeholder="Meeting, Birthday, Appointment..."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
              />
              <Input
                label="End Time"
                type="time"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickAddModal;
