import React, { useEffect, useMemo, useState } from 'react';
import { Home, MapPin } from 'lucide-react';
import DataTable from '../../components/common/DataTable';
import DistrictSelect from '../../components/common/DistrictSelect';

const API_BASE_URL = 'http://localhost:8080';

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

const getRelocationPriority = (cwcFlag, predictedPercentage) => {
  const predicted =
    predictedPercentage !== null && predictedPercentage !== undefined
      ? Number(predictedPercentage)
      : null;

  if (Number(cwcFlag) === 1 || (predicted !== null && predicted >= 15)) {
    return 'VERY HIGH';
  }

  if (predicted !== null && predicted >= 10) {
    return 'HIGH';
  }

  if (predicted !== null && predicted >= 5) {
    return 'MODERATE';
  }

  if (predicted !== null && predicted >= 2) {
    return 'LOW';
  }

  if (predicted !== null) {
    return 'VERY LOW';
  }

  return 'UNKNOWN';
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'VERY HIGH':
      return 'badge-risk-very-high';
    case 'HIGH':
      return 'badge-risk-high';
    case 'MODERATE':
      return 'badge-risk-moderate';
    case 'LOW':
      return 'badge-risk-low';
    case 'VERY LOW':
      return 'badge-risk-very-low';
    default:
      return 'badge-status-unavailable';
  }
};

const formatValue = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return 'Not available in source';
  }

  return Number(value).toFixed(decimals);
};

const formatLocationValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Not available in source';
  }

  return value;
};

const RelocationPlanning = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('Wardha');
  const [riskData, setRiskData] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!selectedDistrict) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const encodedDistrict = encodeURIComponent(selectedDistrict);

        const [riskResponse, mlResponse, relocationResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/risk/${encodedDistrict}`),
            fetch(`${API_BASE_URL}/api/ml/${encodedDistrict}`),
            fetch(`${API_BASE_URL}/api/relocation/${encodedDistrict}`),
          ]);

        if (!riskResponse.ok) {
          throw new Error(`Risk API failed: ${riskResponse.status}`);
        }

        if (!mlResponse.ok) {
          throw new Error(`ML API failed: ${mlResponse.status}`);
        }

        if (!relocationResponse.ok) {
          throw new Error(
            `Relocation API failed: ${relocationResponse.status}`
          );
        }

        const [risk, ml, relocation] = await Promise.all([
          riskResponse.json(),
          mlResponse.json(),
          relocationResponse.json(),
        ]);

        setRiskData(risk);
        setMlData(ml);
        setLocations(Array.isArray(relocation) ? relocation : []);
      } catch (requestError) {
        console.error('Relocation page request failed:', requestError);
        setRiskData(null);
        setMlData(null);
        setLocations([]);
        setError(
          'Could not load relocation data. Make sure the Spring Boot backend is running on port 8080.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDistrict]);

  const historicalFloodArea =
    mlData?.floodAffectedAreaPct19862022 ??
    riskData?.floodAffectedAreaPct19862022 ??
    null;

  const predictedFloodArea = mlData?.predictedFloodAreaPct ?? null;

  const riskLevel = getRiskLevel(predictedFloodArea);

  const relocationPriority = useMemo(
    () =>
      getRelocationPriority(
        riskData?.cwcOver15pctFlag,
        predictedFloodArea
      ),
    [riskData, predictedFloodArea]
  );

  const planningRequired =
    relocationPriority === 'VERY HIGH' ||
    relocationPriority === 'HIGH';

  const columns = [
    {
      key: 'placeName',
      label: 'Place Name',
    },
    {
      key: 'placeType',
      label: 'Place Type',
    },
    {
      key: 'talukaOrArea',
      label: 'Area / Taluka',
    },
    {
      key: 'latitude',
      label: 'Latitude',
      render: (row) =>
        row.latitude !== null && row.latitude !== undefined
          ? Number(row.latitude).toFixed(6)
          : 'Not available in source',
    },
    {
      key: 'longitude',
      label: 'Longitude',
      render: (row) =>
        row.longitude !== null && row.longitude !== undefined
          ? Number(row.longitude).toFixed(6)
          : 'Not available in source',
    },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (row) =>
        formatLocationValue(row.capacity),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        formatLocationValue(row.status),
    },
    {
      key: 'source',
      label: 'Source',
      render: (row) => {
        const isCandidateGroup =
          row.placeType === 'SOURCE-SUPPORTED CANDIDATE GROUP';

        return (
          <div>
            <span
              className={`badge ${
                isCandidateGroup
                  ? 'badge-status-candidate'
                  : 'badge-status-source'
              }`}
            >
              {isCandidateGroup
                ? 'SOURCE-SUPPORTED CANDIDATE GROUP'
                : 'SOURCE-NAMED LOCATION'}
            </span>

            <div
              style={{
                marginTop: '4px',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-gray-500)',
              }}
            >
              {formatLocationValue(row.source)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'sourcePage',
      label: 'Source Page',
      render: (row) =>
        formatLocationValue(row.sourcePage),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Relocation Planning</h1>
        <p className="page-subtitle">
          Source-based relocation information for flood-risk planning
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: '520px',
          marginBottom: 'var(--spacing-5)',
        }}
      >
        <label className="form-label" htmlFor="relocation-district">
          Select District
        </label>

        <DistrictSelect
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          placeholder="Select district..."
        />
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
          Loading relocation data...
        </div>
      ) : (
        <>
          <div className="relocation-summary">
            <div className="stat">
              <div className="value">
                {historicalFloodArea !== null
                  ? `${formatValue(historicalFloodArea, 2)}%`
                  : 'Not available in source'}
              </div>
              <div className="label">Historical Flood Area</div>
            </div>

            <div className="stat">
              <div className="value">
                {predictedFloodArea !== null
                  ? `${formatValue(predictedFloodArea, 4)}%`
                  : 'Not available in source'}
              </div>
              <div className="label">ML Predicted Flood Area</div>
            </div>

            <div className="stat">
              <div
                className={`value badge ${getPriorityClass(
                  relocationPriority
                )}`}
                style={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                }}
              >
                {relocationPriority}
              </div>
              <div className="label">Relocation Priority</div>
            </div>

            <div className="stat">
              <div className="value">
                {riskLevel}
              </div>
              <div className="label">ML Risk Level</div>
            </div>

            <div className="stat">
              <div className="value">
                {planningRequired ? 'Yes' : 'No'}
              </div>
              <div className="label">Planning Required</div>
            </div>

            <div className="stat">
              <div className="value">
                {locations.length}
              </div>
              <div className="label">Relocation Records</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  Relocation Locations
                </h2>
                <p className="card-subtitle">
                  {selectedDistrict} — records returned by the backend
                </p>
              </div>

              <Home size={22} />
            </div>

            <DataTable
              columns={columns}
              rows={locations}
              emptyMessage="No relocation records available in source"
            />
          </div>

          <div
            className="card"
            style={{ marginTop: 'var(--spacing-5)' }}
          >
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  Relocation Data Notes
                </h2>
                <p className="card-subtitle">
                  How the source data is represented
                </p>
              </div>

              <MapPin size={22} />
            </div>

            <div
              style={{
                display: 'grid',
                gap: 'var(--spacing-3)',
                color: 'var(--color-gray-600)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 1.7,
              }}
            >
              <div className="info-box">
                <div className="title">
                  Named locations
                </div>
                <div className="text">
                  Source-named locations are shown directly from the
                  relocation records.
                </div>
              </div>

              <div className="info-box">
                <div className="title">
                  Candidate groups
                </div>
                <div className="text">
                  SOURCE-SUPPORTED CANDIDATE GROUP records are not
                  treated as individual named sites.
                </div>
              </div>

              <div className="info-box">
                <div className="title">
                  Availability
                </div>
                <div className="text">
                  The current backend does not provide live occupancy,
                  available-capacity, or full/empty status. The
                  interface therefore does not invent those values.
                </div>
              </div>

              <div className="info-box">
                <div className="title">
                  Coordinates
                </div>
                <div className="text">
                  When latitude or longitude is absent from the source,
                  the page displays “Not available in source” and does
                  not invent a map location.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RelocationPlanning;