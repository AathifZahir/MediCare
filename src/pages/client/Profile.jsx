// src/components/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../../firebase/auth"; // Import your Firebase auth configuration
import db from "../../firebase/firestore"; // Import your Firestore configuration
import { doc, getDoc, deleteDoc } from "firebase/firestore"; // Import Firestore methods
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth"; // Import reauthentication methods
import UpdateProfile from "./UpdateProfile"; // Import the UpdateProfile component
import HomeSidebar from "../../components/HomeSidebar";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: ""
  });
  const [isEditing, setIsEditing] = useState(false); // State for toggling edit mode
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    // Redirect to profile if user is not authenticated
    if (!user) {
      navigate("/profile", { replace: true }); // Replace the current entry with the login page
      return;
    }

    // Fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, "users", user.uid); // Define the document reference
        const userSnapshot = await getDoc(userDoc); // Fetch the document
        
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
        } else {
          console.log("User data not found");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data.");
      }
    };

    fetchUserData();
  }, [user, navigate]);

  // Handle profile deletion with re-authentication
  const handleDelete = async () => {
    if (!user) return;

    const email = user.email; // Get the user's email
    const password = prompt("Please enter your password to confirm deletion:");

    if (!password) {
      setError("Password is required to delete the profile.");
      return;
    }

    const credential = EmailAuthProvider.credential(email, password);

    try {
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, proceed to delete the profile
      await deleteDoc(doc(db, "users", user.uid));
      await user.delete(); // Delete Firebase Authentication user
      console.log("User profile deleted successfully");
      navigate("/signup"); // Redirect to signup page after deletion
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        console.error("Error deleting user profile:", err);
        setError("Failed to delete profile. Please try again.");
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      alert("Logged out successfully.");
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout Error", error);
      alert("Error logging out.");
    }
  };

  return (
    <div>
      <HomeSidebar />
      <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            User Profile
          </h2>
          {error && <div className="text-red-600 text-center">{error}</div>}
          
          {isEditing ? (
            <UpdateProfile
              userData={userData}
              setUserData={setUserData}
              user={user}
              setIsEditing={setIsEditing}
              setError={setError}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-gray-900">First Name: {userData.firstName}</p>
              <p className="text-gray-900">Last Name: {userData.lastName}</p>
              <p className="text-gray-900">Phone Number: {userData.phoneNumber}</p>
              <p className="text-gray-900">Date of Birth: {userData.dateOfBirth}</p>
              <p className="text-gray-900">Address: {userData.address}</p>
            </div>
          )}

          {/* Edit, Delete, and Logout Buttons */}
          <div className="flex space-x-4">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)} // Exit edit mode
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)} // Enter edit mode
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
