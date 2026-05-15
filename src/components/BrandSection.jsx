import React from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { filterData, computeKPI, formatValue, computeTierBreakdown } from '../utils/dataManager';
import TabContent from './TabContent';

export default function BrandSection({ brand, data, rosConfig }) {
  const { activeTabIds, setActiveTab, editMode, addTab } = useDashboardStore();
  const activeTabId = activeTabIds[brand.id] || brand.tabs[0]?.id;
  const brandData = filterData(data, brand);
  const tiers = data.length ? computeTierBreakdown(brandData, rosConfig) : [];

  return (
    <div>
      {/* Brand header */}
      <header className="relative overflow-hidden" style={{ background: brand.gradient }}>
        <div className="hatch" />
        <div className="relative px-11 pt-7 pb-6">
          <div className="text-[10px] tracking-[0.18em] uppercase text-white/40 mb-1">
            {brand.eyebrow}
          </div>
          {brand.titleStyle ? (
            <div
              className="text-[34px] font-bold leading-tight mb-0.5 font-serif"
              dangerouslySetInnerHTML={{ __html: `<span style="${brand.titleStyle}">${brand.label}</span>` }}
            />
          ) : (
            <div className="text-[34px] font-bold text-white leading-tight mb-0.5 font-serif">
              {brand.label}
            </div>
          )}
          <div className="text-[10px] text-white/40 tracking-[0.06em] uppercase mb-5">
            {brand.subtitle}
          </div>

          {/* KPI row */}
          <div className="flex gap-2.5 flex-wrap">
            {brand.kpis.map(kpi => {
              const value = brandData.length ? computeKPI(brandData, kpi) : null;
              return (
                <div key={kpi.id} className="kpi-glass">
                  <div
                    className="font-serif text-[20px] font-bold leading-none mb-0.5"
                    style={{ color: kpi.color || '#c7d2fe' }}
                  >
                    {value !== null ? formatValue(value, kpi.format) : '—'}
                  </div>
                  <div className="text-[9px] text-white/40 tracking-[0.06em] uppercase">
                    {kpi.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Velocity tier strip */}
      {tiers.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-11 py-3 flex gap-2 flex-wrap items-center">
          {tiers.map(tier => (
            <div
              key={tier.tier}
              className="rounded-lg px-3 py-1.5 flex items-center gap-2 border"
              style={{
                background: tier.bgColor,
                borderColor: `${tier.color}40`,
                color: tier.color,
              }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tier.color }} />
              <div>
                <div className="text-[11px] font-semibold">{tier.label}</div>
                <div className="text-[10px] opacity-70 whitespace-nowrap">
                  {tier.styleCount} styles · {formatValue(tier.totalSales, 'compact')} units
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty data notice */}
      {data.length === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-11 py-2 text-[11px] text-amber-800 flex items-center gap-2">
          <span>⚠</span>
          <span>No data loaded. Click <strong>Update Data</strong> in the top bar to upload a CSV or Excel file.</span>
        </div>
      )}

      {/* Inner nav */}
      <nav
        className="sticky bg-white border-b-2 border-gray-200 px-11 flex overflow-x-auto shadow-sm"
        style={{ top: '50px', zIndex: 900 }}
      >
        {brand.tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(brand.id, tab.id)}
              className="px-3.5 py-[11px] text-[11px] font-medium border-b-[3px] cursor-pointer whitespace-nowrap font-sans transition-all duration-150 bg-transparent border-none"
              style={{
                color: isActive ? brand.color : '#888',
                borderBottom: `3px solid ${isActive ? brand.color : 'transparent'}`,
                fontWeight: isActive ? 600 : 500,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tab.label}
            </button>
          );
        })}
        {editMode && (
          <button
            onClick={() => addTab(brand.id)}
            className="px-3.5 py-[11px] text-[11px] text-indigo-400 hover:text-indigo-600 cursor-pointer whitespace-nowrap font-sans bg-transparent border-none"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            + Tab
          </button>
        )}
      </nav>

      {/* Tab content */}
      <div>
        {brand.tabs.map(tab => (
          <div key={tab.id} style={{ display: tab.id === activeTabId ? 'block' : 'none' }}>
            <TabContent brand={brand} tab={tab} data={brandData} rosConfig={rosConfig} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center py-3.5 px-11 text-[10px] text-gray-300 border-t border-gray-100 mt-4 tracking-wide">
        UTM Looker · Dashboard Builder · FY 2025–26
      </footer>
    </div>
  );
}
