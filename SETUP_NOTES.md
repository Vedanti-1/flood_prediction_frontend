# Disaster Risk Frontend — setup notes

## 1. Install the one extra dependency

Everything here is plain React + CSS + custom SVG charts (no chart library
needed), except routing:

```bash
npm install react-router-dom
```

## 2. Drop these files into your project

Copy the `src/` folder from this delivery into your existing
`disaster-risk-frontend/src/`, merging rather than deleting anything you
already have outside of `App.jsx`, `main.jsx`, and `index.css` (those three
are meant to be replaced — they only wire up routing and global styles).

## 3. Backend base URL

Change the backend URL in one place if it ever moves:
`src/api/config.js` → `BASE_URL`.

## 4. Assumptions made (please check these against your Spring Boot DTOs)

The four endpoints exist, but their exact response shape wasn't specified, so
the UI reads fields defensively with optional chaining and falls back to
"Not available in source" for anything missing. Adjust the field names below
to match your real DTOs — that's the only change needed to go from empty
states to live data.

**GET /api/dashboard/{district}**
```json
{
  "riskLevel": "HIGH",
  "historicalFloodPercent": 12.4,
  "predictedFloodPercent": 14.1,
  "population": 1500000,
  "rainfallMm": 890,
  "riverDistanceKm": 3.2,
  "relocationCount": 6,
  "summary": "free text risk summary",
  "populationDensity": 410,
  "elevationM": 520,
  "slopeDegree": 4.2,
  "rainfallSeries": [{ "period": "2021", "mm": 850 }],
  "lulcBreakdown": [{ "label": "Agriculture", "percent": 55, "color": "#..." }]
}
```

**GET /api/risk/{district}**
```json
{
  "riskLevel": "HIGH",
  "historicalFloodPercent": 12.4,
  "predictedFloodPercent": 14.1,
  "population": 1500000,
  "riverDistanceKm": 3.2,
  "cwcIndicator": "Verified",
  "historicalSeries": [{ "year": 2019, "historicalPercent": 10.1, "predictedPercent": 11.0 }]
}
```

**GET /api/ml/{district}**
```json
{
  "historicalFloodPercent": 12.4,
  "predictedFloodPercent": 14.1,
  "modelPerformance": { "r2": 0.84, "mae": 1.2, "rmse": 2.1 },
  "featureImportance": [{ "feature": "Rainfall", "importance": 0.32 }]
}
```

**GET /api/relocation/{district}**
```json
{
  "riskLevel": "HIGH",
  "historicalFloodPercent": 12.4,
  "predictedFloodPercent": 14.1,
  "relocationPriority": "High",
  "planningRequired": true,
  "candidateLocationCount": 4,
  "locations": [
    {
      "name": "Example Relief Site",
      "type": "NAMED",
      "area": "Example Taluka",
      "latitude": 19.99,
      "longitude": 73.78,
      "capacity": 500,
      "status": "Not available in source",
      "source": "District Disaster Management Plan",
      "sourcePage": "p. 42",
      "verified": true
    }
  ]
}
```
Rows with `"type"` other than `"NAMED"` (or missing) render as
**SOURCE-SUPPORTED CANDIDATE GROUP**. Set `"verified": false` on any row that
should show **Not verified** instead of whatever status string you send.

## 5. Real (non-fake) data already included

`src/data/maharashtraDistricts.js` lists the 36 real Maharashtra districts by
name only — used purely to populate the search/select control before the
backend is wired up. No risk, population or coordinate values are attached to
it; every statistic still comes from your API.

## 6. Map / GIS layer

`components/common/MapPlaceholder.jsx` is a placeholder frame (grid +
schematic outline, no invented district boundaries). When you have real
GeoJSON, swap its contents for a `react-leaflet` (or similar) layer — the
surrounding card, legend and district-info panel don't need to change.

## 7. Where charts pull from

All charts (`BarChart`, `LineChart`, `DistributionBar`) are plain SVG
components that take arrays of numbers you already fetched — remove or wire
up the `rainfallSeries`, `historicalSeries`, `lulcBreakdown` and
`featureImportance` fields as your backend starts returning them; until then
each chart shows an empty state instead of guessing values.
