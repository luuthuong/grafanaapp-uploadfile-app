import React, { useState, useCallback, useEffect } from 'react';
import { css } from '@emotion/css';
import { 
  Button, 
  Input, 
  TextArea, 
  TagList,
  Modal,
  useStyles2
} from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { EditMetadataModalProps } from './types';

export function EditMetadataModal({ file, isOpen, onSave, onClose }: EditMetadataModalProps) {
  const styles = useStyles2(getStyles);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (file) {
      setTitle(file.filename);
      setTags(file.tags);
      setTagInput('');
    }
  }, [file]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleSave = useCallback(() => {
    if (!file) return;
    
    const updatedFile = {
      ...file,
      filename: title.trim(),
      description,
      tags,
    };
    
    onSave(updatedFile);
  }, [file, title, description, tags, onSave]);

  const handleClose = useCallback(() => {
    if (file) {
      setTitle(file.filename);
      setTags(file.tags);
      setTagInput('');
    }
    onClose();
  }, [file, onClose]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  if (!file) {
    return null;
  }

  const isFormValid = title.trim().length > 0;

  return (
    <Modal isOpen={isOpen} title="Edit File Metadata" onDismiss={handleClose}>
      <div className={styles.modalContent}>
        <div className={styles.formRow}>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="Enter a title for this file"
            invalid={!isFormValid}
          />
        </div>
        
        <div className={styles.formRow}>
          <TextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            placeholder="Enter a description (optional)"
            rows={3}
          />
        </div>
        
        <div className={styles.formRow}>
          <label className={styles.label}>Tags</label>
          <div className={styles.tagInput}>
            <Input
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.currentTarget.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={addTag} disabled={!tagInput.trim()} variant="secondary">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className={styles.tags}>
              <TagList tags={tags} onClick={removeTag} />
            </div>
          )}
        </div>
        
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  modalContent: css`
    width: 500px;
    max-width: 90vw;
    padding: ${theme.spacing(2)};
  `,
  fileInfo: css`
    background: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.weak};
    border-radius: ${theme.shape.borderRadius()};
    padding: ${theme.spacing(1.5)};
    margin-bottom: ${theme.spacing(3)};
    font-size: 14px;
    color: ${theme.colors.text.secondary};
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
    margin-top: ${theme.spacing(2)};
  `,
});
