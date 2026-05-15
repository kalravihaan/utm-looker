import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

const FORMATS = ['compact', 'currency', 'percent', 'decimal', 'number'];
const AGGREGATIONS = ['sum', 'avg', 'count', 'countDistinct'];

export default function BrandEditor({ brand, availableColumns }) {
  const { updateBrand, addKPI, updateKPI, deleteKPI, addBrand, deleteBrand, activeBrandId } = useDashboardStore();

  if (!brand) return null;

  const patch = (updates) => updateBrand(brand.id, updates);

  return (
    <div className="space-y-4 text-[12px]">
      {/* Brand basics */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Brand Settings</div>
      </div>

      <Field label="Display Name">
        <Input value={brand.label} onChange={e => patch({ label: e.target.value, navLabel: e.target.value })} />
      </Field>

      <Field label="Nav Label (short)">
        <Input value={brand.navLabel || brand.label} onChange={e => patch({ navLabel: e.target.value })} />
      </Field>

      <Field label="Eyebrow Text">
        <Input value={brand.eyebrow || ''} onChange={e => patch({ eyebrow: e.target.value })} />
      </Field>

      <Field label="Subtitle">
        <Input value={brand.subtitle || ''} onChange={e => patch({ subtitle: e.target.value })} />
      </Field>

      <Field label="Brand Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={brand.color || '#818cf8'}
            onChange={e => patch({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <span className="text-[11px] text-gray-500 font-mono">{brand.color || '#818cf8'}</span>
        </div>
      </Field>

      {/* Data filter */}
      <div className="border-t border-gray-100 pt-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Data Filter</div>
      </div>

      <Field label="Filter Field (e.g. Brand)">
        <Select
          value={brand.filterField || ''}
          onChange={e => patch({ filterField: e.target.value })}
        >
          <option value="">— No filter (all data) —</option>
          {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </Field>

      <Field label="Filter Value">
        <Input
          value={brand.filter || ''}
          onChange={e => patch({ filter: e.target.value })}
          placeholder="e.g. Sangria"
        />
      </Field>

      {/* KPIs */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">KPI Cards</div>
          <button
            onClick={() => addKPI(brand.id)}
            className="text-[10px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-500 hover:bg-indigo-50"
          >
            + Add KPI
          </button>
        </div>

        <div className="space-y-3">
          {brand.kpis?.map(kpi => (
            <div key={kpi.id} className="bg-gray-50 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-600">{kpi.label}</span>
                <button
                  onClick={() => deleteKPI(brand.id, kpi.id)}
                  className="text-[10px] text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
              <Field label="Label">
                <Input value={kpi.label} onChange={e => updateKPI(brand.id, kpi.id, { label: e.target.value })} />
              </Field>
              <Field label="Field">
                <Select
                  value={kpi.field || ''}
                  onChange={e => updateKPI(brand.id, kpi.id, { field: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Aggregation">
                  <Select
                    value={kpi.aggregation || 'sum'}
                    onChange={e => updateKPI(brand.id, kpi.id, { aggregation: e.target.value })}
                  >
                    {AGGREGATIONS.map(a => <option key={a} value={a}>{aggLabel(a)}</option>)}
                  </Select>
                </Field>
                <Field label="Format">
                  <Select
                    value={kpi.format || 'compact'}
                    onChange={e => updateKPI(brand.id, kpi.id, { format: e.target.value })}
                  >
                    {FORMATS.map(f => <option key={f} value={f}>{capitalize(f)}</option>)}
                  </Select>
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand management */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Brand Management</div>
        <button
          onClick={() => addBrand()}
          className="w-full py-2 rounded-lg text-[12px] font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
        >
          + Add New Brand
        </button>
        <button
          onClick={() => { if (confirm('Delete this brand?')) deleteBrand(brand.id); }}
          className="w-full py-2 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
        >
          Delete This Brand
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-indigo-300"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-indigo-300 bg-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      value={value || ''}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);
const aggLabel = a => ({ sum: 'Sum', avg: 'Avg', count: 'Count', countDistinct: 'Distinct' }[a] || a);
