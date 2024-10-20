import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/client/auth/Login'; // Adjust the import path as necessary
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import '@testing-library/jest-dom'; // Import jest-dom for additional matchers

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})), // Mock getAuth to return a mock auth object
    signInWithEmailAndPassword: jest.fn(),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})), // Mock getFirestore to return a mock Firestore object
    doc: jest.fn(),
    getDoc: jest.fn(),
}));

describe('Login', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    });

    test('should log in successfully', async () => {
        // Mock user credentials
        const mockUserCredential = {
            user: { uid: '12345', email: 'john@example.com' },
        };

        // Mock Firestore user data
        const mockUserData = { role: 'patient' };
        
        // Set up mocks
        signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

        // Fill in the login form
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            // Verify that signInWithEmailAndPassword was called once
            expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'john@example.com', 'Password123');
        });
    });

    test('should show error message for unauthorized role', async () => {
        // Mock user credentials
        const mockUserCredential = {
            user: { uid: '12345', email: 'john@example.com' },
        };

        // Mock Firestore user data with unauthorized role
        const mockUserData = { role: 'admin' };

        // Set up mocks
        signInWithEmailAndPassword.mockResolvedValueOnce(mockUserCredential);
        getDoc.mockResolvedValueOnce({ exists: () => true, data: () => mockUserData });

        // Fill in the login form
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Unauthorized access. Please contact support./i)).toBeInTheDocument();
        });
    });

    test('should show error message for login failure', async () => {
        // Set up mock to simulate login failure
        signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Login failed'));

        // Fill in the login form
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/Login failed. Please check your credentials and try again./i)).toBeInTheDocument();
        });
    });
});
