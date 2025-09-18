// analyticsLogger.js
import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

export const logTabChange = (tabName) => {
  logEvent(analytics, 'tab_change', { tab_name: tabName });
};

export const logPatientRegistration = (patientName) => {
   console.log("Sending event to Firebase Analytics:", patientName);
  logEvent(analytics, 'register_patient', { patient_name: patientName });
  console.log("logEvent called");
};

export const logDoctorRegistration = (doctorName) => {
  logEvent(analytics, 'register_doctor', { doctor_name: doctorName });
};


export const logAppointmentBooking = (patientName, doctorName, date) => {
  logEvent(analytics, 'book_appointment', {
    patient_name: patientName,
    doctor_name: doctorName,
    appointment_date: date,
  });
};
