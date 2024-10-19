import { render, fireEvent, screen } from "@testing-library/react";
import PaymentGateway from "../src/pages/client/PaymentGateway"; // Adjust path
import { doc, getDoc } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

describe("PaymentGateway", () => {
  beforeEach(() => {
    // Mock user data
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ firstName: "John", lastName: "Doe" }),
    });
  });

  it("should display user name and default service amount", async () => {
    render(<PaymentGateway />);

    // Check for the user's name
    const userName = await screen.findByText(/John Doe/i);
    expect(userName).toBeInTheDocument();

    // Check service fee
    const amountInput = screen.getByDisplayValue("1500"); // Assuming service fee is LKR 1500
    expect(amountInput).toBeInTheDocument();
  });

  it("should show error when card details are missing", () => {
    render(<PaymentGateway />);

    // Trigger form submission with empty card details
    fireEvent.click(screen.getByText(/submit/i));

    expect(
      screen.getByText(/please fill in all card details/i)
    ).toBeInTheDocument();
  });
});
