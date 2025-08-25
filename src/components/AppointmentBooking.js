import axios from 'axios';
import { useState, useEffect } from "react";
import './AppointmentBooking.css';

function AppointmentBooking() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
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

  // Fetch appointments when doctor changes
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

  const handleSelectSlot = (dateTimeStr) => {
    setForm({ ...form, appointmentDate: dateTimeStr });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    if (!form.appointmentDate) {
      alert("Please select an appointment date and time.");
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
      const response = await axios.get(`http://localhost:8081/appointments/doctor/${form.doctorId}`);
      setAppointments(response.data);
      setForm({ patientId: "", doctorId: "", appointmentDate: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Generate 30 days from today, with day name & date
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

  // Check if slot is booked
  const isSlotBooked = (day, hour) => {
    for (const app of appointments) {
      const appDate = new Date(app.appointmentDate);
      if (
        appDate.getFullYear() === day.getFullYear() &&
        appDate.getMonth() === day.getMonth() &&
        appDate.getDate() === day.getDate() &&
        appDate.getHours() === hour
      ) {
        return app;
      }
    }
    return null;
  };

  // Format hour to AM/PM string
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    return `${displayHour} ${ampm}`;
  };

  const days = generateDays();
  const hours = Array.from({ length: 23 }, (_, i) => i + 1); // 1am to 11pm

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
          <div className="calendar-time-grid">
            {/* Header row: empty top-left cell + days */}
            <div className="grid-row header-row">
              <div className="time-cell "></div>
              {days.map(day => (
                <div key={day.toISOString()} className="day-cell header-cell">
                  <div>{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div>{day.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {hours.map(hour => (
              <div key={hour} className="grid-row">
                <div className="time-cell">{formatHour(hour)}</div>
                {days.map(day => {
                  const booked = isSlotBooked(day, hour);
                  const dateTimeStr = `${day.toISOString().slice(0, 10)}T${hour.toString().padStart(2, '0')}:00`;
                  const isSelected = form.appointmentDate.startsWith(dateTimeStr);
                  return (
                    <div
                      key={day.toISOString() + hour}
                      className={`time-slot-cell ${booked ? "booked" : "available"} ${isSelected ? "selected" : ""}`}
                      onClick={() => !booked && handleSelectSlot(dateTimeStr)}
                      title={booked ? `Booked with Patient ID: ${booked.patientId}` : "Available"}
                    >
                      {booked ? (
                        <>
                          Booked
                          <br />
                          {formatHour(hour)} - {formatHour(hour + 1)}
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={!form.appointmentDate}>Book Appointment</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AppointmentBooking;
