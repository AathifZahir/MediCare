import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"; // Firebase Firestore functions for data operations
import { useNavigate } from "react-router-dom"; // For programmatic navigation between routes
import db from "../../firebase/firestore"; // Firebase configuration
import Sidebar from "../../components/AdminSidebar"; // Sidebar component for navigation
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
  TextField, // Importing components from MUI for UI elements
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Icons for different actions
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility"; 

const ReportHome = () => {
  const [patients, setPatients] = useState([]); // State to store patients data
  const [error, setError] = useState(""); // State for error handling
  const [loading, setLoading] = useState(false); // Loading state
  const [anchorEl, setAnchorEl] = useState(null); // State to handle menu anchor element
  const [selectedPatient, setSelectedPatient] = useState(null); // Track selected patient
  const [selectedReportId, setSelectedReportId] = useState(null); // Track selected report
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state for notifications
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message content
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity type

  const [searchQuery, setSearchQuery] = useState(""); // State to manage search input

  const navigate = useNavigate(); // Initialize router navigation

  // Fetch patients from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true during fetch
        const patientSnapshot = await getDocs(collection(db, "users")); // Get patient data
        const patientList = patientSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() })) // Map docs to patient objects
          .filter((patient) => patient.role === "patient"); // Filter by 'patient' role
        setPatients(patientList); // Store patients in state
      } catch (error) {
        console.error("Error fetching data:", error); // Log errors
        setError("Error fetching data. Please try again later."); // Display error message
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchData(); // Call fetch function
  }, []);

  // Open menu and store patient reference
  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget); // Store the element triggering the menu
    setSelectedPatient(patient); // Store selected patient
    setSelectedReportId(null); // Reset report selection
  };

  // Close the action menu and reset selections
  const handleMenuClose = () => {
    setAnchorEl(null); // Clear menu anchor
    setSelectedPatient(null); // Reset selected patient
    setSelectedReportId(null); // Reset report selection
  };

  // Navigate to add report page
  const handleAddReport = () => {
    if (selectedPatient) {
      navigate(`/admin/reports/add/${selectedPatient.id}`); // Navigate to add report route
    }
    handleMenuClose(); // Close menu after navigation
  };

  // Navigate to edit report page
  const handleEditReport = (report) => {
    if (selectedPatient) {
      navigate(`/admin/reports/edit/${selectedPatient.id}/${report.id}`); // Navigate to edit report route
    }
    handleMenuClose(); // Close menu
  };

  // Delete report from Firestore and update UI state
  const handleDeleteReport = async () => {
    if (!selectedReportId) {
      console.error("No report selected for deletion."); // Debug log
      return;
    }

    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this report?"); // Confirm deletion
      if (!confirmDelete) return; // Exit if cancelled

      await deleteDoc(doc(db, "reports", selectedReportId)); // Delete report from Firestore

      // Update local state after deletion
      setPatients((prevPatients) =>
        prevPatients.map((patient) => {
          if (patient.id === selectedPatient.id) {
            return {
              ...patient,
              reports: patient.reports.filter((report) => report.id !== selectedReportId), // Remove deleted report
            };
          }
          return patient;
        })
      );

      // Show success notification
      setSnackbarMessage("Report deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting report:", error); // Log error
      // Show error notification
      setSnackbarMessage("Error deleting report. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
    handleMenuClose(); // Close menu
  };

  // Navigate to view report page
  const handleViewReport = () => {
    if (selectedPatient) {
      navigate(`/admin/reports/view/${selectedPatient.id}/${selectedReportId}`); // Navigate to view report
    }
    handleMenuClose(); // Close menu
  };

  // Close snackbar notification
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return; // Ignore if clicked away
    setSnackbarOpen(false); // Close snackbar
  };

  // Track selected report ID
  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId); // Store report ID in state
    console.log("Selected report ID:", reportId); // Debug log
  };

  // Filter patients based on search input
  const filteredPatients = patients.filter((patient) =>
    `${patient.firstName} ${patient.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) // Match against search query
  );

  return (
    <div className="flex h-screen bg-gray-100"> {/* Main container */}
      <Sidebar /> {/* Admin sidebar */}
      <div className="flex-1 p-8 overflow-auto"> {/* Content area */}
        <div className="max-w-6xl mx-auto"> {/* Center content */}
          <h2 className="text-3xl font-bold mb-6">Report Home</h2> {/* Page title */}
          {error && <div className="text-red-600 text-center mb-4">{error}</div>} {/* Error message */}
          
          {/* Search input */}
          <TextField
            variant="outlined"
            placeholder="Search by name..."
            value={searchQuery} // Bind search query to state
            onChange={(e) => setSearchQuery(e.target.value)} // Update search state on input
            fullWidth
            className="mb-4"
          />

          {loading ? ( // Show loading indicator if fetching data
            <div className="text-center">Loading...</div>
          ) : (
            <TableContainer component={Paper}> {/* Table container */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell align="right">Actions</TableCell> {/* Action column */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => ( // Map over filtered patients
                    <TableRow key={patient.id}> {/* Row for each patient */}
                      <TableCell>{patient.firstName}</TableCell>
                      <TableCell>{patient.lastName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phoneNumber}</TableCell>
                      <TableCell>{patient.address}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, patient)}> {/* Menu button */}
                          <MoreVertIcon />
                        </IconButton>
                        {/* List reports if available */}
                        {patient.reports && patient.reports.length > 0 && (
                          <div>
                            {patient.reports.map((report) => (
                              <div
                                key={report.id}
                                onClick={() => handleSelectReport(report.id)} // Select report on click
                                style={{ cursor: "pointer", margin: "4px 0" }}
                              >
                                <span>{report.title}</span> {/* Report title */}
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
      
      {/* Action menu */}
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

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ReportHome;
