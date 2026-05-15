import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

const CHART_TYPES = ['bar', 'line', 'pie', 'doughnut'];
const AGGREGATIONS = ['sum', 'avg', 'count', 'countDistinct'];
const HEIGHTS = ['sm', 'md', 'lg'];
const FORMATS = ['compact', 'currency', 'percent', 'decimal', 'number'];
const COLORS_PRESET = ['#818cf8','#f472b6','#c9973a','#60a5fa','#fb923c','#34d399','#f87171','#fbbf24','#a78bfa','#38bdf8'];

export default function WidgetEditor({ widget, brandId, tabId, availableColumns, activeTab = 'data' }) {
  const { updateWidget, deleteWidget } = useDashboardStore();
  const patch = (u) => updateWidget(brandId, tabId, widget.id, u);
  const patchMapping = (k, v) => patch({ dataMapping: { ...widget.dataMapping, [k]: v } });
  const isChart = widget.type === 'chart';

  if (activeTab === 'style') {
    return (
      <div className="space-y-4 text-[12px]">
        <Field label="Chart Type">
          <div className="grid grid-cols-2 gap-1.5">
            {CHART_TYPES.map(t => (
              <button key={t} onClick={() => patch({ chartType: t })}
                className="py-1.5 rounded text-[11px] font-medium border transition-colors capitalize"
                style={{ background: widget.chartType === t ? '#818cf8' : '#fff', color: widget.chartType === t ? '#fff' : '#555', borderColor: widget.chartType === t ? '#818cf8' : '#e5e7eb' }}>
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Width">
          <div className="flex gap-2">
            {[1, 2].map(s => (
              <button key={s} onClick={() => patch({ span: s })}
                className="flex-1 py-1.5 rounded text-[11px] font-medium border transition-colors"
                style={{ background: widget.span === s ? '#818cf8' : '#fff', color: widget.span === s ? '#fff' : '#555', borderColor: widget.span === s ? '#818cf8' : '#e5e7eb' }}>
                {s === 1 ? 'Half Width' : 'Full Width'}
              </button>
            ))}
          </div>
        </Field>

        {isChart && (
          <Field label="Height">
            <div className="flex gap-2">
              {HEIGHTS.map(h => (
                <button key={h} onClick={() => patch({ height: h })}
                  className="flex-1 py-1.5 rounded text-[11px] font-medium border transition-colors capitalize"
                  style={{ background: widget.height === h ? '#818cf8' : '#fff', color: widget.height === h ? '#fff' : '#555', borderColor: widget.height === h ? '#818cf8' : '#e5e7eb' }}>
                  {h}
                </button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Primary Color">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COLORS_PRESET.map(c => (
              <button key={c} onClick={() => patch({ color: c })}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: widget.color === c ? '#111' : 'transparent' }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={widget.color || '#818cf8'} onChange={e => patch({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0" />
            <span className="text-[11px] text-gray-500 font-mono">{widget.color || '#818cf8'}</span>
          </div>
        </Field>

        <Field label="Options">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!widget.fillArea} onChange={e => patch({ fillArea: e.target.checked })} className="rounded" />
              <span className="text-[11px] text-gray-600">Fill area under line</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!widget.horizontal} onChange={e => patch({ horizontal: e.target.checked })} className="rounded" />
              <span className="text-[11px] text-gray-600">Horizontal orientation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!widget.multiSeries} onChange={e => patch({ multiSeries: e.target.checked })} className="rounded" />
              <span className="text-[11px] text-gray-600">Multi-series mode</span>
            </label>
          </div>
        </Field>

        <div className="border-t border-gray-100 pt-3">
          <button onClick={() => deleteWidget(brandId, tabId, widget.id)}
            className="w-full py-2 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50">
            Delete Widget
          </button>
        </div>
      </div>
    );
  }

  // Data tab
  return (
    <div className="space-y-4 text-[12px]">
      <Field label="Widget Title">
        <Input value={widget.title} onChange={e => patch({ title: e.target.value })} placeholder="Chart title" />
      </Field>

      {isChart && widget.dataMapping && (
        <>
          <Field label="X Axis (Dimension)">
            <Select value={widget.dataMapping.xAxis || ''} onChange={e => patchMapping('xAxis', e.target.value)}>
              <option value="">— Select column —</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>

          {widget.multiSeries ? (
            <Field label="Y Axes (comma-separated)">
              <Input
                value={Array.isArray(widget.dataMapping.yAxis) ? widget.dataMapping.yAxis.join(', ') : widget.dataMapping.yAxis || ''}
                onChange={e => patchMapping('yAxis', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="Revenue, Total Sales Qty"
              />
              <div className="text-[9px] text-gray-400 mt-1">Separate multiple fields with commas</div>
            </Field>
          ) : (
            <Field label="Y Axis (Metric)">
              <Select value={Array.isArray(widget.dataMapping.yAxis) ? widget.dataMapping.yAxis[0] : widget.dataMapping.yAxis || ''} onChange={e => patchMapping('yAxis', e.target.value)}>
                <option value="">— Select column —</option>
                {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          )}

          <Field label="Aggregation">
            <Select value={widget.aggregation || 'sum'} onChange={e => patch({ aggregation: e.target.value })}>
              {AGGREGATIONS.map(a => <option key={a} value={a}>{aggLabel(a)}</option>)}
            </Select>
          </Field>

          <Field label="Sort By">
            <Select value={widget.sortBy || ''} onChange={e => patch({ sortBy: e.target.value })}>
              <option value="">— Default order —</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </>
      )}

      {widget.type === 'table' && (
        <>
          <Field label="Group By">
            <Select value={widget.groupBy || ''} onChange={e => patch({ groupBy: e.target.value })}>
              <option value="">— Select column —</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>

          <div className="border-t border-gray-100 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Columns</div>
            <div className="space-y-2 mb-3">
              {(widget.columns || []).map((col, i) => (
                <div key={i} className="bg-gray-50 rounded p-2 text-[11px] flex items-center gap-2">
                  <span className="flex-1 truncate font-medium text-gray-700">{col.label || col.field}</span>
                  <Select
                    value={col.aggregation || 'sum'}
                    onChange={e => {
                      const cols = [...widget.columns];
                      cols[i] = { ...cols[i], aggregation: e.target.value };
                      patch({ columns: cols });
                    }}
                  >
                    {AGGREGATIONS.map(a => <option key={a} value={a}>{aggLabel(a)}</option>)}
                  </Select>
                  <button onClick={() => patch({ columns: widget.columns.filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-600 px-1">✕</button>
                </div>
              ))}
            </div>
            <Select
              value=""
              onChange={e => {
                if (!e.target.value) return;
                const col = { field: e.target.value, label: e.target.value, aggregation: 'sum', align: 'right', format: 'number' };
                patch({ columns: [...(widget.columns || []), col] });
                e.target.value = '';
              }}
            >
              <option value="">+ Add column…</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </>
      )}

      <div className="border-t border-gray-100 pt-3">
        <button onClick={() => deleteWidget(brandId, tabId, widget.id)}
          className="w-full py-2 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50">
          Delete Widget
        </button>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-indigo-300"
    style={{ fontFamily: "'DM Sans', sans-serif" }} value={value || ''} onChange={onChange} placeholder={placeholder} />
);

const Select = ({ value, onChange, children }) => (
  <select className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-700 outline-none focus:border-indigo-300 bg-white"
    style={{ fontFamily: "'DM Sans', sans-serif" }} value={value || ''} onChange={onChange}>
    {children}
  </select>
);

const aggLabel = a => ({ sum: 'Sum', avg: 'Average', count: 'Count', countDistinct: 'Count Distinct' }[a] || a);
