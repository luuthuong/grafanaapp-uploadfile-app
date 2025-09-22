import React, { useCallback } from 'react';
import { css } from '@emotion/css';
import {
  Button,
  Input,
  TagList,
  Modal,
  IconButton,
  useStyles2,
  Icon
} from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { FileUploadModalProps } from './types';
import { useFileUpload } from './useFileUpload';

export function FileUploadModal({ isOpen, onClose, onUpload, uploadProgress }: FileUploadModalProps) {
  const styles = useStyles2(getStyles);

  const {
    selectedFiles,
    uploadTitle,
    uploadTags,
    tagInput,
    isDragOver,
    fileInputRef,
    dropZoneRef,
    handleFileSelect,
    removeSelectedFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setUploadTitle,
    setTagInput,
    addTag,
    removeTag,
    handleUpload,
    resetForm,
    hasUploadInProgress,
    formatFileSize,
  } = useFileUpload({ onUpload, uploadProgress });

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal isOpen={isOpen} title="Upload Files" onDismiss={handleClose}>
      <div className={styles.modalContent}>
        <div
          ref={dropZoneRef}
          className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="upload" size="xl" />
          <p>Drag and drop files here or click to select</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className={styles.selectedFiles}>
            <h3>Selected Files</h3>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.selectedFile}>
                <span>{file.name} ({formatFileSize(file.size)})</span>
                <IconButton
                  name="times"
                  onClick={() => removeSelectedFile(index)}
                  tooltip="Remove file"
                  size="sm"
                />
              </div>
            ))}
          </div>
        )}

        {uploadProgress.length > 0 && (
          <div className={styles.uploadProgress}>
            <h3>Upload Progress</h3>
            {uploadProgress.map((progress) => (
              <div key={progress.filename} className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span>{progress.filename}</span>
                  <span className={styles.progressStatus}>
                    {progress.status === 'uploading' ? `Uploading...` :
                      progress.status === 'success' ? 'Complete' : 'Error'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className={styles.metadataForm}>
            <div className={styles.formRow}>
              <Input
                label="Title"
                placeholder="Enter a title for the files"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.currentTarget.value)}
              />
            </div>

            <div className={styles.formRow}>
              <div>
                <label className={styles.label}>Metadata</label>
                <div className={styles.tagInput}>
                  <Input
                    placeholder="Add Metadata and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.currentTarget.value)}
                    onKeyUp={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                {uploadTags.length > 0 && (
                  <div className={styles.tags}>
                    <TagList tags={uploadTags} onClick={removeTag} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={handleClose} disabled={hasUploadInProgress}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || hasUploadInProgress || uploadTags.length === 0}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  modalContent: css`
    width: 600px;
    margin: 0 auto;
    max-width: 90vw;
    padding: ${theme.spacing(2)};
  `,
  dropzone: css`
    border: 2px dashed ${theme.colors.border.medium};
    border-radius: ${theme.shape.radius.default};
    padding: ${theme.spacing(4)};
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${theme.colors.background.primary};
    margin-bottom: ${theme.spacing(3)};
    
    &:hover {
      border-color: ${theme.colors.primary.border};
      background: ${theme.colors.background.canvas};
    }
    
    p {
      margin: ${theme.spacing(1)} 0 0 0;
      color: ${theme.colors.text.secondary};
    }
  `,
  dragOver: css`
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.transparent};
  `,
  selectedFiles: css`
    margin-bottom: ${theme.spacing(3)};
    
    h3 {
      margin: 0 0 ${theme.spacing(1)} 0;
      font-size: 16px;
      color: ${theme.colors.text.primary};
    }
  `,
  selectedFile: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing(1)};
    background: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.weak};
    border-radius: ${theme.shape.radius.default};
    margin-bottom: ${theme.spacing(0.5)};
    
    span {
      color: ${theme.colors.text.primary};
    }
  `,
  uploadProgress: css`
    margin-bottom: ${theme.spacing(3)};
    
    h3 {
      margin: 0 0 ${theme.spacing(1)} 0;
      font-size: 16px;
      color: ${theme.colors.text.primary};
    }
  `,
  progressItem: css`
    margin-bottom: ${theme.spacing(1)};
  `,
  progressHeader: css`
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing(0.5)};
    font-size: 14px;
    
    span {
      color: ${theme.colors.text.primary};
    }
  `,
  progressStatus: css`
    font-weight: 500;
  `,
  progressBar: css`
    background: ${theme.colors.border.weak};
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  `,
  progressFill: css`
    background: ${theme.colors.primary.main};
    height: 100%;
    transition: width 0.3s ease;
  `,
  metadataForm: css`
    border-top: 1px solid ${theme.colors.border.weak};
    padding-top: ${theme.spacing(3)};
    margin-bottom: ${theme.spacing(3)};
    
    h3 {
      margin: 0 0 ${theme.spacing(2)} 0;
      font-size: 16px;
      color: ${theme.colors.text.primary};
    }
  `,
  formRow: css`
    margin-bottom: ${theme.spacing(2)};
  `,
  label: css`
    display: block;
    margin-bottom: ${theme.spacing(0.5)};
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.text.primary};
  `,
  tagInput: css`
    display: flex;
    gap: ${theme.spacing(1)};
    margin-bottom: ${theme.spacing(1)};
  `,
  tags: css`
    margin-top: ${theme.spacing(1)};
  `,
  modalActions: css`
    display: flex;
    gap: ${theme.spacing(1)};
    justify-content: flex-end;
    padding-top: ${theme.spacing(2)};
    border-top: 1px solid ${theme.colors.border.weak};
  `,
});
