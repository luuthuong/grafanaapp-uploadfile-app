import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PageLayoutType } from '@grafana/data';
import {
  Button,
  ConfirmModal,
  Alert,
  useStyles2
} from '@grafana/ui';
import { PluginPage } from '@grafana/runtime';
import {
  FileUploadModal,
  FileList,
  EditMetadataModal,
  FileMetadata,
  UploadProgress,
  FileUploadFormData
} from '../components/FileManagement';
import { useCurrentUser } from 'hooks/useCurrentUser';
import { fileApi } from 'components/FileManagement/file.api';

function PageUploadFiles() {
  const styles = useStyles2(getStyles);
  const { user } = useCurrentUser();

  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileMetadata | null>(null);
  const [deletingFile, setDeletingFile] = useState<FileMetadata | null>(null);



  useEffect(() => {
    loadFiles();
  }, [])

  const loadFiles = async () => {
    try {
      const fetchedFiles = await fileApi.getFileList();
      const files: FileMetadata[] = fetchedFiles.files.map(f => ({
        filename: f.file.fileName,
        id: f.file.id,
        size: f.file.size,
        tags: f.tags.split(',').map(t => t.trim()).filter(t => t),
        uploadDate: new Date(f.file.uploadedAt),
      } as FileMetadata));

      setFiles(files);
      console.log('Fetched files:', fetchedFiles);
    } catch (err) {
      setError('Failed to fetch files');
    }
  }

  const handleUpload = useCallback(async (selectedFiles: File[], metadata: FileUploadFormData) => {
    if (selectedFiles.length === 0) return;

    setUploadProgress(selectedFiles.map(file => ({
      filename: file.name,
      progress: 0,
      status: 'uploading' as const
    })));

    await fileApi.uploadFile(selectedFiles[0], metadata.tags, metadata.title);
    await loadFiles();
    setUploadProgress([]);
    setIsUploadModalOpen(false);
  }, []);

  const handleDeleteFile = useCallback(async (file: FileMetadata) => {
    try {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setDeletingFile(null);
    } catch (err) {
      setError('Failed to delete file');
    }
  }, []);

  const handleUpdateFileMetadata = useCallback(async (file: FileMetadata) => {
    try {
      setFiles(prev => prev.map(f => f.id === file.id ? file : f));
      setEditingFile(null);
    } catch (err) {
      setError('Failed to update file metadata');
    }
  }, []);

  const handleDownloadFile = useCallback((file: FileMetadata) => {
  }, []);

  const roleDescriptions = {
    'Admin': 'You have full access to all features and settings.',
    'Editor': 'You can create and edit content but have limited access to settings.',
    'Viewer': 'You can view content but cannot make any changes.'
  }

  const canUpload = useMemo(() => {
    const role = user?.orgs.find(o => o.orgId === user.orgId)?.role || 'Viewer';
    return role === 'Admin' || role === 'Editor';
  }, [user]);

  const canEdit = useMemo(() => {
    const role = user?.orgs.find(o => o.orgId === user.orgId)?.role || 'Viewer';
    return role === 'Admin' || role === 'Editor';
  }, [user]);

  return (
    <PluginPage layout={PageLayoutType.Canvas}>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1>File Management</h1>
              <p>
                {roleDescriptions[user?.orgs.find(o => o.orgId === user.orgId)?.role || 'Viewer'] || 'Role information not available.'}
              </p>
            </div>
            {canUpload && (
              <Button onClick={() => setIsUploadModalOpen(true)} size="md" variant='secondary'>
                Upload Files
              </Button>
            )}
          </div>

          {error && (
            <Alert title="Error" severity="error" onRemove={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className={styles.fileListSection}>
            <h2>Uploaded Files ({files.length})</h2>
            <FileList
              isReadOnly={!canEdit}
              files={files}
              onDownload={handleDownloadFile}
              onEdit={setEditingFile}
              onDelete={setDeletingFile}
            />
          </div>
        </div>
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
      />

      <EditMetadataModal
        file={editingFile}
        isOpen={!!editingFile}
        onSave={handleUpdateFileMetadata}
        onClose={() => setEditingFile(null)}
      />

      {deletingFile && (
        <ConfirmModal
          isOpen={true}
          title="Delete File"
          body={`Are you sure you want to delete "${deletingFile.filename}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={() => handleDeleteFile(deletingFile)}
          onDismiss={() => setDeletingFile(null)}
        />
      )}
    </PluginPage>
  );
}



export default PageUploadFiles;

const getStyles = (theme: GrafanaTheme2) => ({
  page: css`
    padding: ${theme.spacing(3)};
    background-color: ${theme.colors.background.primary};
    min-height: 100vh;
  `,
  container: css`
    max-width: 1200px;
    margin: 0 auto;
  `,
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing(4)};
    
    div {
      flex: 1;
    }
    
    h1 {
      margin: 0 0 ${theme.spacing(1)} 0;
      color: ${theme.colors.text.primary};
    }
    
    p {
      margin: 0;
      color: ${theme.colors.text.secondary};
    }
  `,
  fileListSection: css`    
    h2 {
      margin: 0 0 ${theme.spacing(2)} 0;
      color: ${theme.colors.text.primary};
    }
  `,
});
