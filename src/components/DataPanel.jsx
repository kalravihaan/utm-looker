import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { getDataColumns } from '../utils/dataManager';

export default function DataPanel({ config, data }) {
  const { addCalculatedField, updateCalculatedField, deleteCalculatedField } = useDashboardStore();
  const { dimensions, metrics } = getDataColumns(data);
  const calculatedFields = config.calculatedFields || [];
  const [editingCF, setEditingCF] = useState(null);
  const [newCF, setNewCF] = useState(false);
  const [cfForm, setCFForm] = useState({ name: '', formula: '', format: 'number', description: '' });
  const [openSection, setOpenSection] = useState({ dimensions: true, metrics: true, calculated: true });

  const toggle = (k) => setOpenSection(s => ({ ...s, [k]: !s[k] }));

  const startEditCF = (cf) => {
    setEditingCF(cf.id);
    setCFForm({ name: cf.name, formula: cf.formula, format: cf.format, description: cf.description || '' });
    setNewCF(false);
  };

  const startNewCF = () => {
    setNewCF(true);
    setEditingCF(null);
    setCFForm({ name: '', formula: '', format: 'number', description: '' });
  };

  const saveCF = () => {
    if (!cfForm.name.trim() || !cfForm.formula.trim()) return;
    if (newCF) {
      addCalculatedField(cfForm);
    } else {
      updateCalculatedField(editingCF, cfForm);
    }
    setEditingCF(null);
    setNewCF(false);
  };

  const Section = ({ id, title, count, children }) => (
    <div className="border-b border-gray-100">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600"
      >
        <span>{title} <span className="font-mono text-gray-300 ml-1">({count})</span></span>
        <span>{openSection[id] ? '▾' : '▸'}</span>
      </button>
      {openSection[id] && <div className="pb-2">{children}</div>}
    </div>
  );

  const FieldChip = ({ name, type }) => (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 mx-2 mb-1 rounded cursor-default hover:bg-gray-50 group"
      title={name}
    >
      <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${type === 'metric' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
        {type === 'metric' ? '123' : 'ABC'}
      </span>
      <span className="text-[11px] text-gray-700 truncate flex-1">{name}</span>
    </div>
  );

  const CFForm = () => (
    <div className="mx-2 mb-2 bg-indigo-50 rounded-lg p-2.5 space-y-2">
      <div>
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Field Name</label>
        <input
          className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded bg-white outline-none focus:border-indigo-300"
          placeholder="e.g. Avg Price"
          value={cfForm.name}
          onChange={e => setCFForm(s => ({ ...s, name: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Formula</label>
        <textarea
          className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded bg-white outline-none focus:border-indigo-300 font-mono resize-none"
          placeholder="e.g. Revenue / Total Sales Qty"
          rows={2}
          value={cfForm.formula}
          onChange={e => setCFForm(s => ({ ...s, formula: e.target.value }))}
        />
        <div className="text-[9px] text-gray-400 mt-0.5">Use column names with +  −  ×  ÷</div>
      </div>
      <div>
        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">Format</label>
        <select
          className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded bg-white outline-none"
          value={cfForm.format}
          onChange={e => setCFForm(s => ({ ...s, format: e.target.value }))}
        >
          <option value="number">Number</option>
          <option value="compact">Compact (1.2K)</option>
          <option value="currency">Currency (₹)</option>
          <option value="percent">Percent (%)</option>
          <option value="decimal">Decimal</option>
        </select>
      </div>
      <div className="flex gap-1.5">
        <button onClick={saveCF} className="flex-1 py-1 rounded text-[11px] font-semibold text-white" style={{ background: '#818cf8' }}>
          {newCF ? 'Add Field' : 'Save'}
        </button>
        <button onClick={() => { setEditingCF(null); setNewCF(false); }} className="px-2 py-1 rounded text-[11px] border border-gray-200 text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
      style={{ width: 240, minHeight: 'calc(100vh - 50px)' }}
    >
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
        <div className="text-[11px] font-bold text-gray-700">Fields</div>
        <div className="text-[9px] text-gray-400 mt-0.5">
          {data.length ? `${data.length} rows loaded` : 'No data — upload a file'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section id="dimensions" title="Dimensions" count={dimensions.length}>
          {dimensions.length === 0
            ? <div className="px-3 py-1 text-[10px] text-gray-300">No data yet</div>
            : dimensions.map(d => <FieldChip key={d} name={d} type="dimension" />)
          }
        </Section>

        <Section id="metrics" title="Metrics" count={metrics.length}>
          {metrics.length === 0
            ? <div className="px-3 py-1 text-[10px] text-gray-300">No data yet</div>
            : metrics.map(m => <FieldChip key={m} name={m} type="metric" />)
          }
        </Section>

        <Section id="calculated" title="Calculated Fields" count={calculatedFields.length}>
          {calculatedFields.map(cf => (
            <div key={cf.id}>
              {editingCF === cf.id ? (
                <CFForm />
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 mx-2 mb-0.5 rounded hover:bg-gray-50 group">
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-green-50 text-green-600">fx</span>
                  <span className="text-[11px] text-gray-700 truncate flex-1">{cf.name}</span>
                  <div className="hidden group-hover:flex gap-0.5">
                    <button onClick={() => startEditCF(cf)} className="text-[10px] text-indigo-400 hover:text-indigo-600 px-1">✎</button>
                    <button onClick={() => deleteCalculatedField(cf.id)} className="text-[10px] text-red-400 hover:text-red-600 px-1">✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {newCF ? (
            <CFForm />
          ) : (
            <button
              onClick={startNewCF}
              className="flex items-center gap-1.5 px-2.5 py-1.5 mx-2 mt-1 rounded border border-dashed border-indigo-200 text-indigo-400 hover:bg-indigo-50 text-[11px] font-medium w-[calc(100%-16px)]"
            >
              + New Calculated Field
            </button>
          )}
        </Section>
      </div>
    </div>
  );
}
