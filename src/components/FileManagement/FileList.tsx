import React from 'react';
import { css } from '@emotion/css';
import { TagList, EmptySearchResult, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { FileListProps } from './types';
import { FileActions } from './FileActions';

export function FileList({ files, onDownload, onEdit, onDelete, isReadOnly = true }: FileListProps) {
  const styles = useStyles2(getStyles);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (files.length === 0) {
    return (
      <EmptySearchResult>
        <p>No files uploaded yet.</p>
        <p>Click the "Upload Files" button to get started!</p>
      </EmptySearchResult>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Size</th>
            <th>Upload Date</th>
            <th>Tags</th>
            {
              !isReadOnly && <th>Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>
                <div>
                  <div className={styles.filename}>{file.filename}</div>
                </div>
              </td>
              <td>{formatFileSize(file.size)}</td>
              <td>{formatDate(file.uploadDate)}</td>
              <td>
                <TagList tags={file.tags} />
              </td>
              {
                !isReadOnly && <td>
                  <FileActions
                    file={file}
                    onDownload={onDownload}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  tableContainer: css`
    overflow-x: auto;
    background: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.medium};
    border-radius: ${theme.shape.borderRadius()};
  `,
  table: css`
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: ${theme.spacing(1.5)} ${theme.spacing(1)};
      text-align: left;
      border-bottom: 1px solid ${theme.colors.border.weak};
    }
    
    th {
      background: ${theme.colors.background.canvas};
      color: ${theme.colors.text.primary};
      font-weight: 500;
      font-size: 14px;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    td {
      color: ${theme.colors.text.primary};
      font-size: 14px;
      vertical-align: top;
    }
    
    tbody tr:hover {
      background: ${theme.colors.background.canvas};
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
  `,
  filename: css`
    font-weight: 500;
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing(0.25)};
  `,
  originalFilename: css`
    font-size: 12px;
    color: ${theme.colors.text.secondary};
  `,
});
