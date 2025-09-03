import axios from 'axios';
import { useState, useEffect } from "react";
import { Stepper, Step, StepLabel, Button } from '@mui/material';
import './AppointmentBooking.css'; // your existing styling

const steps = [
  "Select Patient & Doctor",
  "Verify Details",
  "Select Slot",
  "Payment",
  "Checkout"
];

function AppointmentBooking({organization}) {
  const [activeStep, setActiveStep] = useState(0);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    notificationVerified: false,
    paymentInfo: ""
  });
  const [message, setMessage] = useState("");

  // Load patients and doctors
  useEffect(() => {
    axios.get("http://localhost:8081/appointments/patients")
      .then(res => setPatients(res.data))
      .catch(() => setPatients([]));

    axios.get("http://localhost:8081/appointments/doctors")
      .then(res => setDoctors(res.data))
      .catch(() => setDoctors([]));
  }, []);

  // Load appointments when doctor changes
  useEffect(() => {
    if (form.doctorId) {
      axios.get(`http://localhost:8081/appointments/doctor/${form.doctorId}`)
        .then(res => setAppointments(res.data))
        .catch(() => setAppointments([]));
      setForm(f => ({ ...f, appointmentDate: "" }));
    } else {
      setAppointments([]);
      setForm(f => ({ ...f, appointmentDate: "" }));
    }
  }, [form.doctorId]);

  // Step navigation
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

    if (activeStep === 3 && !form.paymentInfo.trim()) {
      alert("Enter payment details.");
      return;
    }

    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectSlot = (dateTimeStr) => {
    setForm({ ...form, appointmentDate: dateTimeStr });
  };

  const handleBookAppointment = async () => {
    setMessage("");
    try {
      const body = {
        patientId: parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate
      };

      await axios.post("http://localhost:8081/appointments/book", body);
      alert("Appointment booked successfully!");
      setActiveStep(activeStep + 1);
    } catch (err) {
      setMessage(err.message || "Booking failed.");
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
    return appointments.find(app => {
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
          <div className='form-stack'>
            <select name="patientId" value={form.patientId} onChange={handleChange}>
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} (ID: {p.id})
                </option>
              ))}
            </select>
            <select name="doctorId" value={form.doctorId} onChange={handleChange}>
              <option value="">Select Doctor</option>
              {doctors.map(d => (
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
              <li>Patient id: {form.patientId}</li>
              <li>Doctor id: {form.doctorId}</li>
            </ul>
            <label>
              <input
                type="checkbox"
                checked={form.notificationVerified}
                onChange={e => setForm({ ...form, notificationVerified: e.target.checked })}
              /> I verify the details are correct.
            </label>
          </div>
        );

      case 2:
        return (
          <div className="calendar-time-grid">
            <div className="grid-row header-row">
              <div className="time-cell"></div>
              {days.map(day => (
                <div key={day.toISOString()} className={`day-cell header-cell ${isWeekend(day) ? 'weekend' : ''}`}>
                  <div>{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div>{day.getDate()}</div>
                </div>
              ))}
            </div>

            {hours.map(hour => (
              <div key={hour} className="grid-row">
                <div className="time-cell">{formatHour(hour)}</div>
                {days.map(day => {
                  const dateTimeStr = `${day.toISOString().slice(0, 10)}T${hour.toString().padStart(2, '0')}:00`;
                  const isSelected = form.appointmentDate.startsWith(dateTimeStr);
                  if (isWeekend(day)) {
                    return <div key={day + hour} className="time-slot-cell weekend">-</div>;
                  }
                  const booked = isSlotBooked(day, hour);
                  return (
                    <div
                      key={day + hour}
                      className={`time-slot-cell ${booked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => !booked && handleSelectSlot(dateTimeStr)}
                      title={booked ? `Booked (Patient ID: ${booked.patientId})` : "Available"}
                    >
                      {booked ? "Booked" : ""}
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
            {/* <p>Enter dummy payment information (for now):</p> */}
            <input
              type="text"
              name="paymentInfo"
              placeholder="Card Number"
              value={form.paymentInfo}
              onChange={handleChange}
            />
            {/* <p style={{ fontSize: '0.9em', color: 'gray' }}>Replace this with a real payment gateway later.</p> */}
          </div>
        );

      case 4:
        return (
          <div>
            {/* <h3>Confirm your appointment:</h3> */}
            <p>Appointment: {new Date(form.appointmentDate).toLocaleString()}</p>
            <p>Patient ID: {form.patientId}</p>
            <p>Doctor ID: {form.doctorId}</p>            
            <p>Payment Info: {form.paymentInfo}</p>
            <Button variant="contained" color="primary" onClick={handleBookAppointment}>
              Confirm & Book
            </Button>
            {message && <p style={{ color: 'red' }}>{message}</p>}
          </div>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <div className="appointment-container">
      <h2>Book Appointment</h2>
      <p>{organization}</p>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
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
            <div style={{ marginTop: 30 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} style={{ marginRight: 10 }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 && (
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

