import React, { useState } from "react";
import db from "../../firebase/firestore";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { Button, Typography, Paper, CircularProgress, Alert, Modal, Box } from "@mui/material";
import Sidebar from "../../components/AdminSidebar";
import { QrCode, X, FileText } from "lucide-react";

export default function Scan() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [reportDetails, setReportDetails] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const patientId = "hdfjayMStOY3BRZZYuF3LbPMKcl1"; // Replace with dynamic patient ID from QR code
      const docRef = doc(db, "users", patientId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUser({
          id: docSnap.id,
          ...docSnap.data(),
        });
        setSuccessMessage("Successfully Scanned!");
        setIsModalOpen(true);
      } else {
        setError("No patient found with the specified ID.");
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError("Failed to fetch patient data.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    setLoadingReport(true);
    setError("");
    setReportDetails(null);

    try {
      const q = query(collection(db, "reports"), where("patientId", "==", user.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const reportData = querySnapshot.docs[0].data();
        setReportDetails(reportData);
        setIsReportModalOpen(true);
      } else {
        setError("No reports found for this patient.");
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to fetch report data.");
    } finally {
      setLoadingReport(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUser(null);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportDetails(null);
  };

  const handleViewReportDetails = () => {
    handleViewReport();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow flex items-center justify-center p-8">
        <Paper elevation={3} className="p-8 max-w-md w-full bg-white rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <QrCode className="w-24 h-24 mx-auto mb-4 text-blue-600" />
            <Typography variant="h4" className="text-3xl font-bold text-gray-800">
              Scan Digital Health Card
            </Typography>
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleScan}
            disabled={loading}
            fullWidth
            className="py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <CircularProgress size={24} className="text-white" />
            ) : (
              <>
                <QrCode className="w-6 h-6 mr-2" />
                Scan Card
              </>
            )}
          </Button>

          {error && (
            <Alert severity="error" className="mt-6 rounded-lg">
              {error}
            </Alert>
          )}

          {user && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleViewReport}
              fullWidth
              className="mt-4 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
            >
              {loadingReport ? <CircularProgress size={24} className="text-white" /> : "View Report"}
            </Button>
          )}

          {/* Modal for displaying patient details */}
          <Modal
            open={isModalOpen}
            onClose={closeModal}
            aria-labelledby="patient-details-title"
            aria-describedby="patient-details-description"
          >
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              <Typography id="patient-details-title" variant="h5" className="text-center mb-6 text-2xl font-bold text-blue-600">
                {successMessage}
              </Typography>
              {user && (
                <div id="patient-details-description" className="space-y-4 mb-6">
                  {[
                    { label: "Name", value: `${user.firstName} ${user.lastName}` },
                    { label: "Date of Birth", value: user.dateOfBirth },
                    { label: "Address", value: user.address },
                    { label: "Email", value: user.email },
                    { label: "Phone", value: user.phoneNumber },
                    { label: "Role", value: user.role },
                  ].map((item, index) => (
                    <div key={index} className="flex border-b border-gray-200 pb-2">
                      <Typography className="font-semibold w-1/3 text-gray-600">{item.label}:</Typography>
                      <Typography className="w-2/3 text-gray-800">{item.value}</Typography>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col space-y-4">
                <Button
                  onClick={handleViewReportDetails}
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="py-3 rounded-full transition-all duration-300 bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg text-white font-semibold"
                  startIcon={<FileText />}
                >
                  View Report Details
                </Button>
                <Button
                  onClick={closeModal}
                  variant="outlined"
                  color="primary"
                  fullWidth
                  className="py-3 rounded-full transition-all duration-300 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg font-semibold"
                >
                  Close
                </Button>
              </div>
            </Box>
          </Modal>

          {/* Modal for displaying report details */}
          <Modal
            open={isReportModalOpen}
            onClose={closeReportModal}
            aria-labelledby="report-details-title"
            aria-describedby="report-details-description"
          >
            <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <button
                onClick={closeReportModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              <Typography id="report-details-title" variant="h5" className="text-center mb-6 text-2xl font-bold text-green-600">
                Report Details
              </Typography>
              {reportDetails ? (
                <div id="report-details-description" className="space-y-4 mb-6">
                  {[
                    { label: "Report Type", value: reportDetails.reportType },
                    { label: "Report Category", value: reportDetails.reportCategory },
                    { label: "Test Date", value: reportDetails.testDate },
                    { label: "Doctor's Comments", value: reportDetails.doctorComments },
                    { label: "Report File", value: reportDetails.reportURL ? <a href={reportDetails.reportURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Report</a> : "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="flex border-b border-gray-200 pb-2">
                      <Typography className="font-semibold w-1/3 text-gray-600">{item.label}:</Typography>
                      <Typography className="w-2/3 text-gray-800">{item.value}</Typography>
                    </div>
                  ))}
                </div>
              ) : (
                loadingReport ? <CircularProgress /> : <Typography>No report details available.</Typography>
              )}
              <Button
                onClick={closeReportModal}
                variant="outlined"
                color="primary"
                fullWidth
                className="mt-4 py-3 rounded-full transition-all duration-300 border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg font-semibold"
              >
                Close
              </Button>
            </Box>
          </Modal>
        </Paper>
      </div>
    </div>
  );
}