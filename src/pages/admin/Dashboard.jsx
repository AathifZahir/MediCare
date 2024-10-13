import React from "react";
import AdminSidebar from "../../components/AdminSidebar"; // Adjust the path if necessary

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Welcome to the admin dashboard! Here you can manage your settings and
          view analytics.
        </p>

        {/* Additional content can go here */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Analytics Overview
          </h2>
          {/* Add charts or statistics here */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium">Users</h3>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium">Products</h3>
              <p className="text-2xl font-bold">567</p>
            </div>
            {/* Add more cards for additional analytics */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
