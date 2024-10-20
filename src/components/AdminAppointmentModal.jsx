import React, { useState, useEffect } from "react";
import db from "../firebase/firestore"; // Import Firestore configuration
import { collection, getDocs, addDoc, Timestamp, query, where } from "firebase/firestore"; // Firestore methods
import { services } from "../data/ServicesData"; // Import services data

const AdminAppointmentModal = ({ isOpen, onClose }) => {
  const [hospitals, setHospitals] = useState([]); // State to store list of hospitals
  const [selectedHospital, setSelectedHospital] = useState(""); // State to store selected hospital ID
  const [userName, setUserName] = useState(""); // State to store user name
  const [date, setDate] = useState(""); // State to store selected appointment date
  const [time, setTime] = useState(""); // State to store selected appointment time
  const [paymentType, setPaymentType] = useState(""); // State to store selected payment type
  const [cardNumber, setCardNumber] = useState(""); // State to store card number (for card payments)
  const [policyNumber, setPolicyNumber] = useState(""); // State to store insurance policy number
  const [providerName, setProviderName] = useState(""); // State to store insurance provider name
  const [selectedService, setSelectedService] = useState(null); // State to store selected service details
  const [bookedSlots, setBookedSlots] = useState([]); // State to store already booked time slots
  const [error, setError] = useState(""); // State to store error messages

  // Fetch available hospitals from Firestore when the component loads
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCollection = collection(db, "hospitals"); // Reference to hospitals collection
        const hospitalSnapshot = await getDocs(hospitalsCollection); // Fetch hospital documents
        const hospitalData = hospitalSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setHospitals(hospitalData); // Store fetched hospitals in state
      } catch (error) {
        console.error("Error retrieving hospitals:", error);
      }
    };
    fetchHospitals(); // Call fetch function
  }, []);

  // Fetch booked slots for a selected hospital and date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedHospital || !date) return; // Only fetch if hospital and date are selected

      try {
        const q = query(
          collection(db, "appointments"),
          where("hospitalId", "==", selectedHospital),
          where("date", "==", date)
        );
        const querySnapshot = await getDocs(q); // Fetch booked appointments
        const booked = querySnapshot.docs.map((doc) => doc.data().time); // Extract booked times
        setBookedSlots(booked); // Store booked times in state
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchBookedSlots(); // Call fetch function when hospital or date changes
  }, [selectedHospital, date]);

  if (!isOpen) return null; // Don't render modal if it is not open

  // Generate time slots from 09:00 to 16:30
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 16.5; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`); // Add full-hour slots
      if (hour < 16.5) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`); // Add half-hour slots
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(); // Call to generate time slots

  // Disable past dates in the date picker
  const todayString = new Date().toISOString().split("T")[0]; // Get current date for date picker min value

  // Handle form submission to create appointment and transaction in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!userName || !date || !time || !selectedHospital || !paymentType || !selectedService) {
      setError("Please fill all required fields.");
      return;
    }

    const appointmentStatus = paymentType === "insurance" ? "Under Review" : "Scheduled"; // Set status based on payment type
    const serviceFee = selectedService.fee.replace("LKR ", "").replace(",", ""); // Get service fee as a number

    // Create appointment data
    const appointmentData = {
      userName,
      date,
      time,
      hospitalId: selectedHospital,
      serviceId: selectedService.id.toString(), // Store service ID
      amount: parseFloat(serviceFee), // Convert fee to float
      paymentType,
      status: appointmentStatus,
      timestamp: Timestamp.now(), // Set creation timestamp
    };

    try {
      console.log("Appointment Data:", appointmentData);

      // Add appointment to Firestore
      const appointmentRef = await addDoc(collection(db, "appointments"), appointmentData);
      const appointmentId = appointmentRef.id; // Get created appointment ID
      console.log("Appointment added with ID:", appointmentId);

      // Set transaction status based on payment type
      let transactionStatus = "Pending";
      if (paymentType === "card" || paymentType === "cash") {
        transactionStatus = "Paid";
      } else if (paymentType === "insurance") {
        transactionStatus = "Under Review";
      }

      // Create transaction data
      const transactionData = {
        amount: parseFloat(serviceFee),
        appointmentId,
        hospitalId: selectedHospital,
        userName,
        paymentType,
        status: transactionStatus,
        timestamp: Timestamp.now(), // Set creation timestamp for the transaction
      };

      // Add additional details based on payment type
      if (paymentType === "card") {
        transactionData.cardNumber = cardNumber; // Store card number if payment type is card
      } else if (paymentType === "insurance") {
        transactionData.policyNumber = policyNumber; // Store insurance policy number
        transactionData.providerName = providerName; // Store insurance provider name
      }

      console.log("Transaction Data:", transactionData);

      // Add transaction to Firestore
      await addDoc(collection(db, "transactions"), transactionData);
      console.log("Transaction added.");

      // Reset form and close modal
      setUserName("");
      setDate("");
      setTime("");
      setSelectedHospital("");
      setSelectedService(null);
      setPaymentType("");
      setCardNumber("");
      setPolicyNumber("");
      setProviderName("");
      setError("");
      onClose(); // Close modal
    } catch (error) {
      console.error("Error creating appointment or transaction:", error);
      setError("Failed to create appointment.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Create Appointment
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Form to create an appointment */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name input */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)} // Update user name state
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Service selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Service:</label>
            <select
              value={selectedService ? selectedService.id : ""}
              onChange={(e) => {
                const service = services.find((s) => s.id === parseInt(e.target.value)); // Find selected service
                setSelectedService(service); // Set selected service
              }}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Display service fee */}
          {selectedService && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Fee:</label>
              <input
                type="text"
                value={selectedService.fee} // Display fee from the selected service
                readOnly
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
          )}

          {/* Hospital selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Hospital:</label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)} // Set selected hospital
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select a hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)} // Set selected date
              min={todayString} // Disable past dates
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          {/* Time slot selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Time:</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)} // Set selected time slot
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select a time slot</option>
              {timeSlots.map((slot) => (
                <option
                  key={slot}
                  value={slot}
                  disabled={bookedSlots.includes(slot)} // Disable already booked slots
                >
                  {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Payment type selection */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Type:</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)} // Set selected payment type
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select payment type</option>
              <option value="card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>

          {/* Card number input (if payment type is card) */}
          {paymentType === "card" && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Card Number:</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)} // Set card number
                required
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}

          {/* Insurance details (if payment type is insurance) */}
          {paymentType === "insurance" && (
            <>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Policy Number:</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)} // Set policy number
                  required
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider Name:</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)} // Set insurance provider name
                  required
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </>
          )}

          {/* Submit button */}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Create Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAppointmentModal;