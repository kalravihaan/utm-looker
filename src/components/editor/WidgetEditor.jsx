import React from 'react';
import { useDashboardStore } from '../../store/dashboardStore';

const CHART_TYPES = ['bar', 'line', 'pie', 'doughnut'];
const AGGREGATIONS = ['sum', 'avg', 'count', 'countDistinct'];
const HEIGHTS = ['sm', 'md', 'lg'];
const SPANS = [1, 2];

export default function WidgetEditor({ widget, brandId, tabId, availableColumns }) {
  const { updateWidget, deleteWidget } = useDashboardStore();

  const patch = (updates) => updateWidget(brandId, tabId, widget.id, updates);

  const patchMapping = (key, value) =>
    patch({ dataMapping: { ...widget.dataMapping, [key]: value } });

  const isChart = widget.type === 'chart';

  return (
    <div className="space-y-4 text-[12px]">
      {/* Title */}
      <Field label="Widget Title">
        <Input
          value={widget.title}
          onChange={e => patch({ title: e.target.value })}
          placeholder="Chart title"
        />
      </Field>

      {/* Type */}
      {isChart && (
        <Field label="Chart Type">
          <Select value={widget.chartType} onChange={e => patch({ chartType: e.target.value })}>
            {CHART_TYPES.map(t => <option key={t} value={t}>{capitalize(t)}</option>)}
          </Select>
        </Field>
      )}

      {/* Span */}
      <Field label="Width">
        <div className="flex gap-2">
          {SPANS.map(s => (
            <button
              key={s}
              onClick={() => patch({ span: s })}
              className="flex-1 py-1.5 rounded text-[11px] font-medium border transition-colors"
              style={{
                background: widget.span === s ? '#818cf8' : '#fff',
                color: widget.span === s ? '#fff' : '#555',
                borderColor: widget.span === s ? '#818cf8' : '#e5e7eb',
              }}
            >
              {s === 1 ? 'Half' : 'Full'}
            </button>
          ))}
        </div>
      </Field>

      {/* Chart height */}
      {isChart && (
        <Field label="Chart Height">
          <div className="flex gap-2">
            {HEIGHTS.map(h => (
              <button
                key={h}
                onClick={() => patch({ height: h })}
                className="flex-1 py-1.5 rounded text-[11px] font-medium border transition-colors"
                style={{
                  background: widget.height === h ? '#818cf8' : '#fff',
                  color: widget.height === h ? '#fff' : '#555',
                  borderColor: widget.height === h ? '#818cf8' : '#e5e7eb',
                }}
              >
                {capitalize(h)}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Data mapping */}
      {isChart && widget.dataMapping && (
        <>
          <div className="border-t border-gray-100 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Data Mapping</div>
          </div>

          <Field label="X Axis (Dimension)">
            <Select
              value={widget.dataMapping.xAxis || ''}
              onChange={e => patchMapping('xAxis', e.target.value)}
            >
              <option value="">— Select column —</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>

          {widget.multiSeries && Array.isArray(widget.dataMapping.yAxis) ? (
            <Field label="Y Axes (Metrics, comma-separated)">
              <Input
                value={widget.dataMapping.yAxis.join(',')}
                onChange={e => patchMapping('yAxis', e.target.value.split(',').map(s => s.trim()))}
                placeholder="Revenue, Total Sales Qty"
              />
            </Field>
          ) : (
            <Field label="Y Axis (Metric)">
              <Select
                value={Array.isArray(widget.dataMapping.yAxis) ? widget.dataMapping.yAxis[0] : widget.dataMapping.yAxis || ''}
                onChange={e => patchMapping('yAxis', e.target.value)}
              >
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

          <Field label="Multi-Series">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!widget.multiSeries}
                onChange={e => patch({ multiSeries: e.target.checked })}
                className="rounded"
              />
              <span className="text-[11px] text-gray-600">Enable multi-series (stacked)</span>
            </label>
          </Field>

          <Field label="Horizontal Bars">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!widget.horizontal}
                onChange={e => patch({ horizontal: e.target.checked })}
                className="rounded"
              />
              <span className="text-[11px] text-gray-600">Horizontal orientation</span>
            </label>
          </Field>
        </>
      )}

      {/* Table columns config */}
      {widget.type === 'table' && (
        <>
          <div className="border-t border-gray-100 pt-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Table Config</div>
          </div>

          <Field label="Group By">
            <Select
              value={widget.groupBy || ''}
              onChange={e => patch({ groupBy: e.target.value })}
            >
              <option value="">— Select column —</option>
              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </>
      )}

      {/* Color */}
      {isChart && (
        <Field label="Primary Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={widget.color || '#818cf8'}
              onChange={e => patch({ color: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <span className="text-[11px] text-gray-500 font-mono">{widget.color || '#818cf8'}</span>
          </div>
        </Field>
      )}

      {/* Delete */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={() => deleteWidget(brandId, tabId, widget.id)}
          className="w-full py-2 rounded-lg text-[12px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
        >
          Delete Widget
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
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
      value={value}
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
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  );
}

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

const aggLabel = a => ({
  sum: 'Sum',
  avg: 'Average',
  count: 'Count',
  countDistinct: 'Count Distinct',
}[a] || a);
