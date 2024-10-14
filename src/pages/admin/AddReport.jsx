import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import AdminSidebar from "../../components/AdminSidebar";
import auth from "../../firebase/auth.jsx";
import storage from "../../firebase/storage";
import db from "../../firebase/firestore.jsx";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const AddReport = () => {
  const { customerId, reportId } = useParams(); // Get reportId from URL params
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [testDate, setTestDate] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [doctorComments, setDoctorComments] = useState("");
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        // Check if the current user is authorized to add reports
        if (!["admin", "staff", "doctor"].includes(userData.role)) {
          alert("Unauthorized access. Redirecting to login.");
          navigate("/login");
        }
      } else {
        alert("Please log in to access this page.");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch patient data based on customerId
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientDoc = await getDoc(doc(db, "users", customerId));
        if (patientDoc.exists()) {
          const patientData = patientDoc.data();
          setPatientName(`${patientData.firstName} ${patientData.lastName}`);
        } else {
          setError("Patient not found.");
        }
      } catch (error) {
        setError("Error fetching patient data.");
      }
    };

    fetchPatientData();
  }, [customerId]);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const q = query(collection(db, "users"), where("role", "==", "doctor"));
        const doctorSnapshot = await getDocs(q);

        if (doctorSnapshot.empty) {
          throw new Error("No doctors found.");
        }

        const doctorList = doctorSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDoctors(doctorList);
      } catch (error) {
        setError("Error fetching doctors. Please try again later.");
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch report data for editing if reportId exists
  useEffect(() => {
    const fetchReportData = async () => {
      if (reportId) {
        try {
          const reportDoc = await getDoc(doc(db, "reports", reportId));
          if (reportDoc.exists()) {
            const reportData = reportDoc.data();
            // Populate the fields with report data
            setSelectedDoctor(reportData.doctorId);
            setReportType(reportData.reportType);
            setReportCategory(reportData.reportCategory);
            setDoctorComments(reportData.doctorComments);
            setTestDate(reportData.testDate);
          } else {
            setError("Report not found.");
          }
        } catch (error) {
          setError("Error fetching report data.");
        }
      }
    };

    fetchReportData();
  }, [reportId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Only PDF and DOCX are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Limit to 5MB
        setError("File size exceeds 5MB limit.");
        return;
      }
      setReportFile(file);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccess(false);
    setError("");
  };

  const resetForm = () => {
    setSelectedDoctor("");
    setReportType("");
    setReportCategory("");
    setDoctorComments("");
    setTestDate("");
    setReportFile(null);
  };

  const uploadFileAndAddReport = async () => {
    const storageRef = ref(storage, `reports/${customerId}/${reportFile.name}`);
    await uploadBytes(storageRef, reportFile);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDoctor || !reportType || !reportCategory || !testDate || !reportFile) {
      setError("Please fill all required fields and upload a report.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Upload file and get download URL
      const downloadURL = await uploadFileAndAddReport();

      // If reportId exists, update the report; otherwise, add a new report
      if (reportId) {
        await updateDoc(doc(db, "reports", reportId), {
          patientId: customerId,
          patientName,
          doctorId: selectedDoctor,
          reportType,
          reportCategory,
          doctorComments,
          testDate,
          fileName: reportFile.name,
          reportURL: downloadURL,
          updatedAt: new Date(),
        });
      } else {
        // Add new report document to Firestore
        await addDoc(collection(db, "reports"), {
          patientId: customerId,
          patientName,
          doctorId: selectedDoctor,
          reportType,
          reportCategory,
          doctorComments,
          testDate,
          fileName: reportFile.name,
          reportURL: downloadURL,
          uploadedAt: new Date(),
        });
      }

      setSuccess(true);
      resetForm(); // Reset the form fields after success
    } catch (error) {
      setError(error.message || "Error uploading report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h2 className="text-2xl font-bold">Upload Customer Report</h2>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <MuiAlert
                  onClose={handleCloseSnackbar}
                  severity="success"
                  sx={{ width: "100%" }}
                >
                  Report uploaded successfully!
                </MuiAlert>
              </Snackbar>
            )}
            {loadingDoctors ? (
              <p className="text-center">Loading doctors...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-1">
                      Patient's Full Name
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      value={patientName}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Doctor
                    </label>
                    <select
                      id="doctor"
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <select
                      id="reportType"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select a report type</option>
                      <option value="Blood Test">Blood Test</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reportCategory" className="block text-sm font-medium text-gray-700 mb-1">
                      Report Category
                    </label>
                    <select
                      id="reportCategory"
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select a report category</option>
                      <option value="Routine">Routine</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Follow-Up">Follow-Up</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="testDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Test Date
                    </label>
                    <input
                      type="date"
                      id="testDate"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="doctorComments" className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Comments (optional)
                  </label>
                  <textarea
                    id="doctorComments"
                    value={doctorComments}
                    onChange={(e) => setDoctorComments(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    rows="3"
                  />
                </div>
                <div>
                  <label htmlFor="reportFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Report (PDF/DOCX)
                  </label>
                  <input
                    type="file"
                    id="reportFile"
                    accept=".pdf, .docx"
                    onChange={handleFileChange}
                    required={!reportId} // Make file upload required only if adding new report
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 text-white rounded-md focus:outline-none ${
                      loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Uploading..." : reportId ? "Update Report" : "Upload Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReport;
