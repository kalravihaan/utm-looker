import React, { useRef } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { exportCSV, exportConfig, filterData } from '../utils/dataManager';

export default function TopBar({ config }) {
  const {
    activeBrandId, setActiveBrand, editMode, toggleEditMode,
    uploadData, uploading, getActiveProject, loadConfigFromFile,
  } = useDashboardStore();
  const activeProject = getActiveProject();
  const fileRef = useRef(null);
  const configFileRef = useRef(null);

  const brandColors = {
    overall: '#818cf8',
    sangria: '#f472b6',
    hop: '#c9973a',
    aay: '#60a5fa',
    ar: '#fb923c',
  };

  const handleExportCSV = () => {
    const data = activeProject?.data || [];
    const brand = config.brands.find(b => b.id === activeBrandId);
    const filtered = filterData(data, brand);
    exportCSV(filtered.length ? filtered : data, `${activeBrandId}-data.csv`);
  };

  const handleSave = () => {
    exportConfig(config, activeProject?.data || []);
  };

  const handleLoadConfig = (e) => {
    const file = e.target.files[0];
    if (file) loadConfigFromFile(file);
    e.target.value = '';
  };

  return (
    <header
      className="sticky top-0 z-[1000] flex items-center border-b border-[#1a1a2e] shadow-[0_2px_12px_rgba(0,0,0,0.5)] overflow-x-auto"
      style={{ background: '#0a0a14', padding: '0 24px' }}
    >
      {/* Logo */}
      <div
        className="text-[#555] font-serif text-[12px] font-bold tracking-[0.1em] uppercase py-[14px] pr-5 mr-1 border-r border-[#222] whitespace-nowrap shrink-0"
      >
        {config.title?.split('FY')[0]?.trim() || 'UTM'} · FY 25–26
      </div>

      {/* Brand tabs */}
      <nav className="flex items-center overflow-x-auto flex-1">
        {config.brands.map(brand => {
          const isActive = brand.id === activeBrandId;
          const color = brand.color || brandColors[brand.id] || '#818cf8';
          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className="px-4 py-[14px] text-[11px] font-semibold bg-transparent border-none border-b-[3px] cursor-pointer whitespace-nowrap font-sans transition-all duration-200"
              style={{
                color: isActive ? color : '#444',
                borderBottomColor: isActive ? color : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {brand.navLabel || brand.label}
            </button>
          );
        })}
      </nav>

      {/* Action buttons */}
      <div className="flex items-center gap-2 ml-4 shrink-0">
        {/* Upload data */}
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => { if (e.target.files[0]) uploadData(e.target.files[0]); e.target.value = ''; }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
          style={{ background: '#1a1a2e', color: '#94a3b8', border: '1px solid #2a2a3e' }}
          title="Upload Data Source (CSV or Excel)"
        >
          <UploadIcon />
          {uploading ? 'Loading…' : 'Update Data'}
        </button>

        {/* Export CSV */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
          style={{ background: '#1a1a2e', color: '#94a3b8', border: '1px solid #2a2a3e' }}
          title="Export current data as CSV"
        >
          <DownloadIcon />
          Export CSV
        </button>

        {/* Load config */}
        <input ref={configFileRef} type="file" accept=".json" className="hidden" onChange={handleLoadConfig} />
        <button
          onClick={() => configFileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
          style={{ background: '#1a1a2e', color: '#94a3b8', border: '1px solid #2a2a3e' }}
          title="Load saved dashboard config"
        >
          <FolderIcon />
          Load
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
          style={{ background: '#1a1a2e', color: '#94a3b8', border: '1px solid #2a2a3e' }}
          title="Save Dashboard Config + Data"
        >
          <SaveIcon />
          Save
        </button>

        {/* Edit toggle */}
        <button
          onClick={toggleEditMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
          style={{
            background: editMode ? '#4f46e5' : '#1a1a2e',
            color: editMode ? '#fff' : '#94a3b8',
            border: `1px solid ${editMode ? '#6366f1' : '#2a2a3e'}`,
          }}
          title="Toggle Edit Mode"
        >
          <EditIcon />
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>
    </header>
  );
}

const UploadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);

const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
