import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings,
  ChevronDown,
  LogOut,
  HandCoins,
  Hospital,
  NotepadText,
} from "lucide-react";
import getUserRole from "../utils/getUserRole"; // Import the getUserRole function
import { CircularProgress, Box } from "@mui/material"; // Import CircularProgress from Material-UI
import auth from "../firebase/auth";
import { signOut } from "firebase/auth";

const navItems = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: ShoppingCart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Hospital", href: "/admin/hospital", icon: Hospital },
    { name: "Report", href: "/ReportHome", icon: NotepadText },
  ],
  staff: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  doctor: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export default function AdminSidebar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      console.log("Fetched User Role:", role); // Debugging line
      setUserRole(role);
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Full height of the sidebar
          backgroundColor: "#1f2937", // Match the sidebar's background color
        }}
      >
        <CircularProgress size={60} thickness={4} />{" "}
        {/* Material-UI loading spinner */}
      </Box>
    );
  }

  const handleLogout = async () => {
    console.log("Logout button pressed"); // Check if the function is called
    try {
      await signOut(auth); // Sign out the user
      console.log("User signed out"); // Confirm user is signed out
      window.location.href = "/admin/login"; // Redirect to the login page
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally show an error message to the user
    }
  };

  const itemsToShow = userRole ? navItems[userRole] : [];

  return (
    <div className="flex h-screen w-64 flex-col justify-between bg-gray-800 text-gray-100">
      <div className="px-4 py-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Admin Panel</h2>
        <nav>
          {itemsToShow.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
            >
              <item.icon className="h-6 w-6 mr-3" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>
      <div className="px-4 py-6 border-t border-gray-700">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center w-full text-left"
        >
          <div className="flex-1">
            <h3 className="text-sm font-semibold">John Doe</h3>
            <p className="text-xs text-gray-400">{userRole}</p>{" "}
            {/* Display user role */}
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isProfileOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {isProfileOpen && (
          <div className="mt-3 py-2 bg-gray-700 rounded-md">
            <a
              href="/admin/profile"
              className="block px-4 py-2 text-sm hover:bg-gray-600"
            >
              Profile
            </a>
            <a
              href="/admin/settings"
              className="block px-4 py-2 text-sm hover:bg-gray-600"
            >
              Settings
            </a>
            <button
              onClick={handleLogout} // Move onClick here
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
