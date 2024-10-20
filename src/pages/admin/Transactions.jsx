import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CreditCard, Shield, Banknote, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import db from "../../firebase/firestore";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import getUserRoleAndHospital from "../../utils/getUserRoleAndHospital";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [confirmationInfo, setConfirmationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTransactionInfo, setEditTransactionInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { role, hospitalId } = await getUserRoleAndHospital();

        // Fetch transactions
        const transactionsCollection = collection(db, "transactions");
        const transactionSnapshot = await getDocs(transactionsCollection);
        const transactionList = transactionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter transactions based on user role
        const filteredTransactions =
          role === "admin"
            ? transactionList
            : transactionList.filter(
                (transaction) => transaction.hospitalId === hospitalId
              );

        setTransactions(filteredTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (transaction) => {
    setConfirmationInfo(transaction); // Set transaction for status change
    setConfirmStatusDialogOpen(true); // Open confirmation dialog
  };

  const confirmStatusChange = async () => {
    if (confirmationInfo) {
      try {
        const appointmentDocRef = doc(
          db,
          "appointments",
          confirmationInfo.appointmentId
        );
        await updateDoc(appointmentDocRef, { status: "scheduled" }); //update appointment status

        const transactionDocRef = doc(db, "transactions", confirmationInfo.id);
        await updateDoc(transactionDocRef, { status: "Paid" }); //update transaction status

        setTransactions(
          transactions.map((t) =>
            t.id === confirmationInfo.id ? { ...t, status: "Paid" } : t
          )
        );
      } catch (error) {
        console.error(
          "Error updating appointment or transaction status:",
          error
        );
      } finally {
        setConfirmStatusDialogOpen(false);
        setConfirmationInfo(null);
      }
    }
  };

  //handle deleting a transaction
  const handleDeleteTransaction = (transaction) => {
    setConfirmationInfo(transaction);
    setConfirmDeleteDialogOpen(true);
  };

  //confirm delete transaction
  const confirmDeleteTransaction = async () => {
    //check if confirmationInfo is not null
    if (confirmationInfo) {
      try {
        const transactionDocRef = doc(db, "transactions", confirmationInfo.id);
        await deleteDoc(transactionDocRef);

        setTransactions(
          transactions.filter((t) => t.id !== confirmationInfo.id)
        );
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setConfirmDeleteDialogOpen(false);
        setConfirmationInfo(null);
      }
    }
  };

  //handle editing a transaction
  const handleEditTransaction = (transaction) => {
    setEditTransactionInfo(transaction);
    setEditModalOpen(true);
  };

  //confirm edit transaction
  // Edit the transaction status
  const confirmEditTransaction = async () => {
    //check if editTransactionInfo is not null
    if (editTransactionInfo) {
      try {
        // Update the transaction status
        const transactionDocRef = doc(
          db,
          "transactions",
          editTransactionInfo.id
        );
        await updateDoc(transactionDocRef, {
          status: editTransactionInfo.status,
        });

        // Update the related appointment status based on the new transaction status
        const appointmentDocRef = doc(
          db,
          "appointments",
          editTransactionInfo.appointmentId
        );
        const newStatus =
          editTransactionInfo.status === "Paid" ? "Scheduled" : "Pending";
        await updateDoc(appointmentDocRef, { status: newStatus });

        // Update the local state
        setTransactions(
          transactions.map((t) =>
            t.id === editTransactionInfo.id
              ? { ...t, status: editTransactionInfo.status }
              : t
          )
        );
      } catch (error) {
        console.error(
          "Error updating transaction or appointment status:",
          error
        );
      } finally {
        setEditModalOpen(false);
        setEditTransactionInfo(null);
      }
    }
  };

  //setting modal data for payment type
  const openModal = (modalInfo) => {
    setModalInfo(modalInfo);
  };

  //close modal for payment type
  const closeModal = () => {
    setModalInfo(null);
  };

  //function to get the icon and color based on the payment type
  const getTypeIcon = (type) => {
    switch (type) {
      case "card":
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case "insurance":
        return <Shield className="w-5 h-5 text-green-500" />;
      case "cash":
        return <Banknote className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Transaction Table
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Full Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.userName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(transaction)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-900"
                      >
                        {getTypeIcon(transaction.paymentType)}
                        <span className="ml-2">{transaction.paymentType}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${transaction.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {transaction.status === "Under Review" ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-full transition duration-300"
                          >
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition duration-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition duration-300"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/*adding confirm status dialog*/}
        {confirmStatusDialogOpen && (
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${
              confirmStatusDialogOpen ? "block" : "hidden"
            }`}
          >
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Confirm Status Change
              </h2>
              <p className="text-sm text-gray-700">
                Are you sure you want to mark the related appointment as
                "scheduled"?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setConfirmStatusDialogOpen(false)}
                  className="bg-white hover:bg-gray-100 mt-5 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/*adding confirm delete dialog*/}
        {confirmDeleteDialogOpen && (
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${
              confirmDeleteDialogOpen ? "block" : "hidden"
            }`}
          >
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Confirm Delete
              </h2>
              <p className="text-sm text-gray-700">
                Are you sure you want to delete this transaction?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setConfirmDeleteDialogOpen(false)}
                  className="bg-white hover:bg-gray-100 mt-5 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTransaction}
                  className="bg-red-500 hover:bg-red-700 mt-5 text-white font-semibold py-2 px-4 border border-red-700 rounded shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/*adding edit status dialog*/}
        {editModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Transaction Status
              </h2>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editTransactionInfo?.status}
                  onChange={(e) =>
                    setEditTransactionInfo({
                      ...editTransactionInfo,
                      status: e.target.value,
                    })
                  }
                  className="block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-5">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEditTransaction}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal to display payment details */}
        {modalInfo && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Transaction Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  {getTypeIcon(modalInfo.paymentType)}
                  <p className="ml-2 text-sm text-gray-700">
                    Payment Type: {modalInfo.paymentType}
                  </p>
                </div>

                {/* Common transaction fields */}
                <p className="text-sm text-gray-700">
                  Amount: LKR {modalInfo.amount}
                </p>
                <p className="text-sm text-gray-700">
                  Status: {modalInfo.status}
                </p>
                <p className="text-sm text-gray-700">
                  Full Name: {modalInfo.fullName}
                </p>

                {/* Conditionally render fields based on payment type */}
                {modalInfo.paymentType === "insurance" && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      Policy Number: {modalInfo.policyNumber}
                    </p>
                    <p className="text-sm text-gray-700">
                      Provider Name: {modalInfo.providerName}
                    </p>
                  </div>
                )}

                {modalInfo.paymentType === "card" && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      Card Number: **** **** ****{" "}
                      {modalInfo.cardNumber.slice(-4)}
                      {/* Only show the last 4 digits of the card */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
