import React, { useRef } from 'react';
import { useDashboardStore } from './store/dashboardStore';
import TopBar from './components/TopBar';
import BrandSection from './components/BrandSection';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/editor/EditSidebar';

export default function App() {
  const { activeProject, activeBrandId, editMode, projects, activeProjectId } = useDashboardStore();
  const config = activeProject?.config;
  const data = activeProject?.data || [];

  if (!config) return null;

  const activeBrand = config.brands.find(b => b.id === activeBrandId) || config.brands[0];

  return (
    <div className={`min-h-screen bg-[#f1f5f9] ${editMode ? 'edit-mode' : ''}`}>
      <TopBar config={config} />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {config.brands.map(brand => (
            <div
              key={brand.id}
              style={{ display: brand.id === activeBrandId ? 'block' : 'none' }}
            >
              <BrandSection brand={brand} data={data} />
            </div>
          ))}
        </div>
      </div>
      <EditSidebar />
    </div>
  );
}
