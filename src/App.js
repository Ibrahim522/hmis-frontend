// import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientForm from './components/Patient/PatientForm';
import DoctorForm from './components/Doctor';
import AppointmentForm from './components/AppointmentForm';
// import PatientsList from './components/PatientsList';
import HmisHomePage from './components/HmisHomePage';
function App() {
  return (
    <div>
      <Router>
      <Routes>
        <Route path="/" element={<HmisHomePage />} />
        <Route path="/register-patient" element={<PatientForm />} />
        <Route path="/register-doctor" element={<DoctorForm />} />
        <Route path="/appointments" element={<AppointmentForm />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
