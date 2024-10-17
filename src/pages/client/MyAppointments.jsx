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
  const [doctors, setDoctors] = useState({}); // Store doctor details
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

        // Fetch doctors and hospitals in parallel
        const doctorIds = [
          ...new Set(appointmentsData.map((app) => app.doctorId)), // Extract unique doctor IDs
        ];
        const hospitalIds = [
          ...new Set(appointmentsData.map((app) => app.hospitalId)), // Extract unique hospital IDs
        ];

        console.log("Doctor IDs:", doctorIds); // Log doctor IDs
        console.log("Hospital IDs:", hospitalIds); // Log hospital IDs

        // Fetch doctor details
        const doctorPromises = doctorIds.map((id) => getDocData("users", id));
        // Fetch hospital details
        const hospitalPromises = hospitalIds.map((id) =>
          getDocData("hospitals", id)
        );

        const doctorsData = await Promise.all(doctorPromises);
        const hospitalsData = await Promise.all(hospitalPromises);

        console.log("Fetched doctors:", doctorsData); // Log fetched doctors
        console.log("Fetched hospitals:", hospitalsData); // Log fetched hospitals

        // Map the results to store in state
        const doctorsMap = doctorsData.reduce((acc, doctor) => {
          if (doctor) acc[doctor.id] = doctor; // Ensure doctor exists
          return acc;
        }, {});

        const hospitalsMap = hospitalsData.reduce((acc, hospital) => {
          if (hospital) acc[hospital.id] = hospital; // Ensure hospital exists
          return acc;
        }, {});

        setDoctors(doctorsMap);
        setHospitals(hospitalsMap);
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
                    Appointment with Dr.{" "}
                    {doctors[appointment.doctorId]?.firstName ||
                      "Unknown Doctor"}{" "}
                    {doctors[appointment.doctorId]?.lastName ||
                      "Unknown Doctor"}
                  </h2>
                  <p>Date: {appointment.date}</p>
                  <p>Time: {appointment.time}</p>
                  <p>
                    Location:{" "}
                    {hospitals[appointment.hospitalId]?.name ||
                      "Unknown Hospital"}
                  </p>

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
