export const createAppointmentUrl = (
  hospitalId,
  date,
  time,
  serviceId,
  onClose,
  setError
) => {
  // Check for required fields
  if (!hospitalId || !date || !time) {
    setError("All fields must be filled.");
    return;
  }

  // Check if date is in the past
  const appointmentDate = new Date(date);
  const today = new Date();
  if (appointmentDate < today) {
    setError("Please select a date that is tomorrow or later.");
    return;
  }

  // Create the appointment URL
  window.location.href = `/payment-gateway?hospitalId=${hospitalId}&date=${date}&time=${time}&serviceId=${serviceId}`;

  // Close the modal
  onClose();
};
