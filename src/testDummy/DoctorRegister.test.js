import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DoctorRegister from "../components/DoctorRegister";
import axios from "axios";

jest.mock("axios");

describe("DoctorRegister Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText(/CNIC/i), {
      target: { value: "12345-1234567-1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Date of Birth/i), {
      target: { value: "1990-01-01" },
    });

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Cardiologist" } }); // specialization
    fireEvent.change(selects[1], { target: { value: "Male" } }); // gender

    fireEvent.change(screen.getByPlaceholderText(/Contact/i), {
      target: { value: "1234567890" },
    });
  };

  test("renders all form fields correctly", () => {
    render(<DoctorRegister organization="HealthOrg" />);

    expect(screen.getByText("Doctor Registration")).toBeInTheDocument();
    expect(screen.getByText("HealthOrg")).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/CNIC/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Date of Birth/i)).toBeInTheDocument();

    expect(screen.getAllByRole("combobox").length).toBe(2); // specialization + gender
    expect(screen.getByPlaceholderText(/Contact/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("validates name fields to allow only letters", async () => {
    render(<DoctorRegister organization="HealthOrg" />);
    const firstNameInput = screen.getByPlaceholderText(/First Name/i);

    fireEvent.change(firstNameInput, { target: { value: "John123" } });
    fireEvent.blur(firstNameInput);

    expect(screen.getByText(/only letters/i)).toBeInTheDocument();

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(screen.queryByText(/only letters/i)).not.toBeInTheDocument();
  });

  test("shows error on invalid email format", async () => {
    render(<DoctorRegister organization="HealthOrg" />);
    const emailInput = screen.getByPlaceholderText(/Email/i);

    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  test("send OTP button triggers API call and sets OTP sent state", async () => {
    axios.post.mockResolvedValueOnce({});

    render(<DoctorRegister organization="HealthOrg" />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "john.doe@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/otp/send-otp"),
        { email: "john.doe@example.com" }
      );
    });

    await screen.findByPlaceholderText(/Enter your OTP here/i);
    expect(screen.queryByRole("button", { name: /send otp/i })).not.toBeInTheDocument();
  });

  test("verify OTP triggers API call and sets verified state", async () => {
    axios.post.mockResolvedValueOnce({}); // send OTP
    axios.post.mockResolvedValueOnce({}); // verify OTP

    render(<DoctorRegister organization="HealthOrg" />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "john.doe@example.com" },
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
        { email: "john.doe@example.com", otp: "123456" }
      );
    });

    await screen.findByText("✅");
  });

  test("prevents submission if OTP not verified", async () => {
    render(<DoctorRegister organization="HealthOrg" />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalledWith(expect.stringContaining("/doctors/register"));
    });
  });
  
  test("submits form successfully when OTP verified", async () => {
    axios.post.mockResolvedValue({});

    render(<DoctorRegister organization="HealthOrg" />);
    fillValidForm();

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
        expect.stringContaining("/doctors/register"),
        expect.objectContaining({
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          address: "123 Main St",
          cnic: "12345-1234567-1",
          dob: "1990-01-01",
          specialization: "Cardiologist",
          gender: "Male",
          contact: "1234567890",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/First Name/i).value).toBe("");
    });
  });

  test("shows error message on registration failure", async () => {
    axios.post.mockResolvedValueOnce({}); // send OTP
    axios.post.mockResolvedValueOnce({}); // verify OTP
    axios.post.mockRejectedValueOnce(new Error("Server error")); // fail registration

    render(<DoctorRegister organization="HealthOrg" />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: /send otp/i }));
    const otpInput = await screen.findByPlaceholderText(/Enter your OTP here/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));

    const registerBtn = await screen.findByRole("button", { name: /register/i });
    fireEvent.click(registerBtn);

    expect(await screen.findByText(/Registration failed/i)).toBeInTheDocument();
  });
});
