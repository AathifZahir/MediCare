// test/AppointmentModel.test.js
import { createAppointmentUrl } from "../src/utils/CreateAppointment";

describe("createAppointmentUrl", () => {
  let mockOnClose;
  let mockSetError;

  beforeEach(() => {
    // Mock the onClose and setError functions
    mockOnClose = jest.fn();
    mockSetError = jest.fn();

    // Mock window.location.href
    delete window.location; // Delete the existing location object
    window.location = { href: "" }; // Create a new location object
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should create appointment and redirect to payment gateway on valid input", () => {
    const hospitalId = "123";
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10); // Tomorrow's date
    const time = "10:00";
    const serviceId = "abc";

    createAppointmentUrl(
      hospitalId,
      date,
      time,
      serviceId,
      mockOnClose,
      mockSetError
    );

    // Check that no error was set
    expect(mockSetError).not.toHaveBeenCalled(); // This should pass if the function logic is correct

    // Check that window.location.href was set correctly
    expect(window.location.href).toBe(
      `/payment-gateway?hospitalId=${hospitalId}&date=${date}&time=${time}&serviceId=${serviceId}`
    );

    // Check that onClose was called to close the modal
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("should set error when date is in the past", () => {
    const hospitalId = "123";
    const date = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // Yesterday's date
    const time = "10:00";
    const serviceId = "abc";

    createAppointmentUrl(
      hospitalId,
      date,
      time,
      serviceId,
      mockOnClose,
      mockSetError
    );

    // Check that an error was set for invalid date
    expect(mockSetError).toHaveBeenCalledWith(
      "Please select a date that is tomorrow or later."
    );

    // Check that no redirection happened
    expect(window.location.href).toBe("");

    // onClose should not be called due to error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("should set error when required parameters are missing", () => {
    const hospitalId = ""; // Missing hospitalId
    const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10); // Tomorrow's date
    const time = ""; // Missing time
    const serviceId = "abc";

    createAppointmentUrl(
      hospitalId,
      date,
      time,
      serviceId,
      mockOnClose,
      mockSetError
    );

    // Check that an error was set for missing parameters
    expect(mockSetError).toHaveBeenCalledWith("All fields must be filled.");

    // Check that no redirection happened
    expect(window.location.href).toBe("");

    // onClose should not be called due to error
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
