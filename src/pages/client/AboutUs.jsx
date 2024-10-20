// AboutUs.js
import React from "react";
import HomeSidebar from "../../components/HomeNavbar";
import HomeFooter from "../../components/HomeFooter";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeSidebar />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/aboutbg.jpg')", // Add your background image here
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            About Us
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8">
            Committed to Improving Healthcare
          </p>
        </div>
      </section>
      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Our Mission</h2>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-8">
          Our mission is to provide innovative healthcare solutions that improve
          patient outcomes and streamline healthcare management. We are
          dedicated to enhancing the efficiency of healthcare professionals and
          ensuring that patients receive the best care possible.
        </p>
      </section>
      {/* Core Values Section */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">Integrity</h3>
            <p className="text-gray-600">
              We uphold the highest standards of honesty and ethical behavior in
              all that we do.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">Innovation</h3>
            <p className="text-gray-600">
              We embrace change and continually seek new ways to improve our
              services and solutions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold mb-2">Compassion</h3>
            <p className="text-gray-600">
              We care deeply about the well-being of our patients and strive to
              provide supportive and empathetic service.
            </p>
          </div>
        </div>
      </section>
      <HomeFooter />
    </div>
  );
};

export default AboutUs;
