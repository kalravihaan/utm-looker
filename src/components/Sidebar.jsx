import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export default function Sidebar() {
  const { projects, activeProjectId, setActiveProject, addProject, renameProject, deleteProject } = useDashboardStore();
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  if (collapsed) {
    return (
      <div className="w-8 bg-white border-r border-gray-200 flex flex-col items-center pt-3 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="text-gray-400 hover:text-gray-700 p-1"
          title="Expand sidebar"
        >
          ›
        </button>
      </div>
    );
  }

  const startRename = (proj) => {
    setEditingId(proj.id);
    setEditName(proj.name);
  };

  const commitRename = () => {
    if (editName.trim()) renameProject(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="w-52 bg-white border-r border-gray-200 shrink-0 flex flex-col" style={{ minHeight: 'calc(100vh - 50px)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Dashboards</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-gray-300 hover:text-gray-500 text-xs"
        >
          ‹
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {projects.map(proj => (
          <div
            key={proj.id}
            className={`group flex items-center gap-1.5 px-3 py-2 cursor-pointer text-[12px] transition-colors ${
              proj.id === activeProjectId ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveProject(proj.id)}
          >
            <DashIcon className={proj.id === activeProjectId ? 'text-indigo-400' : 'text-gray-300'} />
            {editingId === proj.id ? (
              <input
                className="flex-1 text-[12px] border border-indigo-300 rounded px-1 py-0 outline-none"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => e.key === 'Enter' && commitRename()}
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span className="flex-1 truncate">{proj.name}</span>
            )}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button
                className="text-gray-300 hover:text-gray-600 p-0.5"
                onClick={e => { e.stopPropagation(); startRename(proj); }}
                title="Rename"
              >
                <PenIcon />
              </button>
              {projects.length > 1 && (
                <button
                  className="text-gray-300 hover:text-red-500 p-0.5"
                  onClick={e => { e.stopPropagation(); deleteProject(proj.id); }}
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={() => addProject('New Dashboard')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <PlusIcon />
          New Dashboard
        </button>
      </div>
    </div>
  );
}

const DashIcon = ({ className }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PenIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);
