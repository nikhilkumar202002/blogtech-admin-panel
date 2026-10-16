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
  type = 'danger',
  icon,
  isLoading = false,
}) => {
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

  const renderIconBadge = () => {
    if (modalType === 'danger') {
      return (
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shrink-0 shadow-xs">
          {modalIcon || <AlertTriangle size={24} />}
        </div>
      );
    }
    if (modalType === 'warning') {
      return (
        <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shrink-0 shadow-xs">
          {modalIcon || <AlertCircle size={24} />}
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 shrink-0 shadow-xs">
        {modalIcon || <Info size={24} />}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="420px">
      <div className="flex flex-col items-center text-center pt-2 px-1 pb-1">
        {renderIconBadge()}

        {/* Modal Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight leading-snug">
          {modalTitle}
        </h3>

        {/* Modal Message Description */}
        <p className="text-[13.5px] text-slate-500 mb-6 leading-relaxed max-w-sm">
          {modalMessage}
        </p>

        {/* Modal Actions */}
        <div className="flex gap-3 w-full">
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

export const DeleteConfirmModal = (props) => (
  <ConfirmDialog type="delete" {...props} />
);

export const CloseJobConfirmModal = (props) => (
  <ConfirmDialog type="close-job" {...props} />
);

export const UnpublishBlogConfirmModal = (props) => (
  <ConfirmDialog type="unpublish" {...props} />
);

export default ConfirmDialog;
