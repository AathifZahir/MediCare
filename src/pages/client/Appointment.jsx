import React, { useState, useEffect } from "react";
import HomeSidebar from "../../components/HomeSidebar";
import db from "../../firebase/firestore"; // Import Firestore instance
import { collection, getDocs, query, where } from "firebase/firestore"; // Firestore functions
import Snackbar from "@mui/material/Snackbar"; // Import Material-UI Snackbar
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const appointmentTypes = ["Checkup", "Consultation", "Surgery"];

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10; // Starting from 10 AM
  const minute = (i % 2) * 30; // 0 or 30 minutes
  return `${hour}:${minute === 0 ? "00" : minute}`;
});

const Appointment = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]); // Track booked times
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For Snackbar

  // Fetch hospitals from Firestore
  useEffect(() => {
    const fetchHospitals = async () => {
      const querySnapshot = await getDocs(collection(db, "hospitals"));
      const hospitalList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHospitals(hospitalList);
    };

    fetchHospitals();
  }, []);

  // Fetch appointments for selected hospital and date
  useEffect(() => {
    const fetchAppointments = async () => {
      if (selectedHospital && selectedDate) {
        const q = query(
          collection(db, "appointments"),
          where("hospitalId", "==", selectedHospital),
          where("date", "==", selectedDate)
        );
        const querySnapshot = await getDocs(q);
        const appointments = querySnapshot.docs.map((doc) => doc.data().time);

        // Log the appointments fetched for the selected date
        console.log(
          `Appointments for hospital ${selectedHospital} on ${selectedDate}:`,
          appointments
        );

        setBookedTimes(appointments);
      }
    };

    fetchAppointments();
  }, [selectedHospital, selectedDate]);

  const handleHospitalChange = (event) => {
    setSelectedHospital(event.target.value);
    setBookedTimes([]); // Reset booked times when hospital changes
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const appointmentData = {
      hospitalId: selectedHospital,
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
    };

    try {
      // Open Snackbar to show redirect message
      setSnackbarOpen(true);

      // Construct URL with query parameters for payment gateway
      const params = new URLSearchParams(appointmentData).toString();
      const paymentUrl = `/payment-gateway?${params}`;

      // Simulate a delay for redirecting to the payment gateway
      setTimeout(() => {
        navigate(paymentUrl); // Redirect to payment gateway with data in the URL
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment: ", error);
    }
  };

  return (
    <div>
      <HomeSidebar />
      <div className="max-w-lg mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          Book a Hospital Appointment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hospital Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Hospital
            </label>
            <select
              value={selectedHospital}
              onChange={handleHospitalChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>
                Select a hospital
              </option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type of Appointment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Appointment
            </label>
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>
                Select appointment type
              </option>
              {appointmentTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleTimeChange(time)}
                  disabled={bookedTimes.includes(time)} // Disable if time is booked
                  className={`p-2 border rounded-md text-gray-700 hover:bg-indigo-600 hover:text-white transition duration-200 
                  ${
                    bookedTimes.includes(time)
                      ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                      : selectedTime === time
                      ? "bg-indigo-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Proceed to Payment
          </button>
        </form>

        {/* Snackbar for redirect message */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="info"
            sx={{ width: "100%" }}
          >
            Redirecting to payment gateway...
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Appointment;
