import { setDoc, addDoc, collection, doc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore"; // Import Firestore methods

export const submitPayment = async (data) => {
  const {
    hospitalId,
    amount,
    serviceId,
    paymentType,
    date,
    time,
    userId,
    userName,
    cardNumber,
    policyNumber,
    providerName,
  } = data;

  try {
    const paymentSuccess = true; // Simulate a payment success

    if (paymentSuccess) {
      // Create the appointment data
      const appointmentData = {
        hospitalId,
        amount: Number(amount),
        serviceId,
        paymentType,
        date,
        time,
        userId,
        userName,
        timestamp: new Date(),
      };

      // Set status based on payment type
      if (paymentType === "card") {
        appointmentData.status = "Scheduled";
      } else if (paymentType === "insurance") {
        appointmentData.status = "Pending";
      }

      // Get Firestore instance
      const firestore = getFirestore(); // Get the Firestore instance

      // Create the appointment document and get its ID
      const appointmentRef = await addDoc(
        collection(firestore, "appointments"),
        appointmentData
      );
      const appointmentId = appointmentRef.id;

      // Create transaction data
      const transactionData = {
        appointmentId,
        amount: Number(amount),
        paymentType,
        userId,
        userName,
        timestamp: new Date(),
        hospitalId,
      };

      // Add specific fields based on payment type
      if (paymentType === "card") {
        transactionData.cardNumber = cardNumber;
        transactionData.status = "Paid";
      } else if (paymentType === "insurance") {
        transactionData.policyNumber = policyNumber;
        transactionData.providerName = providerName;
        transactionData.status = "Under Review";
      }

      // Store the transaction in the transactions collection
      const transactionRef = await addDoc(
        collection(firestore, "transactions"),
        transactionData
      );
      const transactionId = transactionRef.id;

      // Update the appointment with the transaction ID
      await setDoc(
        doc(firestore, "appointments", appointmentId),
        { transactionId },
        { merge: true }
      );

      return { success: true, message: "Payment successful!" };
    } else {
      throw new Error("Payment processing failed. Please try again.");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      message: "Payment processing failed. Please try again.",
    };
  }
};
