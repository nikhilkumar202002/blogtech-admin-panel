import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, CheckSquare } from 'lucide-react';
import { Pagination } from './Pagination';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  selectable = true,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  bulkActions = null,
  emptyTitle = 'No data found',
  emptyDescription = 'Try adjusting your search or filter parameters.',
  emptyIcon,
  onEmptyAction,
  emptyActionLabel,
  // Pagination props
  pagination = true,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Handle column sorting
  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Sort data if sortKey is set
  let processedData = [...data];
  if (sortKey) {
    processedData.sort((a, b) => {
      let valA = a[sortKey] ?? '';
      let valB = b[sortKey] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination slicing
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = pagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData;

  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row[keyField]));

  const isSomeSelected =
    selectedRows.length > 0 && !allSelected;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(16, 24, 40, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Bulk actions banner if items are selected */}
      {selectedRows.length > 0 && (
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#eef2ff',
            borderBottom: '1px solid #c7d2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#3730a3',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={16} />
            <span>
              <strong>{selectedRows.length}</strong> item{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
          {bulkActions ? (
            <div style={{ display: 'flex', gap: '8px' }}>{bulkActions}</div>
          ) : (
            <Button
              size="sm"
              variant="danger"
              icon={Trash2}
              onClick={() => onSelectAll && onSelectAll([])}
            >
              Deselect All
            </Button>
          )}
        </div>
      )}

      {/* Main Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {selectable && (
                <th
                  style={{
                    width: '44px',
                    padding: '12px 16px',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = paginatedData.map((row) => row[keyField]);
                        const combined = Array.from(new Set([...selectedRows, ...pageIds]));
                        onSelectAll && onSelectAll(combined);
                      } else {
                        const pageIds = paginatedData.map((row) => row[keyField]);
                        const remaining = selectedRows.filter((id) => !pageIds.includes(id));
                        onSelectAll && onSelectAll(remaining);
                      }
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#4f46e5',
                      cursor: 'pointer',
                      borderRadius: '4px',
                    }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: '#475569',
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                    whiteSpace: 'nowrap',
                    userSelect: col.sortable ? 'none' : 'auto',
                    cursor: col.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span style={{ color: sortKey === col.key ? '#4f46e5' : '#cbd5e1' }}>
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp size={13} />
                          ) : (
                            <ArrowDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {selectable && (
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <Skeleton width="16px" height="16px" radius="4px" />
                    </td>
                  )}
                  {columns.map((c, cIdx) => (
                    <td key={cIdx} style={{ padding: '14px 16px' }}>
                      <Skeleton width={cIdx === 0 ? '70%' : '50%'} height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  style={{ padding: '48px 16px', textAlign: 'center' }}
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const isSelected = selectedRows.includes(row[keyField]);
                return (
                  <tr
                    key={row[keyField] || rIdx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    {selectable && (
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onSelectRow && onSelectRow([...selectedRows, row[keyField]]);
                            } else {
                              onSelectRow &&
                                onSelectRow(selectedRows.filter((id) => id !== row[keyField]));
                            }
                          }}
                          style={{
                            width: '16px',
                            height: '16px',
                            accentColor: '#4f46e5',
                            cursor: 'pointer',
                            borderRadius: '4px',
                          }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key || col.header}
                        style={{
                          padding: '14px 16px',
                          color: '#0f172a',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render ? col.render(row, rIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !isLoading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};
