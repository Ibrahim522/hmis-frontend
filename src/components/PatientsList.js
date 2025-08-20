import React, { useEffect, useState } from 'react';

export default function PatientsList() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8081/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Registered Patients</h2>
      <ul>
        {patients.map(p => (
          <li key={p.id}>
            {p.name} | Age: {p.age} | Gender: {p.gender} | Contact: {p.contact}
          </li>
        ))}
      </ul>
    </div>
  );
}
