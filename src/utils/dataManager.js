import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const MONTH_ORDER = ['April','May','June','July','August','September','October','November','December','January','February','March'];

// Parse uploaded file (CSV or Excel) → array of row objects
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') return parseCSV(file);
  if (['xlsx','xls'].includes(ext)) return parseExcel(file);
  throw new Error('Unsupported file type. Please upload CSV or Excel.');
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: ({ data, errors }) => {
        if (errors.length && !data.length) return reject(errors[0]);
        resolve(data);
      },
      error: reject,
    });
  });
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        // Use first sheet by default
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: null });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Filter rows by brand
export function filterData(data, brand) {
  if (!brand || !brand.filter || !brand.filterField) return data;
  const val = brand.filter.toLowerCase();
  const field = brand.filterField;
  return data.filter(row => String(row[field] ?? '').toLowerCase() === val);
}

// Get unique sorted values for a dimension field
export function getUniqueValues(data, field, sortByField) {
  if (sortByField) {
    const map = new Map();
    data.forEach(row => {
      const key = String(row[field] ?? '');
      if (!map.has(key)) {
        map.set(key, Number(row[sortByField]) || 0);
      } else {
        map.set(key, Math.min(map.get(key), Number(row[sortByField]) || 0));
      }
    });
    return [...map.entries()].sort((a, b) => a[1] - b[1]).map(([k]) => k);
  }
  // Month-aware sorting
  const vals = [...new Set(data.map(row => String(row[field] ?? '')).filter(Boolean))];
  if (MONTH_ORDER.includes(vals[0])) {
    return vals.sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));
  }
  return vals.sort();
}

// Core aggregation engine
export function aggregate(data, { xAxis, yAxis, aggregation = 'sum', sortBy }) {
  const grouped = new Map();
  const countMap = new Map();
  const distinctMap = new Map();

  data.forEach(row => {
    const key = String(row[xAxis] ?? '');
    if (!grouped.has(key)) {
      grouped.set(key, 0);
      countMap.set(key, 0);
      distinctMap.set(key, new Set());
    }
    const val = Number(row[yAxis]) || 0;
    countMap.set(key, countMap.get(key) + 1);
    if (aggregation === 'countDistinct') {
      distinctMap.get(key).add(row[yAxis]);
    } else {
      grouped.set(key, grouped.get(key) + val);
    }
  });

  const labels = getUniqueValues(data, xAxis, sortBy ? 'Month Numbering' : null);
  const values = labels.map(label => {
    if (!grouped.has(label)) return 0;
    switch (aggregation) {
      case 'sum': return grouped.get(label);
      case 'avg': return countMap.get(label) ? grouped.get(label) / countMap.get(label) : 0;
      case 'count': return countMap.get(label);
      case 'countDistinct': return distinctMap.get(label).size;
      default: return grouped.get(label);
    }
  });

  return { labels, values };
}

// Multi-series aggregation
export function aggregateMultiSeries(data, { xAxis, yAxes, aggregation = 'sum', sortBy }) {
  const result = {};
  yAxes.forEach(yAxis => {
    result[yAxis] = aggregate(data, { xAxis, yAxis, aggregation, sortBy });
  });
  const labels = result[yAxes[0]].labels;
  const series = yAxes.map(yAxis => ({ name: yAxis, data: result[yAxis].values }));
  return { labels, series };
}

// Group-by aggregation for tables
export function groupAggregate(data, groupByField, columns) {
  const groups = new Map();
  const counts = new Map();
  const distincts = new Map();

  data.forEach(row => {
    const key = String(row[groupByField] ?? 'Unknown');
    if (!groups.has(key)) {
      groups.set(key, {});
      counts.set(key, {});
      distincts.set(key, {});
      columns.forEach(col => {
        groups.get(key)[col.field] = 0;
        counts.get(key)[col.field] = 0;
        distincts.get(key)[col.field] = new Set();
      });
    }
    columns.forEach(col => {
      if (col.field === groupByField) return;
      const val = Number(row[col.field]) || 0;
      const agg = col.aggregation || 'sum';
      if (agg === 'countDistinct') {
        distincts.get(key)[col.field].add(row[col.field]);
      } else {
        groups.get(key)[col.field] += val;
        counts.get(key)[col.field]++;
      }
    });
  });

  return [...groups.entries()].map(([key, vals]) => {
    const row = { [groupByField]: key };
    columns.forEach(col => {
      if (col.field === groupByField) return;
      const agg = col.aggregation || 'sum';
      switch (agg) {
        case 'sum': row[col.field] = vals[col.field]; break;
        case 'avg': row[col.field] = counts.get(key)[col.field] ? vals[col.field] / counts.get(key)[col.field] : 0; break;
        case 'count': row[col.field] = counts.get(key)[col.field]; break;
        case 'countDistinct': row[col.field] = distincts.get(key)[col.field].size; break;
        default: row[col.field] = vals[col.field];
      }
    });
    return row;
  }).sort((a, b) => (b['Total Sales Qty'] || b['Revenue'] || 0) - (a['Total Sales Qty'] || a['Revenue'] || 0));
}

// KPI computation
export function computeKPI(data, kpi) {
  if (!data.length) return 0;
  const { field, aggregation } = kpi;

  switch (aggregation) {
    case 'sum':
      return data.reduce((s, r) => s + (Number(r[field]) || 0), 0);
    case 'avg': {
      const vals = data.map(r => Number(r[field])).filter(v => !isNaN(v) && v > 0);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    }
    case 'count':
      return data.length;
    case 'countDistinct':
      return new Set(data.map(r => r[field])).size;
    default:
      return 0;
  }
}

// Number formatting
export function formatValue(value, format) {
  if (value === null || value === undefined || isNaN(value)) return '–';
  switch (format) {
    case 'compact': return formatCompact(value);
    case 'currency': return formatCurrency(value);
    case 'percent': return `${value.toFixed(1)}%`;
    case 'decimal': return value.toFixed(2);
    case 'number': return Math.round(value).toLocaleString('en-IN');
    default: return Math.round(value).toLocaleString('en-IN');
  }
}

function formatCompact(n) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toLocaleString('en-IN');
}

function formatCurrency(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

// Determine velocity tier for a style
export function getTier(ros) {
  if (ros > 1.5) return 'very-fast';
  if (ros >= 0.7) return 'fast';
  if (ros > 0.3) return 'moderate';
  if (ros > 0) return 'slow';
  return 'dead';
}

export function getTierLabel(tier) {
  return { 'very-fast': 'Very Fast', fast: 'Fast', moderate: 'Moderate', slow: 'Slow', dead: 'Dead' }[tier] || tier;
}

export function getTierColor(tier) {
  return {
    'very-fast': '#059669',
    fast: '#16a34a',
    moderate: '#d97706',
    slow: '#dc2626',
    dead: '#6b7280',
  }[tier] || '#6b7280';
}

export function getTierBgColor(tier) {
  return {
    'very-fast': '#ecfdf5',
    fast: '#f0fdf4',
    moderate: '#fffbeb',
    slow: '#fef2f2',
    dead: '#f9fafb',
  }[tier] || '#f9fafb';
}

// Compute velocity tier breakdown from data
export function computeTierBreakdown(data) {
  const styleMap = new Map();
  data.forEach(row => {
    const sid = row['Style id'];
    if (!styleMap.has(sid)) {
      styleMap.set(sid, { sales: 0, ros: 0, count: 0 });
    }
    const s = styleMap.get(sid);
    s.sales += Number(row['Total Sales Qty']) || 0;
    s.ros += Number(row['ROS']) || 0;
    s.count++;
  });

  const tiers = { 'very-fast': [], fast: [], moderate: [], slow: [], dead: [] };
  styleMap.forEach((val, sid) => {
    const avgRos = val.count ? val.ros / val.count : 0;
    const tier = getTier(avgRos);
    tiers[tier].push({ sid, sales: val.sales, ros: avgRos });
  });

  return Object.entries(tiers).map(([tier, styles]) => ({
    tier,
    label: getTierLabel(tier),
    styleCount: styles.length,
    totalSales: styles.reduce((s, x) => s + x.sales, 0),
    color: getTierColor(tier),
    bgColor: getTierBgColor(tier),
  }));
}

// Export data to CSV
export function exportCSV(data, filename = 'dashboard-data.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Export config as JSON
export function exportConfig(config, data) {
  const payload = JSON.stringify({ config, data }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.id || 'dashboard'}-config.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Compute avg ROS per style across all rows
function computeStyleROS(data) {
  const rosSum = new Map();
  const rosCount = new Map();
  data.forEach(row => {
    const sid = row['Style id'];
    if (sid == null) return;
    rosSum.set(sid, (rosSum.get(sid) || 0) + (Number(row['ROS']) || 0));
    rosCount.set(sid, (rosCount.get(sid) || 0) + 1);
  });
  const result = new Map();
  rosSum.forEach((sum, sid) => {
    result.set(sid, rosCount.get(sid) ? sum / rosCount.get(sid) : 0);
  });
  return result;
}

// Filter rows to only styles in a given velocity tier
export function filterByTier(data, tier) {
  if (!tier || !data.length) return data;
  const styleROS = computeStyleROS(data);
  return data.filter(row => {
    const avgRos = styleROS.get(row['Style id']) || 0;
    return getTier(avgRos) === tier;
  });
}

// Safely evaluate a formula against a data row
export function evaluateFormula(formula, row, fieldNames) {
  const sorted = fieldNames.slice().sort((a, b) => b.length - a.length);
  let expr = formula;
  sorted.forEach(field => {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      expr = expr.replace(new RegExp(escaped, 'g'), String(Number(row[field]) || 0));
    } catch(e) {}
  });
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${expr})`)();
    return isFinite(result) ? result : 0;
  } catch { return 0; }
}

// Apply calculated fields to each row, returning enriched data
export function applyCalculatedFields(data, calculatedFields) {
  if (!calculatedFields?.length || !data.length) return data;
  const fieldNames = Object.keys(data[0]);
  return data.map(row => {
    const enriched = { ...row };
    calculatedFields.forEach(cf => {
      enriched[cf.name] = evaluateFormula(cf.formula, row, fieldNames);
    });
    return enriched;
  });
}

// Categorise data columns into dimensions vs metrics
export function getDataColumns(data) {
  if (!data.length) return { dimensions: [], metrics: [] };
  const sample = data[0];
  const dimensions = [];
  const metrics = [];
  Object.entries(sample).forEach(([key, val]) => {
    if (typeof val === 'number' || (!isNaN(Number(val)) && val !== '' && val !== null)) {
      metrics.push(key);
    } else {
      dimensions.push(key);
    }
  });
  return { dimensions, metrics };
}
