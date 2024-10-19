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
  UserPlus,
  CalendarCheck,
  NotepadText,
  Scan,
  QrCode,
} from "lucide-react";
import getUserRole from "../utils/getUserRole"; // Import the getUserRole function
import { CircularProgress, Box } from "@mui/material"; // Import CircularProgress from Material-UI
import auth from "../firebase/auth";
import { signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import db from "../firebase/firestore"; // Import the Firestore instance

const navItems = {
  admin: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },
    {
      name: "Appointment",
      href: "/admin/appointments",
      icon: CalendarCheck,
    },
    { name: "Patients", href: "/admin/viewprofile", icon: Users },

    { name: "Hospital", href: "/admin/hospital", icon: Hospital },
    { name: "Report", href: "/admin/report", icon: NotepadText },
    { name: "Scan", href: "/admin/scan", icon: QrCode },
  ],
  staff: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },

    {
      name: "Appointment",
      href: "/admin/appointments",
      icon: CalendarCheck,
    },
    { name: "Scan", href: "/admin/scan", icon: QrCode },
  ],
  doctor: [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: HandCoins },

    {
      name: "Appointment",
      href: "/admin/appointments",
      icon: CalendarCheck,
    },
    { name: "Scan", href: "/admin/scan", icon: QrCode },
  ],
};

export default function AdminSidebar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      console.log("Fetched User Role:", role); // Debugging line
      setUserRole(role);
      setLoading(false);
    };

    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserDetails({
              firstName: userData.firstName || "John",
              lastName: userData.lastName || "Doe",
            });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserRole();
    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#1f2937",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
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
            <h3 className="text-sm font-semibold">
              {userDetails.firstName} {userDetails.lastName}
            </h3>
            <p className="text-xs text-gray-400">{userRole}</p>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isProfileOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
        {isProfileOpen && (
          <div className="mt-3 py-2 bg-gray-700 rounded-md">
            <button
              onClick={handleLogout}
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
