import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function PatientPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(true);
  const [patientKey, setPatientKey] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Registration form state
  const [regData, setRegData] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
    password: ""
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    patientKey: "",
    password: ""
  });

  // Handle registration input change
  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  // Handle login input change
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Submit registration to backend
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await fetch("http://localhost:8081/patients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      setPatientKey(data.patientKey); // Show patientKey to user
      setErrorMessage("");
      // Don't auto switch to login, let user choose manually
      // setIsRegistering(false);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Submit login to backend
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await fetch("http://localhost:8081/patients/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
       const data = await res.json();
      if (!res.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    navigate("/appointments"); // ✅ Redirect if login successful
  } catch (error) {
    setErrorMessage(error.message);
  }
  };

  if (loginSuccess) {
    return <h2>Login successful! Proceed to appointment booking.</h2>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Patient Portal</h1>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            setIsRegistering(true);
            setErrorMessage("");
            setPatientKey("");
          }}
          disabled={isRegistering}
          style={{ marginRight: 10 }}
        >
          Register New Patient
        </button>
        <button
          onClick={() => {
            setIsRegistering(false);
            setErrorMessage("");
            setPatientKey("");
          }}
          disabled={!isRegistering}
        >
          Patient Login
        </button>
      </div>

      {isRegistering ? (
        <>
          <h2>Register</h2>
          <form onSubmit={handleRegisterSubmit}>
            <input
              name="name"
              value={regData.name}
              onChange={handleRegChange}
              placeholder="Name"
              required
            />
            <input
              name="age"
              type="number"
              value={regData.age}
              onChange={handleRegChange}
              placeholder="Age"
              required
            />
            <select
              name="gender"
              value={regData.gender}
              onChange={handleRegChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="contact"
              value={regData.contact}
              onChange={handleRegChange}
              placeholder="Contact"
              required
            />
            <input
              name="password"
              type="password"
              value={regData.password}
              onChange={handleRegChange}
              placeholder="Password"
              required
            />
            <button type="submit">Register</button>
          </form>

          {patientKey && (
            <p style={{ marginTop: 15, color: "green" }}>
              Registration successful! Your Patient Key is: <b>{patientKey}</b>. Please keep it safe and use it to login.
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <input
              name="patientKey"
              value={loginData.patientKey}
              onChange={handleLoginChange}
              placeholder="Patient Key"
              required
            />
            <input
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleLoginChange}
              placeholder="Password"
              required
            />
            <button type="submit">Login</button>
          </form>
        </>
      )}

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default PatientPage;
