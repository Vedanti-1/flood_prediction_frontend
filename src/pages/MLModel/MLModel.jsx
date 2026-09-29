import React, { useEffect, useState } from 'react';
import { BarChart3, Brain, CheckCircle, Info } from 'lucide-react';

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

const getRiskLevel = (percentage) => {
  if (percentage === null || percentage === undefined) {
    return 'UNKNOWN';
  }

  if (percentage >= 15) return 'VERY HIGH';
  if (percentage >= 10) return 'HIGH';
  if (percentage >= 5) return 'MODERATE';
  if (percentage >= 2) return 'LOW';
  return 'VERY LOW';
};

const getRiskColor = (level) => {
  switch (level) {
    case 'VERY HIGH':
      return '#e53e3e';
    case 'HIGH':
      return '#ed8936';
    case 'MODERATE':
      return '#ecc94b';
    case 'LOW':
      return '#48bb78';
    case 'VERY LOW':
      return '#38a169';
    default:
      return '#718096';
  }
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return 'Not available in source';
  }

  return `${Number(value).toFixed(4)}%`;
};

const MLModel = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Wardha');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMLPrediction = async () => {
      if (!selectedDistrict) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/ml/${encodeURIComponent(selectedDistrict)}`
        );

        if (!response.ok) {
          throw new Error(`ML request failed with status ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('ML prediction request failed:', err);
        setData(null);
        setError(
          'Could not load ML prediction. Make sure the Spring Boot backend is running on port 8080.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMLPrediction();
  }, [selectedDistrict]);

  const historical = data?.floodAffectedAreaPct19862022 ?? null;
  const predicted = data?.predictedFloodAreaPct ?? null;
  const backendRiskLevel = data?.riskLevel ?? null;

  const calculatedRiskLevel = getRiskLevel(predicted);
  const riskLevel = backendRiskLevel || calculatedRiskLevel;
  const riskColor = getRiskColor(riskLevel);

  const comparisonMax = Math.max(
    historical ?? 0,
    predicted ?? 0,
    1
  );

  const historicalWidth =
    historical === null
      ? 0
      : Math.min(100, (Number(historical) / comparisonMax) * 100);

  const predictedWidth =
    predicted === null
      ? 0
      : Math.min(100, (Number(predicted) / comparisonMax) * 100);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">ML Model</h1>
        <p className="page-subtitle">
          Random Forest Regression for district-level flood-affected area
          prediction
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: '520px',
          marginBottom: 'var(--spacing-5)',
        }}
      >
        <label className="form-label" htmlFor="ml-district">
          Select District
        </label>

        <select
          id="ml-district"
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

      <div className="ml-model-section">
        <div className="card model-card">
          <div className="card-header">
            <div>
              <div className="card-title">About the Model</div>
              <div className="card-subtitle">
                Random Forest Regression
              </div>
            </div>

            <Brain size={22} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-5)',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-2)',
                }}
              >
                <Brain size={18} />
                <strong>Prediction target</strong>
              </div>

              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-600)',
                  lineHeight: 1.7,
                }}
              >
                The model predicts the percentage of district area affected
                by floods.
              </p>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--spacing-2)',
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-2)',
                }}
              >
                <BarChart3 size={18} />
                <strong>Model type</strong>
              </div>

              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-600)',
                  lineHeight: 1.7,
                }}
              >
                Random Forest Regression using rainfall, terrain,
                population, land-cover and river-distance features.
              </p>
            </div>
          </div>
        </div>

        <div className="card model-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Risk Classification Thresholds
              </div>
              <div className="card-subtitle">
                Applied to the ML predicted flood-affected area
              </div>
            </div>

            <Info size={20} />
          </div>

          <div className="threshold-grid">
            <div className="threshold-item">
              <span
                className="swatch"
                style={{ background: '#b7332a' }}
              />
              <strong>VERY HIGH</strong>
              <span>≥15%</span>
            </div>

            <div className="threshold-item">
              <span
                className="swatch"
                style={{ background: '#db6a2e' }}
              />
              <strong>HIGH</strong>
              <span>10–&lt;15%</span>
            </div>

            <div className="threshold-item">
              <span
                className="swatch"
                style={{ background: '#e0a526' }}
              />
              <strong>MODERATE</strong>
              <span>5–&lt;10%</span>
            </div>

            <div className="threshold-item">
              <span
                className="swatch"
                style={{ background: '#7ca653' }}
              />
              <strong>LOW</strong>
              <span>2–&lt;5%</span>
            </div>

            <div className="threshold-item">
              <span
                className="swatch"
                style={{ background: '#2f8f7b' }}
              />
              <strong>VERY LOW</strong>
              <span>&lt;2%</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card model-card">
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-10)',
                color: 'var(--color-gray-500)',
              }}
            >
              Loading ML prediction...
            </div>
          </div>
        ) : (
          <div className="card model-card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  Prediction for {selectedDistrict}
                </div>
                <div className="card-subtitle">
                  Values returned by Spring Boot
                </div>
              </div>

              <CheckCircle size={22} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 'var(--spacing-4)',
                marginBottom: 'var(--spacing-5)',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-4)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-500)',
                  }}
                >
                  Historical Flood Area
                </div>

                <div
                  style={{
                    marginTop: 'var(--spacing-2)',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                  }}
                >
                  {formatPercentage(historical)}
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-400)',
                  }}
                >
                  CWC 1986–2022
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-4)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-500)',
                  }}
                >
                  Predicted Flood Area
                </div>

                <div
                  style={{
                    marginTop: 'var(--spacing-2)',
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                  }}
                >
                  {formatPercentage(predicted)}
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-400)',
                  }}
                >
                  Random Forest
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-4)',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-gray-500)',
                  }}
                >
                  Risk Level
                </div>

                <div style={{ marginTop: 'var(--spacing-2)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      borderRadius: 'var(--radius-full)',
                      background: riskColor,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {riskLevel}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-gray-500)',
                  marginBottom: '6px',
                }}
              >
                <span>Historical CWC</span>
                <span>ML Prediction</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 'var(--spacing-3)',
                }}
              >
                <div>
                  <div
                    style={{
                      height: '12px',
                      background: 'var(--color-gray-200)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${historicalWidth}%`,
                        height: '100%',
                        background: '#4299e1',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      height: '12px',
                      background: 'var(--color-gray-200)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${predictedWidth}%`,
                        height: '100%',
                        background: '#ed8936',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card model-card">
          <div className="card-header">
            <div>
              <div className="card-title">Model Performance</div>
              <div className="card-subtitle">
                Validation metrics from the trained model
              </div>
            </div>

            <BarChart3 size={20} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--spacing-4)',
            }}
          >
            <div className="dashboard-indicator">
              <div className="value">0.683</div>
              <div className="label">LOOCV R²</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">2.592</div>
              <div className="label">LOOCV RMSE</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">1.310</div>
              <div className="label">LOOCV MAE</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">300</div>
              <div className="label">Random Forest Trees</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--spacing-4)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--spacing-2)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-500)',
            }}
          >
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              Validation metrics are based on leave-one-district-out
              cross-validation. The model uses a Random Forest Regressor
              with 300 trees and predicts flood-affected area percentage.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLModel;