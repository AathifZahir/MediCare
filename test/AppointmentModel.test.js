import { render, fireEvent, screen } from "@testing-library/react";
import AppointmentModal from "../src/components/AppointmentModal"; // Adjust path
import { collection, getDocs } from "firebase/firestore";
import { mockFirestore } from "firebase-mock";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

describe("AppointmentModal", () => {
  const hospitalsMock = [
    { id: "hospital1", name: "General Hospital" },
    { id: "hospital2", name: "City Clinic" },
  ];

  beforeEach(() => {
    getDocs.mockResolvedValue({
      docs: hospitalsMock.map((hospital) => ({
        id: hospital.id,
        data: () => hospital,
      })),
    });
  });

  it("should render hospitals dropdown", async () => {
    render(
      <AppointmentModal
        isOpen={true}
        onClose={jest.fn()}
        service={{ id: 1, name: "Consultation" }}
      />
    );

    // Wait for hospitals to be fetched
    const hospitalOptions = await screen.findAllByRole("option");
    expect(hospitalOptions.length).toBe(hospitalsMock.length + 1); // Includes default 'Select a hospital'
  });

  it("should show error for past date", async () => {
    render(
      <AppointmentModal
        isOpen={true}
        onClose={jest.fn()}
        service={{ id: 1, name: "Consultation" }}
      />
    );

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });

    const submitButton = screen.getByText(/create appointment/i);
    fireEvent.click(submitButton);

    expect(
      screen.getByText(/please select a date that is tomorrow or later/i)
    ).toBeInTheDocument();
  });

  it("should disable booked time slots", async () => {
    // Add mock booked appointments logic and check if time slots are disabled
  });
});
