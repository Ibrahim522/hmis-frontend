import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorPage() {
  const [isRegistering, setIsRegistering] = useState(true);
  const [doctorKey, setDoctorKey] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Registration form state
  const [regData, setRegData] = useState({
    name: "",
    specialization: "",
    contact: "",
    password: ""
  });

  // Login form state
  const [loginData, setLoginData] = useState({
    doctorKey: "",
    password: ""
  });

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Submit registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await fetch("http://localhost:8082/doctors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      if (!res.ok) throw new Error("Registration failed");
      const data = await res.json();
      setDoctorKey(data.doctorKey);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Submit login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const res = await fetch("http://localhost:8082/doctors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");
      navigate("/appointments");  // Navigate to doctor appointment page
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Doctor Portal</h1>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            setIsRegistering(true);
            setErrorMessage("");
            setDoctorKey("");
          }}
          disabled={isRegistering}
          style={{ marginRight: 10 }}
        >
          Register New Doctor
        </button>
        <button
          onClick={() => {
            setIsRegistering(false);
            setErrorMessage("");
            setDoctorKey("");
          }}
          disabled={!isRegistering}
        >
          Doctor Login
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
              name="specialization"
              value={regData.specialization}
              onChange={handleRegChange}
              placeholder="Specialization"
              required
            />
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
          {doctorKey && (
            <p style={{ marginTop: 15, color: "green" }}>
              Registration successful! Your Doctor Key is: <b>{doctorKey}</b>. Please keep it safe and use it to login.
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <input
              name="doctorKey"
              value={loginData.doctorKey}
              onChange={handleLoginChange}
              placeholder="Doctor Key"
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

export default DoctorPage;
