import React, { useState, useEffect } from "react";
import db from "../firebase/firestore";
import { collection, getDocs, addDoc, Timestamp, query, where } from "firebase/firestore";
import { services } from "../data/ServicesData";

const AdminAppointmentModal = ({ isOpen, onClose }) => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [userName, setUserName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [providerName, setProviderName] = useState("");
  const [selectedService, setSelectedService] = useState(null); // Store selected service
  const [bookedSlots, setBookedSlots] = useState([]);
  const [error, setError] = useState("");

  // Fetch available hospitals from Firestore
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCollection = collection(db, "hospitals");
        const hospitalSnapshot = await getDocs(hospitalsCollection);
        const hospitalData = hospitalSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setHospitals(hospitalData);
      } catch (error) {
        console.error("Error retrieving hospitals:", error);
      }
    };
    fetchHospitals();
  }, []);

  // Fetch booked slots when hospital and date are selected
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedHospital || !date) return;

      try {
        const q = query(
          collection(db, "appointments"),
          where("hospitalId", "==", selectedHospital),
          where("date", "==", date)
        );
        const querySnapshot = await getDocs(q);
        const booked = querySnapshot.docs.map((doc) => doc.data().time);
        setBookedSlots(booked);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    fetchBookedSlots();
  }, [selectedHospital, date]);

  if (!isOpen) return null; // Don't render modal if it's not open

  // Generate time slots from 09:00 to 16:30
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 16.30; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 16.30) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Disable past dates in date picker
  const todayString = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userName || !date || !time || !selectedHospital || !paymentType || !selectedService) {
      setError("Please fill all required fields.");
      return;
    }

    const appointmentStatus = paymentType === "insurance" ? "Under Review" : "Scheduled";
    const serviceFee = selectedService.fee.replace("LKR ", "").replace(",", "");

    // Create appointment entry in Firestore
    const appointmentData = {
      userName,
      date,
      time,
      hospitalId: selectedHospital,
      serviceId: selectedService.id.toString(), // Set serviceId
      amount: parseFloat(serviceFee), // Set amount
      paymentType,
      status: appointmentStatus,
      timestamp: Timestamp.now(), // Save timestamp of appointment creation
    };

    try {
      console.log("Appointment Data:", appointmentData);

      // Add appointment to appointments collection
      const appointmentRef = await addDoc(collection(db, "appointments"), appointmentData);
      const appointmentId = appointmentRef.id;
      console.log("Appointment added with ID:", appointmentId);

      // Set transaction status based on paymentType
      let transactionStatus = "Pending";
      if (paymentType === "card" || paymentType === "cash") {
        transactionStatus = "Paid";
      } else if (paymentType === "insurance") {
        transactionStatus = "Under Review";
      }

      // Create transaction entry
      const transactionData = {
        amount: parseFloat(serviceFee),
        appointmentId,
        hospitalId: selectedHospital,
        userName,
        paymentType,
        status: transactionStatus, // Set the correct status based on paymentType
        timestamp: Timestamp.now(), // Save timestamp of transaction creation
      };

      // Add additional data for card or insurance
      if (paymentType === "card") {
        transactionData.cardNumber = cardNumber;
      } else if (paymentType === "insurance") {
        transactionData.policyNumber = policyNumber;
        transactionData.providerName = providerName;
      }

      console.log("Transaction Data:", transactionData);

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
      onClose();
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">User Name:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Service:</label>
            <select
              value={selectedService ? selectedService.id : ""}
              onChange={(e) => {
                const service = services.find((s) => s.id === parseInt(e.target.value));
                setSelectedService(service);
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

          {selectedService && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Service Fee:</label>
              <input
                type="text"
                value={selectedService.fee}
                readOnly
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-100"
              />
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Hospital:</label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
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

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayString}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Time:</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select a time slot</option>
              {timeSlots.map((slot) => (
                <option
                  key={slot}
                  value={slot}
                  disabled={bookedSlots.includes(slot)}
                >
                  {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Type:</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="" disabled>Select payment type</option>
              <option value="card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>

          {paymentType === "card" && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Card Number:</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}

          {paymentType === "insurance" && (
            <>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Policy Number:</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  required
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Provider Name:</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  required
                  className="py-2 px-4 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </>
          )}

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