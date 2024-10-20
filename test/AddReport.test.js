
/*
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddReport from '../src/pages/admin/AddReport'; // Adjust the import path as necessary
import { addDoc } from 'firebase/firestore'; // Importing Firestore's addDoc function

// Mock Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    addDoc: jest.fn().mockResolvedValue({}), // Mock addDoc to resolve with an empty object
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: {
            uid: 'mockUserId', // Mock user ID, no role checking needed
        },
    })),
}));

// Mock the getUserRole module to ignore any role checks
jest.mock('../src/utils/getUserRole', () => ({
    getUserRole: jest.fn(() => 'admin'), // You can set it to 'admin' or any default role
}));

describe('AddReport', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <AddReport />
            </MemoryRouter>
        );
    });

    test('renders without crashing', () => {
        expect(screen.getByText(/Submit Report/i)).toBeInTheDocument();
    });

    test('should submit the report form successfully', async () => {
        fireEvent.change(screen.getByPlaceholderText('Customer ID'), { target: { value: '12345' } });
        fireEvent.change(screen.getByPlaceholderText('Patient Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Select Doctor'), { target: { value: 'doctor123' } });
        fireEvent.change(screen.getByPlaceholderText('Report Type'), { target: { value: 'Blood Test' } });
        fireEvent.change(screen.getByPlaceholderText('Report Category'), { target: { value: 'Routine' } });
        fireEvent.change(screen.getByPlaceholderText('Doctor Comments'), { target: { value: 'All good.' } });
        fireEvent.change(screen.getByLabelText(/Test Date/i), { target: { value: '2024-10-20' } });
        fireEvent.change(screen.getByPlaceholderText('Report File'), { target: { value: 'report.pdf' } });
        fireEvent.change(screen.getByPlaceholderText('Download URL'), { target: { value: 'https://example.com/report.pdf' } });

        // Submit the form
        fireEvent.click(screen.getByText(/Submit Report/i));

        await waitFor(() => {
            // Verify that addDoc was called once
            expect(addDoc).toHaveBeenCalledTimes(1);
            expect(addDoc).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
                customerId: '12345',
                patientName: 'John Doe',
                selectedDoctor: 'doctor123',
                reportType: 'Blood Test',
                reportCategory: 'Routine',
                doctorComments: 'All good.',
                testDate: '2024-10-20',
                reportFile: { name: 'report.pdf' },
                downloadURL: 'https://example.com/report.pdf',
            }));
        });
    });

    test('should handle submission error', async () => {
        // Mock addDoc to reject with an error
        addDoc.mockRejectedValueOnce(new Error('Error adding report'));

        fireEvent.change(screen.getByPlaceholderText('Customer ID'), { target: { value: '12345' } });
        fireEvent.change(screen.getByPlaceholderText('Patient Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Select Doctor'), { target: { value: 'doctor123' } });
        fireEvent.change(screen.getByPlaceholderText('Report Type'), { target: { value: 'Blood Test' } });
        fireEvent.change(screen.getByPlaceholderText('Report Category'), { target: { value: 'Routine' } });
        fireEvent.change(screen.getByPlaceholderText('Doctor Comments'), { target: { value: 'All good.' } });
        fireEvent.change(screen.getByLabelText(/Test Date/i), { target: { value: '2024-10-20' } });
        fireEvent.change(screen.getByPlaceholderText('Report File'), { target: { value: 'report.pdf' } });
        fireEvent.change(screen.getByPlaceholderText('Download URL'), { target: { value: 'https://example.com/report.pdf' } });

        // Submit the form
        fireEvent.click(screen.getByText(/Submit Report/i));

        await waitFor(() => {
            // Verify that the error message is displayed
            expect(screen.getByText(/Error adding report/i)).toBeInTheDocument();
        });
    });
});

*/