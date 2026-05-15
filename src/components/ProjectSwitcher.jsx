import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import defaultConfig from '../config/defaultConfig.json';

export default function ProjectSwitcher() {
  const {
    projects, activeProjectId, setActiveProject,
    addProject, renameProject, deleteProject,
  } = useDashboardStore();

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startRename = (e, proj) => {
    e.stopPropagation();
    setEditingId(proj.id);
    setEditName(proj.name);
  };

  const commitRename = () => {
    if (editName.trim()) renameProject(editingId, editName.trim());
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (projects.length === 1) return; // keep at least one
    if (confirm('Delete this dashboard? This cannot be undone.')) deleteProject(id);
  };

  return (
    <div
      className="shrink-0 bg-white border-r border-gray-200 flex flex-col"
      style={{ width: 200, minHeight: 'calc(100vh - 50px)' }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dashboards</span>
        <span className="text-[9px] text-gray-300 font-mono">{projects.length}</span>
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto py-1">
        {projects.map(proj => {
          const isActive = proj.id === activeProjectId;
          return (
            <div
              key={proj.id}
              onClick={() => setActiveProject(proj.id)}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-indigo-50 border-r-2 border-indigo-400'
                  : 'hover:bg-gray-50 border-r-2 border-transparent'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: isActive ? '#818cf8' : '#d1d5db' }}
              />

              {editingId === proj.id ? (
                <input
                  className="flex-1 text-[11px] border border-indigo-300 rounded px-1 py-0.5 outline-none min-w-0"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className={`flex-1 text-[12px] truncate min-w-0 ${isActive ? 'text-indigo-700 font-semibold' : 'text-gray-600'}`}
                >
                  {proj.name}
                </span>
              )}

              {/* Actions (visible on hover) */}
              <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                <button
                  onClick={e => startRename(e, proj)}
                  className="p-0.5 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-100"
                  title="Rename"
                >
                  <PenIcon />
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={e => handleDelete(e, proj.id)}
                    className="p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
                    title="Delete dashboard"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add dashboard */}
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={() => addProject('New Dashboard')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-dashed border-gray-200 hover:border-indigo-200"
        >
          <PlusIcon />
          New Dashboard
        </button>
      </div>

      {/* Persistent tip */}
      <div className="px-3 pb-3 pt-1">
        <div className="text-[9px] text-gray-300 leading-tight text-center">
          Dashboards auto-save to browser storage
        </div>
      </div>
    </div>
  );
}

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PenIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);
