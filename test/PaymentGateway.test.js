import { submitPayment } from "../src/utils/CreateTransaction"; // Adjust the import path
import {
  addDoc,
  setDoc,
  collection,
  doc,
  getFirestore,
} from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn((_, __, id) => ({ id })),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
}));

describe("submitPayment", () => {
  const mockData = {
    hospitalId: "hospital123",
    amount: 100,
    serviceId: "service456",
    paymentType: "card",
    date: "2024-10-20",
    time: "10:00 AM",
    userId: "user789",
    userName: "John Doe",
    cardNumber: "4111111111111111",
    policyNumber: "policy123",
    providerName: "InsuranceProvider",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should successfully submit payment and create appointment and transaction", async () => {
    const mockAppointmentRef = { id: "appointment123" };
    const mockTransactionRef = { id: "transaction123" };

    addDoc.mockResolvedValueOnce(mockAppointmentRef);
    addDoc.mockResolvedValueOnce(mockTransactionRef);

    const result = await submitPayment(mockData);

    expect(addDoc).toHaveBeenCalledTimes(2);
    expect(addDoc).toHaveBeenCalledWith(
      collection(getFirestore(), "appointments"),
      expect.objectContaining({
        hospitalId: "hospital123",
        amount: 100,
        serviceId: "service456",
        paymentType: "card",
        date: "2024-10-20",
        time: "10:00 AM",
        userId: "user789",
        userName: "John Doe",
        status: "Scheduled",
        timestamp: expect.any(Date),
      })
    );
    expect(addDoc).toHaveBeenCalledWith(
      collection(getFirestore(), "transactions"),
      expect.objectContaining({
        appointmentId: "appointment123",
        amount: 100,
        paymentType: "card",
        userId: "user789",
        userName: "John Doe",
        cardNumber: "4111111111111111", // Expect cardNumber to be included
        status: "Paid",
        timestamp: expect.any(Date),
      })
    );
    expect(setDoc).toHaveBeenCalledWith(
      doc(getFirestore(), "appointments", mockAppointmentRef.id),
      { transactionId: "transaction123" },
      { merge: true }
    );
    expect(result).toEqual({ success: true, message: "Payment successful!" });
  });

  test("should handle insurance payment and create appointment and transaction", async () => {
    const mockDataInsurance = { ...mockData, paymentType: "insurance" };
    const mockAppointmentRef = { id: "appointment456" };
    const mockTransactionRef = { id: "transaction456" };

    addDoc.mockResolvedValueOnce(mockAppointmentRef);
    addDoc.mockResolvedValueOnce(mockTransactionRef);

    const result = await submitPayment(mockDataInsurance);

    expect(addDoc).toHaveBeenCalledTimes(2);
    expect(addDoc).toHaveBeenCalledWith(
      collection(getFirestore(), "appointments"),
      expect.objectContaining({
        hospitalId: "hospital123",
        amount: 100,
        serviceId: "service456",
        paymentType: "insurance",
        date: "2024-10-20",
        time: "10:00 AM",
        userId: "user789",
        userName: "John Doe",
        status: "Pending",
        timestamp: expect.any(Date),
      })
    );
    expect(addDoc).toHaveBeenCalledWith(
      collection(getFirestore(), "transactions"),
      expect.objectContaining({
        appointmentId: "appointment456",
        amount: 100,
        paymentType: "insurance",
        userId: "user789",
        userName: "John Doe",
        policyNumber: "policy123", // Expect policyNumber to be included
        providerName: "InsuranceProvider", // Expect providerName to be included
        status: "Under Review",
        timestamp: expect.any(Date),
      })
    );
    expect(setDoc).toHaveBeenCalledWith(
      doc(getFirestore(), "appointments", mockAppointmentRef.id),
      { transactionId: "transaction456" },
      { merge: true }
    );
    expect(result).toEqual({ success: true, message: "Payment successful!" });
  });

  test("should return an error message when payment processing fails", async () => {
    // Simulate payment processing failure
    jest.spyOn(Math, "random").mockReturnValueOnce(0); // Always return 0 for the random check

    const result = await submitPayment(mockData);

    expect(result).toEqual({
      success: false,
      message: "Payment processing failed. Please try again.",
    });
  });
});
