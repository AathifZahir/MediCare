import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore methods
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Storage methods
import { updateEmail, sendEmailVerification } from "firebase/auth"; // Import updateEmail and sendEmailVerification from Firebase Auth
import db from "../../firebase/firestore"; // Import your Firestore configuration
import storage from "../../firebase/storage"; // Import your Firebase Storage configuration

const UpdateProfile = ({ userData, setUserData, user, setIsEditing, setError }) => {
  // Local state for form errors
  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");
  const [profilePic, setProfilePic] = useState(null); // State for the selected profile picture

  // Handle form changes
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setPhoneError(""); // Clear phone error on change
    setDobError("");   // Clear DOB error on change
  };

  // Handle profile picture change
  const handlePicChange = (e) => {
    setProfilePic(e.target.files[0]); // Get the selected file
  };

  // Validate phone number
  const validatePhoneNumber = (number) => {
    const phonePattern = /^[0-9]{10}$/; // Adjust the pattern according to your requirements
    return phonePattern.test(number);
  };

  // Validate date of birth
  const validateDateOfBirth = (date) => {
    const today = new Date();
    const dob = new Date(date);
    return dob <= today; // Check if the date is not in the future
  };

  // Handle profile update
  const handleUpdate = async (e) => {
    e.preventDefault();
    let isValid = true; // Flag to track overall form validity

    // Validate the phone number
    if (!validatePhoneNumber(userData.phoneNumber)) {
      setPhoneError("Phone number must be 10 digits.");
      isValid = false; // Mark as invalid
    }

    // Validate the date of birth
    if (!validateDateOfBirth(userData.dateOfBirth)) {
      setDobError("Date of birth cannot be in the future.");
      isValid = false; // Mark as invalid
    }

    if (!isValid) return; // Exit if there are validation errors

    try {
      // Handle profile picture upload if selected
      let profilePicUrl = userData.profilePictureUrl; // Keep the old URL by default
      if (profilePic) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, profilePic); // Upload the new picture
        profilePicUrl = await getDownloadURL(storageRef); // Get the new URL
      }

      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        profilePictureUrl: profilePicUrl, // Update the profile picture URL
      });

      console.log("User profile updated successfully.");
      setError(""); // Clear error on successful update
      setIsEditing(false); // Exit edit mode after update
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userData.lastName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userData.phoneNumber}
              onChange={handleChange}
            />
            {phoneError && <p className="text-red-600 text-sm">{phoneError}</p>} {/* Show validation error */}
          </div>
          <div>
            <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <input
              id="profilePic"
              name="profilePic"
              type="file"
              accept="image/*" // Accept image files only
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={handlePicChange} // Handle picture change
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userData.dateOfBirth}
              onChange={handleChange}
            />
            {dobError && <p className="text-red-600 text-sm">{dobError}</p>} {/* Show validation error */}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={userData.address}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;
