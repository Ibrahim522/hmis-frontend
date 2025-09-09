import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Typography } from "@mui/material";

function PaymentForm({ form, setForm, onPaymentSuccess, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href + "?success=true",
        receipt_email: "", // optional
      },
      redirect: "if_required",
    });

    if (error) {
      alert(error.message || "Payment failed.");  // <-- alert on failure
      setErrorMessage(error.message || "Payment failed.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      alert("Payment succeeded!");  // <-- alert on success
      setForm({ ...form, paymentInfo: paymentIntent.id });
      onPaymentSuccess();
      setIsProcessing(false);
    } else {
      setErrorMessage("Payment processing.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!stripe || isProcessing}
        sx={{ mt: 2 }}
      >
        {isProcessing ? "Processing..." : `Pay Rs ${amount}`}
      </Button>
    </form>
  );
}

export default PaymentForm;
