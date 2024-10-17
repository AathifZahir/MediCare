import React from "react";
import ServiceCard from "../../components/ServiceCard";
import { services } from "../../data/ServicesData"; // Adjust the import path if necessary
import HomeSidebar from "../../components/HomeNavbar"; // Import HomeSidebar

const ServicesPage = () => {
  const handleBookNow = (serviceId) => {
    console.log(`Service ${serviceId} booked!`);
    // Add your booking logic here
  };

  return (
    <div className="flex flex-col">
      <HomeSidebar /> {/* HomeSidebar at the top */}
      <div className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-6">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
