import React, { useState } from 'react';

export default function DoctorForm() {
  const [doctor, setDoctor] = useState({
    name: '',
    specialty: '',
    contact: ''
  });

  const handleChange = e => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8082/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctor),
      });
      if (res.ok) {
        alert('Doctor registered successfully!');
        setDoctor({ name: '', specialty: '', contact: '' });
      } else {
        alert('Registration failed');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Doctor Registration</h2>
      <input name="name" placeholder="Name" value={doctor.name} onChange={handleChange} required />
      <input name="specialty" placeholder="Specialty" value={doctor.specialty} onChange={handleChange} required />
      <input name="contact" placeholder="Contact" value={doctor.contact} onChange={handleChange} required />
      <button type="submit">Register Doctor</button>
    </form>
  );
}
