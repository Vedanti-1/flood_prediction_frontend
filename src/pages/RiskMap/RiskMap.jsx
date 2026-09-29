import React, { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = 'http://localhost:8080';

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

const getRiskLevel = (value, cwcFlag = 0) => {
  if (Number(cwcFlag) === 1) return 'VERY HIGH';

  if (value == null || Number.isNaN(Number(value))) {
    return 'UNKNOWN';
  }

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

const formatNumber = (value, decimals = 2) => {
  if (value == null) return '—';

  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

function FitBounds({ geojson }) {
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

export default function RiskMap() {
  const [selectedDistrict, setSelectedDistrict] = useState('Wardha');
  const [data, setData] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [allDistrictRisk, setAllDistrictRisk] = useState({});
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDistrict = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/${encodeURIComponent(
            selectedDistrict
          )}`
        );

        if (!response.ok) {
          throw new Error(`Dashboard API ${response.status}`);
        }

        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setData(null);
        setError('Could not load district data from Spring Boot.');
      } finally {
        setLoading(false);
      }
    };

    loadDistrict();
  }, [selectedDistrict]);

  useEffect(() => {
    const loadMap = async () => {
      setMapLoading(true);

      try {
        const geoResponse = await fetch(`${API_BASE_URL}/api/geojson`);

        if (!geoResponse.ok) {
          throw new Error(`GeoJSON API ${geoResponse.status}`);
        }

        const geo = await geoResponse.json();
        setGeojson(geo);

        const results = await Promise.all(
          DISTRICTS.map(async (district) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/dashboard/${encodeURIComponent(
                  district
                )}`
              );

              if (!response.ok) {
                return [district, 'UNKNOWN'];
              }

              const json = await response.json();

              return [
                district,
                getRiskLevel(
                  json?.mlPrediction?.predictedFloodAreaPct,
                  json?.risk?.cwcOver15pctFlag
                ),
              ];
            } catch {
              return [district, 'UNKNOWN'];
            }
          })
        );

        setAllDistrictRisk(Object.fromEntries(results));
      } catch (err) {
        console.error(err);
        setGeojson(null);
        setError(
          'Could not load Maharashtra district boundaries from Spring Boot.'
        );
      } finally {
        setMapLoading(false);
      }
    };

    loadMap();
  }, []);

  const risk = data?.risk ?? null;
  const prediction = data?.mlPrediction ?? null;

  const riskLevel = useMemo(
    () =>
      getRiskLevel(
        prediction?.predictedFloodAreaPct,
        risk?.cwcOver15pctFlag
      ),
    [prediction, risk]
  );

  const riskColor = getRiskColor(riskLevel);

  const geoJsonStyle = (feature) => {
    const name = feature?.properties?.district;

    const level =
      name === selectedDistrict
        ? riskLevel
        : allDistrictRisk[name] || 'UNKNOWN';

    return {
      fillColor: getRiskColor(level),
      color: name === selectedDistrict ? '#111827' : '#475569',
      weight: name === selectedDistrict ? 3 : 1.5,
      fillOpacity: name === selectedDistrict ? 0.95 : 0.9,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature?.properties?.district || 'Unknown';
    const level = allDistrictRisk[name] || 'UNKNOWN';

    layer.bindTooltip(
      `<strong>${name}</strong><br/>${level}`,
      {
        permanent: true,
        direction: 'center',
        className: 'district-map-label',
      }
    );

    layer.on({
      click: () => {
        if (DISTRICTS.includes(name)) {
          setSelectedDistrict(name);
        }
      },
    });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Risk Map</h1>
        <p className="page-subtitle">
          District-level AI flood-risk information for Maharashtra
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: 520,
          marginBottom: 20,
        }}
      >
        <label className="form-label" htmlFor="risk-map-district">
          Select District
        </label>

        <select
          id="risk-map-district"
          className="form-select"
          value={selectedDistrict}
          onChange={(event) =>
            setSelectedDistrict(event.target.value)
          }
        >
          {DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
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

      <div className="risk-map-layout">
        <div
          className="card"
          style={{
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
                Click any district to view its risk information
              </div>
            </div>

            <MapPin size={22} />
          </div>

          <div
            style={{
              height: 600,
              position: 'relative',
            }}
          >
            {mapLoading && (
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

            {geojson && (
              <MapContainer
                center={[19.5, 76]}
                zoom={6}
                scrollWheelZoom
                style={{
                  height: '100%',
                  width: '100%',
                }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GeoJSON
                  key={`${selectedDistrict}-${JSON.stringify(
                    allDistrictRisk
                  )}`}
                  data={geojson}
                  style={geoJsonStyle}
                  onEachFeature={onEachFeature}
                />

                <FitBounds geojson={geojson} />
              </MapContainer>
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
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Risk Legend
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

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                District Information
              </div>
              <div className="card-subtitle">
                Live from the current Spring Boot API
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 30, textAlign: 'center' }}>
              Loading district data...
            </div>
          ) : data ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18,
                  flexWrap: 'wrap',
                }}
              >
                <strong>{selectedDistrict}</strong>

                <span
                  style={{
                    background: riskColor,
                    color: '#fff',
                    borderRadius: 999,
                    padding: '6px 12px',
                    fontWeight: 700,
                  }}
                >
                  {riskLevel}
                </span>
              </div>

              <div className="risk-map-info-panel">
                <div className="info-row">
                  <span className="info-label">
                    Historical Flood Area
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      prediction?.historicalFloodAreaPct,
                      2
                    )}
                    %
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    ML Predicted Flood Area
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      prediction?.predictedFloodAreaPct,
                      4
                    )}
                    %
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Population
                  </span>
                  <span className="info-value">
                    {risk?.population2011 != null
                      ? Number(
                          risk.population2011
                        ).toLocaleString('en-IN')
                      : '—'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Population Density
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.populationDensity2011,
                      2
                    )}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Mean Elevation
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.meanElevationM,
                      1
                    )}{' '}
                    m
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Mean Slope
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.meanSlopeDeg,
                      2
                    )}
                    °
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Mean Daily Rainfall
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.meanDailyRainfallMm,
                      2
                    )}{' '}
                    mm
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Max Daily Rainfall
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.maxDailyRainfallMm,
                      2
                    )}{' '}
                    mm
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    Nearest River
                  </span>
                  <span className="info-value">
                    {formatNumber(
                      risk?.nearestRiverDistanceKm,
                      2
                    )}{' '}
                    km
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">
                    CWC Over 15%
                  </span>
                  <span className="info-value">
                    {Number(risk?.cwcOver15pctFlag) === 1
                      ? 'Yes'
                      : 'No'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 30 }}>
              No district data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}