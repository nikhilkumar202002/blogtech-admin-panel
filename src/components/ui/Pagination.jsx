import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between p-3.5 px-4 border-t border-slate-200 bg-white text-[13px] text-slate-600 rounded-b-xl flex-wrap gap-3">
      <div className="flex items-center gap-4">
        <span>
          Showing <strong className="text-slate-900">{startItem}</strong> - <strong className="text-slate-900">{endItem}</strong> of{' '}
          <strong className="text-slate-900">{totalItems}</strong> entries
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="py-1 px-2 rounded-md border border-slate-300 bg-white text-xs text-slate-900 cursor-pointer outline-none focus:border-indigo-600"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className={`p-1.5 rounded-md border border-slate-200 bg-white flex items-center transition-colors ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`py-1.5 px-2.5 rounded-md border border-slate-200 bg-white flex items-center gap-1 text-[13px] transition-colors ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span className="py-1 px-3 font-semibold text-slate-900 text-[13px]">
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`py-1.5 px-2.5 rounded-md border border-slate-200 bg-white flex items-center gap-1 text-[13px] transition-colors ${
            currentPage >= totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`p-1.5 rounded-md border border-slate-200 bg-white flex items-center transition-colors ${
            currentPage >= totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
