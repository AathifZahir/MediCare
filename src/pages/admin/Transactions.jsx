import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { CreditCard, Shield, Banknote, X } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";

const initialTransactions = [
  {
    id: 1,
    fullName: "John Doe",
    type: "card",
    amount: 100.0,
    status: "pending",
    cardNumber: "**** **** **** 1234",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    type: "insurance",
    amount: 250.0,
    status: "paid",
    policyNumber: "INS-12345",
    providerName: "Health Co.",
  },
  {
    id: 3,
    fullName: "Bob Johnson",
    type: "cash",
    amount: 50.0,
    status: "pending",
  },
  {
    id: 4,
    fullName: "Alice Brown",
    type: "card",
    amount: 75.5,
    status: "paid",
    cardNumber: "**** **** **** 5678",
  },
];

const Transactions = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [modalInfo, setModalInfo] = useState(null);
  const [confirmationInfo, setConfirmationInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate a fetch call
    const fetchData = async () => {
      // Simulate a delay for loading
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // You can replace this with actual fetching logic
      setTransactions(initialTransactions); // Set your fetched transactions here
      setLoading(false); // Set loading to false after data is fetched
    };

    fetchData();
  }, []);

  const handleStatusChange = (id) => {
    setConfirmationInfo({ id, newStatus: "paid" });
  };

  const confirmStatusChange = () => {
    setTransactions(
      transactions.map((t) =>
        t.id === confirmationInfo.id
          ? { ...t, status: confirmationInfo.newStatus }
          : t
      )
    );
    setConfirmationInfo(null);
  };

  const openModal = (transaction) => {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Transaction Table
        </h1>

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
                        {transaction.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openModal(transaction)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-900"
                      >
                        {getTypeIcon(transaction.type)}
                        <span className="ml-2">{transaction.type}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${transaction.amount.toFixed(2)}
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
                        <button
                          onClick={() => handleStatusChange(transaction.id)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-full transition duration-300"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modalInfo && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Transaction Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition duration-300"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  {getTypeIcon(modalInfo.type)}
                  <span className="ml-2 text-lg font-medium text-gray-700 capitalize">
                    {modalInfo.type}
                  </span>
                </div>
                {modalInfo.type === "card" && (
                  <p className="text-gray-600">
                    <span className="font-medium">Card Number:</span>{" "}
                    {modalInfo.cardNumber}
                  </p>
                )}
                {modalInfo.type === "insurance" && (
                  <>
                    <p className="text-gray-600">
                      <span className="font-medium">Policy Number:</span>{" "}
                      {modalInfo.policyNumber}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Provider Name:</span>{" "}
                      {modalInfo.providerName}
                    </p>
                  </>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Amount:</span> $
                  {modalInfo.amount.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      modalInfo.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {modalInfo.status}
                  </span>
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
