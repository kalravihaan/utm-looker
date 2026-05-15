import { create } from 'zustand';
import defaultConfig from '../config/defaultConfig.json';
import { parseFile, filterData } from '../utils/dataManager';

const generateId = () => `w-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const useDashboardStore = create((set, get) => ({
  // Dashboard projects list
  projects: [{ id: 'default', name: 'UTM FY 2025-26', config: defaultConfig, data: [] }],
  activeProjectId: 'default',

  // UI state
  activeBrandId: 'overall',
  activeTabIds: {},      // brandId → tabId
  editMode: false,
  selectedWidgetId: null,
  uploading: false,
  uploadError: null,

  // Derived data access — use getActiveProject() instead of a JS getter
  // (Zustand flattens getters to plain values on set(), breaking reactivity)
  getActiveProject: () => {
    const s = get();
    return s.projects.find(p => p.id === s.activeProjectId) || s.projects[0];
  },

  // Project management
  addProject: (name) => {
    const id = `proj-${Date.now()}`;
    const newConfig = { ...defaultConfig, id, title: name };
    set(s => ({
      projects: [...s.projects, { id, name, config: newConfig, data: [] }],
      activeProjectId: id,
    }));
  },

  setActiveProject: (id) => set({ activeProjectId: id, activeBrandId: 'overall', activeTabIds: {} }),

  renameProject: (id, name) => set(s => ({
    projects: s.projects.map(p => p.id === id ? { ...p, name } : p),
  })),

  deleteProject: (id) => set(s => {
    const projects = s.projects.filter(p => p.id !== id);
    return {
      projects: projects.length ? projects : [{ id: 'default', name: 'New Dashboard', config: defaultConfig, data: [] }],
      activeProjectId: projects[0]?.id || 'default',
    };
  }),

  // Data upload
  uploadData: async (file) => {
    set({ uploading: true, uploadError: null });
    try {
      const data = await parseFile(file);
      set(s => ({
        projects: s.projects.map(p =>
          p.id === s.activeProjectId ? { ...p, data } : p
        ),
        uploading: false,
      }));
    } catch (err) {
      set({ uploading: false, uploadError: err.message });
    }
  },

  clearUploadError: () => set({ uploadError: null }),

  // Navigation
  setActiveBrand: (brandId) => set({ activeBrandId: brandId, selectedWidgetId: null }),

  setActiveTab: (brandId, tabId) => set(s => ({
    activeTabIds: { ...s.activeTabIds, [brandId]: tabId },
  })),

  // Edit mode
  toggleEditMode: () => set(s => ({ editMode: !s.editMode, selectedWidgetId: null })),
  setSelectedWidget: (id) => set({ selectedWidgetId: id }),

  // Config mutations
  updateConfig: (updater) => set(s => ({
    projects: s.projects.map(p =>
      p.id === s.activeProjectId
        ? { ...p, config: updater(p.config) }
        : p
    ),
  })),

  // Dashboard title
  setDashboardTitle: (title) => get().updateConfig(c => ({ ...c, title })),

  // Brand mutations
  addBrand: () => {
    const id = `brand-${Date.now()}`;
    const newBrand = {
      id,
      navLabel: 'New Brand',
      label: 'New Brand',
      color: '#818cf8',
      gradient: 'linear-gradient(135deg,#0f172a,#1e1b4b,#312e81)',
      eyebrow: 'New Dashboard',
      subtitle: 'Brand Performance',
      filter: null,
      filterField: 'Brand',
      kpis: [
        { id: `kpi-${generateId()}`, label: 'Sales Qty', field: 'Total Sales Qty', aggregation: 'sum', format: 'compact', color: '#c7d2fe' },
        { id: `kpi-${generateId()}`, label: 'Revenue', field: 'Revenue', aggregation: 'sum', format: 'currency', color: '#c7d2fe' },
      ],
      tabs: [
        {
          id: 'overview',
          label: 'Overview',
          widgets: [],
        },
      ],
    };
    get().updateConfig(c => ({ ...c, brands: [...c.brands, newBrand] }));
    set({ activeBrandId: id });
  },

  deleteBrand: (brandId) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.filter(b => b.id !== brandId),
    }));
    set(s => ({
      activeBrandId: s.activeBrandId === brandId
        ? (get().getActiveProject()?.config.brands[0]?.id || 'overall')
        : s.activeBrandId,
    }));
  },

  updateBrand: (brandId, patch) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b => b.id === brandId ? { ...b, ...patch } : b),
    }));
  },

  // Tab mutations
  addTab: (brandId) => {
    const tab = { id: `tab-${Date.now()}`, label: 'New Tab', widgets: [] };
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId ? { ...b, tabs: [...b.tabs, tab] } : b
      ),
    }));
  },

  deleteTab: (brandId, tabId) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? { ...b, tabs: b.tabs.filter(t => t.id !== tabId) }
          : b
      ),
    }));
  },

  renameTab: (brandId, tabId, label) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? { ...b, tabs: b.tabs.map(t => t.id === tabId ? { ...t, label } : t) }
          : b
      ),
    }));
  },

  // Widget mutations
  addWidget: (brandId, tabId, widgetType = 'chart') => {
    const id = generateId();
    const widget = widgetType === 'table'
      ? {
          id,
          type: 'table',
          title: 'New Table',
          span: 2,
          groupBy: 'Brand',
          columns: [
            { field: 'Brand', label: 'Brand' },
            { field: 'Total Sales Qty', label: 'Sales Qty', aggregation: 'sum', align: 'right', format: 'compact' },
          ],
        }
      : {
          id,
          type: 'chart',
          title: 'New Chart',
          chartType: 'bar',
          span: 1,
          height: 'md',
          dataMapping: { xAxis: 'Month', yAxis: 'Total Sales Qty', groupBy: null },
          aggregation: 'sum',
          sortBy: 'Month Numbering',
          color: '#818cf8',
        };

    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? {
              ...b,
              tabs: b.tabs.map(t =>
                t.id === tabId ? { ...t, widgets: [...t.widgets, widget] } : t
              ),
            }
          : b
      ),
    }));
    set({ selectedWidgetId: id });
  },

  updateWidget: (brandId, tabId, widgetId, patch) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? {
              ...b,
              tabs: b.tabs.map(t =>
                t.id === tabId
                  ? { ...t, widgets: t.widgets.map(w => w.id === widgetId ? { ...w, ...patch } : w) }
                  : t
              ),
            }
          : b
      ),
    }));
  },

  deleteWidget: (brandId, tabId, widgetId) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? {
              ...b,
              tabs: b.tabs.map(t =>
                t.id === tabId
                  ? { ...t, widgets: t.widgets.filter(w => w.id !== widgetId) }
                  : t
              ),
            }
          : b
      ),
    }));
    set({ selectedWidgetId: null });
  },

  reorderWidgets: (brandId, tabId, newWidgets) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? { ...b, tabs: b.tabs.map(t => t.id === tabId ? { ...t, widgets: newWidgets } : t) }
          : b
      ),
    }));
  },

  // KPI mutations
  addKPI: (brandId) => {
    const kpi = { id: `kpi-${generateId()}`, label: 'New KPI', field: 'Total Sales Qty', aggregation: 'sum', format: 'compact', color: '#c7d2fe' };
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId ? { ...b, kpis: [...b.kpis, kpi] } : b
      ),
    }));
  },

  updateKPI: (brandId, kpiId, patch) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? { ...b, kpis: b.kpis.map(k => k.id === kpiId ? { ...k, ...patch } : k) }
          : b
      ),
    }));
  },

  deleteKPI: (brandId, kpiId) => {
    get().updateConfig(c => ({
      ...c,
      brands: c.brands.map(b =>
        b.id === brandId
          ? { ...b, kpis: b.kpis.filter(k => k.id !== kpiId) }
          : b
      ),
    }));
  },

  // Calculated fields CRUD
  addCalculatedField: (field) => {
    const id = `cf-${Date.now()}`;
    get().updateConfig(c => ({
      ...c,
      calculatedFields: [...(c.calculatedFields || []), {
        id,
        name: field.name || 'New Field',
        formula: field.formula || '0',
        format: field.format || 'number',
        description: field.description || '',
      }],
    }));
  },

  updateCalculatedField: (id, patch) => {
    get().updateConfig(c => ({
      ...c,
      calculatedFields: (c.calculatedFields || []).map(cf =>
        cf.id === id ? { ...cf, ...patch } : cf
      ),
    }));
  },

  deleteCalculatedField: (id) => {
    get().updateConfig(c => ({
      ...c,
      calculatedFields: (c.calculatedFields || []).filter(cf => cf.id !== id),
    }));
  },

  // Load config from JSON file
  loadConfigFromFile: async (file) => {
    const text = await file.text();
    const { config, data } = JSON.parse(text);
    const id = `proj-${Date.now()}`;
    set(s => ({
      projects: [...s.projects, { id, name: config.title || 'Imported', config, data: data || [] }],
      activeProjectId: id,
    }));
  },
}));
