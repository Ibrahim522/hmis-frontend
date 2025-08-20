import React, { useState } from 'react';

export default function AppointmentForm() {
  const [appointment, setAppointment] = useState({
    patientId: '',
    doctorId: '',
    date: ''
  });

  const handleChange = e => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8083/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (res.ok) {
        alert('Appointment booked successfully!');
        setAppointment({ patientId: '', doctorId: '', date: '' });
      } else {
        alert('Booking failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book Appointment</h2>
      <input name="patientId" type="number" placeholder="Patient ID" value={appointment.patientId} onChange={handleChange} required />
      <input name="doctorId" type="number" placeholder="Doctor ID" value={appointment.doctorId} onChange={handleChange} required />
      <input name="date" type="date" value={appointment.date} onChange={handleChange} required />
      <button type="submit">Book Appointment</button>
    </form>
  );
}
