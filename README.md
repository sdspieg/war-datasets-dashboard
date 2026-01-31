# Ukraine Territorial Control & Military Events Dashboard

Interactive React dashboard visualizing Russian-controlled territory in Ukraine, military events, and Kursk region dynamics from ISW (Institute for the Study of War) assessment data stored in PostGIS.

## Architecture

```
dashboard/
├── public/data/                ← Static JSON/GeoJSON exported from PostGIS
│   ├── daily_areas.json        ← 3,601 daily area records
│   ├── events.json             ← 39 scored military events
│   ├── metadata.json           ← Date range, layer types, export stats
│   ├── territory_geojson/      ← 39 GeoJSON files (ukraine_control_map change points)
│   └── kursk_geojson/          ← 37 GeoJSON files (kursk_russian_advances change points)
├── src/
│   ├── App.tsx                 ← Root component: data loading, error boundaries, tab routing
│   ├── main.tsx                ← React entry point
│   ├── types/index.ts          ← TypeScript interfaces (DailyArea, MilitaryEvent, DashboardState)
│   ├── data/
│   │   ├── loader.ts           ← Fetch functions for JSON/GeoJSON files
│   │   └── processing.ts       ← Interpolation, rolling median, monthly aggregation, trend
│   ├── context/
│   │   └── DashboardContext.tsx ← Global state via useReducer (date range, events, tab, etc.)
│   ├── components/
│   │   ├── Layout.tsx          ← CSS Grid layout: sidebar + header + main content
│   │   ├── Sidebar.tsx         ← Date range slider, summary stats, interpolation toggle, event filter
│   │   ├── TabNavigation.tsx   ← Territory | Events | Map tabs
│   │   ├── DateRangeSlider.tsx ← Dual-handle date range selector
│   │   ├── EventFilter.tsx     ← Grouped checkboxes by importance tier
│   │   ├── charts/
│   │   │   ├── TerritoryControlChart.tsx   ← Area chart: total Russian-controlled km²
│   │   │   ├── MonthlyChangesChart.tsx     ← Bar chart: monthly net change (red/blue)
│   │   │   ├── RateOfChangeChart.tsx       ← Dual-panel: territory + 30-day velocity
│   │   │   ├── KurskChart.tsx              ← Kursk recapture with phase annotations
│   │   │   ├── EventTimelineChart.tsx      ← Scatter: date × importance, size = territorial
│   │   │   ├── EventHeatmap.tsx            ← Nivo heatmap: T/S/C per event
│   │   │   ├── EventRadarChart.tsx         ← Nivo radar: top-N event profiles
│   │   │   ├── EventScatterChart.tsx       ← Bubble: strategic × territorial, size = cascade
│   │   │   ├── MetricDecomposition.tsx     ← Stacked horizontal bar: T/S/C decomposition
│   │   │   └── shared/
│   │   │       ├── EventOverlay.tsx        ← Vertical dashed reference lines for events
│   │   │       ├── ChartTooltip.tsx        ← Styled tooltip with nearby event details
│   │   │       └── ChartLegend.tsx         ← Consistent legend component
│   │   └── map/
│   │       ├── TerritoryMap.tsx            ← React-Leaflet + GeoJSON overlay
│   │       ├── TimeSlider.tsx              ← Play/pause animation with speed controls
│   │       └── MapLegend.tsx               ← Map legend overlay
│   └── styles/
│       ├── variables.css       ← CSS custom properties (dark theme palette)
│       └── components.css      ← Full component styles, responsive breakpoints
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack

| Layer        | Technology                                      |
|--------------|--------------------------------------------------|
| Framework    | Vite + React 18 + TypeScript                    |
| Charts       | Recharts (7 charts) + Nivo (heatmap, radar)     |
| Map          | React-Leaflet + Leaflet + CARTO dark basemap    |
| State        | React Context + useReducer                       |
| Styling      | CSS custom properties, dark theme                |
| Data         | Static JSON/GeoJSON (no backend server needed)   |

## Prerequisites

- **Node.js** >= 18
- **Python 3** with `psycopg2` (for data export only)
- **PostGIS database** running on `localhost:5433` (for data export only)

## Setup

### 1. Export data from PostGIS

```bash
cd "/mnt/g/My Drive/RuBase/Red lines/Datasets"
python3 export_dashboard_data.py
```

This connects to the ISW PostGIS database (`localhost:5433`, db `isw_shapefiles`) and writes JSON/GeoJSON files to `dashboard/public/data/`.

Output:
- `daily_areas.json` — 3,601 rows from `clean_daily_areas` view (ukraine conflict)
- `events.json` — 39 military events with importance/T/S/C scores
- `territory_geojson/*.geojson` — Simplified GeoJSON for ukraine_control_map change points
- `kursk_geojson/*.geojson` — Simplified GeoJSON for kursk_russian_advances change points
- `metadata.json` — Date range, layer types, record counts

### 2. Install dependencies

**Important:** Google Drive doesn't support symlinks. Install in `/tmp` then copy:

```bash
mkdir -p /tmp/dashboard
cp dashboard/package.json /tmp/dashboard/
cd /tmp/dashboard && npm install
cp -r /tmp/dashboard/node_modules dashboard/
cp /tmp/dashboard/package-lock.json dashboard/
```

### 3. Run development server

```bash
cd /tmp/dashboard    # or copy all source files there for faster I/O
npx vite
```

### 4. Build for production

```bash
cd /tmp/dashboard
npx vite build
# Output: dist/ folder (fully self-contained static site)
```

## Deployment

The `dist/` folder is a fully static site — no backend needed. Deploy to any static hosting:

### Quick tunnel (temporary, no account)

```bash
# Install cloudflared
curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /tmp/cloudflared
chmod +x /tmp/cloudflared

# Serve and tunnel
npx serve dist -l 3333 &
/tmp/cloudflared tunnel --url http://localhost:3333
# Gives you a https://xxx.trycloudflare.com URL
```

### Netlify (permanent, free)

Drag `dashboard/dist/` to [app.netlify.com/drop](https://app.netlify.com/drop)

### GitHub Pages

Push to a repo, enable Pages from the `dist` folder or use a GitHub Action.

### Vercel

```bash
npx vercel dashboard/dist
```

## Dashboard Features

### Territory Tab (4 charts)
- **Russian-Controlled Territory** — Area chart with interpolated data, linear trend line, event overlay markers
- **Monthly Territorial Changes** — Bar chart with red (Russian gains) / blue (Ukrainian gains), average line, stats overlay
- **Rate of Territorial Change** — Dual-panel: territory area + 30-day rolling velocity (km²/month)
- **Kursk Region** — Russian recapture progress with 5 phase annotations

### Events Tab (5 charts)
- **Event Importance Timeline** — Scatter plot: date × importance, bubble size = territorial impact, opacity = confidence
- **Event Metric Heatmap** — Nivo heatmap: Territorial/Strategic/Cascade scores per event
- **Event Radar Profiles** — Nivo radar: top-N events overlaid on T/S/C axes
- **Strategic vs Territorial** — Bubble scatter: strategic × territorial, size = cascade, color = importance
- **Metric Decomposition** — Stacked horizontal bars: T/S/C breakdown per event, sorted by importance

### Map Tab
- **Interactive Leaflet map** centered on eastern Ukraine (48.5°N, 37.5°E)
- **CARTO dark basemap** with semi-transparent red GeoJSON polygons
- **Time slider** with play/pause, speed controls (1 day/s, 1 week/s, 1 month/s)
- **Legend** showing current date and loading state

### Cross-chart Interactions
- **Date range filtering** — Sidebar sliders filter all charts simultaneously
- **Event selection** — Checkbox groups (Critical I>=8, Significant I>=6, Other) toggle event overlays
- **Interpolation toggle** — Switch between raw step-function and interpolated data
- **Event highlighting** — Click an event on any chart to highlight it (via shared context)
- **URL hash sync** — Active tab encoded in URL hash for shareable links
- **Error boundaries** — Each chart wrapped in React error boundary with retry button

## Database Schema Reference

| Table/View           | Purpose                                              |
|----------------------|------------------------------------------------------|
| `clean_daily_areas`  | View: daily area totals per layer_type per conflict  |
| `shapefile_metadata` | Source shapefile metadata (date, type, conflict)     |
| `control_polygons`   | Polygon geometries with metadata_id foreign key      |

### Ukraine layer types
`ukraine_control_map`, `russian_advances`, `kursk_russian_advances`, `partisan_warfare`, `russian_claimed`, `russian_infiltration`, `ukraine_other`, `ukrainian_counteroffensives`

## Military Events (39 total)

Events are scored on three axes (0–4 each):
- **T (Territorial)** — Direct territorial impact
- **S (Strategic)** — Strategic significance
- **C (Cascade)** — Cascading/downstream effects

**Importance** = sum-based score (1–10). **Confidence** = High/Medium/Low.

Key events include: Avdiivka Falls (I=9), Pokrovsk Offensive (I=9), Luhansk Fully Captured (I=9), Op. Spiderweb (I=9), Vuhledar Falls (I=8), Kharkiv Offensive (I=8), Kursk Incursion (I=8), Chasiv Yar Falls (I=8), Toretsk Falls (I=8), Kupiansk Offensive (I=8), Dobropillia UKR Victory (I=8).
