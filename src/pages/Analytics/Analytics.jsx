import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Droplets,
  Mountain,
  Ruler,
  TrendingUp,
  Users,
} from 'lucide-react';

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

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) {
    return 'Not available in source';
  }

  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const MetricCard = ({ icon: Icon, label, value, unit = '' }) => {
  return (
    <div className="stats-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-3)',
        }}
      >
        <div>
          <div className="label">{label}</div>
          <div className="value">
            {value}
            {unit && value !== 'Not available in source' ? ` ${unit}` : ''}
          </div>
        </div>

        <div className="icon-wrapper blue">
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

const HorizontalBar = ({ label, value, max, unit = '' }) => {
  const numericValue =
    value !== null && value !== undefined ? Number(value) : null;

  const numericMax = Number(max) > 0 ? Number(max) : 1;

  const width =
    numericValue === null
      ? 0
      : Math.min(100, Math.max(0, (numericValue / numericMax) * 100));

  return (
    <div style={{ marginBottom: 'var(--spacing-4)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-2)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <span style={{ color: 'var(--color-gray-600)' }}>{label}</span>

        <strong style={{ color: 'var(--color-gray-700)' }}>
          {numericValue === null
            ? 'Not available in source'
            : `${numericValue.toFixed(2)}${unit ? ` ${unit}` : ''}`}
        </strong>
      </div>

      <div
        style={{
          height: '10px',
          background: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            background: 'var(--color-primary-500)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
};

const Analytics = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Wardha');
  const [riskData, setRiskData] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!selectedDistrict) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const encodedDistrict = encodeURIComponent(selectedDistrict);

        const [riskResponse, mlResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/risk/${encodedDistrict}`),
          fetch(`${API_BASE_URL}/api/ml/${encodedDistrict}`),
        ]);

        if (!riskResponse.ok) {
          throw new Error(`Risk request failed: ${riskResponse.status}`);
        }

        if (!mlResponse.ok) {
          throw new Error(`ML request failed: ${mlResponse.status}`);
        }

        const [risk, ml] = await Promise.all([
          riskResponse.json(),
          mlResponse.json(),
        ]);

        setRiskData(risk);
        setMlData(ml);
      } catch (err) {
        console.error('Analytics request failed:', err);
        setRiskData(null);
        setMlData(null);
        setError(
          'Could not load analytics data. Make sure the Spring Boot backend is running on port 8080.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedDistrict]);

  const environmentalMetrics = [
    {
      label: 'Mean Elevation',
      value: riskData?.meanElevationM,
      unit: 'm',
      icon: Mountain,
    },
    {
      label: 'Mean Slope',
      value: riskData?.meanSlopeDeg,
      unit: '°',
      icon: TrendingUp,
    },
    {
      label: 'Nearest River',
      value: riskData?.nearestRiverDistanceKm,
      unit: 'km',
      icon: Ruler,
    },
    {
      label: 'Population Density',
      value: riskData?.populationDensity2011,
      unit: 'people/km²',
      icon: Users,
    },
  ];

  const rainfallMetrics = [
    {
      label: 'Mean Daily Rainfall',
      value: riskData?.meanDailyRainfallMm,
    },
    {
      label: 'Maximum Daily Rainfall',
      value: riskData?.maxDailyRainfallMm,
    },
    {
      label: 'Rainfall 95th Percentile',
      value: riskData?.rainfallP95Mm,
    },
    {
      label: 'Mean Monsoon Rainfall',
      value: riskData?.meanMonsoonRainfallMm,
    },
  ];

  const lulcMetrics = [
    {
      label: 'Tree Cover',
      value: riskData?.treeCoverPct,
    },
    {
      label: 'Cropland',
      value: riskData?.croplandPct,
    },
    {
      label: 'Built-up',
      value: riskData?.builtUpPct,
    },
    {
      label: 'Permanent Water Bodies',
      value: riskData?.permanentWaterBodiesPct,
    },
  ];

  const historical = mlData?.floodAffectedAreaPct19862022 ?? null;
  const predicted = mlData?.predictedFloodAreaPct ?? null;

  const comparisonMax = Math.max(
    historical ?? 0,
    predicted ?? 0,
    1
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">
          Environmental, demographic, rainfall and flood-risk indicators
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: '520px',
          marginBottom: 'var(--spacing-5)',
        }}
      >
        <label className="form-label" htmlFor="analytics-district">
          Select District
        </label>

        <select
          id="analytics-district"
          className="form-select"
          value={selectedDistrict}
          onChange={(event) => setSelectedDistrict(event.target.value)}
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
            padding: 'var(--spacing-4)',
            marginBottom: 'var(--spacing-5)',
            background: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: 'var(--radius-md)',
            color: '#c53030',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--spacing-10)',
            color: 'var(--color-gray-500)',
          }}
        >
          Loading analytics data...
        </div>
      ) : (
        <>
          <div
            className="card"
            style={{
              marginBottom: 'var(--spacing-5)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              flexWrap: 'wrap',
            }}
          >
            <BarChart3 size={22} />
            <strong>{selectedDistrict}</strong>
            <span style={{ color: 'var(--color-gray-500)' }}>
              Real values from Spring Boot APIs
            </span>
          </div>

          <div className="dashboard-stats">
            <MetricCard
              icon={Droplets}
              label="Historical Flood Area"
              value={
                historical !== null
                  ? Number(historical).toFixed(2)
                  : 'Not available in source'
              }
              unit={historical !== null ? '%' : ''}
            />

            <MetricCard
              icon={Droplets}
              label="ML Predicted Flood Area"
              value={
                predicted !== null
                  ? Number(predicted).toFixed(2)
                  : 'Not available in source'
              }
              unit={predicted !== null ? '%' : ''}
            />

            <MetricCard
              icon={Users}
              label="Population"
              value={
                riskData?.population2011 !== null &&
                riskData?.population2011 !== undefined
                  ? formatNumber(riskData.population2011, 0)
                  : 'Not available in source'
              }
            />

            <MetricCard
              icon={Ruler}
              label="Nearest River"
              value={formatNumber(riskData?.nearestRiverDistanceKm)}
              unit={
                riskData?.nearestRiverDistanceKm !== null &&
                riskData?.nearestRiverDistanceKm !== undefined
                  ? 'km'
                  : ''
              }
            />
          </div>

          <div className="analytics-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Historical vs ML Prediction
                  </div>
                  <div className="card-subtitle">
                    Flood-affected area percentage
                  </div>
                </div>
              </div>

              <HorizontalBar
                label="Historical CWC"
                value={historical}
                max={comparisonMax}
                unit="%"
              />

              <HorizontalBar
                label="Random Forest Prediction"
                value={predicted}
                max={comparisonMax}
                unit="%"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Rainfall Indicators
                  </div>
                  <div className="card-subtitle">
                    District rainfall features used by the model
                  </div>
                </div>
              </div>

              {rainfallMetrics.map((metric) => (
                <HorizontalBar
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  max={Math.max(
                    ...rainfallMetrics.map((item) =>
                      Number(item.value) || 0
                    ),
                    1
                  )}
                  unit="mm"
                />
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Terrain & Demographic Indicators
                  </div>
                  <div className="card-subtitle">
                    Elevation, slope, river proximity and population
                  </div>
                </div>
              </div>

              {environmentalMetrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3) 0',
                      borderBottom:
                        '1px solid var(--color-gray-100)',
                    }}
                  >
                    <Icon size={20} />

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-gray-500)',
                        }}
                      >
                        {metric.label}
                      </div>

                      <strong>
                        {metric.value !== null &&
                        metric.value !== undefined
                          ? `${formatNumber(
                              metric.value
                            )} ${metric.unit}`
                          : 'Not available in source'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Land Cover Indicators
                  </div>
                  <div className="card-subtitle">
                    ESA WorldCover 2021 district percentages
                  </div>
                </div>
              </div>

              {lulcMetrics.map((metric) => (
                <HorizontalBar
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  max={100}
                  unit="%"
                />
              ))}
            </div>

            <div className="card analytics-grid full-width">
              <div>
                <div className="card-title">
                  Additional Rainfall Indicators
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--spacing-4)',
                    marginTop: 'var(--spacing-4)',
                  }}
                >
                  <div className="dashboard-indicator">
                    <div className="value">
                      {formatNumber(
                        riskData?.rainyDays50mmPlus,
                        0
                      )}
                    </div>
                    <div className="label">
                      Rainy Days ≥50 mm
                    </div>
                  </div>

                  <div className="dashboard-indicator">
                    <div className="value">
                      {formatNumber(
                        riskData?.rainyDays100mmPlus,
                        0
                      )}
                    </div>
                    <div className="label">
                      Rainy Days ≥100 mm
                    </div>
                  </div>

                  <div className="dashboard-indicator">
                    <div className="value">
                      {formatNumber(
                        riskData?.maxMonsoonRainfallMm
                      )}
                    </div>
                    <div className="label">
                      Max Monsoon Rainfall (mm)
                    </div>
                  </div>

                  <div className="dashboard-indicator">
                    <div className="value">
                      {formatNumber(
                        riskData?.totalMonsoonRainfallMm
                      )}
                    </div>
                    <div className="label">
                      Total Monsoon Rainfall (mm)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="info-box"
            style={{ marginTop: 'var(--spacing-5)' }}
          >
            <div className="title">Data interpretation</div>

            <div className="text">
              Analytics on this page use values returned by the real Spring
              Boot risk and ML endpoints. Historical flood area represents
              the CWC 1986–2022 reference value, while predicted flood area
              represents the Random Forest model prediction.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;