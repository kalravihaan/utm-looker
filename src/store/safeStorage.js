// Resilient localStorage wrapper — handles quota errors and serialization failures
export const safeStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },

  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (err) {
      // QuotaExceededError: retry without data arrays
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        try {
          const parsed = JSON.parse(value);
          if (parsed?.state?.projects) {
            parsed.state.projects = parsed.state.projects.map(p => ({
              ...p,
              dataSources: (p.dataSources || []).map(ds => ({ ...ds, data: [] })),
            }));
          }
          localStorage.setItem(name, JSON.stringify(parsed));
          console.warn('utm-looker: data too large for localStorage, saved config only (data cleared).');
        } catch {
          try { localStorage.removeItem(name); } catch {}
        }
      }
    }
  },

  removeItem: (name) => {
    try { localStorage.removeItem(name); } catch {}
  },
};
