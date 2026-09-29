import React, { useEffect, useState } from 'react';
import { Calendar, Waves } from 'lucide-react';

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

const formatPercent = (value) => {
  if (value === null || value === undefined) {
    return 'Not available in source';
  }

  return `${Number(value).toFixed(2)}%`;
};

const FloodHistory = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Wardha');
  const [riskData, setRiskData] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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
        console.error('Flood history request failed:', err);
        setRiskData(null);
        setMlData(null);
        setError(
          'Could not load flood history data. Make sure the Spring Boot backend is running on port 8080.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDistrict]);

  const historicalFloodArea =
    mlData?.floodAffectedAreaPct19862022 ??
    riskData?.floodAffectedAreaPct19862022 ??
    null;

  const predictedFloodArea = mlData?.predictedFloodAreaPct ?? null;

  const riskLevel =
    predictedFloodArea === null
      ? 'Not available in source'
      : predictedFloodArea >= 15
        ? 'VERY HIGH'
        : predictedFloodArea >= 10
          ? 'HIGH'
          : predictedFloodArea >= 5
            ? 'MODERATE'
            : predictedFloodArea >= 2
              ? 'LOW'
              : 'VERY LOW';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Flood History</h1>
        <p className="page-subtitle">
          Historical CWC flood-affected area and ML prediction comparison
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: '520px',
          marginBottom: 'var(--spacing-5)',
        }}
      >
        <label className="form-label" htmlFor="flood-history-district">
          Select District
        </label>

        <select
          id="flood-history-district"
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
          Loading flood history...
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
            <span className="flood-history-cwc">
              <span className="dot" />
              CWC historical flood data
            </span>

            <span
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-gray-500)',
              }}
            >
              Flood-affected area reported for 1986–2022
            </span>
          </div>

          <div className="flood-history-charts">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    Historical Flood-Affected Area
                  </div>
                  <div className="card-subtitle">
                    {selectedDistrict}
                  </div>
                </div>

                <Waves size={22} />
              </div>

              <div
                style={{
                  minHeight: '240px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  textAlign: 'center',
                  background: 'var(--color-gray-50)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-6)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--font-size-4xl)',
                    fontWeight: 700,
                    color: 'var(--color-primary-700)',
                  }}
                >
                  {formatPercent(historicalFloodArea)}
                </div>

                <div
                  style={{
                    marginTop: 'var(--spacing-2)',
                    color: 'var(--color-gray-500)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  District area affected by floods during the CWC
                  1986–2022 reference period
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Historical vs ML Prediction</div>
                  <div className="card-subtitle">
                    Flood-affected area percentage
                  </div>
                </div>
              </div>

              <div
                style={{
                  minHeight: '240px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '48px',
                  padding: 'var(--spacing-6)',
                }}
              >
                <div
                  style={{
                    width: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: '180px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height:
                        historicalFloodArea !== null
                          ? `${Math.max(
                              8,
                              Math.min(
                                160,
                                Number(historicalFloodArea) * 8
                              )
                            )}px`
                          : '8px',
                      background: '#4299e1',
                      borderRadius: '6px 6px 0 0',
                    }}
                  />

                  <strong
                    style={{
                      marginTop: 'var(--spacing-2)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {formatPercent(historicalFloodArea)}
                  </strong>

                  <span
                    style={{
                      marginTop: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    Historical
                  </span>
                </div>

                <div
                  style={{
                    width: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: '180px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height:
                        predictedFloodArea !== null
                          ? `${Math.max(
                              8,
                              Math.min(
                                160,
                                Number(predictedFloodArea) * 8
                              )
                            )}px`
                          : '8px',
                      background: '#ed8936',
                      borderRadius: '6px 6px 0 0',
                    }}
                  />

                  <strong
                    style={{
                      marginTop: 'var(--spacing-2)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                  >
                    {formatPercent(predictedFloodArea)}
                  </strong>

                  <span
                    style={{
                      marginTop: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-gray-500)',
                    }}
                  >
                    ML Prediction
                  </span>
                </div>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-gray-400)',
                }}
              >
                Blue = historical CWC value · Orange = Random Forest
                prediction
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--spacing-5)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--spacing-5)',
            }}
          >
            <div className="card">
              <div className="card-header">
                <div className="card-title">District Information</div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-3)',
                  }}
                >
                  <span style={{ color: 'var(--color-gray-500)' }}>
                    District
                  </span>
                  <strong>{selectedDistrict}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-3)',
                  }}
                >
                  <span style={{ color: 'var(--color-gray-500)' }}>
                    Historical Flood Area
                  </span>
                  <strong>{formatPercent(historicalFloodArea)}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-3)',
                  }}
                >
                  <span style={{ color: 'var(--color-gray-500)' }}>
                    ML Predicted Flood Area
                  </span>
                  <strong>{formatPercent(predictedFloodArea)}</strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-3)',
                  }}
                >
                  <span style={{ color: 'var(--color-gray-500)' }}>
                    ML Risk Level
                  </span>
                  <strong>{riskLevel}</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Data Source</div>
                <Calendar size={20} />
              </div>

              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-600)',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <strong>CWC:</strong> Historical flood-affected area
                  covering the 1986–2022 reference period.
                </div>

                <div>
                  <strong>ML model:</strong> Random Forest Regression
                  prediction of flood-affected area percentage.
                </div>

                <div
                  style={{
                    marginTop: 'var(--spacing-3)',
                    color: 'var(--color-gray-500)',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  The current backend does not expose year-by-year flood
                  event records through an API, so this page does not invent
                  annual historical values.
                </div>
              </div>
            </div>
          </div>

          <div
            className="info-box"
            style={{ marginTop: 'var(--spacing-5)' }}
          >
            <div className="title">About this comparison</div>
            <div className="text">
              Historical values come from the CWC flood-affected-area
              dataset. ML values come from the Random Forest model. They are
              displayed separately so historical evidence is not confused
              with model prediction.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloodHistory;