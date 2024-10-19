import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
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
        const userRole = await getUserRoleAndHospital(); // Fetch user role
        console.log(userRole);
        const appointmentsCollection = collection(db, "appointments");
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        const appointmentList = await Promise.all(
          appointmentsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const patientName = await fetchUserName(data.userId); // Fetch user name from userId
            return { id: doc.id, patientName, ...data };
          })
        );

        // Filter appointments based on user role
        if (userRole === "admin") {
          setAppointments(appointmentList); // Admin sees all appointments
        } else {
          // If doctor or staff, filter by hospitalId
          const filteredAppointments = appointmentList.filter(
            (appointment) => appointment.hospitalId === userRole.hospitalId // Replace `userHospitalId` with the actual hospital ID of the user
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
    setConfirmDialogOpen(true); // Open confirmation dialog
  };

  const confirmStatusChange = async () => {
    if (selectedAppointment) {
      try {
        // Update the appointment status in Firestore
        const appointmentDocRef = doc(
          db,
          "appointments",
          selectedAppointment.id
        );
        await updateDoc(appointmentDocRef, {
          status: "Completed", // Change to the desired status
        });

        // Update state with new status
        setAppointments(
          appointments.map((a) =>
            a.id === selectedAppointment.id ? { ...a, status: "Completed" } : a
          )
        );
      } catch (error) {
        console.error("Error updating appointment status:", error);
      } finally {
        setConfirmDialogOpen(false); // Close confirmation dialog
        setSelectedAppointment(null); // Clear selected appointment
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patient Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Appointment Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
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

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogContent>
            Are you sure you want to mark this appointment as "completed"?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} color="secondary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminAppointment;
