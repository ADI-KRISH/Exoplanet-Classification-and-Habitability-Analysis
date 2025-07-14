// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import PredictionForm from './PredictionForm';
import HabitabilityForm from './HabitabilityForm';
import PlanetReportPage from './PlanetReportPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<PredictionForm />} />
        <Route path="/habitability" element={<HabitabilityForm />} />
        <Route path="/planet-report" element={<PlanetReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
