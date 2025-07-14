import React, { useState } from 'react';
import Starfield from './Starfield';
import { useLocation, useNavigate } from 'react-router-dom';

function HabitabilityForm() {
  const featureDescriptions = [
    { name: 'P. Zone Class', description: 'Planetary zone classification (coded numerically)' },
    { name: 'P. Mag', description: 'Apparent magnitude of the planet' },
    { name: 'P. Radius (EU)', description: 'Planetary radius in Earth units' },
    { name: 'S. No. Planets HZ', description: 'Number of planets in the star\'s habitable zone' },
    { name: 'P. Sem Major Axis (AU)', description: 'Semi-major axis of the planet\'s orbit (in AU)' },
    { name: 'P. Teq Min (K)', description: 'Minimum equilibrium temperature of the planet (Kelvin)' },
    { name: 'P. SFlux Max (EU)', description: 'Maximum stellar flux received by planet (in Earth units)' },
    { name: 'P. SFlux Min (EU)', description: 'Minimum stellar flux received (in Earth units)' },
    { name: 'S. Mag from Planet', description: 'Apparent magnitude of the star as seen from the planet' },
    { name: 'P. SFlux Mean (EU)', description: 'Mean stellar flux received (in Earth units)' },
    { name: 'P. Mass (EU)', description: 'Planetary mass in Earth units' },
    { name: 'S. Mass (SU)', description: 'Stellar mass in Solar units' },
    { name: 'P. Period (days)', description: 'Orbital period of the planet (in days)' },
    { name: 'S. Luminosity (SU)', description: 'Stellar luminosity in Solar units' },
    { name: 'S. Size from Planet (deg)', description: 'Star\'s angular size from the planet (in degrees)' }
  ];

  const [features, setFeatures] = useState(Array(15).fill(''));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const exoplanetFeatures = location.state?.exoplanetFeatures || [];
  const classificationResult = location.state?.classificationResult || {};

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    let values = text
      .split(/[\n, ]+/)
      .filter(val => val.trim() !== '')
      .map(Number);

    if (values.length !== 15 || values.some(isNaN)) {
      setError('Invalid file format. Must contain exactly 15 numeric values.');
      return;
    }

    setFeatures(values.map(String));
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/habitability-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: features.map(Number) })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Prediction failed');
      }

      const data = await response.json();
      setResult(data);

      // If habitable, navigate automatically to report
      if (data.status === 'habitable') {
        navigate('/planet-report', {
          state: {
            exoplanetFeatures,
            habitabilityFeatures: features,
            classificationResult,
            habitabilityResult: data
          }
        });
      }
    } catch (err) {
      setError(err.message || "Failed to fetch prediction.");
    }
  };

  return (
    <div>
      <Starfield />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '900px',
        margin: '0 auto',
        padding: '30px',
        color: 'white',
        borderRadius: '12px',
        fontFamily: 'Orbitron, sans-serif',
        lineHeight: '1.6'
      }}>
        <h2 style={{ color: '#00ffe7', textAlign: 'center' }}>🧪 Habitability Prediction Form</h2>
        <p style={{ textAlign: 'center', color: '#aaa' }}>
          Provide planetary and stellar data to estimate habitability potential.
        </p>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{
              padding: '8px',
              // backgroundColor: '#121232',
              color: 'white',
              border: '1px solid #00ffe7',
              borderRadius: '6px'
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {features.map((val, i) => (
            <div key={i} style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                {featureDescriptions[i].name}
                <span style={{
                  marginLeft: '10px',
                  fontSize: '0.8em',
                  color: '#777'
                }}>
                  ({featureDescriptions[i].description})
                </span>
              </label>
              <input
                type="number"
                step="any"
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid #00ffe7',
                  borderRadius: '6px'
                }}
                required
              />
            </div>
          ))}

          <button type="submit" style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#00ffe7',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '20px'
          }}>
            🌍 Evaluate Habitability
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderLeft: '4px solid red',
            borderRadius: '6px',
            color: '#ff9999'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: result.status === 'habitable' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 80, 80, 0.1)',
            borderLeft: result.status === 'habitable' ? '4px solid #00ff77' : '4px solid #ff5050',
            borderRadius: '8px',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <p style={{ fontSize: '1.4rem', textAlign: 'center' }}>
              <strong>Status:</strong> {result.status.toUpperCase()}<br />
              <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={() => {
                navigate('/planet-report', {
                  state: {
                    exoplanetFeatures,
                    habitabilityFeatures: features,
                    classificationResult,
                    habitabilityResult: result
                  }
                });
              }}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              🛰️ Generate Full Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HabitabilityForm;
