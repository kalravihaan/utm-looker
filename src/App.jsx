import React, { useMemo } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import { applyCalculatedFields } from './utils/dataManager';
import TopBar from './components/TopBar';
import BrandSection from './components/BrandSection';
import ProjectSwitcher from './components/ProjectSwitcher';
import DataPanel from './components/DataPanel';
import EditSidebar from './components/editor/EditSidebar';

export default function App() {
  const store = useDashboardStore();
  const { activeBrandId, editMode } = store;
  const activeProject = store.getActiveProject();
  const config = activeProject?.config;
  const rawData = store.getActiveData();

  // Enrich data with calculated fields
  const data = useMemo(
    () => applyCalculatedFields(rawData, config?.calculatedFields),
    [rawData, config?.calculatedFields]
  );

  if (!config) return null;

  const rightOffset = editMode ? 340 : 0;

  return (
    <div className={`min-h-screen bg-[#f1f5f9] ${editMode ? 'edit-mode' : ''}`}>
      <TopBar config={config} />

      <div className="flex" style={{ minHeight: 'calc(100vh - 50px)' }}>
        {/* Left: project switcher is ALWAYS visible */}
        <ProjectSwitcher />

        {/* Left: data/field panel only in edit mode */}
        {editMode && <DataPanel config={config} data={data} />}

        {/* Main dashboard canvas */}
        <div className="flex-1 min-w-0" style={{ marginRight: rightOffset }}>
          {config.brands.map(brand => (
            <div key={brand.id} style={{ display: brand.id === activeBrandId ? 'block' : 'none' }}>
              <BrandSection brand={brand} data={data} rosConfig={config.rosConfig} />
            </div>
          ))}
        </div>
      </div>

      {/* Right: properties panel, only in edit mode */}
      <EditSidebar />
    </div>
  );
}
