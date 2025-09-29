import axios from "axios";
import { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Button } from "@mui/material";
import "./AppointmentBooking.css";
import { backend_api_url } from "../config";

import PaymentForm from "./PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { logAppointmentBooking } from "../FirebaseAnalytics"; 

const stripePromise = loadStripe("pk_test_51S2syLCjoVPMv76imBAFsz0OdoFOnVbP2JUSV09aW1wmV3LFTJk2KIx2dgcyS6Xf4lbTMIrhwA4JMxb27Hso3InF00ODFhBAWL");

const steps = [
  "Select Patient & Doctor",
  "Verify Details",
  "Select Slot",
  "Payment",
  "Checkout",
];

function AppointmentBooking({ organization }) {
  const [activeStep, setActiveStep] = useState(0);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    notificationVerified: false,
    paymentInfo: "",
  });
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (activeStep === 3 && form.patientId && form.doctorId && form.appointmentDate) {
      axios
        .post(`${backend_api_url}/api/payment/create-payment-intent`, {
          patientId: form.patientId,
          doctorId: form.doctorId,
          appointmentDate: form.appointmentDate,
        })
        .then((res) => {
          console.log("Payment intent response:", res.data);
          setClientSecret(res.data.clientSecret);
        });
    }
  }, [activeStep]);

  // Load patients and doctors on mount
  useEffect(() => {
    axios
      .get(`${backend_api_url}/patients`)
      .then((res) => {
        console.log("Response data:", res.data);
        setPatients(res.data);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setPatients([]);
      });

    axios
      .get(`${backend_api_url}/doctors`)
      .then((res) => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  // Load appointments when doctor changes
  useEffect(() => {
    if (form.doctorId) {
      axios
        .get(`${backend_api_url}/appointments/doctor/${form.doctorId}`)
        .then((res) => setAppointments(res.data))
        .catch(() => setAppointments([]));
      setForm((f) => ({ ...f, appointmentDate: "" }));
    } else {
      setAppointments([]);
      setForm((f) => ({ ...f, appointmentDate: "" }));
    }
  }, [form.doctorId]);

  const handleNext = () => {
    if (activeStep === 0 && (!form.patientId || !form.doctorId)) {
      alert("Select both patient and doctor.");
      return;
    }
    if (activeStep === 1 && !form.notificationVerified) {
      alert("Please verify the details.");
      return;
    }
    if (activeStep === 2 && !form.appointmentDate) {
      alert("Please select an appointment slot.");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectSlot = (dateTimeStr) => {
    setForm({ ...form, appointmentDate: dateTimeStr });
  };

  const handleBookAppointment = async () => {
    setMessage("");
    try {
      const body = {
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
      };
      await axios.post(`${backend_api_url}/appointments/book`, body);
      alert("Appointment booked successfully!");
      setActiveStep((prev) => prev + 1);

      // Refresh appointments to show the new booking
      axios
        .get(`${backend_api_url}/appointments/doctor/${form.doctorId}`)
        .then((res) => setAppointments(res.data))
        .catch(() => setAppointments([]));

      // --- Analytics Logging here ---
      const patient = patients.find((p) => p.id === body.patientId);
      const doctor = doctors.find((d) => d.id === body.doctorId);

      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
      const doctorName = doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Unknown Doctor";

      logAppointmentBooking(patientName, doctorName, form.appointmentDate);
    } catch (err) {
      setMessage(err.message || "Booking failed.");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    try {
      await axios.delete(`${backend_api_url}/appointments/${appointmentId}`);
      alert("Appointment cancelled.");
      // Refresh appointments after cancellation
      axios
        .get(`${backend_api_url}/appointments/doctor/${form.doctorId}`)
        .then((res) => setAppointments(res.data))
        .catch(() => setAppointments([]));
    } catch (err) {
      alert("Failed to cancel appointment.");
    }
  };

  // Calendar helpers
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isSlotBooked = (day, hour) => {
    return appointments.find((app) => {
      const appDate = new Date(app.appointmentDate);
      return (
        appDate.getFullYear() === day.getFullYear() &&
        appDate.getMonth() === day.getMonth() &&
        appDate.getDate() === day.getDate() &&
        appDate.getHours() === hour
      );
    });
  };

  const formatHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    return `${displayHour} ${ampm}`;
  };

  const isWeekend = (day) => {
    const d = day.getDay();
    return d === 0 || d === 6;
  };

  const days = generateDays();
  const hours = Array.from({ length: 11 }, (_, i) => i + 13); // 1 PM - 11 PM

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="form-stack">
            <select name="patientId" value={form.patientId} onChange={handleChange}>
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (ID: {p.id})
                </option>
              ))}
            </select>
            <select name="doctorId" value={form.doctorId} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName} - {d.specialization}
                </option>
              ))}
            </select>
          </div>
        );
      case 1:
        return (
          <div>
            <p>Confirm patient and doctor details:</p>
            <ul>
              <li>
                Patient:{" "}
                {patients.find((p) => p.id === parseInt(form.patientId))
                  ? `${patients.find((p) => p.id === parseInt(form.patientId)).firstName} ${patients.find((p) => p.id === parseInt(form.patientId)).lastName} (ID: ${form.patientId})`
                  : "N/A"}
              </li>
              <li>
                Doctor:{" "}
                {doctors.find((d) => d.id === parseInt(form.doctorId))
                  ? `Dr. ${doctors.find((d) => d.id === parseInt(form.doctorId)).firstName} ${doctors.find((d) => d.id === parseInt(form.doctorId)).lastName} - ${doctors.find((d) => d.id === parseInt(form.doctorId)).specialization}`
                  : "N/A"}
              </li>
            </ul>
            <label>
              <input
                type="checkbox"
                checked={form.notificationVerified}
                onChange={(e) => setForm({ ...form, notificationVerified: e.target.checked })}
              />{" "}
              I verify the details are correct.
            </label>
          </div>
        );
      case 2:
        return (
          <div className="calendar-time-grid">
            <div className="grid-row header-row">
              <div className="time-cell"></div>
              {days.map((day) => (
                <div key={day.toISOString()} className={`day-cell header-cell ${isWeekend(day) ? "weekend" : ""}`}>
                  <div>{day.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <div>{day.getDate()}</div>
                </div>
              ))}
            </div>

            {hours.map((hour) => (
              <div key={hour} className="grid-row">
                <div className="time-cell">{formatHour(hour)}</div>
                {days.map((day) => {
                  const dateTimeStr = `${day.toISOString().slice(0, 10)}T${hour.toString().padStart(2, "0")}:00`;
                  const isSelected = form.appointmentDate.startsWith(dateTimeStr);
                  if (isWeekend(day)) {
                    return (
                      <div key={day + hour} className="time-slot-cell weekend">
                        -
                      </div>
                    );
                  }
                  const booked = isSlotBooked(day, hour);
                  return (
                    <div
                      key={day + hour}
                      className={`time-slot-cell ${booked ? "booked" : "available"} ${isSelected ? "selected" : ""}`}
                      onClick={() => !booked && handleSelectSlot(dateTimeStr)}
                      title={booked ? `Booked (Patient ID: ${booked.patientId})` : "Available"}
                    >
                      {booked ? (
                        booked.patientId === parseInt(form.patientId) ? (
                          <>
                            Booked{" "}
                            <button
                              className="cancel-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelAppointment(booked.id);
                              }}
                              title="Cancel this appointment"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          "Booked"
                        )
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  amount={1499} // pass amount PKR
                  form={form}
                  setForm={setForm}
                  onPaymentSuccess={() => {
                    // Move to next step or whatever you want on payment success
                    setActiveStep((prev) => prev + 1);
                  }}
                />
              </Elements>
            ) : (
              <div>Loading payment details...</div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h3>Confirm & Book Appointment</h3>
            <p>
              <strong>Appointment Date & Time:</strong> {new Date(form.appointmentDate).toLocaleString()}
            </p>
            <p>
              <strong>Patient ID:</strong> {form.patientId}
            </p>
            <p>
              <strong>Doctor ID:</strong> {form.doctorId}
            </p>
            <Button variant="contained" color="primary" onClick={handleBookAppointment}>
              Confirm & Book
            </Button>
            {message && <p style={{ color: "red" }}>{message}</p>}
          </div>
        );
      case 5:
        return (
          <div>
            <h3>Booking Completed!</h3>
            <p>Your appointment has been successfully booked.</p>
          </div>
        );
      default:
        return "Unknown step";
    }
  };

  // Listen to URL query param for Stripe success or cancel to auto-advance step
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setActiveStep(4);
    } else if (query.get("canceled")) {
      alert("Payment canceled.");
    }
  }, []);

  return (
    <div className="appointment-container">
      <h2>Book Appointment</h2>
      <p>{organization}</p>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div style={{ marginTop: 30 }}>
        {activeStep === steps.length ? (
          <div>
            <h3>Appointment booked successfully!</h3>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Book Another
            </Button>
          </div>
        ) : (
          <>
            {renderStepContent(activeStep)}

            <div style={{ marginTop: 20 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} style={{ marginRight: 8 }}>
                  Back
                </Button>
              )}
              {activeStep < 3 && (
                <Button variant="contained" color="primary" onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;
