import React, { useState, useEffect } from "react";
import db from "../firebase/firestore"; // Adjust the import path as necessary
import { collection, getDocs } from "firebase/firestore";
import { X } from "lucide-react"; // Importing the cancel icon

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const hospitalsCollection = collection(db, "hospitals");
        const hospitalSnapshot = await getDocs(hospitalsCollection);
        const hospitalNames = hospitalSnapshot.docs.map(
          (doc) => doc.data().name
        ); // Assuming the field is named 'name'
        setHospitals(hospitalNames);
      } catch (error) {
        console.error("Error retrieving hospital names: ", error);
      }
    };

    if (isOpen) {
      fetchHospitals();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation logic here...

    console.log(
      `Appointment created for service: ${service.name} at ${selectedHospital} on ${date} at ${time}`
    );
    onClose(); // Close the modal after submission
  };

  const handleCancel = () => {
    setDate("");
    setTime("");
    setSelectedHospital("");
    setError("");
    onClose(); // Close the modal on cancel
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Cancel icon in the top corner */}
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
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a hospital
              </option>
              {hospitals.map((hospital, index) => (
                <option key={index} value={hospital}>
                  {hospital}
                </option>
              ))}
            </select>
          </div>
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
              required
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring -blue-500 focus:border-blue-500"
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
                <option key={index} value={slot}>
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
