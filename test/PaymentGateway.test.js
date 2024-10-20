// PaymentGateway.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // For routing
import PaymentGateway from "./PaymentGateway"; // Adjust the import path as needed
import auth from "../../firebase/auth"; // Import your auth instance
import db from "../../firebase/firestore"; // Import your Firestore config
import { addDoc } from "firebase/firestore"; // Import addDoc

// Mocking Firestore addDoc function
jest.mock("../../firebase/firestore", () => ({
  ...jest.requireActual("../../firebase/firestore"),
  addDoc: jest.fn(),
}));

// Mock the auth instance
jest.mock("../../firebase/auth", () => ({
  currentUser: { uid: "testUserId" },
}));

describe("PaymentGateway Component", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <PaymentGateway />
      </MemoryRouter>
    );
  });

  it("should successfully process a card payment", async () => {
    fireEvent.click(screen.getByText("Card"));
    fireEvent.change(screen.getByPlaceholderText("1234 5678 9012 3456"), {
      target: { value: "1234567812345678" },
    });
    fireEvent.change(screen.getByPlaceholderText("MM/YY"), {
      target: { value: "12/25" },
    });
    fireEvent.change(screen.getByPlaceholderText("123"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByText(/Pay Now LKR/i));

    // Mock successful payment
    addDoc.mockResolvedValueOnce({ id: "testAppointmentId" });

    await waitFor(() => {
      expect(screen.getByText("Payment successful!")).toBeInTheDocument();
    });
  });

  it("should show an error message for missing card details", async () => {
    fireEvent.click(screen.getByText("Card")); // Select card payment
    fireEvent.click(screen.getByText(/Pay Now LKR/i)); // Attempt to submit

    // Expect error message to appear
    expect(
      await screen.findByText("Please fill in all card details.")
    ).toBeInTheDocument();
  });

  it("should handle the submission of insurance payment and show success message", async () => {
    fireEvent.click(screen.getByText("Insurance"));
    fireEvent.change(screen.getByPlaceholderText("Policy Number"), {
      target: { value: "POL123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Insurance Provider"), {
      target: { value: "Health Insurance" },
    });

    fireEvent.click(screen.getByText(/Pay Now LKR/i));

    // Mock successful payment
    addDoc.mockResolvedValueOnce({ id: "testAppointmentId" });

    await waitFor(() => {
      expect(screen.getByText("Payment successful!")).toBeInTheDocument();
    });
  });

  it("should show an error message for missing insurance details", async () => {
    fireEvent.click(screen.getByText("Insurance")); // Select insurance payment
    fireEvent.click(screen.getByText(/Pay Now LKR/i)); // Attempt to submit

    // Expect error message to appear
    expect(
      await screen.findByText("Please fill in all insurance details.")
    ).toBeInTheDocument();
  });
});
