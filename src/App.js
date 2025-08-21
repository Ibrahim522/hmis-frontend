import React, { useState, useEffect } from "react";

function App() {
  const [tab, setTab] = useState("patient"); // patient, doctor, appointment

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h1>Hospital Management System</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("patient")} disabled={tab === "patient"}>Patient Register</button>
        <button onClick={() => setTab("doctor")} disabled={tab === "doctor"}>Doctor Register</button>
        <button onClick={() => setTab("appointment")} disabled={tab === "appointment"}>Appointment</button>
      </nav>

      {tab === "patient" && <PatientRegister />}
      {tab === "doctor" && <DoctorRegister />}
      {tab === "appointment" && <AppointmentBook />}
    </div>
  );
}

function PatientRegister() {
  const [form, setForm] = useState({ name: "", age: "", gender: "", contact: ""});
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:8081/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Registration failed");
      await res.json();
      setMessage("Patient Registered successfully!");
      setForm({ name: "", age: "", gender: "", contact: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Patient Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
       
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

function DoctorRegister() {
  const [form, setForm] = useState({ name: "", specialization: "", contact: "" });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:8082/doctors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Registration failed");
      await res.json();
      setMessage("Doctor Registered successfully!");
      setForm({ name: "", specialization: "", contact: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Doctor Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} required />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
       
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

function AppointmentBook() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: "", doctorId: "", appointmentDate: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8083/appointments/patients")
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(() => setPatients([]));

    fetch("http://localhost:8083/appointments/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(() => setDoctors([]));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const body = {
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
      };
      const res = await fetch("http://localhost:8083/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Appointment booking failed");
      await res.json();
      setMessage("Appointment booked successfully!");
      setForm({ patientId: "", doctorId: "", appointmentDate: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <select name="patientId" value={form.patientId} onChange={handleChange} required>
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
          ))}
        </select>
        <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          name="appointmentDate"
          value={form.appointmentDate}
          onChange={handleChange}
          required
        />
        <button type="submit">Book Appointment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
