import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { filterByTier } from '../utils/dataManager';
import ChartWidget from './widgets/ChartWidget';
import TableWidget from './widgets/TableWidget';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableWidget({ widget, brand, tab, data }) {
  const { editMode } = useDashboardStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: widget.span === 2 ? 'span 2' : 'span 1',
  };

  return (
    <div ref={setNodeRef} style={style} className="widget-container">
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="drag-handle absolute top-2 left-2 z-10 text-gray-300 cursor-grab active:cursor-grabbing"
          style={{ opacity: 1 }}
          title="Drag to reorder"
        >
          ⠿
        </div>
      )}
      {widget.type === 'table' ? (
        <TableWidget widget={widget} data={data} brand={brand} tab={tab} />
      ) : (
        <ChartWidget widget={widget} data={data} brand={brand} tab={tab} />
      )}
    </div>
  );
}

export default function TabContent({ brand, tab, data }) {
  const { editMode, addWidget, deleteTab, renameTab, reorderWidgets } = useDashboardStore();

  // Apply tier filter if this tab has one
  const tabData = tab.tierFilter ? filterByTier(data, tab.tierFilter) : data;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tab.widgets.findIndex(w => w.id === active.id);
      const newIndex = tab.widgets.findIndex(w => w.id === over.id);
      reorderWidgets(brand.id, tab.id, arrayMove(tab.widgets, oldIndex, newIndex));
    }
  };

  // Tier info header
  const TIER_INFO = {
    'very-fast': { label: 'Very Fast', color: '#059669', bg: '#ecfdf5', desc: 'ROS > 1.5' },
    fast: { label: 'Fast', color: '#16a34a', bg: '#f0fdf4', desc: 'ROS 0.7–1.5' },
    moderate: { label: 'Moderate', color: '#d97706', bg: '#fffbeb', desc: 'ROS 0.3–0.7' },
    slow: { label: 'Slow', color: '#dc2626', bg: '#fef2f2', desc: 'ROS > 0–0.3' },
    dead: { label: 'Dead', color: '#6b7280', bg: '#f9fafb', desc: 'ROS = 0' },
  };
  const tierInfo = tab.tierFilter ? TIER_INFO[tab.tierFilter] : null;

  return (
    <div className="px-11 py-4 max-w-[1440px] mx-auto">
      {/* Tier info banner */}
      {tierInfo && (
        <div
          className="rounded-lg px-4 py-3 mb-4 flex items-center gap-3 border"
          style={{ background: tierInfo.bg, borderColor: `${tierInfo.color}40` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: tierInfo.color }} />
          <div>
            <span className="font-bold text-[13px]" style={{ color: tierInfo.color }}>{tierInfo.label} Styles</span>
            <span className="text-[11px] text-gray-500 ml-2">{tierInfo.desc}</span>
          </div>
          {data.length > 0 && (
            <div className="ml-auto text-[11px] font-mono text-gray-500">
              {tabData.length} rows
              {tabData.length !== data.length && ` (filtered from ${data.length})`}
            </div>
          )}
        </div>
      )}

      {/* Edit tab controls */}
      {editMode && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-indigo-200">
          <span className="text-[11px] text-indigo-400 font-semibold">Tab: {tab.label}</span>
          <button onClick={() => { const n = prompt('Tab name:', tab.label); if (n) renameTab(brand.id, tab.id, n); }}
            className="text-[11px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-500 hover:bg-indigo-50">Rename</button>
          <button onClick={() => { if (confirm('Delete this tab?')) deleteTab(brand.id, tab.id); }}
            className="text-[11px] px-2 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50">Delete</button>
          <div className="ml-auto flex gap-2">
            <button onClick={() => addWidget(brand.id, tab.id, 'chart')}
              className="text-[11px] px-3 py-1 rounded-md font-semibold text-white" style={{ background: '#818cf8' }}>+ Chart</button>
            <button onClick={() => addWidget(brand.id, tab.id, 'table')}
              className="text-[11px] px-3 py-1 rounded-md font-semibold text-white" style={{ background: '#6366f1' }}>+ Table</button>
          </div>
        </div>
      )}

      {/* Widget grid with drag-and-drop */}
      {tab.widgets.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-[13px]">
          No widgets on this tab. {editMode ? 'Use "+ Chart" or "+ Table" above.' : ''}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tab.widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3.5 mb-4" style={{ position: 'relative' }}>
              {tab.widgets.map(widget => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  brand={brand}
                  tab={tab}
                  data={tabData}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
