import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentModal from "./AppointmentModal"; // Adjust the path as necessary
import db from "../firebase/firestore"; // Adjust the import path as necessary
import { collection, addDoc } from "firebase/firestore";

// Mock the Firebase functions
jest.mock("../firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

const serviceMock = { id: "service1", name: "Consultation" };
const hospitalMock = { id: "hospital1", name: "City Hospital" };

// Mock the Firebase Firestore data
beforeEach(async () => {
  db.getDocs.mockResolvedValue({
    docs: [
      {
        id: hospitalMock.id,
        data: () => ({ name: hospitalMock.name }),
      },
    ],
  });

  // Mock the appointment data
  db.getDocs.mockResolvedValueOnce({
    docs: [],
  });
});

describe("AppointmentModal", () => {
  test("renders correctly and creates appointment on valid input", async () => {
    render(
      <AppointmentModal
        isOpen={true}
        onClose={jest.fn()}
        service={serviceMock}
      />
    );

    // Select hospital
    fireEvent.change(screen.getByLabelText(/hospital/i), {
      target: { value: hospitalMock.id },
    });

    // Select date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: tomorrow.toISOString().split("T")[0] },
    });

    // Select time
    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/create appointment/i));

    // Expect the user to be redirected
    await waitFor(() => {
      expect(window.location.href).toContain("/payment-gateway");
    });
  });

  test("shows error for selecting a past date", async () => {
    render(
      <AppointmentModal
        isOpen={true}
        onClose={jest.fn()}
        service={serviceMock}
      />
    );

    // Select hospital
    fireEvent.change(screen.getByLabelText(/hospital/i), {
      target: { value: hospitalMock.id },
    });

    // Select a past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: yesterday.toISOString().split("T")[0] },
    });

    // Select time
    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/create appointment/i));

    // Expect to see the error message
    expect(
      await screen.findByText(/please select a date that is tomorrow or later/i)
    ).toBeInTheDocument();
  });

  test("does not create appointment if hospital is not selected", async () => {
    render(
      <AppointmentModal
        isOpen={true}
        onClose={jest.fn()}
        service={serviceMock}
      />
    );

    // Select date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: tomorrow.toISOString().split("T")[0] },
    });

    // Select time
    fireEvent.change(screen.getByLabelText(/time/i), {
      target: { value: "09:00" },
    });

    // Submit the form
    fireEvent.click(screen.getByText(/create appointment/i));

    // Expect the error message to be present
    expect(
      await screen.findByText(/please select a hospital/i)
    ).toBeInTheDocument();
  });
});
