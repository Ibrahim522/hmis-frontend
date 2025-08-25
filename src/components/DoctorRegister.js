import axios from 'axios';
import { useState } from "react";

function DoctorRegister() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    cnic: "",
    dob: "",              // date of birth
    specialization: "",
    gender: "",
    contact: ""
  });
  const [message, setMessage] = useState("");

  // CNIC: digits only, max length 13
  const handleCnicChange = e => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 13);
    setForm({ ...form, cnic: value });
  };

  // Contact: digits only, no limit, no spinner UI
  const handleContactChange = e => {
    const value = e.target.value.replace(/\D/g, '');
    setForm({ ...form, contact: value });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/doctors/register", form);
      alert("Doctor Registered successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        cnic: "",
        dob: "",
        specialization: "",
        gender: "",
        contact: ""
      });
      setMessage("");
    } catch (err) {
      setMessage("Registration failed: " + err.message);
    }
  };

  return (
    <div>
      <h2>Doctor Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cnic"
          placeholder="CNIC"
          value={form.cnic}
          onChange={handleCnicChange}
          maxLength={13}
          required
        />
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={form.dob}
          onChange={handleChange}
          required
        />
        <select
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          required
        >
          <option value="">Select Specialization</option>
          <option>General Practitioner (GP)</option>
          <option>Cardiologist</option>
          <option>Dermatologist</option>
          <option>Endocrinologist</option>
          <option>Gastroenterologist</option>
          <option>Neurologist</option>
          <option>Gynecologist</option>
          <option>Oncologist</option>
          <option>Ophthalmologist</option>
          <option>Orthopedic Surgeon</option>
          <option>Pediatrician</option>
          <option>Psychiatrist</option>
          <option>Pulmonologist</option>
          <option>Radiologist</option>
          <option>Rheumatologist</option>
          <option>Urologist</option>
          <option>Anesthesiologist</option>
          <option>ENT Specialist</option>
          <option>Pathologist</option>
          <option>Immunologist</option>
          <option>Nephrologist</option>
          <option>General Surgery</option>
          <option>Plastic Surgeon</option>
          <option>Infectious Disease Specialist</option>
          <option>Allergy and Immunology Specialist</option>
        </select>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input
          type="text"
          name="contact"
          placeholder="Contact"
          value={form.contact}
          onChange={handleContactChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DoctorRegister;
