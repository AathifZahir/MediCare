import React from "react";

const ServiceCard = ({ service, onBookNow }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 flex flex-col transition-transform transform hover:scale-105 hover:shadow-xl">
      <h3 className="text-2xl font-semibold text-blue-600 mb-2">
        {service.name}
      </h3>
      <p className="text-gray-700 mb-4">{service.description}</p>
      <p className="font-bold text-lg mb-1">
        Fee: <span className="text-blue-500">{service.fee}</span>
      </p>
      <p className="mb-1">
        <strong className="text-gray-800">Insurance Coverage:</strong>{" "}
        {service.insurance}
      </p>
      <p className="mb-4">
        <strong className="text-gray-800">Payment Options:</strong>{" "}
        {service.paymentOptions.join(", ")}
      </p>
      <button
        onClick={() => onBookNow(service.id)}
        className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
      >
        Book Now
      </button>
    </div>
  );
};

export default ServiceCard;
