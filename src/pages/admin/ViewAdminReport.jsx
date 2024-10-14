import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import auth from "../../firebase/auth.jsx";
import db from "../../firebase/firestore.jsx";
import AdminSidebar from "../../components/AdminSidebar";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ViewAdminReport = () => {
  const { customerId } = useParams(); // Fetch customerId from URL params
  const navigate = useNavigate();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientName, setPatientName] = useState("");

  // Authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        alert("Please log in to access this page.");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientDoc = await getDoc(doc(db, "users", customerId));
        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          if (patientData.role === "patient") {
            setPatientName(`${patientData.firstName} ${patientData.lastName}`);
          } else {
            setError("The user is not a patient.");
          }
        } else {
          setError("Patient not found.");
        }
      } catch (error) {
        setError("Error fetching patient data.");
        console.error(error);
      }
    };

    fetchPatientData();
  }, [customerId]);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const q = query(collection(db, "reports"), where("patientId", "==", customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const reportData = querySnapshot.docs[0].data();
          setReportDetails(reportData);
        } else {
          setError("No reports found for this patient.");
        }
      } catch (error) {
        setError("Error fetching report data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [customerId]);

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h2 className="text-lg font-semibold">View Report</h2>
          </div>
          {patientName && (
            <p className="mt-2 text-sm px-6">Patient: {patientName}</p>
          )}
          {loading ? (
            <div className="text-center">Loading report details...</div>
          ) : error ? (
            <div className="text-red-600 px-6">{error}</div>
          ) : (
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Report Type:</h3>
                <p>{reportDetails.reportType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Report Category:</h3>
                <p>{reportDetails.reportCategory}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Test Date:</h3>
                <p>{reportDetails.testDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Doctor's Comments:</h3>
                <p>{reportDetails.doctorComments}</p>
              </div>
              {reportDetails.reportURL && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Report File:</h3>
                  <a href={reportDetails.reportURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View Report
                  </a>
                </div>
              )}
            </div>
          )}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
              {error}
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default ViewAdminReport;
