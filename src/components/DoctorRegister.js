import axios from 'axios';
import { useState } from "react";

function DoctorRegister() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    cnic: "",
    age: "",             
    specialization: "",
    gender: "",
    contact: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:8081/doctors/register", form);
      setMessage("Doctor Registered successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        cnic: "",
        age: "",
        specialization: "",
        gender: "",
        contact: ""
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Doctor Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <input type="text" name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />  {/* Added age input */}

        <select name="specialization" value={form.specialization} onChange={handleChange} required>
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

        <select name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input type="text" name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
export default DoctorRegister;