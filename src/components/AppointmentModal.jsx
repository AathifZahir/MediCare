import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation between pages
import db from "../firebase/firestore"; // Firestore database import
import { collection, getDocs, query, where } from "firebase/firestore";
import { X } from "lucide-react"; // Importing cancel icon
import { services } from "../data/ServicesData"; // Importing services data for service details
import auth from "../firebase/auth"; // Import Firebase authentication for current user data

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [date, setDate] = useState(""); // State to store selected date
  const [time, setTime] = useState(""); // State to store selected time
  const [error, setError] = useState(""); // State to store any error messages
  const [hospitals, setHospitals] = useState([]); // State to store list of hospitals
  const [selectedHospital, setSelectedHospital] = useState(""); // State for selected hospital
  const [doctors, setDoctors] = useState([]); // State to store list of doctors
  const [selectedDoctor, setSelectedDoctor] = useState(""); // State for selected doctor
  const [bookedAppointments, setBookedAppointments] = useState([]); // State to store booked appointments for the selected hospital
  const [disabledDates, setDisabledDates] = useState([]); // State for dates with no available appointments
  const [userId, setUserId] = useState(null); // Store the logged-in user's ID
  const [userName, setUserName] = useState(""); // Store the logged-in user's name
  const [serviceFee, setServiceFee] = useState(0); // Store the fee for the selected service

  const navigate = useNavigate(); // Initialize navigate for routing

  // Fetch logged-in user data from Firebase auth
  useEffect(() => {
    const fetchUserData = () => {
      const user = auth.currentUser; // Get current authenticated user
      if (user) {
        setUserId(user.uid); // Set user ID
        setUserName(`${user.displayName || "User"}`); // Set user name or fallback to "User"
      }
    };
    fetchUserData(); // Call the function to fetch user data
  }, []);

  // Fetch the service fee dynamically from servicesData.js based on the service ID
  useEffect(() => {
    const fetchServiceFee = () => {
      const selectedService = services.find((item) => item.id === service.id); // Find the service in services data
      if (selectedService) {
        const fee = parseInt(selectedService.fee.replace(/[^0-9]/g, ""), 10); // Extract numerical fee value
        setServiceFee(fee || 0); // Set the service fee
      }
    };
    if (service) {
      fetchServiceFee(); // Call the function to fetch service fee
    }
  }, [service]);

  // Fetch list of hospitals from Firestore when the modal opens
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCollection = collection(db, "hospitals"); // Reference to hospitals collection
        const hospitalSnapshot = await getDocs(hospitalsCollection); // Fetch hospitals data
        const hospitalData = hospitalSnapshot.docs.map((doc) => ({
          id: doc.id, // Get the document ID
          name: doc.data().name, // Get the hospital name
        }));
        setHospitals(hospitalData); // Set the fetched hospital data
      } catch (error) {
        console.error("Error retrieving hospital names: ", error); // Log errors if fetching fails
      }
    };

    if (isOpen) {
      fetchHospitals(); // Fetch hospitals if the modal is open
    }
  }, [isOpen]);

  // Fetch list of booked appointments for the selected hospital
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedHospital) return; // Skip if no hospital is selected
      try {
        const appointmentsCollection = collection(db, "appointments"); // Reference to appointments collection
        const q = query(
          appointmentsCollection,
          where("hospitalId", "==", selectedHospital.id) // Query appointments for the selected hospital
        );
        const appointmentSnapshot = await getDocs(q); // Fetch the appointments
        const appointmentData = appointmentSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));

        setBookedAppointments(appointmentData); // Store the booked appointments

        // Identify dates that are fully booked (all time slots taken)
        const fullyBookedDates = new Set();
        const slotCount = generateTimeSlots().length; // Count available time slots
        const dateMap = {};

        // Count the number of booked slots for each date
        appointmentData.forEach((appointment) => {
          if (!dateMap[appointment.date]) {
            dateMap[appointment.date] = 0;
          }
          dateMap[appointment.date]++;
          if (dateMap[appointment.date] >= slotCount) {
            fullyBookedDates.add(appointment.date); // Mark date as fully booked
          }
        });

        setDisabledDates(Array.from(fullyBookedDates)); // Disable fully booked dates
      } catch (error) {
        console.error("Error retrieving appointments: ", error); // Log any errors
      }
    };

    if (selectedHospital) {
      fetchAppointments(); // Fetch appointments when a hospital is selected
    }
  }, [selectedHospital]);

  // Fetch list of doctors for the selected hospital (only for doctor appointments)
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospital || service?.id !== 5) return; // Only fetch doctors if the service is a doctor appointment

      try {
        const usersCollection = collection(db, "users"); // Reference to users collection
        const q = query(
          usersCollection,
          where("hospital", "==", selectedHospital.id), // Query doctors for the selected hospital
          where("role", "==", "doctor") // Filter for users with role 'doctor'
        );
        const doctorSnapshot = await getDocs(q); // Fetch the doctors
        const doctorData = doctorSnapshot.docs.map((doc) => ({
          id: doc.id, // Get doctor ID
          name: `${doc.data().firstName} ${doc.data().lastName}`, // Get doctor's full name
        }));

        setDoctors(doctorData); // Store the fetched doctors
      } catch (error) {
        console.error("Error retrieving doctors: ", error); // Log any errors
      }
    };

    if (service?.id === 5 && selectedHospital) {
      fetchDoctors(); // Fetch doctors if it's a doctor appointment and a hospital is selected
    }
  }, [selectedHospital, service]);

  if (!isOpen) return null; // Don't render the modal if it's not open

  // Generate available time slots (9:00 AM - 5:30 PM, in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`); // Add full hour slots
      slots.push(`${hour.toString().padStart(2, "0")}:30`); // Add half-hour slots
    }
    return slots;
  };

  // Check if a time slot is already booked
  const isTimeSlotBooked = (slot) => {
    return bookedAppointments.some(
      (appointment) => appointment.date === date && appointment.time === slot
    );
  };

  const timeSlots = generateTimeSlots(); // Generate time slots

  // Handle form submission (navigate to payment gateway without storing the data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    const selectedDate = new Date(date); // Parse selected date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Get tomorrow's date

    if (selectedDate < tomorrow) {
      setError("Please select a date that is tomorrow or later."); // Set error if the date is too soon
      return;
    }

    // Navigate to the Payment Gateway with appointment details
    navigate(
      `/payment-gateway?hospitalId=${selectedHospital.id}&date=${date}&time=${time}&serviceId=${service.id}&doctorId=${selectedDoctor}`
    );
  };

  // Reset form and close modal on cancel
  const handleCancel = () => {
    setDate("");
    setTime("");
    setSelectedHospital("");
    setSelectedDoctor("");
    setError("");
    onClose(); // Call the parent onClose function to close the modal
  };

  const tomorrow = new Date(); // Get current date
  tomorrow.setDate(tomorrow.getDate() + 1); // Calculate tomorrow's date
  const tomorrowString = tomorrow.toISOString().split("T")[0]; // Format for date input min value

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={handleCancel}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Cancel"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Create Appointment for {service.name} {/* Display service name */}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Show error message */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hospital selection */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="hospital"
              className="text-sm font-medium text-gray-700"
            >
              Hospital:
            </label>
            <select
              id="hospital"
              value={selectedHospital.id || ""}
              onChange={(e) => {
                const selected = hospitals.find(
                  (hospital) => hospital.id === e.target.value
                );
                setSelectedHospital(selected); // Set selected hospital
              }}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
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

          {/* Doctor selection (only for doctor appointments) */}
          {service?.id === 5 && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="doctor"
                className="text-sm font-medium text-gray-700"
              >
                Doctor:
              </label>
              <select
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)} // Set selected doctor
                required
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="" disabled>
                  Select a doctor
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date selection */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date:
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)} // Set selected date
              min={tomorrowString} // Disable past dates
              disabled={disabledDates.includes(date)} // Disable fully booked dates
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:border-blue-500"
            />
          </div>

          {/* Time selection */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="time" className="text-sm font-medium text-gray-700">
              Time:
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)} // Set selected time
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a time slot
              </option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot} disabled={isTimeSlotBooked(slot)}>
                  {slot} {/* Display each time slot */}
                </option>
              ))}
            </select>
          </div>

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

export default AppointmentModal;