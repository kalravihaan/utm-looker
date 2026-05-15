# UTM Looker – No-Code Dashboard Builder

A Looker Studio replacement for UTM brand analytics, built with React + Vite + Tailwind CSS + Chart.js.

## Features

- **5 Brand Dashboards** – Overall, Sangria, House of Pataudi, All About You, Anouk Rustic
- **View / Edit Mode toggle** – Clean presentation mode and full edit mode
- **Data Upload** – Drag-and-drop or click to upload CSV or Excel (.xlsx) files. All charts update reactively.
- **Edit Mode** – Right sidebar to configure every widget, KPI, tab, and brand
- **Chart Types** – Bar, Line, Pie, Doughnut with configurable data mapping
- **Data Mapping** – Map any CSV column to X/Y axes via dropdown
- **KPI Cards** – Configurable aggregations: Sum, Average, Count, Count Distinct
- **Data Tables** – Sortable, searchable grouped tables
- **Velocity Tiers** – Auto-computed Very Fast / Fast / Moderate / Slow / Dead breakdown
- **Multi-Dashboard** – Sidebar to manage multiple dashboard projects
- **Save / Load** – Export config + data as JSON, reload anytime
- **Export CSV** – Download current view's dataset

## Setup

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

## Data Schema

Upload a CSV or Excel file with columns matching the Master Data schema:

| Column | Description |
|---|---|
| Brand | Brand name (Sangria, House of Pataudi, all about you, Anouk Rustic) |
| Article Type | Women_Kurta, Women_Tops, etc. |
| Style id | Numeric style identifier |
| Cost | Cost per unit |
| Total Sales Qty | Total units sold |
| Revenue | Net revenue |
| GMV | Gross Merchandise Value |
| Total Return Qty | Units returned |
| Return % | Return rate as decimal |
| Month | Month name (April–March) |
| Month Numbering | 1–12 |
| ROS | Rate of Sale |

## Design System

Fonts: **Playfair Display** (headings) · **DM Sans** (body) · **DM Mono** (data)

Brand Colors:
- **Overall** – Indigo `#818cf8`
- **Sangria** – Pink `#db2777`
- **House of Pataudi** – Gold `#c9973a`
- **All About You** – Blue `#2563eb`
- **Anouk Rustic** – Orange `#c2510e`
