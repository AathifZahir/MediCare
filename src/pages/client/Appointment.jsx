import React, { useState, useEffect } from "react";
import HomeSidebar from "../../components/HomeSidebar";
import db from "../../firebase/firestore";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const appointmentTypes = ["Checkup", "Consultation", "Surgery"];

// Generate time slots
const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10; // Starting from 10 AM
  const minute = (i % 2) * 30; // 0 or 30 minutes
  return `${hour}:${minute === 0 ? "00" : minute}`;
});

const Appointment = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch doctors from Firestore (based on role)
  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(collection(db, "users"), where("role", "==", "doctor"));
      const querySnapshot = await getDocs(q);
      const doctorList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorList);
    };

    fetchDoctors();
  }, []);

  // Fetch hospital based on selected doctor
  const handleDoctorChange = async (event) => {
    const selectedDoctorId = event.target.value;
    setSelectedDoctor(selectedDoctorId);

    const doctor = doctors.find((doc) => doc.id === selectedDoctorId);

    if (doctor?.hospital) {
      try {
        const hospitalRef = doc(db, "hospitals", doctor.hospital);
        const hospitalSnap = await getDoc(hospitalRef);

        if (hospitalSnap.exists()) {
          const hospitalData = hospitalSnap.data();
          setSelectedHospital(hospitalData.name);
          setSelectedHospitalId(doctor.hospital);
        } else {
          setSelectedHospital("");
          setSelectedHospitalId("");
        }
      } catch (error) {
        setSelectedHospital("");
        setSelectedHospitalId("");
      }
    } else {
      setSelectedHospital("");
      setSelectedHospitalId("");
    }
  };

  // Fetch appointments for selected hospital and date
  useEffect(() => {
    const fetchAppointments = async () => {
      console.log(
        "Fetching appointments for:",
        selectedHospitalId,
        selectedDate
      );
      if (selectedHospitalId && selectedDate) {
        const q = query(
          collection(db, "appointments"),
          where("hospitalId", "==", selectedHospitalId),
          where("date", "==", selectedDate)
        );
        const querySnapshot = await getDocs(q);
        const appointments = querySnapshot.docs.map((doc) => doc.data().time);
        console.log("Retrieved appointments: ", appointments);
        setBookedTimes(appointments);
      }
    };

    fetchAppointments();
  }, [selectedHospital, selectedDate]);

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
      doctorId: selectedDoctor,
      hospitalId: selectedHospitalId,
      type: selectedType,
      date: selectedDate,
      time: selectedTime,
    };

    try {
      setSnackbarOpen(true);

      // Construct URL with query parameters for payment gateway
      const params = new URLSearchParams(appointmentData).toString();
      const paymentUrl = `/payment-gateway?${params}`;

      setTimeout(() => {
        navigate(paymentUrl);
      }, 2000);
    } catch (error) {
      console.error("Error booking appointment: ", error);
    }
  };

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div>
      <HomeSidebar />
      <div className="max-w-lg mx-auto p-4">
        <h2 className="text-xl font-semibold mb-4">
          Book a Hospital Appointment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Doctor
            </label>
            <select
              value={selectedDoctor}
              onChange={handleDoctorChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>
                Select a doctor
              </option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {`${doctor.firstName} ${doctor.lastName}`}
                </option>
              ))}
            </select>
          </div>

          {/* Display the associated hospital after selecting a doctor */}
          {selectedHospital && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital
              </label>
              <input
                type="text"
                value={selectedHospital}
                readOnly
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
              />
            </div>
          )}

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
              min={getTodayDate()} // Set the minimum date to today
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
                  disabled={bookedTimes.includes(time)} // Disable if booked
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
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="success">
            Appointment booked! Redirecting to payment...
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Appointment;
