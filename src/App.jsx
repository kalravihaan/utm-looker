import React, { useMemo } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import { applyCalculatedFields } from './utils/dataManager';
import TopBar from './components/TopBar';
import BrandSection from './components/BrandSection';
import Sidebar from './components/Sidebar';
import DataPanel from './components/DataPanel';
import EditSidebar from './components/editor/EditSidebar';

export default function App() {
  const store = useDashboardStore();
  const { activeBrandId, editMode } = store;
  const activeProject = store.getActiveProject();
  const config = activeProject?.config;
  const rawData = activeProject?.data || [];

  // Enrich data with calculated fields
  const data = useMemo(
    () => applyCalculatedFields(rawData, config?.calculatedFields),
    [rawData, config?.calculatedFields]
  );

  if (!config) return null;

  return (
    <div className={`min-h-screen bg-[#f1f5f9] ${editMode ? 'edit-mode' : ''}`}>
      <TopBar config={config} />
      <div className="flex">
        {editMode
          ? <DataPanel config={config} data={data} />
          : <Sidebar />
        }
        <div className="flex-1 min-w-0" style={{ marginRight: editMode ? 340 : 0 }}>
          {config.brands.map(brand => (
            <div key={brand.id} style={{ display: brand.id === activeBrandId ? 'block' : 'none' }}>
              <BrandSection brand={brand} data={data} />
            </div>
          ))}
        </div>
      </div>
      <EditSidebar />
    </div>
  );
}
