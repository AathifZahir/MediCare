import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import db from "../../firebase/firestore"; // Firestore instance
import HomeSidebar from "../../components/HomeNavbar";

export default function ViewReport() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
   
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "reports"),
            where("patientId", "==", user.uid)
          );
          const reportSnapshot = await getDocs(q);
          if (!reportSnapshot.empty) {
            const reportData = reportSnapshot.docs[0].data(); // Assuming you want the first report found
            console.log("Report Data:", reportData); // Log data here
            setReport(reportData);
          } else {
            setError("No report found for this user.");
          }
        } catch (err) {
          console.error("Error fetching report:", err);
          setError("Failed to load report. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login"); // Redirect to login if not authenticated
      }
    });
  }, [navigate]);

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
      return date.toLocaleString(); // Format the date as needed
    }
    return "N/A"; // Default value if timestamp is invalid
  };

  if (loading) {
    return <div className="text-center mt-10">Loading report...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div>
      <HomeSidebar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Report Details
          </h2>

          {report && (
            <>
              <div className="mb-4">
                <strong>Patient Name:</strong> {report.patientName}
              </div>
              <div className="mb-4">
                <strong>Report Category:</strong> {report.reportCategory}
              </div>
              <div className="mb-4">
                <strong>Report Type:</strong> {report.reportType}
              </div>
              <div className="mb-4">
                <strong>Doctor's Comments:</strong>{" "}
                {report.doctorComments || "No comments provided."}
              </div>
              <div className="mb-4">
                <strong>Test Date:</strong> {report.testDate}
              </div>
              <div className="mb-4">
                <strong>Uploaded At:</strong> {formatDate(report.uploadedAt)}{" "}
                {/* Format the uploadedAt date */}
              </div>

              <a
                href={report.reportURL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Download Report
              </a>
            </>
          )}

          {!report && <p>No report data available.</p>}
        </div>
      </div>
    </div>
  );
}
