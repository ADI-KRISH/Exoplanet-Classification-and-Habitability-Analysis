import React, { useState } from 'react';
import Starfield from './Starfield';
import { useNavigate } from 'react-router-dom';

function PredictionForm() {
  const navigate = useNavigate();

  const featureDescriptions = [
    { name: 'dec', description: 'Declination (degrees)' },
    { name: 'ra', description: 'Right ascension (degrees)' },
    { name: 'koi_depth', description: 'Transit depth (ppm)' },
    { name: 'koi_duration', description: 'Transit duration (hours)' },
    { name: 'koi_fpflag_co', description: 'Centroid offset flag (0/1)' },
    { name: 'koi_fpflag_ec', description: 'Ephemeris match indicates contamination flag (0/1)' },
    { name: 'koi_fpflag_nt', description: 'Non-transit-like flag (0/1)' },
    { name: 'koi_fpflag_ss', description: 'Stellar eclipse flag (0/1)' },
    { name: 'koi_impact', description: 'Impact parameter' },
    { name: 'koi_insol', description: 'Insolation flux (Earth flux)' },
    { name: 'koi_kepmag', description: 'Kepler-band magnitude' },
    { name: 'koi_model_snr', description: 'Signal-to-noise ratio of transit model' },
    { name: 'koi_period', description: 'Orbital period (days)' },
    { name: 'koi_prad', description: 'Planetary radius (Earth radii)' },
    { name: 'koi_slogg', description: 'Stellar surface gravity (log10(cm/s²))' },
    { name: 'koi_srad', description: 'Stellar radius (Solar radii)' },
    { name: 'koi_steff', description: 'Stellar effective temperature (K)' },
    { name: 'koi_teq', description: 'Equilibrium temperature (K)' },
    { name: 'koi_time0bk', description: 'Transit epoch (Barycentric Kepler Julian Day)' }
  ];

  const [features, setFeatures] = useState(Array(19).fill(''));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      .split(/[\n, ]+/)  // split on newline, comma, or space
      .filter(val => val.trim() !== '')
      .map(Number);

    if (values.length !== 19 || values.some(isNaN)) {
      setError('Invalid file format. Must contain exactly 19 numeric values.');
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
      const numericFeatures = features.map(Number);

      if (numericFeatures.some(isNaN)) {
        setError('All features must be valid numbers.');
        return;
      }

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: numericFeatures })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Starfield />
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '850px',
        margin: '0 auto',
        padding: '30px',
        color: 'white',
        borderRadius: '12px',
        fontFamily: 'Orbitron, sans-serif',
        lineHeight: '1.6'
      }}>
        <h1 style={{ textAlign: 'center', fontSize: '2rem', color: '#00ffe7', marginBottom: '20px' }}>
          🪐 Exoplanet Detection System
        </h1>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '1rem' }}>
          Enter or upload parameters to predict exoplanet classification.
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
                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#777' }}>
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
            🚀 Predict
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderLeft: '4px solid red',
            borderRadius: '6px',
            color: '#ff6666'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: result.label === 'confirmed' ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 80, 80, 0.1)',
            borderLeft: result.label === 'confirmed' ? '4px solid #00ff77' : '4px solid #ff5050',
            borderRadius: '8px',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <h2 style={{ color: '#fff' }}>🧠 Model Prediction</h2>
            <p style={{ fontSize: '1.4rem' }}>
              <strong>Disposition:</strong> {result.label.toUpperCase()}<br />
              <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}

        {result && result.label === "confirmed" && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
           <button
  onClick={() =>
    navigate('/habitability', {
      state: {
        exoplanetFeatures: features,
        classificationResult: result
      }
    })
  }
  style={{
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    transition: '0.3s',
    cursor: 'pointer',
    marginTop: '20px'
  }}
>
  🌍 Check Habitability
</button>

          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionForm;
