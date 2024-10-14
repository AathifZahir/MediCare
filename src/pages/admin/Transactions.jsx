import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { CreditCard, Shield, Banknote, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import db from "../../firebase/firestore";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [modalInfo, setModalInfo] = useState(null);
  const [confirmationInfo, setConfirmationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [addTransactionModalOpen, setAddTransactionModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    fullName: "",
    paymentType: "card",
    amount: "",
    userId: "",
    appointmentId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsCollection = collection(db, "transactions");
        const transactionSnapshot = await getDocs(transactionsCollection);
        const transactionList = transactionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Transactions fetched:", transactionList);

        // Fetch users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = {};
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          usersData[doc.id] = `${user.firstName} ${user.lastName}`; // Use document ID as the key
        });

        console.log("Users fetched:", usersData);

        // Fetch appointments
        const appointmentsCollection = collection(db, "appointments");
        const appointmentsSnapshot = await getDocs(appointmentsCollection);
        const appointmentsData = {};
        appointmentsSnapshot.forEach((doc) => {
          const appointment = doc.data();
          appointmentsData[doc.id] = appointment.status; // Use document ID as the key
        });

        console.log("Appointments fetched:", appointmentsData);

        // Combine transaction data with user names and appointment statuses
        const updatedTransactions = transactionList.map((transaction) => ({
          ...transaction,
          fullName: usersData[transaction.userId] || transaction.userName,
          status: appointmentsData[transaction.appointmentId] || "completed",
        }));

        console.log("Updated Transactions:", updatedTransactions);

        setTransactions(updatedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = (transaction) => {
    setConfirmationInfo(transaction);
    setConfirmDialogOpen(true); // Open the confirmation dialog
  };

  const confirmStatusChange = async () => {
    if (confirmationInfo) {
      try {
        // Update the appointment status in Firestore
        const appointmentDocRef = doc(
          db,
          "appointments",
          confirmationInfo.appointmentId
        );
        await updateDoc(appointmentDocRef, {
          status: "scheduled", // Update to the desired status
        });

        // Update state
        setTransactions(
          transactions.map((t) =>
            t.appointmentId === confirmationInfo.appointmentId
              ? { ...t, status: "scheduled" }
              : t
          )
        );
      } catch (error) {
        console.error("Error updating appointment status:", error);
      } finally {
        setConfirmDialogOpen(false); // Close the confirmation dialog
        setConfirmationInfo(null); // Clear the selected transaction
      }
    }
  };

  const openModal = (transaction) => {
    console.log("Opening modal for transaction:", transaction);
    setModalInfo(transaction);
  };

  const closeModal = () => {
    setModalInfo(null);
  };

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

  const handleAddTransaction = async () => {
    try {
      // You may want to validate the input fields here

      // Add the new transaction to Firestore
      const newTransactionDocRef = await addDoc(
        collection(db, "transactions"),
        {
          ...newTransaction,
          userId: "", // Add the userId if necessary, otherwise set it as needed
          appointmentId: "", // Add the appointmentId if necessary
          status: "pending", // Set the initial status to pending
        }
      );

      // Update the UI with the new transaction
      setTransactions([
        ...transactions,
        { id: newTransactionDocRef.id, ...newTransaction, status: "pending" },
      ]);

      // Close the modal and reset the form
      setAddTransactionModalOpen(false);
      setNewTransaction({
        fullName: "",
        paymentType: "card",
        amount: "",
        userId: "",
        appointmentId: "",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleEditTransaction = (transaction) => {
    setAddTransactionModalOpen(true);
    setNewTransaction(transaction);
  };

  const handleDeleteTransaction = (transaction) => {
    setConfirmationInfo(transaction);
    setConfirmDialogOpen(true);
  };

  const confirmDeleteTransaction = async () => {
    if (confirmationInfo) {
      try {
        // Delete the transaction from Firestore
        const transactionDocRef = doc(db, "transactions", confirmationInfo.id);
        await deleteDoc(transactionDocRef);

        // Update the UI to reflect the deleted transaction
        setTransactions(
          transactions.filter((t) => t.id !== confirmationInfo.id)
        );
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setConfirmDialogOpen(false);
        setConfirmationInfo(null);
      }
    }
  };

  const handleSaveTransaction = async () => {
    try {
      if (newTransaction.id) {
        // Update the existing transaction
        const transactionDocRef = doc(db, "transactions", newTransaction.id);
        await updateDoc(transactionDocRef, {
          ...newTransaction,
        });
      } else {
        // Add a new transaction
        const newTransactionDocRef = await addDoc(
          collection(db, "transactions"),
          {
            ...newTransaction,
            userId: "", // Add the userId if necessary, otherwise set it as needed
            appointmentId: "", // Add the appointmentId if necessary
            status: "pending", // Set the initial status to pending
          }
        );

        // Update the UI with the new transaction
        setTransactions([
          ...transactions,
          { id: newTransactionDocRef.id, ...newTransaction, status: "pending" },
        ]);
      }

      // Close the modal and reset the form
      setAddTransactionModalOpen(false);
      setNewTransaction({
        fullName: "",
        paymentType: "card",
        amount: "",
        userId: "",
        appointmentId: "",
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
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
          <button
            onClick={() => setAddTransactionModalOpen(true)} // Open the modal
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Transaction
          </button>
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
                          transaction.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {transaction.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-full transition duration-300"
                          >
                            Mark as Paid
                          </button>
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

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogContent>
            Are you sure you want to mark the related appointment as
            "scheduled"?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} color="secondary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <div
          class={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center ${
            addTransactionModalOpen ? "block" : "hidden"
          }`}
        >
          <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-gray-800">
                {newTransaction.id ? "Edit Transaction" : "Add New Transaction"}
              </h2>
              <button
                onClick={() => setAddTransactionModalOpen(false)}
                class="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newTransaction.fullName}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      fullName: e.target.value,
                    })
                  }
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Payment Type
                </label>
                <select
                  value={newTransaction.paymentType}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      paymentType: e.target.value,
                    })
                  }
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>

              {newTransaction.paymentType === "card" && (
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={newTransaction.cardNumber}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        cardNumber: e.target.value,
                      })
                    }
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              {newTransaction.paymentType === "insurance" && (
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={newTransaction.policyNumber}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        policyNumber: e.target.value,
                      })
                    }
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              {newTransaction.paymentType === "insurance" && (
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={newTransaction.providerName}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        providerName: e.target.value,
                      })
                    }
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </form>

            <div class="flex justify-end space-x-2">
              <button
                class="bg-white hover:bg-gray-100 mt-5 text-gray -800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                onClick={() => setAddTransactionModalOpen(false)}
              >
                Cancel
              </button>
              <button
                class="bg-blue-500 hover:bg-blue-700 mt-5 text-white font-semibold py-2 px-4 border border-blue-700 rounded shadow"
                onClick={handleSaveTransaction}
              >
                {newTransaction.id ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this transaction?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteTransaction} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

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
                <p className="text-sm text-gray-700">
                  Amount: LKR {modalInfo.amount}
                </p>
                <p className="text-sm text-gray-700">
                  Status: {modalInfo.status}
                </p>
                <p className="text-sm text-gray-700">
                  Full Name: {modalInfo.fullName}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
