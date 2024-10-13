// src/components/AdminViewProfile.jsx
import React, { useEffect, useState } from "react";
import db from "../../firebase/firestore"; // Import your Firestore configuration
import { collection, getDocs } from "firebase/firestore"; // Import Firestore methods
import Sidebar from "../../components/AdminSidebar"; // Import Sidebar component

const AdminViewProfile = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, "users"); // Reference to the users collection
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList); // Set the fetched user data
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to fetch user data.");
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.phoneNumber.includes(searchTerm)
    );
  });

  return (
    <div className="flex">
    {/* Sidebar Component */}
    <Sidebar />
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">User Profiles</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name or phone number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded-md w-full"
        />

        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">First Name</th>
              <th className="border border-gray-300 p-2">Last Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Phone Number</th>
              <th className="border border-gray-300 p-2">Date of Birth</th>
              <th className="border border-gray-300 p-2">Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 p-2">{user.firstName}</td>
                  <td className="border border-gray-300 p-2">{user.lastName}</td>
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2">{user.phoneNumber}</td>
                  <td className="border border-gray-300 p-2">{user.dateOfBirth}</td>
                  <td className="border border-gray-300 p-2">{user.address}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border border-gray-300 p-2 text-center">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AdminViewProfile;
