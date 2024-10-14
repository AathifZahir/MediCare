import React, { useState, useEffect } from "react";
import { Home, Calendar, Info, User, LogOut, LogIn , NotepadText} from "lucide-react";
import auth from "../firebase/auth"; // Import the auth object
import { onAuthStateChanged, signOut } from "firebase/auth"; // Import necessary Firebase methods
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null); // State to hold user information
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Set up an authentication state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Update user state
    });
    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      alert("Logged out successfully.");
    } catch (error) {
      console.error("Logout Error", error);
      alert("Error logging out.");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  return (
    <header className="bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">MediCare</h1>
        <nav className="flex-grow flex justify-center space-x-8">
          <a
            href="/"
            className="flex items-center text-gray-700 hover:text-indigo-600"
          >
            <Home className="h-5 w-5 mr-1" />
            Home
          </a>
          <a
            href="/appointments"
            className="flex items-center text-gray-700 hover:text-indigo-600"
          >
            <Calendar className="h-5 w-5 mr-1" />
            Appointment
          </a>
          <a
            href="/about"
            className="flex items-center text-gray-700 hover:text-indigo-600"
          >
            <Info className="h-5 w-5 mr-1" />
            About
          </a>
          <a
            href="/report"
            className="flex items-center text-gray-700 hover:text-indigo-600"
          >
            <NotepadText className="h-5 w-5 mr-1" />
            View Report
          </a>
        </nav>
        {/* Profile or Login Dropdown */}
        <div className="relative">
          {user ? ( // Check if user is logged in
            <>
              <button
                onClick={handleProfileClick} // Navigate to profile on click
                className="flex items-center text-gray-700 hover:text-indigo-600"
              >
                <User className="h-5 w-5 mr-1" />
                Profile
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                  <a
                    href="#"
                    onClick={handleLogout}
                    className="flex items-center p-2 text-gray-700 hover:bg-indigo-600 hover:text-white"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </a>
                </div>
              )}
            </>
          ) : (
            <a
              href="/login"
              className="flex items-center text-gray-700 hover:text-indigo-600"
            >
              <LogIn className="h-5 w-5 mr-1" />
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
