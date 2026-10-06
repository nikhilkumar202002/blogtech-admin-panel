import React from 'react';
import { AlertTriangle, Trash2, EyeOff, FileText, Info, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'delete' | 'close-job' | 'unpublish'
  icon,
  isLoading = false,
}) => {
  // Preset Variants Configuration based on Prompt Specs
  let modalTitle = title;
  let modalMessage = message;
  let modalConfirmLabel = confirmLabel;
  let modalType = type;
  let modalIcon = icon;

  if (type === 'delete') {
    modalTitle = title || 'Delete Job Opening?';
    modalMessage =
      message ||
      'This action cannot be undone. The selected job opening will be permanently deleted.';
    modalConfirmLabel = confirmLabel || 'Delete';
    modalType = 'danger';
    modalIcon = modalIcon || <Trash2 size={24} />;
  } else if (type === 'close-job') {
    modalTitle = title || 'Close Job Opening?';
    modalMessage =
      message ||
      'This position will no longer appear as an active vacancy on the website.';
    modalConfirmLabel = confirmLabel || 'Close Position';
    modalType = 'warning';
    modalIcon = modalIcon || <EyeOff size={24} />;
  } else if (type === 'unpublish') {
    modalTitle = title || 'Unpublish Article?';
    modalMessage =
      message ||
      'This article will be removed from the public website but retained in the admin panel.';
    modalConfirmLabel = confirmLabel || 'Unpublish';
    modalType = 'warning';
    modalIcon = modalIcon || <FileText size={24} />;
  } else {
    modalTitle = title || 'Are you sure?';
    modalMessage =
      message ||
      'This action cannot be undone. Please confirm if you wish to proceed.';
    modalConfirmLabel = confirmLabel || 'Confirm Action';
  }

  // Render Icon Badge with soft backgrounds & rounded borders
  const renderIconBadge = () => {
    if (modalType === 'danger') {
      return (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            marginBottom: '16px',
            flexShrink: 0,
          }}
        >
          {modalIcon || <AlertTriangle size={24} />}
        </div>
      );
    }
    if (modalType === 'warning') {
      return (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706',
            marginBottom: '16px',
            flexShrink: 0,
          }}
        >
          {modalIcon || <AlertCircle size={24} />}
        </div>
      );
    }
    return (
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#eef2ff',
          border: '1px solid #c7d2fe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4f46e5',
          marginBottom: '16px',
          flexShrink: 0,
        }}
      >
        {modalIcon || <Info size={24} />}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '8px 4px 4px 4px',
        }}
      >
        {renderIconBadge()}

        {/* Modal Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.015em',
            lineHeight: 1.3,
          }}
        >
          {modalTitle}
        </h3>

        {/* Modal Message Description */}
        <p
          style={{
            fontSize: '13.5px',
            color: '#64748b',
            margin: '0 0 24px 0',
            lineHeight: 1.5,
            maxWidth: '360px',
          }}
        >
          {modalMessage}
        </p>

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={isLoading}
            fullWidth
          >
            {cancelLabel}
          </Button>
          <Button
            variant={modalType === 'danger' ? 'danger' : 'accent'}
            onClick={onConfirm}
            isLoading={isLoading}
            fullWidth
          >
            {modalConfirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// PRESET MODAL CONVENIENCE EXPORTS
export const DeleteConfirmModal = (props) => (
  <ConfirmDialog type="delete" {...props} />
);

export const CloseJobConfirmModal = (props) => (
  <ConfirmDialog type="close-job" {...props} />
);

export const UnpublishBlogConfirmModal = (props) => (
  <ConfirmDialog type="unpublish" {...props} />
);
