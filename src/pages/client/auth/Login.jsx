import React, { useState } from "react";
import auth from "../../../firebase/auth"; // Import your Firebase auth instance
import db from "../../../firebase/firestore"; // Import Firestore instance
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error messages
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(""); // Reset error message

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch the user's role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid)); // Adjust the path as needed
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { role } = userData;

        // Check if the user role is 'patient'
        if (role === "patient") {
          console.log("User logged in:", email);
          // Redirect to home
          navigate("/");
        } else {
          console.error("Unauthorized role:", role);
          setError("Unauthorized access. Please contact support.");
        }
      } else {
        console.error("No user data found!");
        setError("No user data found. Please contact support.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      // Provide feedback to the user based on the error code
      if (error.code === "auth/too-many-requests") {
        setError(
          "Your account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later."
        );
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-200 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center mt-10 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
        {/* Sign up link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            Not registered?{" "}
            <button
              onClick={() => navigate("/register")} // Navigate to the registration page
              className="text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </button>
          </span>
        </div>
        {/* Sign up link */}
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            For admin Login?{" "}
            <button
              onClick={() => navigate("/admin/login")} // Navigate to the registration page
              className="text-indigo-600 hover:text-indigo-500"
            >
             Login
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
