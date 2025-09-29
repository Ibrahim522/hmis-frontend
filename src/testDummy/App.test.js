import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

jest.mock('../firebase', () => ({
  logEvent: jest.fn(),
  analytics: {}
}));

jest.mock('../components/PatientRegister', () => () => <div>PatientRegister Component</div>);
jest.mock('../components/DoctorRegister', () => () => <div>DoctorRegister Component</div>);
jest.mock('../components/AppointmentBooking', () => () => <div>AppointmentBooking Component</div>);

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header and default tab (PatientRegister)', () => {
    render(<App />);
    expect(screen.getByText('Hospital Management System')).toBeInTheDocument();
    expect(screen.getByText('PatientRegister Component')).toBeInTheDocument();
  });

  test('can select an organization from dropdown', () => {
    render(<App />);
    const select = screen.getByRole('combobox');  
    fireEvent.change(select, { target: { value: 'City Hospital' } });
    expect(select.value).toBe('City Hospital');
  });

  test('can switch to Doctor tab', () => {
    render(<App />);
    const doctorBtn = screen.getByRole('button', { name: /Doctor Register/i });
    fireEvent.click(doctorBtn);
    expect(screen.getByText('DoctorRegister Component')).toBeInTheDocument();
  });

  test('can switch to Appointment tab', () => {
    render(<App />);
    const apptBtn = screen.getByRole('button', { name: /Appointment/i });
    fireEvent.click(apptBtn);
    expect(screen.getByText('AppointmentBooking Component')).toBeInTheDocument();
  });

  test('logs tab change to Firebase', () => {
    const { logEvent } = require('../firebase');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Doctor Register/i }));
    expect(logEvent).toHaveBeenCalledWith({}, 'tab_changed', { tab_name: 'doctor' });
  });

  test('logs organization selection to Firebase', () => {   
    const { logEvent } = require('../firebase');
    render(<App />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Sunrise Clinic' } });
    expect(logEvent).toHaveBeenCalledWith({}, 'organization_selected', { organization: 'Sunrise Clinic' });
  });
});
