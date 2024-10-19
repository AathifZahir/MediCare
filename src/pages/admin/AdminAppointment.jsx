import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import AdminSidebar from "../../components/AdminSidebar";
import db from "../../firebase/firestore";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import getUserRoleAndHospital from "../../utils/getUserRoleAndHospital";

const AdminAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch user details for each appointment using userId
  const fetchUserName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return `${userData.firstName} ${userData.lastName}`;
      } else {
        return "Unknown User";
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return "Unknown User";
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userRole = await getUserRoleAndHospital();
        const appointmentsCollection = collection(db, "appointments");
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        const appointmentList = await Promise.all(
          appointmentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const patientName = await fetchUserName(data.userId);
            return { id: doc.id, patientName, ...data };
          })
        );

        // Filter appointments based on user role
        if (userRole === "admin") {
          setAppointments(appointmentList);
        } else {
          const filteredAppointments = appointmentList.filter(
            (appointment) => appointment.hospitalId === userRole.hospitalId
          );
          setAppointments(filteredAppointments);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = (appointment) => {
    setSelectedAppointment(appointment);
    setConfirmDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (selectedAppointment) {
      try {
        const appointmentDocRef = doc(
          db,
          "appointments",
          selectedAppointment.id
        );
        await updateDoc(appointmentDocRef, {
          status: "Completed",
        });

        setAppointments(
          appointments.map((a) =>
            a.id === selectedAppointment.id ? { ...a, status: "Completed" } : a
          )
        );
      } catch (error) {
        console.error("Error updating appointment status:", error);
      } finally {
        setConfirmDialogOpen(false);
        setSelectedAppointment(null);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Manage Appointments
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
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
                        {appointment.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {appointment.time}
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
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {appointment.status === "Scheduled" && (
                        <button
                          onClick={() => handleStatusChange(appointment)}
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
                  onClick={() => setConfirmDialogOpen(false)}
                  className="bg-white hover:bg-gray-100 mt-5 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointment;
