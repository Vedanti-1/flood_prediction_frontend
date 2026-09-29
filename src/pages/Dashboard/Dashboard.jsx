import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Home,
  MapPin,
  Ruler,
  Users,
  Waves,
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'http://localhost:8080';

const apiFetch = (url, options = {}) => {
  const auth = sessionStorage.getItem('adminAuth');

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(auth ? { Authorization: auth } : {}),
    },
  });
};
const DISTRICTS = [
  'Ahmednagar',
  'Akola',
  'Amravati',
  'Aurangabad',
  'Beed',
  'Bhandara',
  'Buldhana',
  'Chandrapur',
  'Dharashiv',
  'Dhule',
  'Gadchiroli',
  'Gondia',
  'Hingoli',
  'Jalgaon',
  'Jalna',
  'Kolhapur',
  'Latur',
  'Mumbai Suburban',
  'Nagpur',
  'Nanded',
  'Nandurbar',
  'Nashik',
  'Palghar',
  'Parbhani',
  'Pune',
  'Raigad',
  'Ratnagiri',
  'Sangli',
  'Satara',
  'Sindhudurg',
  'Solapur',
  'Thane',
  'Wardha',
  'Washim',
  'Yavatmal',
];

const getRiskLevel = (value) => {
  if (value == null || Number.isNaN(Number(value))) return 'UNKNOWN';

  const score = Number(value);

  if (score >= 15) return 'VERY HIGH';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MODERATE';
  if (score >= 2) return 'LOW';
  return 'VERY LOW';
};

const getRiskColor = (level) => {
  switch (level) {
    case 'VERY HIGH':
      return '#dc2626';
    case 'HIGH':
      return '#f97316';
    case 'MODERATE':
      return '#eab308';
    case 'LOW':
      return '#84cc16';
    case 'VERY LOW':
      return '#16a34a';
    default:
      return '#94a3b8';
  }
};

function FitMaharashtraBounds({ geojson }) {
  const map = useMap();

  useEffect(() => {
    if (!geojson) return;

    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [20, 20],
      });
    }
  }, [geojson, map]);

  return null;
}

export default function Dashboard() {
  const [district, setDistrict] = useState('Wardha');

  const [dashboard, setDashboard] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [allDistrictRisk, setAllDistrictRisk] = useState({});

  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setLoadingDashboard(true);
      setError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/${encodeURIComponent(district)}`
        );

        if (!response.ok) {
          throw new Error(`Dashboard API returned ${response.status}`);
        }

        const json = await response.json();
        setDashboard(json);
      } catch (err) {
        console.error('Dashboard API error:', err);
        setDashboard(null);
        setError(
          'Dashboard API could not be loaded. Keep Spring Boot running on port 8080.'
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    loadDashboard();
  }, [district]);

  useEffect(() => {
    const loadGeoJsonAndRisk = async () => {
      setLoadingMap(true);

      try {
        const geoResponse = await fetch(`${API_BASE_URL}/api/geojson`);

        if (!geoResponse.ok) {
          throw new Error(`GeoJSON API returned ${geoResponse.status}`);
        }

        const geo = await geoResponse.json();
        setGeojson(geo);

        const entries = await Promise.all(
          DISTRICTS.map(async (item) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/dashboard/${encodeURIComponent(item)}`
              );

              if (!response.ok) {
                return [item, null];
              }

              const json = await response.json();

              const predicted = json?.mlPrediction?.predictedFloodAreaPct;
              const cwcFlag = json?.risk?.cwcOver15pctFlag;

              let level = getRiskLevel(predicted);

              if (Number(cwcFlag) === 1) {
                level = 'VERY HIGH';
              }

              return [item, level];
            } catch (err) {
              console.error(`Risk load failed for ${item}`, err);
              return [item, null];
            }
          })
        );

        setAllDistrictRisk(Object.fromEntries(entries));
      } catch (err) {
        console.error('Map API error:', err);
        setGeojson(null);
        setError((current) =>
          current
            ? current
            : 'Maharashtra district boundaries could not be loaded from Spring Boot.'
        );
      } finally {
        setLoadingMap(false);
      }
    };

    loadGeoJsonAndRisk();
  }, []);

  const risk = dashboard?.risk ?? null;
  const mlPrediction = dashboard?.mlPrediction ?? null;
  const relocationPlaces = dashboard?.relocationPlaces ?? [];

  const predicted = mlPrediction?.predictedFloodAreaPct ?? null;
  const historical = mlPrediction?.historicalFloodAreaPct ?? null;

  const riskLevel = useMemo(() => {
    if (Number(risk?.cwcOver15pctFlag) === 1) {
      return 'VERY HIGH';
    }

    return getRiskLevel(predicted);
  }, [risk, predicted]);

  const selectedRiskColor = getRiskColor(riskLevel);

  const geoJsonStyle = (feature) => {
    const featureDistrict = feature?.properties?.district;

    const level =
      featureDistrict === district
        ? riskLevel
        : allDistrictRisk[featureDistrict] || 'UNKNOWN';

    return {
  fillColor: getRiskColor(level),
  color: featureDistrict === district ? '#111827' : '#475569',
  weight: featureDistrict === district ? 3 : 1.5,
  fillOpacity: featureDistrict === district ? 0.95 : 0.9,
};
  };

  const onEachDistrict = (feature, layer) => {
    const featureDistrict = feature?.properties?.district || 'Unknown';

    const level =
      featureDistrict === district
        ? riskLevel
        : allDistrictRisk[featureDistrict] || 'UNKNOWN';

    layer.bindTooltip(
      `<strong>${featureDistrict}</strong><br/>Risk: ${level}`,
      {
        permanent: true,
        direction: 'center',
        className: 'district-map-label',
      }
    );

    layer.on({
      click: () => {
        if (DISTRICTS.includes(featureDistrict)) {
          setDistrict(featureDistrict);
        }
      },
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          AI-Powered Disaster Risk and Relocation Planning System — Maharashtra
        </p>
      </div>

      <div className="card" style={{ maxWidth: 520, marginBottom: 20 }}>
        <label className="form-label" htmlFor="dashboard-district">
          Select District
        </label>

        <select
          id="dashboard-district"
          className="form-select"
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
        >
          {DISTRICTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          style={{
            padding: 16,
            marginBottom: 20,
            background: '#fff5f5',
            border: '1px solid #fecaca',
            borderRadius: 10,
            color: '#b91c1c',
          }}
        >
          {error}
        </div>
      )}

      {loadingDashboard && (
        <div
          className="card"
          style={{
            padding: 20,
            marginBottom: 20,
          }}
        >
          Loading {district} dashboard data...
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stats-card">
          <div className="label">Population</div>
          <div className="value">
            {risk?.population2011 != null
              ? Number(risk.population2011).toLocaleString('en-IN')
              : '—'}
          </div>
          <Users size={22} style={{ marginTop: 10 }} />
        </div>

        <div className="stats-card">
          <div className="label">Historical Flood Area</div>
          <div className="value">
            {historical != null
              ? `${Number(historical).toFixed(2)}%`
              : '—'}
          </div>
          <Waves size={22} style={{ marginTop: 10 }} />
        </div>

        <div className="stats-card">
          <div className="label">ML Predicted Flood Area</div>
          <div className="value">
            {predicted != null
              ? `${Number(predicted).toFixed(4)}%`
              : '—'}
          </div>
          <CloudRain size={22} style={{ marginTop: 10 }} />
        </div>

        <div className="stats-card">
          <div className="label">Relocation Records</div>
          <div className="value">
            {dashboard?.relocationPlaceCount ?? relocationPlaces.length}
          </div>
          <Home size={22} style={{ marginTop: 10 }} />
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <AlertTriangle size={22} />

        <strong>ML Risk Level</strong>

        <span
          style={{
            background: selectedRiskColor,
            color: '#fff',
            borderRadius: 999,
            padding: '6px 14px',
            fontWeight: 700,
          }}
        >
          {riskLevel}
        </span>

        <span>
          {predicted != null
            ? `${Number(predicted).toFixed(4)}% predicted flood-affected area`
            : 'No prediction available'}
        </span>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 20,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div
          className="card-header"
          style={{ padding: '18px 20px' }}
        >
          <div>
            <div className="card-title">
              Maharashtra Flood Risk Map
            </div>
            <div className="card-subtitle">
              Click a district to load its complete dashboard
            </div>
          </div>

          <MapPin size={22} />
        </div>

        <div
          style={{
            height: 560,
            position: 'relative',
          }}
        >
          {loadingMap && (
            <div
              style={{
                position: 'absolute',
                zIndex: 1000,
                top: 15,
                left: 15,
                background: '#fff',
                padding: '8px 12px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Loading Maharashtra map...
            </div>
          )}

          {geojson ? (
            <MapContainer
              center={[19.5, 76]}
              zoom={6}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <GeoJSON
                key={`${district}-${JSON.stringify(allDistrictRisk)}`}
                data={geojson}
                style={geoJsonStyle}
                onEachFeature={onEachDistrict}
              />

              <FitMaharashtraBounds geojson={geojson} />
            </MapContainer>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <strong>
                Maharashtra district map is not available.
              </strong>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              zIndex: 1000,
              right: 15,
              bottom: 15,
              background: '#fff',
              padding: 14,
              borderRadius: 10,
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              ML Risk Legend
            </div>

            {[
              ['VERY HIGH', '≥ 15%'],
              ['HIGH', '10–14.99%'],
              ['MODERATE', '5–9.99%'],
              ['LOW', '2–4.99%'],
              ['VERY LOW', '< 2%'],
            ].map(([level, range]) => (
              <div
                key={level}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: getRiskColor(level),
                    display: 'inline-block',
                  }}
                />

                <span>
                  {level} {range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <strong>Selected district:</strong>

        <span>{district}</span>

        <span
          style={{
            background: selectedRiskColor,
            color: '#fff',
            borderRadius: 999,
            padding: '5px 12px',
            fontWeight: 700,
          }}
        >
          {riskLevel}
        </span>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Key Indicators</div>
          <Ruler size={22} />
        </div>

        <div className="dashboard-indicators">
          <div className="dashboard-indicator">
            <div className="value">
              {risk?.meanElevationM != null
                ? Number(risk.meanElevationM).toFixed(1)
                : '—'}
            </div>
            <div className="label">Elevation (m)</div>
          </div>

          <div className="dashboard-indicator">
            <div className="value">
              {risk?.meanSlopeDeg != null
                ? Number(risk.meanSlopeDeg).toFixed(2)
                : '—'}
            </div>
            <div className="label">Slope (°)</div>
          </div>

          <div className="dashboard-indicator">
            <div className="value">
              {risk?.nearestRiverDistanceKm != null
                ? Number(risk.nearestRiverDistanceKm).toFixed(2)
                : '—'}
            </div>
            <div className="label">River Distance (km)</div>
          </div>

          <div className="dashboard-indicator">
            <div className="value">
              {risk?.meanDailyRainfallMm != null
                ? Number(risk.meanDailyRainfallMm).toFixed(2)
                : '—'}
            </div>
            <div className="label">Mean Rainfall (mm)</div>
          </div>
        </div>
      </div>
    </div>
  );
}