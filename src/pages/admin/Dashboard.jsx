import React, { useEffect, useState, useRef } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import getUserRoleAndHospital from "../../utils/getUserRoleAndHospital";
import db from "../../firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [role, setRole] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const barChartRef = useRef();
  const doughnutChartRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = await getUserRoleAndHospital();
      if (userInfo) {
        setRole(userInfo.role);
        setHospitalId(userInfo.hospitalId);
        fetchAppointments(userInfo.role, userInfo.hospitalId);
        fetchTransactions(userInfo.role, userInfo.hospitalId);
      }
    };

    fetchUserData();
  }, []);

  const fetchAppointments = async (role, hospitalId) => {
    let q;
    if (role === "admin") {
      q = query(collection(db, "appointments"));
    } else if (role === "doctor" || role === "staff") {
      q = query(
        collection(db, "appointments"),
        where("hospitalId", "==", hospitalId)
      );
    }

    const querySnapshot = await getDocs(q);
    const fetchedAppointments = querySnapshot.docs.map((doc) => doc.data());
    setAppointments(fetchedAppointments);
  };

  const fetchTransactions = async (role, hospitalId) => {
    let q;
    if (role === "admin") {
      q = query(collection(db, "transactions"));
    } else if (role === "doctor" || role === "staff") {
      q = query(
        collection(db, "transactions"),
        where("hospitalId", "==", hospitalId)
      );
    }

    const querySnapshot = await getDocs(q);
    const fetchedTransactions = querySnapshot.docs.map((doc) => doc.data());
    setTransactions(fetchedTransactions);
  };

  // Prepare chart data
  const appointmentStatusCounts = appointments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const paymentTypeCounts = transactions.reduce((acc, curr) => {
    acc[curr.paymentType] = (acc[curr.paymentType] || 0) + 1;
    return acc;
  }, {});

  const appointmentStatusData = {
    labels: Object.keys(appointmentStatusCounts),
    datasets: [
      {
        label: "Appointment Status",
        data: Object.values(appointmentStatusCounts),
        backgroundColor: ["#4CAF50", "#FF9800", "#F44336"],
      },
    ],
  };

  const paymentTypeData = {
    labels: Object.keys(paymentTypeCounts),
    datasets: [
      {
        label: "Payment Types",
        data: Object.values(paymentTypeCounts),
        backgroundColor: ["#2196F3", "#FFEB3B", "#9C27B0"],
      },
    ],
  };

  // Generate PDF for the chart
  const generatePdf = async (chartRef, title, summary) => {
    // Ensure the chart is rendered before proceeding
    if (!chartRef.current || !chartRef.current.canvas) {
      console.error("Chart is not yet rendered or attached to DOM.");
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current.canvas, {
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      // Create a new jsPDF document
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text(title, 10, 10);

      pdf.setFontSize(12);
      pdf.text(summary, 10, 20);

      // Add the chart image to the PDF
      pdf.addImage(imgData, "PNG", 10, 40, 180, 100); // Adjust the size and position

      // Save the PDF
      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const appointmentSummary =
    "This chart shows the current appointment statuses, including completed, pending, and canceled appointments in the hospital.";
  const paymentSummary =
    "This chart presents the distribution of payment methods such as cash, card, and insurance used by patients.";

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

        {/* Charts Container */}
        <div className="mt-6 flex gap-10">
          {/* Appointment Status Bar Chart */}
          <div className="w-300 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Appointment Status
            </h2>
            <Bar ref={barChartRef} data={appointmentStatusData} />
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() =>
                generatePdf(
                  barChartRef,
                  "Appointment Status Chart",
                  appointmentSummary
                )
              }
            >
              Download PDF
            </button>
          </div>

          {/* Payment Type Doughnut Chart */}
          <div className="w-300 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Types
            </h2>
            <Doughnut ref={doughnutChartRef} data={paymentTypeData} />
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() =>
                generatePdf(
                  doughnutChartRef,
                  "Payment Type Chart",
                  paymentSummary
                )
              }
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
