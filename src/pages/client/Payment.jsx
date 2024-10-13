import React, { useState } from "react";
import { CreditCard, Shield, Banknote } from "lucide-react";

const PaymentGateway = () => {
  const [paymentType, setPaymentType] = useState("card");

  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Payment Gateway
      </h2>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => handlePaymentTypeChange("card")}
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "card"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <CreditCard className="mr-2" size={20} />
          Card
        </button>
        <button
          onClick={() => handlePaymentTypeChange("insurance")}
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "insurance"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Shield className="mr-2" size={20} />
          Insurance
        </button>
        <button
          onClick={() => handlePaymentTypeChange("cash")}
          className={`flex items-center px-4 py-2 rounded-md ${
            paymentType === "cash"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <Banknote className="mr-2" size={20} />
          Cash
        </button>
      </div>

      <form className="space-y-4">
        {paymentType === "card" && (
          <>
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="cvv"
                  className="block text-sm font-medium text-gray-700"
                >
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="123"
                />
              </div>
            </div>
          </>
        )}

        {paymentType === "insurance" && (
          <>
            <div>
              <label
                htmlFor="policyNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Policy Number
              </label>
              <input
                type="text"
                id="policyNumber"
                name="policyNumber"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Enter your policy number"
              />
            </div>
            <div>
              <label
                htmlFor="providerName"
                className="block text-sm font-medium text-gray-700"
              >
                Provider Name
              </label>
              <input
                type="text"
                id="providerName"
                name="providerName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Enter insurance provider name"
              />
            </div>
          </>
        )}

        {paymentType === "cash" && (
          <div>
            <p className="text-sm text-gray-600">
              Please pay the amount in cash at the counter.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Reference Number:{" "}
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Enter amount"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default PaymentGateway;
