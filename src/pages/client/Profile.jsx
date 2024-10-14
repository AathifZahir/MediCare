import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../../firebase/auth"; // Import your Firebase auth configuration
import db from "../../firebase/firestore"; // Import your Firestore configuration
import { doc, getDoc, deleteDoc } from "firebase/firestore"; // Import Firestore methods
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth"; // Import necessary methods
import UpdateProfile from "./UpdateProfile"; // Import the UpdateProfile component
import HomeSidebar from "../../components/HomeSidebar";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    profilePictureUrl: "", // Add profilePictureUrl
  });
  const [isEditing, setIsEditing] = useState(false); // State for toggling edit mode
  const [isChangingPassword, setIsChangingPassword] = useState(false); // State for toggling password change form
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [currentPassword, setCurrentPassword] = useState(""); // State for current password
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
      navigate("/login"); // Redirect to signup page after deletion
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        console.error("Error deleting user profile:", err);
        setError("Failed to delete profile. Please try again.");
      }
    }
  };

  // Handle password change
  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      setError("Both current and new password are required.");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);
      // Update the password
      await updatePassword(user, newPassword);
      setNewPassword("");
      setCurrentPassword("");
      setIsChangingPassword(false); // Close password change form
      alert("Password changed successfully.");
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        setError("Current password is incorrect.");
      } else {
        console.error("Error changing password:", error);
        setError("Failed to change password. Please try again.");
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
              {/* Display profile picture if available */}
              {userData.profilePictureUrl && (
                <img
                  src={userData.profilePictureUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto"
                />
              )}
              <p className="text-gray-900">First Name: {userData.firstName}</p>
              <p className="text-gray-900">Last Name: {userData.lastName}</p>
              <p className="text-gray-900">Email: {userData.email}</p>
              <p className="text-gray-900">Phone Number: {userData.phoneNumber}</p>
              <p className="text-gray-900">Date of Birth: {userData.dateOfBirth}</p>
              <p className="text-gray-900">Address: {userData.address}</p>
            </div>
          )}

          {/* Change Password Button */}
          {!isChangingPassword ? (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)} // Show password change form
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Change Password
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)} // Hide password change form
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit, Delete, and Logout Buttons */}
          <div className="flex space-x-4">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)} // Close edit mode
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)} // Open edit mode
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete} // Delete profile
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Profile
            </button>
            <button
              type="button"
              onClick={handleLogout} // Logout
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
