import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation for query params
import db from "../../firebase/firestore"; // Import your Firestore config
import { doc, setDoc } from "firebase/firestore"; // Import setDoc to create documents
import { CreditCard, Shield } from "lucide-react"; // Adjust imports based on your usage
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Create Alert component for Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PaymentGateway = () => {
  const location = useLocation(); // Use useLocation to access the URL
  const queryParams = new URLSearchParams(location.search); // Extract query params

  const hospitalId = queryParams.get("hospitalId"); // Get hospitalId
  const type = queryParams.get("type"); // Get type (e.g., "Checkup")
  const date = queryParams.get("date"); // Get date
  const time = queryParams.get("time"); // Get time

  const getAmount = (type) => {
    switch (type) {
      case "Checkup":
        return "1200";
      case "Consultation":
        return "2500";
      case "Surgery":
        return "9500";
      default:
        return "0"; // Default amount for unknown types
    }
  };

  const [paymentType, setPaymentType] = useState("card");
  const [amount, setAmount] = useState(getAmount(type)); // Set initial amount based on type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
  };

  const validateInputs = () => {
    if (
      paymentType === "card" &&
      (!document.getElementById("cardNumber").value ||
        !document.getElementById("expiryDate").value ||
        !document.getElementById("cvv").value)
    ) {
      setError("Please fill in all card details.");
      return false;
    }
    if (
      paymentType === "insurance" &&
      (!document.getElementById("policyNumber").value ||
        !document.getElementById("providerName").value)
    ) {
      setError("Please fill in all insurance details.");
      return false;
    }
    return true; // Inputs are valid
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      // Here, handle your payment processing logic.
      const paymentSuccess = true; // Replace this with actual payment processing result

      if (paymentSuccess) {
        // Create the appointment data in Firestore
        const appointmentData = {
          hospitalId, // Add hospitalId from query params
          type, // Use the type from query params
          amount: Number(amount), // Set amount based on selected type
          paymentType,
          date, // Add date from query params
          time, // Add time from query params
          timestamp: new Date(),
        };

        // Add specific fields based on payment type
        if (paymentType === "card") {
          appointmentData.cardNumber =
            document.getElementById("cardNumber").value;
          appointmentData.expiryDate =
            document.getElementById("expiryDate").value;
          appointmentData.cvv = document.getElementById("cvv").value;
        } else if (paymentType === "insurance") {
          appointmentData.policyNumber =
            document.getElementById("policyNumber").value;
          appointmentData.providerName =
            document.getElementById("providerName").value;
        }

        // Console log to check if appointment data is set properly
        console.log("Appointment Data:", appointmentData);

        // Create the appointment document in Firestore
        const appointmentRef = doc(db, "appointments", hospitalId); // Ensure unique appointment ID logic
        await setDoc(appointmentRef, appointmentData);

        // Show success Snackbar
        setSnackbarOpen(true);
        console.log("Payment successful and appointment created!");
      } else {
        setError("Payment processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Payment Gateway
      </h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handlePaymentTypeChange("card")}
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "card"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <CreditCard className="mr-2" size={20} />
          Card
        </button>
        <button
          onClick={() => handlePaymentTypeChange("insurance")}
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "insurance"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Shield className="mr-2" size={20} />
          Insurance
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {paymentType === "card" && (
          <div className="mb-4">
            <label htmlFor="cardNumber" className="block mb-2">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              className="w-full p-2 border rounded"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
        )}

        {paymentType === "card" && (
          <div className="mb-4">
            <label htmlFor="expiryDate" className="block mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              className="w-full p-2 border rounded"
              placeholder="MM/YY"
              required
            />
          </div>
        )}

        {paymentType === "card" && (
          <div className="mb-4">
            <label htmlFor="cvv" className="block mb-2">
              CVV
            </label>
            <input
              type="password"
              id="cvv"
              className="w-full p-2 border rounded"
              placeholder="123"
              required
            />
          </div>
        )}

        {paymentType === "insurance" && (
          <>
            <div className="mb-4">
              <label htmlFor="policyNumber" className="block mb-2">
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                className="w-full p-2 border rounded"
                placeholder="Enter policy number"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="providerName" className="block mb-2">
                Provider Name
              </label>
              <input
                type="text"
                id="providerName"
                className="w-full p-2 border rounded"
                placeholder="Enter provider name"
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay ₹${amount}`}
        </button>
      </form>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Payment successful!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PaymentGateway;
