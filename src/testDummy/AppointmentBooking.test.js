import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentBooking from "../components/AppointmentBooking";
import axios from "axios";
import { logAppointmentBooking } from "../FirebaseAnalytics";

jest.mock("axios");
jest.mock("../FirebaseAnalytics", () => ({
  logAppointmentBooking: jest.fn(),
}));

describe("AppointmentBooking Component", () => {
  const mockPatients = [
    { id: 1, firstName: "Alice", lastName: "Smith" },
    { id: 2, firstName: "Bob", lastName: "Jones" },
  ];

  const mockDoctors = [
    { id: 10, firstName: "Drake", lastName: "Ramoray", specialization: "Neurology" },
  ];

  const mockAppointments = [];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.get for initial loads
    axios.get.mockImplementation((url) => {
      if (url.includes("/patients")) return Promise.resolve({ data: mockPatients });
      if (url.includes("/doctors")) return Promise.resolve({ data: mockDoctors });
      if (url.includes("/appointments/doctor/")) return Promise.resolve({ data: mockAppointments });
      return Promise.resolve({ data: [] });
    });

    // Mock axios.post for creating payment intent and booking
    axios.post.mockImplementation((url, body) => {
      if (url.includes("/payment/create-payment-intent")) {
        return Promise.resolve({ data: { clientSecret: "test_secret" } });
      }
      if (url.includes("/appointments/book")) {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: {} });
    });
  });

    test("renders initial patient & doctor selectors and Next button", async () => {
      render(<AppointmentBooking organization="TestOrg" />);
      expect(screen.getByText("Book Appointment")).toBeInTheDocument();
      expect(screen.getByText("TestOrg")).toBeInTheDocument();

      // Wait for patient & doctor selects options to load
      await waitFor(() => {
        expect(screen.getAllByRole("option").some(opt => opt.textContent.includes("Alice"))).toBe(true);
        expect(screen.getAllByRole("option").some(opt => opt.textContent.includes("Drake"))).toBe(true);
      });

      expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
    });

  test("shows alert if clicking Next without selecting patient & doctor", async () => {
    window.alert = jest.fn();
    render(<AppointmentBooking organization="TestOrg" />);
    const nextBtn = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Select both patient and doctor.");
    });
  });

  test("proceeds to verification step when patient & doctor are selected", async () => {
    render(<AppointmentBooking organization="TestOrg" />);

    // Wait for and select patient & doctor
    await waitFor(() => screen.getAllByRole("combobox"));
  
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);

    // Wait for verify step content to appear
    await waitFor(() => {
      expect(screen.getByText(/Confirm patient and doctor details/i)).toBeInTheDocument();
    });
  });

  test("requires checking verification checkbox before proceeding", async () => {
    window.alert = jest.fn();
    render(<AppointmentBooking organization="TestOrg" />);

    // Select patient & doctor
    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    // Try to proceed without checking checkbox
    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Please verify the details.");
    });
  });

  test("can check checkbox and proceed to slot selection", async () => {
    render(<AppointmentBooking organization="TestOrg" />);

    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    const verifyCheckbox = await screen.findByRole("checkbox");
    fireEvent.click(verifyCheckbox);

    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    // Now should be on slot selection step: search for available slots
    const slots = await screen.findAllByTitle("Available");
    expect(slots.length).toBeGreaterThan(0);
  });

  test("blocks proceeding if slot not selected", async () => {
    window.alert = jest.fn();
    render(<AppointmentBooking organization="TestOrg" />);

    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    const verifyCheckbox = await screen.findByRole("checkbox");
    fireEvent.click(verifyCheckbox);

    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    // Now slot selection step, click Next without choosing slot
    const nextBtn3 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn3);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Please select an appointment slot.");
    });
  });

  test("loads payment intent on reaching payment step", async () => {
    render(<AppointmentBooking organization="TestOrg" />);

    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    const verifyCheckbox = await screen.findByRole("checkbox");
    fireEvent.click(verifyCheckbox);

    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    const slots = await screen.findAllByTitle("Available");
    fireEvent.click(slots[0]);

    const nextBtn3 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn3);

    // Now payment step should show loading or payment form; check for loading text
    await waitFor(() => {
  const paymentForm = screen.queryByTestId("payment-form");
  const paymentText = screen.queryByText(/payment/i);
  expect(paymentForm || paymentText).toBeInTheDocument();
});

  });

  test("submits booking successfully and calls analytics", async () => {
    window.alert = jest.fn(); 
    render(<AppointmentBooking organization="TestOrg" />);

    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    const verifyCheckbox = await screen.findByRole("checkbox");
    fireEvent.click(verifyCheckbox);

    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    const slots = await screen.findAllByTitle("Available");
    fireEvent.click(slots[0]);

    const nextBtn3 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn3);

    // Move to confirm & book step
    
    const confirmBtn = await screen.findByRole("button", { name: /Confirm & Book/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/appointments/book"),
        expect.objectContaining({
          patientId: 1,
          doctorId: 10,
          // appointmentDate something, could check length >0
        })
      );
    });

    expect(logAppointmentBooking).toHaveBeenCalledWith(
      "Alice Smith",
      "Dr. Drake Ramoray",
      expect.any(String)
    );

    // Alert for success
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Appointment booked successfully!");
    });
  });

  test("shows error message when booking fails", async () => {
    window.alert = jest.fn();
    
    axios.post.mockImplementationOnce((url, body) => {
      if (url.includes("/appointments/book")) {
        return Promise.reject(new Error("Booking failed."));
      }
      return Promise.resolve({ data: {} });
    });

    render(<AppointmentBooking organization="TestOrg" />);

    await waitFor(() => screen.getAllByRole("combobox"));
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });
    fireEvent.change(selects[1], { target: { value: "10" } });

    const nextBtn1 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn1);

    const verifyCheckbox = await screen.findByRole("checkbox");
    fireEvent.click(verifyCheckbox);

    const nextBtn2 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn2);

    const slots = await screen.findAllByTitle("Available");
    fireEvent.click(slots[0]);

    const nextBtn3 = await screen.findByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn3);

    const confirmBtn = await screen.findByRole("button", { name: /Confirm & Book/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("Booking failed.")).toBeInTheDocument();
    });
  });
});
