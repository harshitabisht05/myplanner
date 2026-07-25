import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { workspaceApi } from '../../api/workspaceApi';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Folder, Upload, FileText, Trash2, Download, Eye, HardDrive } from 'lucide-react';

const FilesManager = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [folder, setFolder] = useState('General');

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-files', currentWorkspaceId, selectedFolder],
    queryFn: () => workspaceApi.getFiles(currentWorkspaceId, selectedFolder !== 'All' ? { folder: selectedFolder } : {}),
    enabled: !!currentWorkspaceId
  });

  const files = data?.files || [];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      await workspaceApi.uploadFile(currentWorkspaceId, {
        name: fileName,
        url: fileUrl || 'https://via.placeholder.com/300',
        folder
      });
      showSuccess('File uploaded to vault!');
      queryClient.invalidateQueries({ queryKey: ['workspace-files', currentWorkspaceId] });
      setIsUploadModalOpen(false);
      setFileName('');
      setFileUrl('');
    } catch (err) {
      showError('Failed to upload file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await workspaceApi.deleteFile(currentWorkspaceId, fileId);
      showSuccess('File removed');
      queryClient.invalidateQueries({ queryKey: ['workspace-files', currentWorkspaceId] });
    } catch (err) {
      showError('Failed to delete file');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Document Vault & Files"
        subtitle="Upload, organize, preview, version track, and share team assets & documents"
        icon={Folder}
        action={
          <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" /> Upload File
          </Button>
        }
      />

      {/* Folder Tabs */}
      <div className="flex gap-2 border-b border-planner-border pb-3 overflow-x-auto">
        {['All', 'General', 'Specs', 'Assets', 'Releases'].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedFolder === f ? 'bg-planner-primary text-white' : 'bg-planner-bg text-planner-muted hover:text-planner-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading file vault..." />
      ) : files.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-planner-muted text-sm">No files uploaded in this folder yet.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setIsUploadModalOpen(true)}>
            Upload First File
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file._id} className="p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-planner-secondary text-planner-muted">
                  v{file.version || 1}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-planner-text truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-[10px] text-planner-muted">Folder: {file.folder || 'General'}</p>
                <p className="text-[10px] text-planner-muted">By: {file.uploadedBy?.name || 'User'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-planner-border">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 text-planner-muted hover:text-planner-primary">
                  <Eye className="w-4 h-4" />
                </a>
                <button onClick={() => handleDelete(file._id)} className="p-1 text-planner-muted hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File to Vault 📁">
        <form onSubmit={handleUpload} className="space-y-4">
          <Input label="File Name" placeholder="e.g. System_Architecture_v1.pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} required autoFocus />
          <Input label="File Link / URL" placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
          <Select
            label="Folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            options={[
              { value: 'General', label: 'General' },
              { value: 'Specs', label: 'Specs' },
              { value: 'Assets', label: 'Assets' },
              { value: 'Releases', label: 'Releases' }
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Upload File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilesManager;
