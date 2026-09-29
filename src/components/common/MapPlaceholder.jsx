import RiskBadge from './RiskBadge';
import './MapPlaceholder.css';

/**
 * Placeholder for the Maharashtra GIS/map area.
 *
 * This intentionally does not draw invented district boundaries. Once real
 * GeoJSON is available from the backend, replace the SVG grid below with a
 * proper map layer (e.g. react-leaflet + the GeoJSON) — the surrounding
 * frame, legend slot and district-info slot can stay as-is.
 *
 * geoJsonReady: pass true once a real GeoJSON layer is wired in, to swap
 * the placeholder note for the actual map render (left for backend work).
 */
export default function MapPlaceholder({ selectedDistrict, riskLevel, geoJsonReady = false }) {
  return (
    <div className="map-placeholder">
      <div className="map-placeholder__frame">
        <svg className="map-placeholder__grid" viewBox="0 0 400 320" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-brand-200)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="320" fill="url(#grid)" />
          <path
            d="M60 40 L140 30 L210 55 L260 45 L320 90 L340 150 L300 210 L250 260 L180 280 L110 250 L70 190 L50 120 Z"
            fill="var(--color-brand-100)"
            stroke="var(--color-brand-500)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.9"
          />
        </svg>

        {!geoJsonReady && (
          <div className="map-placeholder__note">
            <p className="map-placeholder__note-title">Maharashtra district map</p>
            <p className="map-placeholder__note-desc">
              GIS layer will render real district boundaries once GeoJSON data is
              connected to this component. No boundary geometry is invented here.
            </p>
          </div>
        )}
      </div>

      <div className="map-placeholder__footer">
        <div>
          <p className="map-placeholder__district-label">Selected district</p>
          <p className="map-placeholder__district-name">{selectedDistrict || 'None selected'}</p>
        </div>
        <RiskBadge level={riskLevel} size="lg" />
      </div>
    </div>
  );
}
