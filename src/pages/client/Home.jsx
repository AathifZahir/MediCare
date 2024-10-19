// Home.js
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Video,
  FileText,
  Shield,
  Book,
} from "lucide-react";
import HomeSidebar from "../../components/HomeNavbar";
import HomeFooter from "../../components/HomeFooter";

const features = [
  {
    icon: Users,
    title: "Patient Management",
    description: "Efficiently manage patient records and appointments",
  },
  {
    icon: Book,
    title: "Appointments",
    description: "Book your appointments with ease with online payment",
  },
  {
    icon: FileText,
    title: "Insurance Processing",
    description: "Streamline insurance claims and verifications",
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Ensure patient data privacy with advanced security measures",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    quote:
      "This system has revolutionized how I manage my patients. It's intuitive and saves me hours each day.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Mark Thompson",
    role: "Patient",
    quote:
      "I love how easy it is to book appointments and access my medical records. It's made managing my health so much simpler.",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    name: "Nurse Emily Chen",
    role: "Head Nurse",
    quote:
      "The streamlined processes have allowed our staff to focus more on patient care. It's been a game-changer for our hospital.",
    image: "/placeholder.svg?height=100&width=100",
  },
];

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeSidebar /> {/* Add the HomeSidebar component here */}
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/homebg.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Empowering Healthcare with Innovative Solutions
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8">
            Streamline patient management and enhance care quality
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
            Get Started
          </button>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md text-center"
            >
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Testimonials</h2>
        <div className="relative">
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronLeft />
          </button>
          <div className="bg-white p-6 rounded-lg shadow-md mx-auto max-w-md text-center">
            <h3 className="text-lg font-semibold">
              {testimonials[currentTestimonial].name}
            </h3>
            <p className="text-gray-600 italic">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <p className="text-sm text-gray-500">
              {testimonials[currentTestimonial].role}
            </p>
          </div>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronRight />
          </button>
        </div>
      </section>
      <HomeFooter />
    </div>
  );
};

export default Home;
