import './App.css'

import PatientRegister from './components/PatientRegister';
import DoctorRegister from './components/DoctorRegister';
import AppointmentBooking from './components/AppointmentBooking';
import { useState} from "react";

function App() {
  const [tab, setTab] = useState("patient"); // patient, doctor, appointment

  return (
    
    <div style={{ maxWidth: 600, margin: "auto" }} className='hmis-container'>
      <h1>Hospital Management System</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("patient")} disabled={tab === "patient"}>Patient Register</button>
        <button onClick={() => setTab("doctor")} disabled={tab === "doctor"}>Doctor Register</button>
        <button onClick={() => setTab("appointment")} disabled={tab === "appointment"}>Appointment</button>
      </nav>

      {tab === "patient" && <PatientRegister />}
      {tab === "doctor" && <DoctorRegister />}
      {tab === "appointment" && <AppointmentBooking />}
    </div>
  );
}

export default App;
