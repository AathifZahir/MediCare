import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import auth from "../firebase/auth"; // Import your Firebase auth
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore methods

const ProfileSidebar = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    role: "",
  });
  const db = getFirestore(); // Initialize Firestore

  // Fetch user's profile info from Firestore
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser; // Get the currently logged-in user
      if (user) {
        const userDoc = doc(db, "users", user.uid); // Reference to the user's document
        const userSnapshot = await getDoc(userDoc); // Fetch the document
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserInfo({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            role: userData.role || "",
          });
        }
      }
    };
    fetchUserInfo();
  }, [db]);

  return (
    <div className="fixed left-10 top-70 h-[400px] w-64 bg-white text-gray-800 shadow-lg flex flex-col items-center justify-between py-6 rounded-lg border border-gray-200">
      {/* Profile Section */}
      <div className="text-center">
        <div className="mt-4">
          <h2 className="text-xl font-semibold">
            {userInfo.firstName} {userInfo.lastName}
          </h2>
          {/* Profile Name */}
          <p className="text-gray-500 text-sm">{userInfo.role}</p>
          {/* Profile Role */}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col space-y-4">
        <a
          href="/Profile"
          className="block py-2 px-4 hover:bg-gray-100 hover:text-gray-800 text-gray-600 rounded-md"
        >
          My Profile
        </a>
        <a
          href="/MyAppointments"
          className="block py-2 px-4 hover:bg-gray-100 hover:text-gray-800 text-gray-600 rounded-md"
        >
          My Appointments
        </a>
      </div>

      {/* Logout Section */}
      <div className="w-full px-4">
        <button
          onClick={() => auth.signOut()} // Sign out the user
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
