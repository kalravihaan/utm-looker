import React, { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import WidgetEditor from './WidgetEditor';
import BrandEditor from './BrandEditor';

export default function EditSidebar() {
  const { editMode, selectedWidgetId, setSelectedWidget, activeBrandId, getActiveProject, activeTabIds } = useDashboardStore();
  const activeProject = getActiveProject();
  const [tab, setTab] = useState('data');

  if (!editMode) return null;

  const config = activeProject?.config;
  const brand = config?.brands.find(b => b.id === activeBrandId);
  const activeTabId = activeTabIds[activeBrandId] || brand?.tabs[0]?.id;
  const activeTab = brand?.tabs.find(t => t.id === activeTabId);
  const selectedWidget = activeTab?.widgets.find(w => w.id === selectedWidgetId);

  const allColumns = activeProject?.data?.length ? Object.keys(activeProject.data[0]) : [];
  const calcFields = config?.calculatedFields || [];
  const availableColumns = [...allColumns, ...calcFields.map(cf => cf.name)];

  const Tab = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className="flex-1 py-2 text-[11px] font-semibold transition-colors"
      style={{
        color: tab === id ? '#4f46e5' : '#94a3b8',
        borderBottom: `2px solid ${tab === id ? '#4f46e5' : 'transparent'}`,
        background: 'none',
        cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed top-0 right-0 bottom-0 bg-white border-l border-gray-200 shadow-xl z-[2000] flex flex-col"
      style={{ width: 340, top: 50 }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[12px] font-bold text-gray-700">
            {selectedWidget ? selectedWidget.title || 'Widget' : brand?.label || 'Brand'}
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">
            {selectedWidget ? `${selectedWidget.type} · ${selectedWidget.chartType || 'table'}` : 'Brand Settings'}
          </div>
        </div>
        {selectedWidget && (
          <button
            onClick={() => setSelectedWidget(null)}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Tabs */}
      {selectedWidget && (
        <div className="flex border-b border-gray-100 shrink-0">
          <Tab id="data" label="Data" />
          <Tab id="style" label="Style" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedWidget ? (
          <WidgetEditor
            widget={selectedWidget}
            brandId={activeBrandId}
            tabId={activeTabId}
            availableColumns={availableColumns}
            activeTab={tab}
          />
        ) : (
          <BrandEditor brand={brand} availableColumns={availableColumns} />
        )}
      </div>
    </div>
  );
}
