import React, { useMemo, useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { groupAggregate, formatValue } from '../../utils/dataManager';

export default function TableWidget({ widget, data, brand, tab }) {
  const { editMode, setSelectedWidget, selectedWidgetId, deleteWidget } = useDashboardStore();
  const isSelected = selectedWidgetId === widget.id;
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('desc');

  const rows = useMemo(() => {
    if (!data.length || !widget.groupBy || !widget.columns?.length) return [];
    return groupAggregate(data, widget.groupBy, widget.columns);
  }, [data, widget]);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortField] ?? 0;
      const bv = b[sortField] ?? 0;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [filtered, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div
      className={`bg-white rounded-[10px] overflow-hidden shadow-sm border edit-mode-widget ${isSelected ? 'outline outline-2 outline-indigo-400' : ''}`}
      style={{ borderColor: '#f0f0f0' }}
      onClick={() => editMode && setSelectedWidget(widget.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-gray-100">
        <span className="text-[11px] font-bold text-[#444] uppercase tracking-[0.04em]">
          {widget.title}
        </span>
        <div className="flex items-center gap-2">
          {data.length > 0 && (
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-[12px] px-2.5 py-1 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none w-44"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              onClick={e => e.stopPropagation()}
            />
          )}
          {editMode && (
            <div className="flex gap-1">
              <button
                onClick={e => { e.stopPropagation(); setSelectedWidget(widget.id); }}
                className="text-[10px] px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-400 hover:bg-indigo-50"
              >
                Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); deleteWidget(brand.id, tab.id, widget.id); }}
                className="text-[10px] px-1.5 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {!data.length ? (
          <div className="text-center py-10 text-gray-300 text-[12px]">Upload data to see table</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-[12px]">No results</div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {widget.columns.map(col => (
                  <th
                    key={col.field}
                    className={`px-2.5 py-2 text-left text-[10px] font-semibold tracking-[0.05em] uppercase text-gray-400 border-b border-gray-100 bg-gray-50 whitespace-nowrap cursor-pointer hover:text-gray-600 select-none ${col.align === 'right' ? 'text-right' : ''}`}
                    onClick={() => handleSort(col.field)}
                  >
                    {col.label}
                    {sortField === col.field && (
                      <span className="ml-1 text-gray-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                  {widget.columns.map(col => (
                    <td
                      key={col.field}
                      className={`px-2.5 py-1.5 align-middle ${col.align === 'right' ? 'text-right font-mono text-[11px]' : ''}`}
                      style={{ fontFamily: col.align === 'right' ? "'DM Mono', monospace" : undefined }}
                    >
                      {col.format
                        ? formatValue(row[col.field], col.format)
                        : String(row[col.field] ?? '–')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="px-3.5 py-1.5 text-[10px] text-gray-400 border-t border-gray-50">
          {sorted.length} rows{search && ` (filtered from ${rows.length})`}
        </div>
      )}
    </div>
  );
}
