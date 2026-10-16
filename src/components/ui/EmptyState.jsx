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
    <div className="flex flex-col items-center justify-center py-10 px-5 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-xs">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">
        {title}
      </h3>
      <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          icon={actionIcon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
