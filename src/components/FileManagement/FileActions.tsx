import React from 'react';
import { css } from '@emotion/css';
import { IconButton, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { FileActionsProps } from './types';

export function FileActions({ file, onDownload, onEdit, onDelete }: FileActionsProps) {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.actions}>
      <IconButton
        name="download-alt"
        onClick={() => onDownload(file)}
        tooltip="Download"
        size="sm"
      />
      <IconButton
        name="edit"
        onClick={() => onEdit(file)}
        tooltip="Edit metadata"
        size="sm"
      />
      <IconButton
        name="trash-alt"
        onClick={() => onDelete(file)}
        tooltip="Delete"
        size="sm"
      />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  actions: css`
    display: flex;
    gap: ${theme.spacing(0.5)};
    align-items: center;
  `,
});
