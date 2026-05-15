import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import ChartWidget from './widgets/ChartWidget';
import TableWidget from './widgets/TableWidget';

export default function TabContent({ brand, tab, data }) {
  const { editMode, addWidget, deleteTab, renameTab } = useDashboardStore();

  return (
    <div className="px-11 py-4 max-w-[1440px] mx-auto">
      {/* Edit tab controls */}
      {editMode && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-indigo-200">
          <span className="text-[11px] text-indigo-400 font-semibold">Tab: {tab.label}</span>
          <button
            onClick={() => {
              const name = prompt('Tab name:', tab.label);
              if (name) renameTab(brand.id, tab.id, name);
            }}
            className="text-[11px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-500 hover:bg-indigo-50"
          >
            Rename
          </button>
          <button
            onClick={() => { if (confirm('Delete this tab?')) deleteTab(brand.id, tab.id); }}
            className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50"
          >
            Delete Tab
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => addWidget(brand.id, tab.id, 'chart')}
              className="text-[11px] px-3 py-1 rounded-md font-semibold"
              style={{ background: '#818cf8', color: '#fff' }}
            >
              + Chart
            </button>
            <button
              onClick={() => addWidget(brand.id, tab.id, 'table')}
              className="text-[11px] px-3 py-1 rounded-md font-semibold"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              + Table
            </button>
          </div>
        </div>
      )}

      {/* Widget grid */}
      {tab.widgets.length === 0 && !editMode ? (
        <div className="text-center py-16 text-gray-400 text-[13px]">
          No widgets configured for this tab.
          {editMode && ' Use the buttons above to add charts or tables.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 mb-4">
          {tab.widgets.map(widget => {
            const spanClass = widget.span === 2 ? 'col-span-2' : 'col-span-1';
            return (
              <div key={widget.id} className={`${spanClass} widget-container`}>
                {widget.type === 'table' ? (
                  <TableWidget widget={widget} data={data} brand={brand} tab={tab} />
                ) : (
                  <ChartWidget widget={widget} data={data} brand={brand} tab={tab} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
