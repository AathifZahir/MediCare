import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../src/pages/client/auth/Register'; // Adjust the import path as necessary
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({ /* mock any necessary methods here */ })),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
        user: { uid: '12345' }, // Mock user object
    }),
}));

describe('SignUp', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );
    });

    test('should submit the form successfully', async () => {
        // Fill the form fields
        fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: '123 Main St' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            // Verify that createUserWithEmailAndPassword was called once
            expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                expect.any(Object), // auth object
                'john@example.com',
                'Password123'
            );
        });
    });
});
