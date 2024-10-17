import React, { useState } from "react";
import ServiceCard from "../../components/ServiceCard";
import { services } from "../../data/ServicesData"; // Adjust the import path if necessary
import HomeSidebar from "../../components/HomeNavbar"; // Import HomeSidebar
import AppointmentModal from "../../components/AppointmentModal"; // Import the modal

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleBookNow = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <HomeSidebar /> {/* HomeSidebar at the top */}
      <div className="p-6 flex-1">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Our Services
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Explore our range of services designed to meet your needs. Click "Book
          Now" to schedule an appointment.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookNow={() => handleBookNow(service)} // Pass the service to the handler
            />
          ))}
        </div>
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        service={selectedService}
      />
    </div>
  );
};

export default ServicesPage;
