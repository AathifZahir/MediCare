import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../../firebase/auth"; // Import your Firebase auth configuration
import db from "../../firebase/firestore"; // Import your Firestore configuration
import { doc, getDoc, deleteDoc } from "firebase/firestore"; // Import Firestore methods
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth"; // Import necessary methods
import UpdateProfile from "./UpdateProfile"; // Import the UpdateProfile component
import HomeSidebar from "../../components/HomeNavbar";
import ProfileSidebar from "../../components/ProfileSidebar";

export default function UserProfile() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showLargeProfilePic, setShowLargeProfilePic] = useState(false); // State for large profile picture
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    // Redirect to profile if user is not authenticated
    if (!user) {
      navigate("/profile", { replace: true });
      return;
    }

    // Fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.role === "patient") {
            // Only proceed if the role is 'patient'
            setUserData(userData);
          } else {
            setError(
              "Access denied: You do not have permission to view this profile."
            );
          }
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

    const email = user.email;
    const password = prompt("Please enter your password to confirm deletion:");

    if (!password) {
      setError("Password is required to delete the profile.");
      return;
    }

    const credential = EmailAuthProvider.credential(email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await user.delete(); // Delete Firebase Authentication user
      console.log("User profile deleted successfully");
      navigate("/login");
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

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setNewPassword("");
      setCurrentPassword("");
      setIsChangingPassword(false);
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
      await signOut(auth);
      alert("Logged out successfully.");
      navigate("/login");
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
          <ProfileSidebar />
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
              {userData.profilePictureUrl && (
                <img
                  src={userData.profilePictureUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto cursor-pointer" // Add cursor pointer for interaction
                  onClick={() => setShowLargeProfilePic(true)} // Show large picture on click
                />
              )}
              <p className="text-gray-900">First Name: {userData.firstName}</p>
              <p className="text-gray-900">Last Name: {userData.lastName}</p>
              <p className="text-gray-900">Email: {userData.email}</p>
              <p className="text-gray-900">
                Phone Number: {userData.phoneNumber}
              </p>
              <p className="text-gray-900">
                Date of Birth: {userData.dateOfBirth}
              </p>
              <p className="text-gray-900">Address: {userData.address}</p>
            </div>
          )}

          {/* Change Password Button */}
          {!isChangingPassword ? (
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  onClick={() => setIsChangingPassword(false)}
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
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            )}

            {/* Delete Profile Button */}
            <button
              onClick={handleDelete} // Call the handleDelete function
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Profile
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirmation(true)} // Show confirmation modal
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
          {/* Logout Confirmation Modal */}
          {showLogoutConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-1/3">
                <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
                <p>Are you sure you want to logout?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 mr-2"
                    onClick={() => setShowLogoutConfirmation(false)} // Close the modal
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={handleLogout} // Proceed with logout
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Large Profile Picture Modal */}
      {showLargeProfilePic && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4">
            <img
              src={userData.profilePictureUrl}
              alt="Large Profile"
              className="w-64 h-64 rounded-full"
            />
            <button
              onClick={() => setShowLargeProfilePic(false)}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
