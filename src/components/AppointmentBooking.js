import axios from 'axios';
import { useState, useEffect } from "react";
import './AppointmentBooking.css';

function AppointmentBooking() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: ""
  });
  const [message, setMessage] = useState("");

  // Load patients and doctors on mount
  useEffect(() => {
    axios.get("http://localhost:8081/appointments/patients")
      .then(res => setPatients(res.data))
      .catch(() => setPatients([]));

    axios.get("http://localhost:8081/appointments/doctors")
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  // Load appointments when doctor changes
  useEffect(() => {
    if (form.doctorId) {
      axios.get(`http://localhost:8081/appointments/doctor/${form.doctorId}`)
        .then(res => setAppointments(res.data))
        .catch(() => setAppointments([]));
      setForm(f => ({ ...f, appointmentDate: "" }));
    } else {
      setAppointments([]);
      setForm(f => ({ ...f, appointmentDate: "" }));
    }
  }, [form.doctorId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const selectDate = (dateStr) => {
    setForm({ ...form, appointmentDate: dateStr });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    if (!form.appointmentDate) {
      alert("Please select an appointment date.");
      return;
    }
    try {
      const body = {
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
      };
      await axios.post("http://localhost:8081/appointments/book", body);
      alert("Appointment booked successfully!");

      // Refresh appointments after booking
      console.log("Doctor ID:", form.doctorId);

      const response = await axios.get(`http://localhost:8081/appointments/doctor/${form.doctorId}`);
      setAppointments(response.data);

      // Clear selection
      setForm({ patientId: "", doctorId: "", appointmentDate: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const checkAppointment = (day) => {
    for (const app of appointments) {
      const appDate = new Date(app.appointmentDate);
      if (
        appDate.getFullYear() === day.getFullYear() &&
        appDate.getMonth() === day.getMonth() &&
        appDate.getDate() === day.getDate()
      ) {
        return app;
      }
    }
    return null;
  };

  return (
    <div className="appointment-container">
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit}>
        <select name="patientId" value={form.patientId} onChange={handleChange} required>
          <option value="">Select Patient</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} (id: {p.id})
            </option>
          ))}
        </select>

        <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>
              {d.firstName} {d.lastName} - {d.specialization}
            </option>
          ))}
        </select>

        {form.doctorId && (
          <div className="calendar-grid">
            {generateDays().map(day => {
              const appointment = checkAppointment(day);
              const dayStr = day.toISOString().slice(0, 10);
              const isSelected = form.appointmentDate.startsWith(dayStr);
              return (
                <div
                  key={dayStr}
                  className={`calendar-box ${appointment ? "booked" : "available"} ${isSelected ? "selected" : ""}`}
                  onClick={() => !appointment && selectDate(dayStr + "T09:00")}
                  title={
                    appointment
                      ? `Booked with Patient ID: ${appointment.patientId}`
                      : "Available"
                  }
                >
                  <div>{day.getDate()}</div>
                  <small>{day.toLocaleDateString(undefined, { weekday: 'short' })}</small>
                  {appointment && <div className="appointment-info">Booked</div>}
                </div>
              );
            })}
          </div>
        )}

        <button type="submit" disabled={!form.appointmentDate}>
          Book Appointment
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AppointmentBooking;
