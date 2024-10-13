import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import db from "../../firebase/firestore"; // Firestore instance
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Firestore functions
import Sidebar from "../../components/AdminSidebar"; // Import Sidebar component
import Snackbar from "@mui/material/Snackbar"; // Snackbar from Material-UI
import MuiAlert from "@mui/material/Alert"; // Alert for Snackbar messages

export default function CreateHospital() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [type, setType] = useState("private");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // State to trigger Snackbar

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!name || !location || !contactNumber) {
      setError("All fields are required.");
      return;
    }

    if (!/^[0-9]{10}$/.test(contactNumber)) {
      setError("Contact number must be 10 digits.");
      return;
    }

    setError(""); // Clear previous error

    try {
      // Save to Firestore
      await setDoc(doc(db, "hospitals", name), {
        name,
        location,
        contactNumber,
        type,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      setSuccess(true); // Show success message
      setName("");
      setLocation("");
      setContactNumber("");
      setType("private");

      // Optional: Navigate or perform other actions after success
      // navigate("/admin/hospitals"); // Example navigation
    } catch (error) {
      console.error("Error creating hospital:", error);
      setError("Error creating hospital: " + error.message);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return; // Prevent auto-hide on click
    setSuccess(false); // Close Snackbar
  };

  return (
    <div className="flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Hospital
          </h2>
          {error && <div className="text-red-600 text-center">{error}</div>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Hospital Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Hospital Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="private">Private</option>
                <option value="government">Government</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Hospital
              </button>
            </div>
          </form>
        </div>

        {/* Success Toast (Snackbar) */}
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Hospital created successfully!
          </MuiAlert>
        </Snackbar>
      </div>
    </div>
  );
}
