import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material"; // Import loading spinner
import AdminSidebar from "../../components/AdminSidebar"; // Admin sidebar component
import AdminAppointmentModal from "../../components/AdminAppointmentModal"; // Appointment creation modal component
import db from "../../firebase/firestore"; // Firestore configuration
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"; // Firestore functions for reading and updating documents
import getUserRoleAndHospital from "../../utils/getUserRoleAndHospital"; // Utility function to get user role and hospital

const AdminAppointment = () => {
  const [appointments, setAppointments] = useState([]); // State to store appointments
  const [loading, setLoading] = useState(true); // State to show loading indicator
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // State to open confirmation dialog
  const [selectedAppointment, setSelectedAppointment] = useState(null); // State to store selected appointment
  const [isModalOpen, setIsModalOpen] = useState(false); // State to open/close appointment modal

  // Fetch user details for each appointment using userId
  const fetchUserName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId)); // Get user document by ID
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return `${userData.firstName} ${userData.lastName}`; // Return user's full name
      } else {
        return "Unknown User"; // If user document doesn't exist
      }
    } catch (error) {
      console.error("Error fetching user:", error); // Handle error
      return "Unknown User";
    }
  };

  // Fetch all appointments from Firestore when component mounts
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userRole = await getUserRoleAndHospital(); // Get user role and hospital
        const appointmentsCollection = collection(db, "appointments"); // Reference to appointments collection
        const appointmentsSnapshot = await getDocs(appointmentsCollection); // Fetch all appointments

        // Map through each appointment document and fetch related user details
        const appointmentList = await Promise.all(
          appointmentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const patientName = await fetchUserName(data.userId); // Fetch user name
            return { id: doc.id, patientName, ...data }; // Return appointment with user details
          })
        );

        // Filter appointments based on user role (admin or hospital-based)
        if (userRole.role === "admin") {
          setAppointments(appointmentList); // Set all appointments if admin
        } else {
          const filteredAppointments = appointmentList.filter(
            (appointment) => appointment.hospitalId === userRole.hospitalId // Filter appointments based on hospital
          );
          setAppointments(filteredAppointments); // Set filtered appointments
        }
      } catch (error) {
        console.error("Error fetching appointments:", error); // Handle error
      } finally {
        setLoading(false); // Set loading to false when data is fetched
      }
    };

    fetchAppointments(); // Call fetch function
  }, []);

  // Handle the action to mark an appointment as completed
  const handleStatusChange = (appointment) => {
    setSelectedAppointment(appointment); // Set the selected appointment
    setConfirmDialogOpen(true); // Open confirmation dialog
  };

  // Confirm and update the appointment status to "Completed"
  const confirmStatusChange = async () => {
    if (selectedAppointment) {
      try {
        const appointmentDocRef = doc(
          db,
          "appointments",
          selectedAppointment.id
        ); // Reference to the selected appointment document
        await updateDoc(appointmentDocRef, {
          status: "Completed", // Update status to completed
        });

        // Update the appointment status in the state
        setAppointments(
          appointments.map((a) =>
            a.id === selectedAppointment.id ? { ...a, status: "Completed" } : a
          )
        );
      } catch (error) {
        console.error("Error updating appointment status:", error); // Handle error
      } finally {
        setConfirmDialogOpen(false); // Close the confirmation dialog
        setSelectedAppointment(null); // Reset the selected appointment
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar /> {/* Admin sidebar for navigation */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Appointments
          </h1>
          {/* Create Appointment Button */}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-300"
            onClick={() => setIsModalOpen(true)} // Open modal on click
          >
            Create Appointment
          </button>
        </div>

        {/* Show loading spinner while data is being fetched */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress /> {/* Loading spinner */}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.userName} {/* Display patient name */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()} {/* Display appointment date */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.time} {/* Display appointment time */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Scheduled"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status} {/* Display appointment status */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Show action button to mark as completed */}
                      {appointment.status === "Scheduled" && (
                        <button
                          onClick={() => handleStatusChange(appointment)} // Handle status change
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-full transition duration-300"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation dialog for marking appointment as completed */}
        {confirmDialogOpen && (
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${
              confirmDialogOpen ? "block" : "hidden"
            }`}
          >
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Confirm Status Change
              </h2>
              <p className="text-sm text-gray-700">
                Are you sure you want to mark this appointment as "completed"?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setConfirmDialogOpen(false)} // Close the dialog without changing status
                  className="bg-white hover:bg-gray-100 mt-5 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange} // Confirm the status change
                  className="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Appointment Modal for creating a new appointment */}
        <AdminAppointmentModal
          isOpen={isModalOpen} // Pass modal open state
          onClose={() => setIsModalOpen(false)} // Close modal handler
          service={null} // You can pass a specific service if needed
        />
      </div>
    </div>
  );
};

export default AdminAppointment;