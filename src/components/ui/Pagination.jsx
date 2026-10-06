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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        fontSize: '13px',
        color: '#475569',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>
          Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{' '}
          <strong>{totalItems}</strong> entries
        </span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
              }}
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: currentPage === 1 ? '#cbd5e1' : '#334155',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
          }}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <span
          style={{
            padding: '4px 12px',
            fontWeight: 600,
            color: '#0f172a',
            fontSize: '13px',
          }}
        >
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
