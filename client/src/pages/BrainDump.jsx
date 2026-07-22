import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brainDumpApi } from '../api/brainDumpApi';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import IconButton from '../components/common/IconButton';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import BrainDumpConvertModal from '../components/modals/BrainDumpConvertModal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import { Brain, Plus, Sparkles, Archive, Trash2, ArrowRight } from 'lucide-react';

const BrainDump = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [inputContent, setInputContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [convertItem, setConvertItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['braindump', showArchived],
    queryFn: () => brainDumpApi.getBrainDumpItems({ includeArchived: showArchived ? 'true' : 'false' })
  });

  const items = data?.items || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    setIsSubmitting(true);
    try {
      await brainDumpApi.createBrainDumpItem({ content: inputContent });
      setInputContent('');
      queryClient.invalidateQueries({ queryKey: ['braindump'] });
      showSuccess('Thought captured! 🧠');
    } catch (err) {
      showError(err.message || 'Failed to capture thought');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async (item) => {
    try {
      await brainDumpApi.updateBrainDumpItem(item._id, { archived: !item.archived });
      queryClient.invalidateQueries({ queryKey: ['braindump'] });
      showSuccess(item.archived ? 'Item restored' : 'Item archived');
    } catch (err) {
      showError(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      await brainDumpApi.deleteBrainDumpItem(deleteConfirmItem._id);
      queryClient.invalidateQueries({ queryKey: ['braindump'] });
      showSuccess('Item deleted');
      setDeleteConfirmItem(null);
    } catch (err) {
      showError(err.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvert = async (convertData) => {
    if (!convertItem) return;
    try {
      await brainDumpApi.convertBrainDumpItem(convertItem._id, convertData);
      queryClient.invalidateQueries({ queryKey: ['braindump'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      showSuccess(`Converted to ${convertData.targetType}! ✨`);
      setConvertItem(null);
    } catch (err) {
      showError(err.message || 'Failed to convert item');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brain Dump"
        subtitle="Unclutter your mind. Capture raw thoughts, ideas, or reminders instantly and convert them later"
        icon={Brain}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived((prev) => !prev)}
          >
            <Archive className="w-4 h-4 mr-1.5" />
            {showArchived ? 'Hide Archived' : 'Show Archived'}
          </Button>
        }
      />

      {/* Low-Friction Quick Input Box */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-planner-card to-purple-500/5 border-purple-200 dark:border-purple-900/60">
        <form onSubmit={handleCreate} className="space-y-3">
          <Textarea
            placeholder="Type anything on your mind... thoughts, tasks, ideas, groceries..."
            rows={3}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!inputContent.trim()}>
              Dump Thought <Sparkles className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Captured Items Grid */}
      {isLoading ? (
        <LoadingSpinner message="Fetching your brain dump..." fullPage />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Mind is clear ✨"
          message="No unorganized thoughts captured right now. Got something on your mind? Type it above!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card
              key={item._id}
              className={`p-4 flex flex-col justify-between gap-3 ${
                item.archived ? 'opacity-60 bg-planner-bg/40' : ''
              }`}
            >
              <p className="text-sm font-medium text-planner-text whitespace-pre-wrap leading-relaxed">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-planner-border text-xs">
                <span className="text-planner-muted">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-1">
                  {!item.archived && (
                    <Button variant="secondary" size="sm" onClick={() => setConvertItem(item)}>
                      Convert <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                  <IconButton
                    size="sm"
                    title={item.archived ? 'Unarchive' : 'Archive'}
                    onClick={() => handleArchiveToggle(item)}
                  >
                    <Archive className="w-4 h-4 text-planner-muted" />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="danger"
                    title="Delete"
                    onClick={() => setDeleteConfirmItem(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Conversion Modal */}
      <BrainDumpConvertModal
        isOpen={!!convertItem}
        onClose={() => setConvertItem(null)}
        onConvert={handleConvert}
        item={convertItem}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleDelete}
        title="Delete Thought"
        message="Are you sure you want to delete this brain dump item?"
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BrainDump;
