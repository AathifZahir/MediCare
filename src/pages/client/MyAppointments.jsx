import React, { useEffect, useState } from "react";
import auth from "../../firebase/auth"; // Import auth from auth.js
import db from "../../firebase/firestore"; // Import Firestore db from firestore.js
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import HomeSidebar from "../../components/HomeNavbar"; // Import HomeSidebar component
import ProfileSidebar from "../../components/ProfileSidebar"; // Import ProfileSidebar component

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState({}); // Store hospital details

  useEffect(() => {
    const fetchAppointments = async (user) => {
      try {
        const appointmentsRef = collection(db, "appointments"); // Reference to the appointments collection
        const q = query(appointmentsRef, where("userId", "==", user.uid)); // Query for user's appointments

        const querySnapshot = await getDocs(q); // Fetch the appointments
        const appointmentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched appointments:", appointmentsData); // Log fetched appointments

        setAppointments(appointmentsData); // Set the appointments state

        const hospitalIds = [
          ...new Set(appointmentsData.map((app) => app.hospitalId)), // Extract unique hospital IDs
        ];

        console.log("Hospital IDs:", hospitalIds); // Log hospital IDs

        // Fetch hospital details
        const hospitalPromises = hospitalIds.map((id) =>
          getDocData("hospitals", id)
        );

        const hospitalsData = await Promise.all(hospitalPromises);

        console.log("Fetched hospitals:", hospitalsData); // Log fetched hospitals

        const hospitalsMap = hospitalsData.reduce((acc, hospital) => {
          if (hospital) acc[hospital.id] = hospital; // Ensure hospital exists
          return acc;
        }, {});

        setHospitals(hospitalsMap);
        console.log(hospitals);
      } catch (error) {
        console.error("Error fetching appointments: ", error);
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    const getDocData = async (collectionName, id) => {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch appointments if the user is logged in
        fetchAppointments(user);
      } else {
        setAppointments([]); // Reset appointments if no user is logged in
        setLoading(false); // Stop loading
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  return (
    <div>
      <HomeSidebar />
      <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <ProfileSidebar />
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul className="space-y-4">
              {appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-md"
                >
                  <h2 className="text-lg font-semibold">
                    Appointment at{" "}
                    {hospitals[appointment.hospitalId]?.name ||
                      "Unknown Hospital"}
                  </h2>
                  <p>Date: {appointment.date}</p>
                  <p>Time: {appointment.time}</p>
                  <p>Payment Type: {appointment.paymentType}</p>
                  <p>Status: {appointment.status}</p>
                  <p>Amount: {appointment.amount}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
