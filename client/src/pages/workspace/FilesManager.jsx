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
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Folder, Upload, FileText, Trash2, Download, Eye, Laptop, File } from 'lucide-react';

const FilesManager = () => {
  const { currentWorkspaceId } = useWorkspace();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [folder, setFolder] = useState('General');

  const { data, isLoading } = useQuery({
    queryKey: ['workspace-files', currentWorkspaceId, selectedFolder],
    queryFn: () => workspaceApi.getFiles(currentWorkspaceId, selectedFolder !== 'All' ? { folder: selectedFolder } : {}),
    enabled: !!currentWorkspaceId
  });

  const files = data?.files || [];

  const handleDeviceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFileUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    try {
      await workspaceApi.uploadFile(currentWorkspaceId, {
        name: fileName,
        url: fileUrl || 'https://via.placeholder.com/300',
        size: fileSize,
        folder
      });
      showSuccess('File uploaded to vault!');
      queryClient.invalidateQueries({ queryKey: ['workspace-files', currentWorkspaceId] });
      setIsUploadModalOpen(false);
      setFileName('');
      setFileUrl('');
      setFileSize(0);
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
      if (previewFile?._id === fileId) setPreviewFile(null);
    } catch (err) {
      showError('Failed to delete file');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImageFile = (file) => {
    if (!file) return false;
    const url = file.url || '';
    const name = file.name || '';
    return url.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspace Document Vault & Files"
        subtitle="Upload assets from device or URL, preview files safely, and download when ready"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          type="files"
          title="Document Vault is Empty"
          message="Upload team files, reference docs, or assets to store them securely."
          actionText="Upload First File"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {files.map((file) => (
            <Card
              key={file._id}
              onClick={() => setPreviewFile(file)}
              className="p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-all cursor-pointer hover:border-planner-primary"
            >
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
                <p className="text-[10px] text-planner-muted">Size: {formatBytes(file.size)}</p>
                <p className="text-[10px] text-planner-muted">By: {file.uploadedBy?.name || 'User'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-planner-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(file);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-planner-primary hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file._id);
                  }}
                  className="p-1 text-planner-muted hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <Modal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} title={`Preview: ${previewFile.name}`} maxWidth="max-w-2xl">
          <div className="space-y-4">
            {/* File Render Box */}
            <div className="p-4 rounded-2xl bg-planner-bg/60 border border-planner-border max-h-80 overflow-auto flex items-center justify-center min-h-[160px]">
              {isImageFile(previewFile) ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-72 object-contain rounded-xl shadow-xs" />
              ) : previewFile.url?.startsWith('data:') || previewFile.url?.startsWith('http') ? (
                <iframe src={previewFile.url} title={previewFile.name} className="w-full h-72 rounded-xl border border-planner-border" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <File className="w-12 h-12 text-purple-500 mx-auto" />
                  <p className="text-xs text-planner-text font-bold">{previewFile.name}</p>
                  <p className="text-[11px] text-planner-muted">Preview player unavailable for this format.</p>
                </div>
              )}
            </div>

            {/* Metadata Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-planner-card p-3 rounded-xl border border-planner-border">
              <div>
                <span className="text-planner-muted block">File Size</span>
                <span className="font-bold text-planner-text">{formatBytes(previewFile.size)}</span>
              </div>
              <div>
                <span className="text-planner-muted block">Folder Category</span>
                <span className="font-bold text-planner-text">{previewFile.folder || 'General'}</span>
              </div>
              <div>
                <span className="text-planner-muted block">Uploaded By</span>
                <span className="font-bold text-planner-text">{previewFile.uploadedBy?.name || 'Teammate'}</span>
              </div>
              <div>
                <span className="text-planner-muted block">Version</span>
                <span className="font-bold text-planner-text">v{previewFile.version || 1}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(previewFile._id)}
                className="text-rose-500 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete File
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                  Close
                </Button>
                <a href={previewFile.url} download={previewFile.name} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm">
                    <Download className="w-4 h-4 mr-1.5" /> Download File
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload File Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload File to Vault 📁">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="p-3 rounded-2xl bg-planner-bg border-2 border-dashed border-planner-border space-y-2 text-center">
            <Laptop className="w-6 h-6 mx-auto text-purple-500" />
            <label className="text-xs font-bold text-planner-text block">Choose File From Your Device</label>
            <input
              type="file"
              onChange={handleDeviceFileChange}
              className="w-full text-xs text-planner-text file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-planner-primary file:text-white hover:file:bg-planner-primaryHover cursor-pointer border border-planner-border rounded-xl p-1 bg-planner-card"
            />
          </div>

          <div className="relative text-center my-2">
            <span className="text-[10px] font-bold text-planner-muted bg-planner-card px-2 uppercase">OR PASTE URL</span>
          </div>

          <Input label="File Name" placeholder="e.g. Architecture_Doc.pdf" value={fileName} onChange={(e) => setFileName(e.target.value)} required />
          <Input label="File URL (Optional if uploaded from device)" placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
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
