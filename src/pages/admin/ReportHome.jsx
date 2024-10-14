import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import db from "../../firebase/firestore";
import Sidebar from "../../components/AdminSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ReportHome = () => {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const navigate = useNavigate();

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const patientSnapshot = await getDocs(collection(db, "users"));
        const patientList = patientSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((patient) => patient.role === "patient");
        setPatients(patientList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Menu handling
  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
    setSelectedReportId(null); // Reset report ID when opening the menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
    setSelectedReportId(null); // Reset selected report ID
  };

  // Action handlers
  const handleAddReport = () => {
    if (selectedPatient) {
      navigate(`/admin/reports/add/${selectedPatient.id}`);
    }
    handleMenuClose();
  };

  const handleEditReport = (report) => {
    if (selectedPatient) {
      navigate(`/admin/reports/edit/${selectedPatient.id}/${report.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteReport = async () => {
    if (!selectedReportId) {
      console.error("No report selected for deletion."); // Debugging log
      return;
    }

    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this report?");
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "reports", selectedReportId)); // Delete the selected report

      // Update local state for patients
      setPatients((prevPatients) =>
        prevPatients.map((patient) => {
          if (patient.id === selectedPatient.id) {
            return {
              ...patient,
              reports: patient.reports.filter((report) => report.id !== selectedReportId),
            };
          }
          return patient;
        })
      );

      setSnackbarMessage("Report deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting report:", error);
      setSnackbarMessage("Error deleting report. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  // Redirect to view report page
  const handleViewReport = () => {
    if (selectedPatient) {
      navigate(`/admin/reports/view/${selectedPatient.id}/${selectedReportId}`);
    }
    handleMenuClose();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId); // Set selected report ID
    console.log("Selected report ID:", reportId); // Debugging log
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Report Home</h2>
          {error && <div className="text-red-600 text-center mb-4">{error}</div>}
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>{patient.firstName}</TableCell>
                      <TableCell>{patient.lastName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.address}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, patient)}>
                          <MoreVertIcon />
                        </IconButton>
                        {/* Map through the patient's reports and display options */}
                        {patient.reports && patient.reports.length > 0 && (
                          <div>
                            {patient.reports.map((report) => (
                              <div
                                key={report.id}
                                onClick={() => handleSelectReport(report.id)}
                                style={{ cursor: "pointer", margin: "4px 0" }}
                              >
                                <span>{report.title}</span> {/* Assuming each report has a title */}
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </div>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleAddReport}>
          <AddIcon fontSize="small" style={{ marginRight: 8 }} />
          Add Report
        </MenuItem>
        <MenuItem onClick={handleEditReport}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit Report
        </MenuItem>
        <MenuItem onClick={handleViewReport}>
          <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
          View Report
        </MenuItem>
        <MenuItem onClick={handleDeleteReport}>
          <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
          Delete Report
        </MenuItem>
      </Menu>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportHome;
