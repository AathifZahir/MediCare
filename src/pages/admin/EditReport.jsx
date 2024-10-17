import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import auth from "../../firebase/auth.jsx";
import storage from "../../firebase/storage";
import db from "../../firebase/firestore.jsx";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import AdminSidebar from "../../components/AdminSidebar";
import DeleteIcon from "@mui/icons-material/Delete";

export default function EditReport() {
  const { customerId } = useParams(); // Fetch customerId from URL params
  const navigate = useNavigate();

  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [testDate, setTestDate] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [doctorComments, setDoctorComments] = useState("");
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [reportExists, setReportExists] = useState(false);
  const [existingReportURL, setExistingReportURL] = useState(null);
  const [reportId, setReportId] = useState(null); // New state for reportId

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

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const doctorsQuery = query(
          collection(db, "users"),
          where("role", "==", "doctor")
        );
        const doctorsSnapshot = await getDocs(doctorsQuery);
        const doctorsList = doctorsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        setError("Error fetching doctors. Please try again later.");
        console.error(error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const q = query(collection(db, "reports"), where("patientId", "==", customerId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const reportData = querySnapshot.docs[0].data();
          const reportId = querySnapshot.docs[0].id; // Get the report ID
          setReportId(reportId); // Save the reportId in the state
          setReportExists(true);
          setSelectedDoctor(reportData.doctorId);
          setReportType(reportData.reportType);
          setReportCategory(reportData.reportCategory);
          setDoctorComments(reportData.doctorComments);
          setTestDate(reportData.testDate);

          if (reportData.reportURL) {
            setExistingReportURL(reportData.reportURL);
          }
        } else {
          setError("No reports found for this patient.");
        }
      } catch (error) {
        setError("Error fetching report data.");
        console.error(error);
      }
    };

    fetchReportData();
  }, [customerId]);

  // Handle file input changes
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only PDF and DOCX are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setReportFile(file);
      setUploadedFileName(file.name);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccess(false);
    setError("");
  };

  // Upload file and return download URL
  const uploadFileAndUpdateReport = async () => {
    const storageRef = ref(storage, `reports/${customerId}/${reportFile.name}`);
    await uploadBytes(storageRef, reportFile);
    return getDownloadURL(storageRef);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !selectedDoctor ||
      !reportType ||
      !reportCategory ||
      !testDate ||
      (reportFile === null && !existingReportURL)
    ) {
      setError("Please fill all required fields and upload a report.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const downloadURL = reportFile
        ? await uploadFileAndUpdateReport()
        : existingReportURL;

      // Check if reportId is defined before proceeding
      if (!reportId) {
        setError("Report ID is not defined. Cannot update report.");
        return;
      }

      await updateDoc(doc(db, "reports", reportId), {
        patientId: customerId,
        patientName,
        doctorId: selectedDoctor,
        reportType,
        reportCategory,
        doctorComments,
        testDate,
        fileName: reportFile ? reportFile.name : null,
        reportURL: downloadURL || null,
        updatedAt: new Date(),
      });

      setSuccess(true);
    } catch (error) {
      setError(error.message || "Error updating report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

// Handle report deletion
const handleDeleteReport = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete this report?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "reports", reportId)); // Use reportId for deletion
    setSuccess(true); // Show success Snackbar
    setError(""); // Clear any previous error
    navigate("/admin/report");
  } catch (error) {
    setError("Error deleting report. Please try again.");
    console.error(error);
  }
};
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h2 className="text-lg font-semibold">Update Report</h2>
          </div>
          {patientName && (
            <p className="mt-2 text-sm px-6">Patient: {patientName}</p>
          )}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="text-red-600">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
                required
              >
                <option value="" disabled>
                  Select a doctor
                </option>
                {!loadingDoctors &&
                  doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
                required
              >
                <option value="Blood Test">Blood Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Report Category
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
                required
              >
                <option value="Routine">Routine</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Test Date
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Report (PDF/DOCX, max 5MB)
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="mt-1 block w-full border-gray-300 rounded-md"
              />
              {uploadedFileName && (
                <p className="mt-1 text-sm text-gray-500">{uploadedFileName}</p>
              )}
              {existingReportURL && (
                <p className="mt-1 text-sm text-gray-500">
                  Existing Report:{" "}
                  <a href={existingReportURL} target="_blank" rel="noopener noreferrer">
                    View Report
                  </a>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Doctor's Comments
              </label>
              <textarea
                value={doctorComments}
                onChange={(e) => setDoctorComments(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
                rows="4"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="submit"
                className={`w-full text-white bg-blue-600 hover:bg-blue-700 rounded-md py-2 px-4 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Report"}
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                className="ml-2 w-full text-white bg-red-600 hover:bg-red-700 rounded-md py-2 px-4"
              >
                <DeleteIcon className="mr-1" />
                Delete Report
              </button>
            </div>
          </form>
          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={handleCloseSnackbar}
              severity="success"
            >
              Report updated successfully!
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}
