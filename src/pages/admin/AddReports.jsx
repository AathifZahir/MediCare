import { addDoc, updateDoc, deleteDoc, collection, doc, getFirestore } from 'firebase/firestore';

/**
 * Adds a new report to Firestore.
 */
export const AddReports = async (reportData) => {
    const { customerId, patientName, selectedDoctor, reportType, testDate } = reportData;

    if (!customerId || !patientName || !selectedDoctor || !reportType || !testDate) {
        throw new Error('Missing required fields');
    }

    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'reports'), reportData);
    return docRef;
};

/**
 * Edits an existing report in Firestore.
 */
export const editReport = async (reportId, updatedData) => {
    if (!reportId) throw new Error('Missing report ID');
    
    const db = getFirestore();
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, updatedData);
    return { id: reportId, ...updatedData };
};

/**
 * Deletes a report from Firestore.
 */
export const deleteReport = async (reportId) => {
    if (!reportId) throw new Error('Missing report ID');
    
    const db = getFirestore();
    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);
    return { id: reportId, status: 'deleted' };
};
