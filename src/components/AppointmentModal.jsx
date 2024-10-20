import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import db from "../firebase/firestore"; // Adjust the import path as necessary
import { collection, getDocs, query, where } from "firebase/firestore";
import { X } from "lucide-react"; // Importing the cancel icon
import { services } from "../data/ServicesData"; // Importing services data
import auth from "../firebase/auth"; // Import Firebase auth for current user

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [serviceFee, setServiceFee] = useState(0);

  const navigate = useNavigate(); // Initialize navigate

  // Fetch the logged-in user data
  useEffect(() => {
    const fetchUserData = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        setUserName(`${user.displayName || "User"}`);
      }
    };
    fetchUserData();
  }, []);

  // Fetch the service fee dynamically from servicesData.js based on the service ID
  useEffect(() => {
    const fetchServiceFee = () => {
      const selectedService = services.find((item) => item.id === service.id);
      if (selectedService) {
        const fee = parseInt(selectedService.fee.replace(/[^0-9]/g, ""), 10);
        setServiceFee(fee || 0);
      }
    };
    if (service) {
      fetchServiceFee();
    }
  }, [service]);

  // Fetch hospitals on modal open
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCollection = collection(db, "hospitals");
        const hospitalSnapshot = await getDocs(hospitalsCollection);
        const hospitalData = hospitalSnapshot.docs.map((doc) => ({
          id: doc.id, // Get the document ID
          name: doc.data().name, // Get the hospital name
        }));
        setHospitals(hospitalData);
      } catch (error) {
        console.error("Error retrieving hospital names: ", error);
      }
    };

    if (isOpen) {
      fetchHospitals();
    }
  }, [isOpen]);

  // Fetch appointments when hospital is selected
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedHospital) return;
      try {
        const appointmentsCollection = collection(db, "appointments");
        const q = query(
          appointmentsCollection,
          where("hospitalId", "==", selectedHospital.id)
        );
        const appointmentSnapshot = await getDocs(q);
        const appointmentData = appointmentSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));

        setBookedAppointments(appointmentData);

        // Collect dates that are fully booked (all time slots taken)
        const fullyBookedDates = new Set();
        const slotCount = generateTimeSlots().length;
        const dateMap = {};

        appointmentData.forEach((appointment) => {
          if (!dateMap[appointment.date]) {
            dateMap[appointment.date] = 0;
          }
          dateMap[appointment.date]++;
          if (dateMap[appointment.date] >= slotCount) {
            fullyBookedDates.add(appointment.date);
          }
        });

        setDisabledDates(Array.from(fullyBookedDates));
      } catch (error) {
        console.error("Error retrieving appointments: ", error);
      }
    };

    if (selectedHospital) {
      fetchAppointments();
    }
  }, [selectedHospital]);

  // Fetch doctors for the selected hospital (only if service is Doctor Appointment)
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospital || service?.id !== 5) return;

      try {
        const usersCollection = collection(db, "users");
        const q = query(
          usersCollection,
          where("hospital", "==", selectedHospital.id),
          where("role", "==", "doctor")
        );
        const doctorSnapshot = await getDocs(q);
        const doctorData = doctorSnapshot.docs.map((doc) => ({
          id: doc.id, // Get doctor ID
          name: `${doc.data().firstName} ${doc.data().lastName}`, // Get doctor's full name
        }));

        setDoctors(doctorData); // Store the fetched doctors
      } catch (error) {
        console.error("Error retrieving doctors: ", error);
      }
    };

    if (service?.id === 5 && selectedHospital) {
      fetchDoctors();
    }
  }, [selectedHospital, service]);

  if (!isOpen) return null;

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const isTimeSlotBooked = (slot) => {
    return bookedAppointments.some(
      (appointment) => appointment.date === date && appointment.time === slot
    );
  };

  const timeSlots = generateTimeSlots();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (selectedDate < tomorrow) {
      setError("Please select a date that is tomorrow or later.");
      return;
    }

    // Pass data to the Payment Gateway without storing in Firestore
    navigate(
      `/payment-gateway?hospitalId=${selectedHospital.id}&date=${date}&time=${time}&serviceId=${service.id}&doctorId=${selectedDoctor}`
    );
  };

  const handleCancel = () => {
    setDate("");
    setTime("");
    setSelectedHospital("");
    setSelectedDoctor("");
    setError("");
    onClose();
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

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
          Create Appointment for {service.name}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                setSelectedHospital(selected);
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

          {service?.id === 5 && ( // Show only if it's a doctor appointment
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
                onChange={(e) => setSelectedDoctor(e.target.value)}
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

          <div className="flex flex-col space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date:
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={tomorrowString}
              disabled={disabledDates.includes(date)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="time" className="text-sm font-medium text-gray-700">
              Time:
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a time slot
              </option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot} disabled={isTimeSlotBooked(slot)}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

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
