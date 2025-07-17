import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Starfield from './Starfield';

const exoFeatureDescriptions = [
  'Declination (degrees)', 'Right ascension (degrees)', 'Transit depth (ppm)', 'Transit duration (hours)',
  'Centroid offset flag (0/1)', 'Ephemeris match contamination flag (0/1)', 'Non-transit-like flag (0/1)',
  'Stellar eclipse flag (0/1)', 'Impact parameter', 'Insolation flux (Earth flux)',
  'Kepler-band magnitude', 'Transit model SNR', 'Orbital period (days)', 'Planet radius (Earth radii)',
  'Stellar surface gravity', 'Stellar radius (Solar radii)', 'Stellar effective temperature (K)',
  'Equilibrium temperature (K)', 'Transit epoch (BKJD)'
];

const habitFeatureDescriptions = [
  'Planetary zone class (encoded)', 'Planet magnitude', 'Planet radius (Earth units)',
  'No. of planets in habitable zone', 'Semi-major axis (AU)', 'Min equilibrium temperature (K)',
  'Max stellar flux (EU)', 'Min stellar flux (EU)', 'Star magnitude from planet',
  'Mean stellar flux (EU)', 'Planet mass (Earth units)', 'Star mass (Solar units)',
  'Planet period (days)', 'Star luminosity (SU)', 'Star size from planet (deg)'
];

function PlanetReportPage() {
  const location = useLocation();
  const {
    exoplanetFeatures = [],
    habitabilityFeatures = [],
    classificationResult = {},
    habitabilityResult = {}
  } = location.state || {};

  const [geminiResponse, setGeminiResponse] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const explainPrediction = async () => {
      if (exoplanetFeatures.length === 19 && habitabilityFeatures.length === 15) {
        const message = `
Summarize the following exoplanet and habitability inputs in a concise manner.

Include:
1. Key feature highlights and their meaning.
2. A short reason for the classification result (${classificationResult.label}, ${(classificationResult.confidence * 100).toFixed(2)}%).
3. A short reason for the habitability status (${habitabilityResult.status}, ${(habitabilityResult.confidence * 100).toFixed(2)}%).
4. Two-paragraph summary on potential for life.

Exoplanet Features:
${exoplanetFeatures.map((val, i) => `${exoFeatureDescriptions[i]}: ${val}`).join('\n')}

Habitability Features:
${habitabilityFeatures.map((val, i) => `${habitFeatureDescriptions[i]}: ${val}`).join('\n')}
`;


        try {
            const response = await fetch('https://exoplanet-classification-and-hol4.onrender.com/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          });

          const data = await res.json();
          const cleanExplanation = (data.explanation || 'No explanation returned from Gemini.').replace(/\*/g, '');
          setGeminiResponse(cleanExplanation);
                  } catch (err) {
          setGeminiResponse('⚠️ Failed to get explanation from Gemini API.');
        }
      }
    };

    explainPrediction();
  }, [exoplanetFeatures, habitabilityFeatures, classificationResult, habitabilityResult]);

  return (
    <div>
      <Starfield />
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px',
        color: 'white',
        fontFamily: 'Orbitron, sans-serif',
        lineHeight: '1.6'
      }}>
        <h2 style={{ textAlign: 'center', color: '#00ffe7', marginBottom: '30px' }}>
          🌍 Planetary Report & Habitability Analysis
        </h2>

        {/* Classification Section */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#4AF5FF' }}>🪐 Exoplanet Classification Result</h3>
          <p><strong>Prediction:</strong> {classificationResult?.label || 'N/A'}</p>
          <p><strong>Confidence:</strong> {(classificationResult?.confidence * 100).toFixed(2) || 'N/A'}%</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ /*backgroundColor: '#1c1c3c'*/ }}>
                  <th style={{ padding: '10px', border: '1px solid #444' }}>Feature</th>
                  <th style={{ padding: '10px', border: '1px solid #444' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {exoplanetFeatures.map((val, i) => (
                  <tr key={i} style={{ /*backgroundColor: i % 2 === 0 ? '#222' : '#2a2a45'*/ }}>
                    <td style={{ padding: '10px', border: '1px solid #444' }}>{exoFeatureDescriptions[i]}</td>
                    <td style={{ padding: '10px', border: '1px solid #444' }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Habitability Section */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#4AFFB0' }}>🌱 Habitability Prediction</h3>
          <p><strong>Status:</strong> {habitabilityResult?.status || 'N/A'}</p>
          <p><strong>Confidence:</strong> {(habitabilityResult?.confidence * 100).toFixed(2) || 'N/A'}%</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ /*backgroundColor: '#1c1c3c'*/ }}>
                  <th style={{ padding: '10px', border: '1px solid #444' }}>Feature</th>
                  <th style={{ padding: '10px', border: '1px solid #444' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {habitabilityFeatures.map((val, i) => (
                  <tr key={i} style={{ /*backgroundColor: i % 2 === 0 ? '#222' : '#2a2a45'*/ }}>
                    <td style={{ padding: '10px', border: '1px solid #444' }}>{habitFeatureDescriptions[i]}</td>
                    <td style={{ padding: '10px', border: '1px solid #444' }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gemini Explanation Section */}
        <section style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '30px' }}>
          <h3 style={{ color: '#FFD700', marginBottom: '15px' }}>🧠 Explanation</h3>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: '1.8', color: '#e0e0e0' }}>
            {geminiResponse}
          </p>
        </section>
      </div>
    </div>
  );
}

export default PlanetReportPage;
