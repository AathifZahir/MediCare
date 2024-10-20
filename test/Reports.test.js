import { AddReports, editReport, deleteReport } from '../src/pages/admin/AddReports';
import { addDoc, updateDoc, deleteDoc, collection, doc, getFirestore } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    doc: jest.fn((_, __, id) => ({ id })),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

describe('ReportsController', () => {
    const mockReportData = {
        customerId: '12345',
        patientName: 'John Doe',
        selectedDoctor: 'doctor123',
        reportType: 'Blood Test',
        reportCategory: 'Routine',
        doctorComments: 'All good.',
        testDate: '2024-10-20',
        reportFile: { name: 'report.pdf' },
        downloadURL: 'https://example.com/report.pdf',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should add a report successfully', async () => {
        const mockDocRef = { id: 'mockDocId' };
        addDoc.mockResolvedValueOnce(mockDocRef);

        const result = await AddReports(mockReportData);

        expect(addDoc).toHaveBeenCalledTimes(1);
        expect(addDoc).toHaveBeenCalledWith(
            collection(getFirestore(), 'reports'),
            mockReportData
        );
        expect(result).toEqual(mockDocRef);
    });

    test('should edit a report successfully', async () => {
        const updatedData = { reportType: 'X-Ray', doctorComments: 'Revised diagnosis.' };
        const reportId = 'mockReportId';

        await editReport(reportId, updatedData);

        expect(updateDoc).toHaveBeenCalledTimes(1);
        expect(updateDoc).toHaveBeenCalledWith(
            doc(getFirestore(), 'reports', reportId),
            updatedData
        );
    });

    test('should delete a report successfully', async () => {
        const reportId = 'mockReportId';

        await deleteReport(reportId);

        expect(deleteDoc).toHaveBeenCalledTimes(1);
        expect(deleteDoc).toHaveBeenCalledWith(
            doc(getFirestore(), 'reports', reportId)
        );
    });

    test('should throw an error when adding a report with missing fields', async () => {
        const invalidReportData = { ...mockReportData, customerId: '' };

        await expect(AddReports(invalidReportData)).rejects.toThrow('Missing required fields');
        expect(addDoc).toHaveBeenCalledTimes(0);
    });

    test('should throw an error when trying to edit a report without an ID', async () => {
        const updatedData = { reportType: 'X-Ray' };

        await expect(editReport('', updatedData)).rejects.toThrow('Missing report ID');
        expect(updateDoc).toHaveBeenCalledTimes(0);
    });

    test('should throw an error when trying to delete a report without an ID', async () => {
        await expect(deleteReport('')).rejects.toThrow('Missing report ID');
        expect(deleteDoc).toHaveBeenCalledTimes(0);
    });
});
