import React, { useState, useEffect } from "react";
import HomeSidebar from "../../components/HomeSidebar";
import db from "../../firebase/firestore"; // Import Firestore instance
import { collection, getDocs, addDoc } from "firebase/firestore"; // Firestore functions
import Snackbar from "@mui/material/Snackbar"; // Import Material-UI Snackbar
import Alert from "@mui/material/Alert";

const appointmentTypes = ["Checkup", "Consultation", "Surgery"];

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10; // Starting from 10 AM
  const minute = (i % 2) * 30; // 0 or 30 minutes
  return `${hour}:${minute === 0 ? "00" : minute}`;
});

const Appointment = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
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

  const handleHospitalChange = (event) => {
    setSelectedHospital(event.target.value);
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

    // Prepare appointment data
    const appointmentData = {
      hospital: selectedHospital,
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
    };

    // Upload appointment data to Firestore
    try {
      await addDoc(collection(db, "appointments"), appointmentData);
      // Open Snackbar on successful booking
      setSnackbarOpen(true);
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
                <option key={hospital.id} value={hospital.name}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </div>

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
                  className={`p-2 border rounded-md text-gray-700 hover:bg-indigo-600 hover:text-white transition duration-200 
                  ${
                    selectedTime === time
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
            Book Appointment
          </button>
        </form>

        {/* Snackbar for appointment confirmation */}
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
            Appointment successfully booked!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Appointment;
