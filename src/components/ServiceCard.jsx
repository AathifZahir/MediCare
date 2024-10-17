// components/ServiceCard.jsx

import React from "react";

const ServiceCard = ({ service, onBookNow }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col">
      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
      <p className="mb-2">{service.description}</p>
      <p className="font-bold mb-1">Fee: {service.fee}</p>
      <p className="mb-1">
        <strong>Insurance Coverage:</strong> {service.insurance}
      </p>
      <p className="mb-4">
        <strong>Payment Options:</strong> {service.paymentOptions.join(", ")}
      </p>
      <button
        onClick={() => onBookNow(service.id)}
        className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-200"
      >
        Book Now
      </button>
    </div>
  );
};

export default ServiceCard;
