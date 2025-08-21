import axios from 'axios';
import { useState} from "react";

function PatientRegister() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    cnic: "",
    age: "",
    gender: "",
    contact: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      await axios.post("http://localhost:8081/patients/register", form);
      setMessage("Patient Registered successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        cnic: "",
        age: "",
        gender: "",
        contact: ""
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Patient Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <input type="text" name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} required />
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

export default PatientRegister;