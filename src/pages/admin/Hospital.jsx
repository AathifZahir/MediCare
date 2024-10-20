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
  Snackbar,
  CircularProgress,
  Button,
  TextField,
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
  const [hospitalToDelete, setHospitalToDelete] = useState(null);

  const hospitalCollectionRef = collection(db, "hospitals");

  //Fetch all hospitals
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await getDocs(hospitalCollectionRef);
      setHospitals(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching hospitals: ", error);
      setSnackbar({ open: true, message: "Error fetching hospitals" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  //open modal  to add new hospital or update hospital
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

  //add or update hospitals
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
      setSnackbar({ open: true, message: error.message || "Error occurred" });
    }
  };

  // handle modal open for delete
  const handleOpenDeleteDialog = (hospital) => {
    setHospitalToDelete(hospital);
    setDeleteDialogOpen(true);
  };

  //handle modal close for delete
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setHospitalToDelete(null);
  };

  //handle delete if user confirms
  const handleConfirmDelete = async () => {
    try {
      const hospitalDoc = doc(db, "hospitals", hospitalToDelete.id);
      await deleteDoc(hospitalDoc);
      fetchHospitals();
      setSnackbar({ open: true, message: "Hospital deleted successfully" });
    } catch (error) {
      console.error("Error deleting hospital: ", error);
      setSnackbar({ open: true, message: error.message || "Error occurred" });
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
        {openModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingHospital ? "Edit Hospital" : "Add Hospital"}
              </h2>
              <form>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                  </select>
                </div>
                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleAddOrUpdateHospital}
                  >
                    {editingHospital ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
          <div className="p-6">
            <h2 className="text-lg font-bold">
              Are you sure you want to delete this hospital?
            </h2>
            <div className="flex justify-end mt-4">
              <Button onClick={handleCloseDeleteDialog} color="secondary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="primary">
                Delete
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default HospitalPage;
