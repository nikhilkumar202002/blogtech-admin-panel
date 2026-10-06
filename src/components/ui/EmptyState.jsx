import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display matching your current query.',
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '420px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: '16px',
        }}
      >
        <Icon size={24} />
      </div>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#0f172a',
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: '#64748b',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" icon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
