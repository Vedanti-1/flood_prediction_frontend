import React from 'react';
import {
  Brain,
  CheckCircle,
  Code,
  Database,
  FileText,
  Info,
  Map,
  Server,
} from 'lucide-react';

const techStack = [
  'React',
  'Vite',
  'React Router',
  'CSS3',
  'Lucide Icons',
  'Spring Boot',
  'MySQL',
  'Python',
  'Random Forest Regression',
  'REST APIs',
];

const dataSources = [
  {
    name: 'Central Water Commission (CWC)',
    description:
      'Historical flood-affected area reference data for Maharashtra districts, 1986–2022.',
  },
  {
    name: 'India Meteorological Department (IMD)',
    description:
      'Daily gridded rainfall data used to derive district-level rainfall features.',
  },
  {
    name: 'Census of India 2011',
    description:
      'District population and population-density information.',
  },
  {
    name: 'ESA WorldCover 2021',
    description:
      'District land-cover percentages derived from 2021 land-cover data.',
  },
  {
    name: 'Official Maharashtra / NWDP Geospatial Data',
    description:
      'District boundaries and river-network information used for geospatial features.',
  },
  {
    name: 'District Disaster Management Plans',
    description:
      'Source material used to identify and document relocation-related locations and candidate groups.',
  },
];

const workflow = [
  {
    title: 'Data Collection',
    description:
      'Rainfall, terrain, land cover, population, rivers and historical flood data.',
    icon: FileText,
  },
  {
    title: 'MySQL',
    description:
      'Cleaned district-level data and model-related records are stored in MySQL.',
    icon: Database,
  },
  {
    title: 'Machine Learning',
    description:
      'Random Forest Regression predicts flood-affected area percentage.',
    icon: Brain,
  },
  {
    title: 'Spring Boot',
    description:
      'REST APIs provide risk, ML prediction and relocation data.',
    icon: Server,
  },
  {
    title: 'React',
    description:
      'The frontend presents the backend data through the project dashboard.',
    icon: Code,
  },
];

const About = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">About</h1>
        <p className="page-subtitle">
          AI-Powered Disaster Risk and Relocation Planning System
        </p>
      </div>

      <div className="about-section">
        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">Project Overview</div>
              <div className="card-subtitle">
                Maharashtra flood-risk decision support
              </div>
            </div>

            <Map size={22} />
          </div>

          <p
            style={{
              color: 'var(--color-gray-600)',
              lineHeight: 1.8,
              marginBottom: 'var(--spacing-4)',
            }}
          >
            This system combines district-level environmental, rainfall,
            demographic and geospatial data with a Random Forest Regression
            model to estimate flood-affected area percentage and support
            relocation planning across Maharashtra.
          </p>

          <div className="tech-stack">
            <span className="tech">Flood Risk Assessment</span>
            <span className="tech">ML Prediction</span>
            <span className="tech">Geospatial Analysis</span>
            <span className="tech">Relocation Planning</span>
          </div>
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">Project Scope</div>
              <div className="card-subtitle">
                First-version implementation
              </div>
            </div>

            <Info size={22} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 'var(--spacing-4)',
            }}
          >
            <div className="dashboard-indicator">
              <div className="value">Maharashtra</div>
              <div className="label">Geographic Scope</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">35</div>
              <div className="label">Districts Used</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">Flood</div>
              <div className="label">Hazard Focus</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">Regression</div>
              <div className="label">ML Approach</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--spacing-4)',
              padding: 'var(--spacing-4)',
              background: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.7,
            }}
          >
            Mumbai City is not included as a separate frontend district in
            this final 35-district scope. Mumbai Suburban is included.
          </div>
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">System Workflow</div>
              <div className="card-subtitle">
                End-to-end project architecture
              </div>
            </div>

            <CheckCircle size={22} />
          </div>

          <div className="workflow">
            {workflow.map((step, index) => {
              const Icon = step.icon;

              return (
                <React.Fragment key={step.title}>
                  <div
                    style={{
                      minWidth: '170px',
                      flex: '1 1 170px',
                      background: 'white',
                      border: '1px solid var(--color-gray-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-4)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        marginBottom: 'var(--spacing-2)',
                      }}
                    >
                      <Icon size={18} />
                      <strong>{step.title}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-gray-500)',
                        lineHeight: 1.6,
                      }}
                    >
                      {step.description}
                    </div>
                  </div>

                  {index < workflow.length - 1 && (
                    <span
                      className="arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">Technology Stack</div>
              <div className="card-subtitle">
                Technologies used in the project
              </div>
            </div>

            <Code size={22} />
          </div>

          <div className="tech-stack">
            {techStack.map((technology) => (
              <span
                key={technology}
                className="tech"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">Data Sources</div>
              <div className="card-subtitle">
                Main datasets used in the current implementation
              </div>
            </div>

            <Database size={22} />
          </div>

          {dataSources.map((source) => (
            <div
              key={source.name}
              className="data-source-item"
            >
              <strong>{source.name}</strong>

              <div
                style={{
                  marginTop: '4px',
                  color: 'var(--color-gray-500)',
                }}
              >
                {source.description}
              </div>
            </div>
          ))}
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">ML Model</div>
              <div className="card-subtitle">
                Flood-affected area prediction
              </div>
            </div>

            <Brain size={22} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 'var(--spacing-4)',
            }}
          >
            <div className="dashboard-indicator">
              <div className="value">Random Forest</div>
              <div className="label">Model</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">300</div>
              <div className="label">Trees</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">0.683</div>
              <div className="label">LOOCV R²</div>
            </div>

            <div className="dashboard-indicator">
              <div className="value">2.592</div>
              <div className="label">LOOCV RMSE</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 'var(--spacing-4)',
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 1.7,
            }}
          >
            The model predicts the percentage of district area affected by
            floods using district-level rainfall, terrain, population,
            land-cover and river-distance features.
          </div>
        </div>

        <div className="card about-card">
          <div className="card-header">
            <div>
              <div className="card-title">Important Data Notes</div>
              <div className="card-subtitle">
                How the application handles source limitations
              </div>
            </div>

            <Info size={22} />
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
              <div className="title">Historical vs prediction</div>
              <div className="text">
                CWC historical flood-affected area and Random Forest
                predictions are displayed as separate values.
              </div>
            </div>

            <div className="info-box">
              <div className="title">Relocation information</div>
              <div className="text">
                Relocation records are source-based. Named locations and
                source-supported candidate groups are kept visually distinct.
              </div>
            </div>

            <div className="info-box">
              <div className="title">Availability information</div>
              <div className="text">
                The current system does not provide live shelter occupancy or
                live available-capacity information. Values that are missing
                from the source are shown as “Not available in source”, and
                unverified records are shown as “Not verified”.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;