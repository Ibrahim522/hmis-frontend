import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PatientRegister from "../components/PatientRegister";
import axios from "axios";
import { logPatientRegistration } from "../FirebaseAnalytics";

jest.mock("axios");
jest.mock("../FirebaseAnalytics", () => ({
  logPatientRegistration: jest.fn(),
}));

  describe("PatientRegister Component", () => {
    beforeEach(() => {
      jest.clearAllMocks(); 
      window.alert = jest.fn();
    });

    test("renders all form fields correctly", () => {
      render(<PatientRegister organization="Test Org" />);

    expect(screen.getByText("Patient Registration")).toBeInTheDocument();
    expect(screen.getByText("Test Org")).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Address/i)).toBeInTheDocument();  
    expect(screen.getByPlaceholderText(/CNIC/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Date of Birth/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // Gender select
    expect(screen.getByPlaceholderText(/Contact Number/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
  });

  test("validates name fields to allow only letters", () => {
    render(<PatientRegister organization="Test Org" />);

    const firstNameInput = screen.getByPlaceholderText(/First Name/i);
    fireEvent.change(firstNameInput, { target: { value: "John123" } });
    fireEvent.blur(firstNameInput);

    expect(screen.getByText("Only letters are allowed")).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(screen.queryByText("Only letters are allowed")).not.toBeInTheDocument();
  });

  test("shows error on invalid email format", () => {
    render(<PatientRegister organization="Test Org" />);

    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);

    expect(screen.getByText("Invalid email format")).toBeInTheDocument();
  });

    test("send OTP button triggers API call and sets OTP sent state", async () => {
      axios.post.mockResolvedValueOnce({});

      render(<PatientRegister organization="Test Org" />);
      const emailInput = screen.getByPlaceholderText(/Email/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining("/otp/send-otp"),
          { email: "test@example.com" }
        );
      });

    await screen.findByPlaceholderText(/Enter your OTP here/i);
    expect(screen.queryByRole("button", { name: /send otp/i })).not.toBeInTheDocument();
  });

  test("verify OTP triggers API call and sets verified state", async () => {
    axios.post.mockResolvedValueOnce({}); // send OTP
    axios.post.mockResolvedValueOnce({}); // verify OTP

    render(<PatientRegister organization="Test Org" />);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    await waitFor(() => {
      expect(emailInput.value).toBe("test@example.com");
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await screen.findByPlaceholderText(/Enter your OTP here/i);

    const otpInput = screen.getByPlaceholderText(/Enter your OTP here/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/otp/verify-otp"),
        { email: "test@example.com", otp: "123456" }
      );
    });

    await screen.findByText("✅");
  });

  test("prevents submission if OTP not verified", async () => {
    render(<PatientRegister organization="Test Org" />);

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), { target: { value: "123 Street" } });
    fireEvent.change(screen.getByPlaceholderText(/CNIC/i), { target: { value: "12345-1234567-1" } });
    fireEvent.change(screen.getByPlaceholderText(/Date of Birth/i), { target: { value: "1990-01-01" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Male" } });
    fireEvent.change(screen.getByPlaceholderText(/Contact Number/i), { target: { value: "1234567890" } });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalledWith(expect.stringContaining("/patients/register"));
    });
  });

  test("submits form successfully and calls analytics log when OTP verified", async () => {
    axios.post.mockResolvedValue({});

    render(<PatientRegister organization="Test Org" />);

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), { target: { value: "123 Street" } });
    fireEvent.change(screen.getByPlaceholderText(/CNIC/i), { target: { value: "12345-1234567-1" } });
    fireEvent.change(screen.getByPlaceholderText(/Date of Birth/i), { target: { value: "1990-01-01" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Male" } });
    fireEvent.change(screen.getByPlaceholderText(/Contact Number/i), { target: { value: "1234567890" } });

    axios.post.mockResolvedValueOnce({}); // send OTP
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await screen.findByPlaceholderText(/Enter your OTP here/i);

    const otpInput = screen.getByPlaceholderText(/Enter your OTP here/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });

    axios.post.mockResolvedValueOnce({}); // verify OTP
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));

    const registerBtn = await screen.findByRole("button", { name: /register/i });
    fireEvent.click(registerBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/patients/register"),
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          address: "123 Street",
          cnic: "12345-1234567-1",
          dob: "1990-01-01",
          gender: "Male",
          contact: "1234567890",
        })
      );
    });

    expect(logPatientRegistration).toHaveBeenCalledWith("John Doe");

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/First Name/i).value).toBe("");
    });
  });

  test("shows error message on registration failure", async () => {
    // Mock successful send OTP
    axios.post.mockResolvedValueOnce({}); 

    // Mock successful verify OTP
    axios.post.mockResolvedValueOnce({}); 

    // Mock registration failure
    axios.post.mockRejectedValueOnce(new Error("Server error"));

    render(<PatientRegister organization="Test Org" />);

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: "john.doe@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), { target: { value: "123 Street" } });
    fireEvent.change(screen.getByPlaceholderText(/CNIC/i), { target: { value: "12345-1234567-1" } });
    fireEvent.change(screen.getByPlaceholderText(/Date of Birth/i), { target: { value: "1990-01-01" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Male" } });
    fireEvent.change(screen.getByPlaceholderText(/Contact Number/i), { target: { value: "1234567890" } });

    // Send OTP
  
    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    await screen.findByPlaceholderText(/Enter your OTP here/i);

    // Enter OTP and verify
    const otpInput = screen.getByPlaceholderText(/Enter your OTP here/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));

    // Attempt to register (will fail)
    const registerBtn = await screen.findByRole("button", { name: /register/i });
    fireEvent.click(registerBtn);

    // Expect error message shown
    await screen.findByText(/Registration failed: Server error/i);
  });
});
