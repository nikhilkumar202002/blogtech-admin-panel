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
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Bulk actions banner if items are selected */}
      {selectedRows.length > 0 && (
        <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between text-[13px] text-indigo-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} />
            <span>
              <strong className="font-semibold">{selectedRows.length}</strong> item{selectedRows.length > 1 ? 's' : ''} selected
            </span>
          </div>
          {bulkActions ? (
            <div className="flex gap-2">{bulkActions}</div>
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
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {selectable && (
                <th className="w-11 px-4 py-3 text-center">
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
                    className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  style={{ width: col.width || 'auto' }}
                  className={`px-4 py-3 font-semibold text-slate-600 whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none' : 'cursor-default select-auto'}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    className={`inline-flex items-center gap-1 ${
                      col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className={sortKey === col.key ? 'text-indigo-600' : 'text-slate-300'}>
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
                <tr key={idx} className="border-b border-slate-100">
                  {selectable && (
                    <td className="px-4 py-3.5 text-center">
                      <Skeleton width="16px" height="16px" radius="4px" />
                    </td>
                  )}
                  {columns.map((c, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <Skeleton width={cIdx === 0 ? '70%' : '50%'} height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? columns.length + 1 : columns.length}
                  className="p-12 text-center"
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
                    className={`border-b border-slate-100 transition-colors ${
                      isSelected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5 text-center">
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
                          className="w-4 h-4 accent-indigo-600 cursor-pointer rounded"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key || col.header}
                        className={`px-4 py-3.5 text-slate-900 align-middle ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        }`}
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

export default DataTable;
