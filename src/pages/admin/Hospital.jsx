import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import db from "../../firebase/firestore";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  CircularProgress,
  Button,
} from "@mui/material";
import AdminSidebar from "../../components/AdminSidebar";

const HospitalPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    location: "",
    type: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState(null); // Hospital to delete

  const hospitalCollectionRef = collection(db, "hospitals");

  const fetchHospitals = async () => {
    setLoading(true);
    const data = await getDocs(hospitalCollectionRef);
    setHospitals(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    setLoading(false);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setEditingHospital(hospital);
      setFormData(hospital);
    } else {
      setEditingHospital(null);
      setFormData({
        name: "",
        contactNumber: "",
        location: "",
        type: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateHospital = async () => {
    try {
      if (editingHospital) {
        const hospitalDoc = doc(db, "hospitals", editingHospital.id);
        await updateDoc(hospitalDoc, {
          ...formData,
          updated_at: new Date(),
        });
        setSnackbar({ open: true, message: "Hospital updated successfully" });
      } else {
        await addDoc(hospitalCollectionRef, {
          ...formData,
          created_at: new Date(),
          updated_at: new Date(),
        });
        setSnackbar({ open: true, message: "Hospital added successfully" });
      }
      fetchHospitals();
      handleCloseModal();
    } catch (error) {
      console.error("Error adding/updating hospital: ", error);
      setSnackbar({ open: true, message: "Error occurred" });
    }
  };

  const handleOpenDeleteDialog = (hospital) => {
    setHospitalToDelete(hospital); // Set the hospital to be deleted
    setDeleteDialogOpen(true); // Open the confirmation dialog
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setHospitalToDelete(null); // Reset the hospital to delete
  };

  const handleConfirmDelete = async () => {
    try {
      const hospitalDoc = doc(db, "hospitals", hospitalToDelete.id);
      await deleteDoc(hospitalDoc);
      fetchHospitals();
      setSnackbar({ open: true, message: "Hospital deleted successfully" });
    } catch (error) {
      console.error("Error deleting hospital: ", error);
      setSnackbar({ open: true, message: "Error occurred" });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-4">Hospital Management</h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => handleOpenModal()}
        >
          Add New Hospital
        </button>

        {loading ? (
          <div className="flex justify-center items-center">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Contact Number</th>
                  <th className="py-3 px-6 text-left">Location</th>
                  <th className="py-3 px-6 text-left">Type</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {hospitals.map((hospital) => (
                  <tr key={hospital.id} className="border-b border-gray-200">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {hospital.name}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {hospital.contactNumber}
                    </td>
                    <td className="py-3 px-6 text-left">{hospital.location}</td>
                    <td className="py-3 px-6 text-left">{hospital.type}</td>
                    <td className="py-3 px-6 text-left flex">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded mr-2"
                        onClick={() => handleOpenModal(hospital)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => handleOpenDeleteDialog(hospital)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for adding/updating hospitals */}
        {/* Your existing modal code here */}

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this hospital? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ open: false, message: "" })}
        />
      </div>
    </div>
  );
};

export default HospitalPage;
