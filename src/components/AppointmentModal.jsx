import React, { useState } from "react";

const AppointmentModal = ({ isOpen, onClose, service }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Generate time slots in 30-minute increments from 9 AM to 5 PM
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

    // Validation
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight for comparison

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Get the date one month from today
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(today.getMonth() + 1);

    if (selectedDate < tomorrow || selectedDate > oneMonthLater) {
      setError("The selected date must be tomorrow or within the next month.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const selectedTime = new Date(selectedDate);
    selectedTime.setHours(hours, minutes);

    // Check if time is between 9 AM and 5 PM
    if (hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
      setError("The appointment time must be between 9 AM and 5 PM.");
      return;
    }

    // Handle appointment creation logic here
    console.log(
      `Appointment created for service: ${service.name} on ${date} at ${time}`
    );
    onClose(); // Close the modal after submission
  };

  // Get tomorrow's date in YYYY-MM-DD format for the min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">
          Create Appointment for {service.name}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={tomorrowString} // Set the minimum date to tomorrow
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:border-blue-500"
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
                Select a time
              </option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between space-x-4">
            <button
              type="submit "
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
            >
              Create Appointment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-gray-300 text-gray- 700 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
