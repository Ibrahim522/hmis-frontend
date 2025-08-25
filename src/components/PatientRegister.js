import axios from 'axios';
import { useState } from "react";

function PatientRegister() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    cnic: "",
    dob: "",       // changed from age to dob
    gender: "",
    contact: ""
  });
  const [message, setMessage] = useState("");

  // Handler for CNIC input - digits only, max 13 chars
  const handleCnicChange = e => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 13);
    setForm({ ...form, cnic: value });
  };

  // Handler for contact input - digits only, no length limit
  const handleContactChange = e => {
    const value = e.target.value.replace(/\D/g, '');
    setForm({ ...form, contact: value });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/patients/register", form);
      alert("Patient Registered successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        cnic: "",
        dob: "",
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
      <h2>Patient Registration</h2>
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
        {/* DOB input */}
        <input
          type="date"
          name="dob"
          placeholder="Date of Birth"
          value={form.dob}
          onChange={handleChange}
          required
        />
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

export default PatientRegister;
