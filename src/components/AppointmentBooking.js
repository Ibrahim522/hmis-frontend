import axios from 'axios';
import { useState, useEffect } from "react";

function AppointmentBooking() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: "", doctorId: "", appointmentDate: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8081/appointments/patients")
    .then(res => setPatients(res.data))
    .catch(() => setPatients([]));

    axios.get("http://localhost:8081/appointments/doctors")
    .then(res => setDoctors(res.data))
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
       await axios.post("http://localhost:8081/appointments/book", body);
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
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName} (id:{p.id})</option>
          ))}
        </select>
        <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.firstName} {d.lastName} - {d.specialization}</option>
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
export default AppointmentBooking;