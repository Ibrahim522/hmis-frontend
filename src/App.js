  import './App.css'

  import PatientRegister from './components/PatientRegister';
  import DoctorRegister from './components/DoctorRegister';
  import AppointmentBooking from './components/AppointmentBooking';
  import { analytics, logEvent } from './firebase';

  import { useState, useEffect } from "react";

  function App() {
    const [tab, setTab] = useState("patient");
    const [organization, setOrganization] = useState("");

    useEffect(() => {
    logEvent(analytics, "tab_changed", { tab_name: tab });
  }, [tab]);

  // Log organization selection
  useEffect(() => {
    if (organization) {
      logEvent(analytics, "organization_selected", { organization });
    }
  }, [organization]);

    return (
      <div style={{ maxWidth: 600, margin: "auto" }} className="hmis-container">
        <h1>Hospital Management System</h1>

        <div style={{ marginBottom: 20 }} className="organizationField">
          <select
            id="organization-select"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          >
            <option value="">Select Organization</option>
            {["City Hospital", "Sunrise Clinic", "Green Valley Medical Center", "Lakeside Health"].map(
              (org, idx) => (
                <option key={idx} value={org}>
                  {org}
                </option>
              )
            )}
          </select>
        </div>

        <nav style={{ marginBottom: 20 }}>
          <button onClick={() => setTab("patient")} disabled={tab === "patient"}>
            Patient Register
          </button>
          <button onClick={() => setTab("doctor")} disabled={tab === "doctor"}>
            Doctor Register
          </button>
          <button onClick={() => setTab("appointment")} disabled={tab === "appointment"}>
            Appointment
          </button>
        </nav>

        {tab === "patient" && <PatientRegister organization={organization} />}
        {tab === "doctor" && <DoctorRegister organization={organization} />}
        {tab === "appointment" && <AppointmentBooking organization={organization}  />
        }
      </div>
    );
  }

  export default App;
