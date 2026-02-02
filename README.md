# War Datasets Dashboard

Interactive dashboard visualizing the Ukraine war through multiple data sources.

**Live site:** https://sdspieg.github.io/war-datasets-dashboard

## Datasets

| Source | Description | Records |
|--------|-------------|---------|
| [ACLED](https://acleddata.com/) | Armed Conflict Location & Event Data | 187K+ events |
| [UCDP GED](https://ucdp.uu.se/) | Uppsala Conflict Data Program | 31K+ events |
| [VIINA 2.0](https://github.com/zhukovyuri/VIINA) | ML-classified news events from 16 outlets | 48M+ records |
| [Bellingcat](https://ukraine.bellingcat.com/) | OSINT-verified civilian harm incidents | 2.5K+ incidents |
| [Ukrainian MoD + Oryx](https://www.oryxspioenkop.com/) | Equipment losses (visual confirmation) | 1.4K+ daily records |
| [Missile Attacks DB](https://github.com/bazaluk/ukraine-missile-attacks) | Missile/drone strikes with intercept rates | 3.3K+ records |
| [OHCHR](https://www.ohchr.org/) | UN-verified civilian casualties | 71 monthly reports |
| [UNHCR](https://www.unhcr.org/) | Refugee statistics and displacement | 56K+ records |
| [DeepState](https://deepstatemap.live/) | Territorial control snapshots | 562 snapshots |
| [ISW](https://www.understandingwar.org/) | Institute for the Study of War analysis | 2.8M+ features |

## Project Structure

```
src/
├── components/        # React components
│   ├── *Tab.tsx      # Feature tabs (Conflict, Aerial, Equipment, etc.)
│   ├── charts/       # Chart components (Timeline, Heatmap, Radar, etc.)
│   └── map/          # Leaflet map components
├── data/             # Data loaders
├── context/          # React Context state management
├── types/            # TypeScript interfaces
└── styles/           # CSS

dist/data/            # Pre-built JSON datasets
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Recharts & Nivo (charts)
- Leaflet (maps)

## Development

```bash
npm install
npm run dev
```
