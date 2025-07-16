import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom'; 


function Home() {
  const navigate = useNavigate();

  return (
    <div className="App" style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, width: '100%', background: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '10px', zIndex: 10, textAlign: 'center' }}>
        <h1>Exoplanet Classification & Habitability Analysis</h1>
        <button
          onClick={() => navigate('/predict')}
          style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#00aaff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Exoplanet Prediction
        </button>
      </div>
      <iframe
        title="NASA Eyes on the Solar System"
        src="https://eyes.nasa.gov/apps/solar-system/#/home?featured=false&detailPanel=false&logo=false&search=false&shareButton=false&menu=false&collapseSettingsOptions=true"
        width="100%"
        height="100%"
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default Home;
