import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import WidgetEditor from './WidgetEditor';
import BrandEditor from './BrandEditor';

export default function EditSidebar() {
  const { editMode, selectedWidgetId, setSelectedWidget, activeBrandId, activeProject, activeTabIds } = useDashboardStore();

  if (!editMode) return null;

  const config = activeProject?.config;
  const brand = config?.brands.find(b => b.id === activeBrandId);
  const activeTabId = activeTabIds[activeBrandId] || brand?.tabs[0]?.id;
  const tab = brand?.tabs.find(t => t.id === activeTabId);
  const selectedWidget = tab?.widgets.find(w => w.id === selectedWidgetId);

  const columns = activeProject?.data?.length
    ? Object.keys(activeProject.data[0] || {})
    : [];

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 bg-black/10 z-[1999] md:hidden"
        onClick={() => setSelectedWidget(null)}
      />

      <div className={`edit-sidebar open`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
          <div>
            <div className="text-[12px] font-bold text-gray-700">
              {selectedWidget ? 'Widget Settings' : 'Brand Settings'}
            </div>
            {selectedWidget && (
              <div className="text-[10px] text-gray-400">{selectedWidget.title}</div>
            )}
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

        <div className="p-4">
          {selectedWidget ? (
            <WidgetEditor
              widget={selectedWidget}
              brandId={activeBrandId}
              tabId={activeTabId}
              availableColumns={columns}
            />
          ) : (
            <BrandEditor brand={brand} availableColumns={columns} />
          )}
        </div>
      </div>
    </>
  );
}
