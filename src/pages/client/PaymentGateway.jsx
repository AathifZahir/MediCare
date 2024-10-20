import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks for navigation and URL management
import db from "../../firebase/firestore"; // Import Firestore configuration
import { doc, setDoc, addDoc, collection, getDoc } from "firebase/firestore"; // Firestore functions for adding and getting documents
import auth from "../../firebase/auth"; // Firebase authentication instance
import { CreditCard, Shield } from "lucide-react"; // Icons for payment types
import Snackbar from "@mui/material/Snackbar"; // Material UI Snackbar for notifications
import MuiAlert from "@mui/material/Alert"; // Material UI Alert for Snackbar notifications
import { services } from "../../data/ServicesData"; // Importing service data

// Create Alert component for displaying notifications in Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PaymentGateway = () => {
  const location = useLocation(); // Extracts location (URL) object to get query parameters
  const navigate = useNavigate(); // For navigating to different routes/pages
  const queryParams = new URLSearchParams(location.search); // Get query params from the URL

  // Extract appointment-related data from query parameters
  const hospitalId = queryParams.get("hospitalId"); // Get hospital ID from URL params
  const time = queryParams.get("time"); // Get selected time for the appointment
  const date = queryParams.get("date"); // Get selected date for the appointment
  const serviceId = queryParams.get("serviceId"); // Get selected service ID
  const doctorId = queryParams.get("doctorId"); // Get doctor ID if it's a doctor appointment

  // Function to calculate the service fee based on the serviceId
  const getServiceFee = (serviceId) => {
    const service = services.find(
      (service) => service.id === parseInt(serviceId)
    );
    if (service) {
      // Convert fee string (e.g., "LKR 1,500") to a number (e.g., 1500)
      const fee = parseInt(service.fee.replace(/[^0-9]/g, ""), 10);
      return fee || 0;
    }
    return 0;
  };

  // State hooks to manage form fields, payment status, and user details
  const [cardNumber, setCardNumber] = useState(""); // Card number for card payment
  const [cvv, setCvv] = useState(""); // CVV for card payment
  const [expiryDate, setExpiryDate] = useState(""); // Expiry date for card payment
  const [paymentType, setPaymentType] = useState("card"); // Default payment type set to "card"
  const [amount, setAmount] = useState(getServiceFee(serviceId)); // Calculate amount based on serviceId
  const [loading, setLoading] = useState(false); // Show loading spinner while processing payment
  const [error, setError] = useState(""); // Error messages for validation or processing
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to control the Snackbar
  const [userId, setUserId] = useState(null); // State to store the user's ID
  const [userName, setUserName] = useState({ firstName: "", lastName: "" }); // Store user's name (first and last)

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const user = auth.currentUser; // Get current logged-in user
    if (user) {
      setUserId(user.uid); // Store the user ID
      fetchUserName(user.uid); // Fetch user's name from Firestore
    }
  }, []);

  // Function to fetch user's first and last name from Firestore using userId
  const fetchUserName = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId); // Get reference to user document
      const userDocSnap = await getDoc(userDocRef); // Fetch the document from Firestore
      if (userDocSnap.exists()) {
        const { firstName, lastName } = userDocSnap.data(); // Extract first and last name
        setUserName({ firstName, lastName }); // Store name in state
      } else {
        console.error("No user found with ID:", userId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Handle changing the payment type (card or insurance)
  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
  };

  // Format and update the card number with spaces every 4 digits
  const handleCardNumberChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "") // Remove non-numeric characters
      .replace(/(\d{4})/g, "$1 ") // Add space after every 4 digits
      .trim();
    if (value.length <= 19) {
      setCardNumber(value); // Update state if length is valid
    }
  };

  // Format and update the CVV (3 digits only)
  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 3); // Allow only numeric values
    setCvv(value);
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 4); // Only allow numeric values
    if (value.length > 2) {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2)}`); // Format expiry date
    } else {
      setExpiryDate(value);
    }
  };

  // Validate payment form inputs
  const validateInputs = () => {
    // Check if card details are filled when payment type is "card"
    if (
      paymentType === "card" &&
      (!document.getElementById("cardNumber").value ||
        !document.getElementById("expiryDate").value ||
        !document.getElementById("cvv").value)
    ) {
      setError("Please fill in all card details.");
      return false;
    }
    // Check if insurance details are filled when payment type is "insurance"
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

  // Handle form submission and payment processing
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!validateInputs()) {
      setLoading(false); // Stop loading if validation fails
      return;
    }

    try {
      const paymentSuccess = true; // Simulate payment success for now

      if (paymentSuccess) {
        // Create appointment data to store in Firestore
        const appointmentData = {
          hospitalId,
          amount: Number(amount),
          serviceId,
          paymentType,
          date,
          time,
          doctorId: doctorId || null, // Add doctorId if applicable
          userId,
          userName: `${userName.firstName} ${userName.lastName}`, // Store user's full name
          timestamp: new Date(),
        };

        if (paymentType === "card") {
          appointmentData.status = "Scheduled"; // Set status to Scheduled for card payments
        } else if (paymentType === "insurance") {
          appointmentData.status = "Pending"; // Set status to Pending for insurance payments
        }

        // Store the appointment data in Firestore
        const appointmentRef = await addDoc(
          collection(db, "appointments"),
          appointmentData
        );
        const appointmentId = appointmentRef.id; // Get the appointment ID

        // Create transaction data to store in Firestore
        const transactionData = {
          appointmentId,
          amount: Number(amount),
          paymentType,
          userId,
          userName: `${userName.firstName} ${userName.lastName}`, // Store user's full name
          timestamp: new Date(),
          hospitalId,
        };

        // Add additional fields for card or insurance payment
        if (paymentType === "card") {
          transactionData.cardNumber =
            document.getElementById("cardNumber").value;
          transactionData.status = "Paid";
        } else if (paymentType === "insurance") {
          transactionData.policyNumber =
            document.getElementById("policyNumber").value;
          transactionData.providerName =
            document.getElementById("providerName").value;
          transactionData.status = "Under Review";
        }

        // Store the transaction in Firestore
        const transactionRef = await addDoc(
          collection(db, "transactions"),
          transactionData
        );
        const transactionId = transactionRef.id; // Get the transaction ID

        // Update the appointment with the transaction ID
        await setDoc(
          doc(db, "appointments", appointmentId),
          { transactionId },
          { merge: true } // Merge with existing data
        );

        // Show success notification
        setSnackbarOpen(true);
        console.log("Payment successful, appointment and transaction created!");

        // Navigate back to the homepage after showing the message
        setTimeout(() => {
          navigate("/"); // Redirect to home after 2 seconds
        }, 2000); // 2 seconds delay
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

  // Close Snackbar notification
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Payment Gateway
      </h2>

      {error && <p className="text-red-500">{error}</p>} {/* Display error messages */}

      {/* Payment type selection buttons */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handlePaymentTypeChange("card")} // Set payment type to "card"
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "card"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <CreditCard className="mr-2" size={20} /> {/* Card icon */}
          Card
        </button>
        <button
          onClick={() => handlePaymentTypeChange("insurance")} // Set payment type to "insurance"
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "insurance"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Shield className="mr-2" size={20} /> {/* Insurance icon */}
          Insurance
        </button>
      </div>

      {/* Payment form */}
      <form onSubmit={handleSubmit}>
        {/* Card payment fields */}
        {paymentType === "card" && (
          <>
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block mb-2">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="w-full p-2 border rounded"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="expiryDate" className="block mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                className="w-full p-2 border rounded"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="cvv" className="block mb-2">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={handleCvvChange}
                className="w-full p-2 border rounded"
                placeholder="123"
                required
              />
            </div>
          </>
        )}

        {/* Insurance payment fields */}
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
                placeholder="Policy Number"
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
                placeholder="Insurance Provider"
                required
              />
            </div>
          </>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay Now LKR ${amount}`} {/* Show loading state */}
        </button>
      </form>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Payment successful!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PaymentGateway;