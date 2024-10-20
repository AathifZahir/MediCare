import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import HospitalPage from "../src/pages/admin/Hospital";
import { addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Mock Firestore and Auth functions
jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  getFirestore: jest.fn(),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "aBmezIYLZXcmUQ1n5jiS9juEdy33" },
  })),
}));

describe("HospitalPage Component - Add Hospital", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("adds a new hospital successfully", async () => {
    addDoc.mockResolvedValueOnce(); // Mock successful addition

    const { getByText, getByLabelText, debug } = render(<HospitalPage />);
    debug(); // Check the rendered output

    // Open the modal to add a hospital
    fireEvent.click(getByText("Add New Hospital"));

    // Check if the modal is open
    debug(); // Check the rendered output after clicking

    // Fill in the form fields
    fireEvent.change(getByLabelText(/Hospital Name/i), {
      target: { value: "New Hospital" },
    });
    fireEvent.change(getByLabelText(/Contact Number/i), {
      target: { value: "123123123" },
    });
    fireEvent.change(getByLabelText(/Location/i), {
      target: { value: "City C" },
    });
    fireEvent.change(getByLabelText(/Type/i), {
      target: { value: "Private" },
    });

    // Submit the form
    fireEvent.click(getByText("Add"));

    await waitFor(() => {
      // You can optionally check for any UI updates here
      // Example: expect(getByText("Hospital added successfully")).toBeInTheDocument();
      // Currently, we're not expecting anything as per your request.
    });
  });

  test("handles error during adding a hospital", async () => {
    addDoc.mockRejectedValueOnce(new Error("Add error")); // Mock error during addition

    const { getByText, getByLabelText, debug } = render(<HospitalPage />);
    debug(); // Check the rendered output

    // Open the modal to add a hospital
    fireEvent.click(getByText("Add New Hospital"));

    // Fill in the form fields
    fireEvent.change(getByLabelText(/Hospital Name/i), {
      target: { value: "New Hospital" },
    });
    fireEvent.change(getByLabelText(/Contact Number/i), {
      target: { value: "123123123" },
    });
    fireEvent.change(getByLabelText(/Location/i), {
      target: { value: "City C" },
    });
    fireEvent.change(getByLabelText(/Type/i), {
      target: { value: "Private" },
    });

    // Submit the form
    fireEvent.click(getByText("Add"));

    await waitFor(() => {
      // Check for error message if displayed in the UI
      expect(getByText("Error occurred")).toBeInTheDocument(); // Adjust based on your component's error handling
    });
  });
});
