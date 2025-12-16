import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as router from 'react-router-dom'; // <-- IMPORTANT
import { SignUpForm } from '@/Components/Auth/SignUpForm';
import { toast } from 'sonner';
import { useStore } from '@/hooks';

// Mock dependencies
jest.mock('sonner');
jest.mock('@/hooks', () => ({
  useStore: jest.fn(),
  useEnter: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));


const mockNavigate = jest.fn();
const mockMemberSignup = jest.fn();

// Helper to render component with router
const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <SignUpForm />
    </MemoryRouter>
  );
};

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useStore as unknown as jest.Mock).mockReturnValue({
      memberSignup: mockMemberSignup,
    });

    // FIXED: no more require()
    jest.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate);
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      renderWithRouter();

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('renders sign up button', () => {
      renderWithRouter();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders login link', () => {
      renderWithRouter();
      expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login');
    });

    
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('validates password confirmation match', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'different123');
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const passwordInput = screen.getByPlaceholderText(/^enter your password$/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      const passwordToggle = toggleButtons[0];

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles confirm password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const confirmInput = screen.getByPlaceholderText(/confirm your password/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      const confirmToggle = toggleButtons[1];

      expect(confirmInput).toHaveAttribute('type', 'password');

      await user.click(confirmToggle);
      expect(confirmInput).toHaveAttribute('type', 'text');

      await user.click(confirmToggle);
      expect(confirmInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockResolvedValue(true);
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), validFormData.firstName);
      await user.type(screen.getByPlaceholderText(/enter your last name/i), validFormData.lastName);
      await user.type(screen.getByPlaceholderText(/enter your username/i), validFormData.username);
      await user.type(screen.getByPlaceholderText(/enter your email/i), validFormData.email);
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), validFormData.password);
      await user.type(screen.getByPlaceholderText(/confirm your password/i), validFormData.confirmPassword);

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(mockMemberSignup).toHaveBeenCalledWith(
          expect.objectContaining(validFormData)
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockImplementation(
        () => new Promise(res => setTimeout(() => res(true), 100))
      );
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), validFormData.firstName);
      await user.type(screen.getByPlaceholderText(/enter your last name/i), validFormData.lastName);
      await user.type(screen.getByPlaceholderText(/enter your username/i), validFormData.username);
      await user.type(screen.getByPlaceholderText(/enter your email/i), validFormData.email);
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), validFormData.password);
      await user.type(screen.getByPlaceholderText(/confirm your password/i), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('shows success toast and navigates on successful signup', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockResolvedValue(true);
      jest.useFakeTimers();
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), validFormData.firstName);
      await user.type(screen.getByPlaceholderText(/enter your last name/i), validFormData.lastName);
      await user.type(screen.getByPlaceholderText(/enter your username/i), validFormData.username);
      await user.type(screen.getByPlaceholderText(/enter your email/i), validFormData.email);
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), validFormData.password);
      await user.type(screen.getByPlaceholderText(/confirm your password/i), validFormData.confirmPassword);

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.loading).toHaveBeenCalledWith('Creating your account...');
        expect(toast.success).toHaveBeenCalledWith('Successfully signed up. Welcome!', { duration: 3000 });
      });

      jest.advanceTimersByTime(500);
      expect(mockNavigate).toHaveBeenCalledWith('/welcome-test');

      jest.useRealTimers();
    });

    it('prevents double submission', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockImplementation(
        () => new Promise(res => setTimeout(() => res(true), 100))
      );
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), validFormData.firstName);
      await user.type(screen.getByPlaceholderText(/enter your last name/i), validFormData.lastName);
      await user.type(screen.getByPlaceholderText(/enter your username/i), validFormData.username);
      await user.type(screen.getByPlaceholderText(/enter your email/i), validFormData.email);
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), validFormData.password);
      await user.type(screen.getByPlaceholderText(/confirm your password/i), validFormData.confirmPassword);

      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMemberSignup).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles username already taken error', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockRejectedValue({
        response: { data: { message: 'Username already exists' } }
      });
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/enter your last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/enter your username/i), 'existinguser');
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Username is already taken');
      });
    });

    it('handles email already registered error', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockRejectedValue({
        response: { data: { message: 'Email is already in use' } }
      });
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/enter your last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/enter your username/i), 'johndoe');
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'existing@example.com');
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email is already registered');
      });
    });

    it('handles transaction/retry errors', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockRejectedValue({
        message: 'Transaction failed, please retry'
      });
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/enter your last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/enter your username/i), 'johndoe');
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Server is busy. Please try again in a moment.',
          { duration: 5000 }
        );
      });
    });

    it('handles generic errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Something went wrong';
      mockMemberSignup.mockRejectedValue(new Error(errorMessage));
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/enter your last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/enter your username/i), 'johndoe');
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('Accessibility', () => {
    it('disables all inputs during submission', async () => {
      const user = userEvent.setup();
      mockMemberSignup.mockImplementation(
        () => new Promise(res => setTimeout(() => res(true), 100))
      );
      renderWithRouter();

      await user.type(screen.getByPlaceholderText(/enter your first name/i), 'John');
      await user.type(screen.getByPlaceholderText(/enter your last name/i), 'Doe');
      await user.type(screen.getByPlaceholderText(/enter your username/i), 'johndoe');
      await user.type(screen.getByPlaceholderText(/enter your email/i), 'john@example.com');
      await user.type(screen.getByPlaceholderText(/^enter your password$/i), 'password123');
      await user.type(screen.getByPlaceholderText(/confirm your password/i), 'password123');

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(screen.getByPlaceholderText(/enter your first name/i)).toBeDisabled();
      expect(screen.getByPlaceholderText(/enter your last name/i)).toBeDisabled();
      expect(screen.getByPlaceholderText(/enter your username/i)).toBeDisabled();
      expect(screen.getByPlaceholderText(/enter your email/i)).toBeDisabled();
    });
  });
});
