import axios from "axios";
import { useState } from "react";
import { logDoctorRegistration } from "../FirebaseAnalytics";
import { backend_api_url } from "../config";

function DoctorRegister({organization}) {
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
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpOnly, setShowOtpOnly] = useState(false);

  const isLettersOnly = (str) => /^[a-zA-Z\s]*$/.test(str);
  const isValidEmail = (email) =>
    /^[a-zA-Z][\w.-]*@[a-zA-Z]+\.[a-zA-Z]{2,}$/.test(email);
  const isValidContact = (contact) => /^\d*$/.test(contact);
  const isValidCnic = (cnic) => /^\d{5}-\d{7}-\d{1}$/.test(cnic);

  const formatCnic = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    const part1 = digits.slice(0, 5);
    const part2 = digits.slice(5, 12);
    const part3 = digits.slice(12, 13);
    return [part1, part2, part3].filter(Boolean).join("-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (value && !isLettersOnly(value)) error = "Only letters are allowed";
        break;
      case "email":
        if (value && !isValidEmail(value)) error = "Invalid email format";
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
        break;
      default:
        error = "";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCnicChange = (e) => {
    let input = e.target.value;

    const cleanInput = input.replace(/[^0-9]/g, "");
    const formatted = formatCnic(cleanInput);

    setForm((prev) => ({ ...prev, cnic: formatted }));

    if (cleanInput.length > 13) {
      setErrors((prev) => ({
        ...prev,
        cnic: "CNIC cannot be longer than 13 digits",
      }));
    } else if (!/^\d*$/.test(cleanInput)) {
      setErrors((prev) => ({
        ...prev,
        cnic: "Only digits allowed in CNIC",
      }));
    } else if (cleanInput.length < 13) {
      setErrors((prev) => ({
        ...prev,
        cnic: "Complete your CNIC",
      }));
    } else {
      setErrors((prev) => ({ ...prev, cnic: "" }));
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    const error = isValidContact(value)
      ? ""
      : "Only digits allowed";
    setErrors((prev) => ({ ...prev, contact: error }));
    setForm((prev) => ({ ...prev, contact: value }));
  };

  const sendOtp = async () => {
    if (!form.email || !isValidEmail(form.email)) {
      alert("Please enter a valid email before sending OTP.");
      return;
    }
    try {
      await axios.post(`${backend_api_url}/otp/send-otp`, { email: form.email });
      setOtpSent(true);
      setShowOtpOnly(true);
      alert("OTP sent to your email.");
    } catch (err) {
      alert("Failed to send OTP. Try again.");
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP first.");
      return;
    }
    try {
      await axios.post(`${backend_api_url}/otp/verify-otp`, {
        email: form.email,
        otp,
      });
      setOtpVerified(true);
      setShowOtpOnly(false);
      alert("Email verified successfully!");
    } catch (err) {
      alert("You entered wrong OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};

    if (!form.firstName) newErrors.firstName = "First Name is required";
    else if (!isLettersOnly(form.firstName))
      newErrors.firstName = "Only letters are allowed";

    if (!form.lastName) newErrors.lastName = "Last Name is required";
    else if (!isLettersOnly(form.lastName))
      newErrors.lastName = "Only letters are allowed";

    if (!form.email) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email format";
    else if (!otpVerified) {
      alert("Please verify your email before registering.");
      return;
    }

    if (!form.address) newErrors.address = "Address is required";

    if (!form.cnic) newErrors.cnic = "CNIC is required";
    else if (!isValidCnic(form.cnic))
      newErrors.cnic = "CNIC must be complete";

    if (!form.dob) newErrors.dob = "Date of Birth is required";

    if (!form.specialization) newErrors.specialization = "Specialization is required";

    if (!form.gender) newErrors.gender = "Gender is required";

    if (!form.contact) newErrors.contact = "Contact number is required";
    else if (!isValidContact(form.contact))
      newErrors.contact = "Only digits allowed";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Please fill all the given fields.");
      return;
    }

    try {
      await axios.post(`${backend_api_url}/doctors/register`, form);
      alert("Doctor Registered successfully!");

       const fullName = `${form.firstName} ${form.lastName}`;
            logDoctorRegistration(fullName);

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
      setErrors({});
      setMessage("");
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
    } catch (err) {
      setMessage("Registration failed: " + err.message);
    }
  };

  return (
    <div>
      <h2>Doctor Registration</h2>
       <p>{organization}</p>
      <form onSubmit={handleSubmit} noValidate className="form-container" >
            {showOtpOnly ? (
    <>
      <div className="form-group verifyButtonContainer" style={{ marginTop: "8px" }}>
          
        <input
          type="text"
          placeholder="Enter your OTP here"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          style={{ width: "200px", marginRight: "8px" }}
        />
        <button type="button" onClick={verifyOtp} className="verifyOtpButton">
          Verify
        </button>
      </div>
    </>
  ) : (
    <>
        <div className="form-stack">
        {[
          { name: "firstName", placeholder: "First Name", type: "text" },
          { name: "lastName", placeholder: "Last Name", type: "text" },          
        ].map((field) => (
          <div className="form-group" key={field.name}>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              required
              className={errors[field.name] ? "error" : ""}
            />
            {errors[field.name] && (
              <div className="error-message">{errors[field.name]}</div>
            )}
          </div>
        ))}
    <div className="form-group" style={{ position: "relative" }}>
      <div className="form-group" style={{ position: "relative" }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className={errors.email ? "error" : ""}
            />
            

           {!otpSent && (
              <button
                type="button"
                onClick={sendOtp}
                className="sendOtpButton"
                
              >
                Send OTP
              </button>
            )}
            {otpVerified && (
            <p style={{ position: "absolute", right: 10, top: -3 }}
              >
            ✅
            </p>
          )}

          {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
            </div>
          </div>

                
          {[
            { name: "address", placeholder: "Address", type: "text" },
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                required
                className={errors[field.name] ? "error" : ""}
              />
              {errors[field.name] && (
                <div className="error-message">{errors[field.name]}</div>
              )}
            </div>
          ))}

        <div className="form-group">
          <input
            type="text"
            name="cnic"
            placeholder="CNIC"
            value={form.cnic}
            onChange={handleCnicChange}
            maxLength={15}
            required
            className={errors.cnic ? "error" : ""}
          />
          {errors.cnic && <div className="error-message">{errors.cnic}</div>}
        </div>

        <div className="form-group">
          <input
            type="date"
            name="dob"
            placeholder="Date of Birth"
            value={form.dob}
            onChange={handleChange}
            required
            className={errors.dob ? "error" : ""}
          />
          {errors.dob && <div className="error-message">{errors.dob}</div>}
        </div>

        <div className="form-group">
          <select
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            className={errors.specialization ? "error" : ""}
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
          {errors.specialization && (
            <div className="error-message">{errors.specialization}</div>
          )}
        </div>

        <div className="form-group">
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className={errors.gender ? "error" : ""}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={form.contact}
            onChange={handleContactChange}
            required
            className={errors.contact ? "error" : ""}
          />
          {errors.contact && (
            <div className="error-message">{errors.contact}</div>
          )}
        </div>
</div>
        <div className="register-button">
        <button type="submit">Register</button>
        </div>
         </>
  )}
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DoctorRegister;
