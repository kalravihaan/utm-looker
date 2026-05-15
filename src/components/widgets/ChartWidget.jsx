import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { useDashboardStore } from '../../store/dashboardStore';
import { aggregate, aggregateMultiSeries } from '../../utils/dataManager';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler,
);

const PALETTE = ['#818cf8','#f472b6','#c9973a','#60a5fa','#fb923c','#34d399','#a78bfa','#f87171','#fbbf24','#38bdf8'];

const HEIGHT_MAP = { sm: 160, md: 220, lg: 300 };

export default function ChartWidget({ widget, data, brand, tab }) {
  const { editMode, setSelectedWidget, selectedWidgetId, deleteWidget } = useDashboardStore();
  const isSelected = selectedWidgetId === widget.id;

  const chartData = useMemo(() => {
    if (!data.length) return null;
    const { dataMapping, aggregation, sortBy, multiSeries, colors, color } = widget;
    if (!dataMapping?.xAxis) return null;

    if (multiSeries && Array.isArray(dataMapping.yAxis)) {
      const { labels, series } = aggregateMultiSeries(data, {
        xAxis: dataMapping.xAxis,
        yAxes: dataMapping.yAxis,
        aggregation,
        sortBy,
      });
      const palette = colors || PALETTE;
      return {
        labels,
        datasets: series.map((s, i) => ({
          label: s.name,
          data: s.data,
          backgroundColor: `${palette[i % palette.length]}99`,
          borderColor: palette[i % palette.length],
          borderWidth: 2,
          fill: widget.fillArea ? true : false,
          tension: 0.4,
          borderRadius: 4,
        })),
      };
    }

    const { labels, values } = aggregate(data, {
      xAxis: dataMapping.xAxis,
      yAxis: dataMapping.yAxis,
      aggregation,
      sortBy,
    });

    const isPieOrDoughnut = ['pie', 'doughnut'].includes(widget.chartType);
    const palette = colors || PALETTE;
    const bgColor = isPieOrDoughnut
      ? palette.map(c => c)
      : `${color || palette[0]}cc`;

    return {
      labels,
      datasets: [{
        label: dataMapping.yAxis || 'Value',
        data: values,
        backgroundColor: bgColor,
        borderColor: isPieOrDoughnut ? palette : (color || palette[0]),
        borderWidth: isPieOrDoughnut ? 2 : 2,
        fill: widget.fillArea || false,
        tension: 0.4,
        borderRadius: isPieOrDoughnut ? 0 : 4,
        borderSkipped: false,
      }],
    };
  }, [data, widget]);

  const options = useMemo(() => {
    const isPie = ['pie', 'doughnut'].includes(widget.chartType);
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: widget.horizontal ? 'y' : 'x',
      plugins: {
        legend: {
          display: isPie || (widget.multiSeries && Array.isArray(widget.dataMapping?.yAxis)),
          position: 'bottom',
          labels: {
            font: { family: "'DM Sans', sans-serif", size: 10 },
            padding: 8,
            boxWidth: 10,
            color: '#555',
          },
        },
        tooltip: {
          backgroundColor: '#0a0a14',
          titleFont: { family: "'DM Sans', sans-serif", size: 11 },
          bodyFont: { family: "'DM Mono', monospace", size: 11 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed?.y ?? ctx.parsed ?? 0;
              return ` ${Number(v).toLocaleString('en-IN')}`;
            },
          },
        },
      },
      scales: isPie ? {} : {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'DM Sans', sans-serif", size: 10 },
            color: '#999',
            maxRotation: 45,
          },
        },
        y: {
          grid: { color: '#f0f0f0' },
          ticks: {
            font: { family: "'DM Mono', monospace", size: 10 },
            color: '#999',
            callback: v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v,
          },
          beginAtZero: true,
        },
      },
      animation: { duration: 600 },
    };
  }, [widget]);

  const height = HEIGHT_MAP[widget.height] || 220;

  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[widget.chartType] || Bar;

  return (
    <div
      className={`bg-white rounded-[10px] p-3.5 shadow-sm border edit-mode-widget ${isSelected ? 'outline outline-2 outline-indigo-400' : ''}`}
      style={{ borderColor: '#f0f0f0' }}
      onClick={() => editMode && setSelectedWidget(widget.id)}
    >
      {/* Widget header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold text-[#555] uppercase tracking-[0.04em]">
          {widget.title}
        </span>
        {editMode && (
          <div className="flex gap-1">
            <button
              onClick={e => { e.stopPropagation(); setSelectedWidget(widget.id); }}
              className="text-[10px] px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-400 hover:bg-indigo-50"
            >
              Edit
            </button>
            <button
              onClick={e => { e.stopPropagation(); deleteWidget(brand.id, tab.id, widget.id); }}
              className="text-[10px] px-1.5 py-0.5 rounded border border-red-200 text-red-400 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', height }}>
        {!data.length ? (
          <div className="flex items-center justify-center h-full text-gray-300 text-[12px]">
            Upload data to see chart
          </div>
        ) : !chartData ? (
          <div className="flex items-center justify-center h-full text-gray-300 text-[12px]">
            Configure data mapping
          </div>
        ) : (
          <ChartComponent data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
