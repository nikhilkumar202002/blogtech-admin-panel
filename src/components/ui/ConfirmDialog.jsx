import React from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm if you wish to proceed.',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={22} />
          </div>
        );
      case 'warning':
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              marginBottom: '16px',
            }}
          >
            <AlertTriangle size={22} />
          </div>
        );
      default:
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#eef2ff',
              border: '1px solid #c7d2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              marginBottom: '16px',
            }}
          >
            <Info size={22} />
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="440px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {getIcon()}
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} isDisabled={isLoading} fullWidth>
            {cancelLabel}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
