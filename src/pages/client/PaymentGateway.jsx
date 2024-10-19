import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import db from "../../firebase/firestore"; // Import your Firestore config
import { doc, setDoc, addDoc, collection, getDoc } from "firebase/firestore"; // Use addDoc for creating new transactions
import auth from "../../firebase/auth"; // Import the auth instance from auth.js
import { CreditCard, Shield } from "lucide-react"; // Adjust imports based on your usage
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { services } from "../../data/ServicesData";

// Create Alert component for Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PaymentGateway = () => {
  const location = useLocation(); // Use useLocation to access the URL
  const navigate = useNavigate(); // Initialize navigate
  const queryParams = new URLSearchParams(location.search); // Extract query params

  const hospitalId = queryParams.get("hospitalId"); // Get hospitalId
  const time = queryParams.get("time"); // Get type (e.g., "Consultation")
  const date = queryParams.get("date"); // Get date
  const serviceId = queryParams.get("serviceId"); // Get time

  const getServiceFee = (serviceId) => {
    const service = services.find(
      (service) => service.id === parseInt(serviceId)
    );
    if (service) {
      // Extract the number from the fee string (e.g., "LKR 1,500" -> 1500)
      const fee = parseInt(service.fee.replace(/[^0-9]/g, ""), 10);
      return fee || 0;
    }
    return 0;
  };

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [paymentType, setPaymentType] = useState("card");
  const [amount, setAmount] = useState(getServiceFee(serviceId)); // Set initial amount based on type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [userId, setUserId] = useState(null); // State for user ID
  const [userName, setUserName] = useState({ firstName: "", lastName: "" }); // State for user's first and last name

  // Get user ID and fetch user data on component mount
  useEffect(() => {
    const user = auth.currentUser; // Access the current user from the imported auth instance
    if (user) {
      setUserId(user.uid); // Set user ID if logged in
      // Fetch the user's first name and last name from Firestore
      fetchUserName(user.uid);
    }
  }, []);

  // Function to fetch user's first and last name from Firestore
  const fetchUserName = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const { firstName, lastName } = userDocSnap.data();
        setUserName({ firstName, lastName });
      } else {
        console.error("No user found with ID:", userId);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
  };

  const handleCardNumberChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
    if (value.length <= 19) {
      setCardNumber(value);
    }
  };

  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 3); // Allow only numeric values
    setCvv(value);
  };

  const handleExpiryDateChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 4); // Allow only numeric values
    if (value.length > 2) {
      setExpiryDate(`${value.slice(0, 2)}/${value.slice(2)}`); // Format as MM/YY
    } else {
      setExpiryDate(value);
    }
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
      const paymentSuccess = true;

      if (paymentSuccess) {
        // Create the appointment data in Firestore
        const appointmentData = {
          hospitalId,
          amount: Number(amount),
          serviceId,
          paymentType,
          date,
          time,
          userId,
          userName: `${userName.firstName} ${userName.lastName}`, // Add user's name
          timestamp: new Date(),
        };

        // Add specific fields based on payment type
        if (paymentType === "card") {
          appointmentData.status = "scheduled";
        } else if (paymentType === "insurance") {
          appointmentData.status = "under review";
        }

        // Create the appointment document in Firestore and get its ID
        const appointmentRef = await addDoc(
          collection(db, "appointments"),
          appointmentData
        );
        const appointmentId = appointmentRef.id;

        // Create transaction data and store it in Firestore
        const transactionData = {
          appointmentId,
          amount: Number(amount),
          paymentType,
          userId,
          userName: `${userName.firstName} ${userName.lastName}`, // Add user's name
          timestamp: new Date(),
        };

        // Add specific fields based on payment type
        if (paymentType === "card") {
          transactionData.cardNumber =
            document.getElementById("cardNumber").value;
          transactionData.status = "Paid";
        } else if (paymentType === "insurance") {
          transactionData.policyNumber =
            document.getElementById("policyNumber").value;
          transactionData.providerName =
            document.getElementById("providerName").value;
          transactionData.status = "Pending";
        }

        // Store the transaction in the transactions collection and get its ID
        const transactionRef = await addDoc(
          collection(db, "transactions"),
          transactionData
        );
        const transactionId = transactionRef.id;

        // Update the appointment with the transaction ID
        await setDoc(
          doc(db, "appointments", appointmentId),
          { transactionId },
          { merge: true }
        );

        // Show success Snackbar
        setSnackbarOpen(true);
        console.log("Payment successful, appointment and transaction created!");

        // Navigate to home page after displaying the message
        setTimeout(() => {
          navigate("/");
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
              value={cardNumber}
              onChange={handleCardNumberChange}
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
              value={expiryDate}
              onChange={handleExpiryDateChange}
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
              type="text"
              id="cvv"
              value={cvv}
              onChange={handleCvvChange}
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

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay Now LKR ${amount}`}
        </button>
      </form>

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
