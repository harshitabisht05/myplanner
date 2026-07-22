import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '../api/noteApi';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import NoteModal from '../components/modals/NoteModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { StickyNote, Plus, Search, Pin, Edit2, Trash2, Tag } from 'lucide-react';

const COLOR_MAP = {
  lavender: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100',
  pink: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800 text-pink-950 dark:text-pink-100',
  blue: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-100',
  peach: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-950 dark:text-orange-100',
  mint: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
  yellow: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
};

const Notes = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [deleteConfirmNote, setDeleteConfirmNote] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', search],
    queryFn: () => noteApi.getNotes({ search })
  });

  const notes = data?.notes || [];

  const togglePinMutation = useMutation({
    mutationFn: (id) => noteApi.togglePinNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const handleFormSubmit = async (noteData) => {
    try {
      if (editingNote) {
        await noteApi.updateNote(editingNote._id, noteData);
        showSuccess('Note updated!');
      } else {
        await noteApi.createNote(noteData);
        showSuccess('Note created! 📝');
      }
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to save note');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmNote) return;
    setIsDeleting(true);
    try {
      await noteApi.deleteNote(deleteConfirmNote._id);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      showSuccess('Note deleted');
      setDeleteConfirmNote(null);
    } catch (err) {
      showError(err.message || 'Failed to delete note');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes & Ideas"
        subtitle="Your thoughts have plenty of room here ♡"
        icon={StickyNote}
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Note
          </Button>
        }
      />

      {/* Search Input Bar */}
      <Card className="p-3">
        <Input
          placeholder="Search notes by title or content..."
          leftIcon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Notes Masonry / Card Grid */}
      {isLoading ? (
        <LoadingSpinner message="Fetching notes..." fullPage />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes found"
          message="Your thoughts have plenty of room here ♡"
          actionText="Create Note"
          onAction={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const colorClass = COLOR_MAP[note.color] || COLOR_MAP.lavender;

            return (
              <div
                key={note._id}
                className={`p-5 rounded-3xl border shadow-cozy flex flex-col justify-between transition-all hover:shadow-cozy-lg hover:-translate-y-0.5 ${colorClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base leading-snug">{note.title || 'Untitled Note'}</h3>
                    <IconButton
                      size="sm"
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                      onClick={() => togglePinMutation.mutate(note._id)}
                    >
                      <Pin
                        className={`w-4 h-4 transition-transform ${
                          note.isPinned ? 'fill-current text-planner-primary rotate-45' : 'opacity-40'
                        }`}
                      />
                    </IconButton>
                  </div>

                  <p className="text-sm opacity-90 whitespace-pre-wrap leading-relaxed mb-4 line-clamp-6">
                    {note.content}
                  </p>
                </div>

                <div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/60 dark:bg-black/20"
                        >
                          <Tag className="w-2.5 h-2.5" /> {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10 text-xs opacity-75">
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <IconButton
                        size="sm"
                        onClick={() => {
                          setEditingNote(note);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteConfirmNote(note)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        note={editingNote}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmNote}
        onClose={() => setDeleteConfirmNote(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note"
        message={`Are you sure you want to delete note "${deleteConfirmNote?.title}"?`}
        confirmText="Delete Note"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Notes;
