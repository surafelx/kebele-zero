import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));

import AuthModal from '../../components/AuthModal';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  feature: 'Forum',
};

describe('AuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue(undefined);
    mockRegister.mockResolvedValue(undefined);
  });

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    render(<AuthModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('shows the sign-in form by default', () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  // ── Mode toggle ────────────────────────────────────────────────────────────

  it('shows "Create Account" title after toggling to sign-up', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    expect(screen.getByText('Create Account', { selector: 'h3' })).toBeInTheDocument();
  });

  it('shows username field in sign-up mode', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
  });

  it('shows confirm password field in sign-up mode', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  it('toggles back to sign-in when clicking "Sign In"', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('resets form fields when toggling modes', async () => {
    render(<AuthModal {...defaultProps} />);
    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    await userEvent.type(emailInput, 'test@test.com');
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.click(screen.getByText('Sign In'));
    expect(emailInput.value).toBe('');
  });

  // ── Sign-in submission ─────────────────────────────────────────────────────

  it('calls login with email and password on sign-in', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'secret');
    });
  });

  it('calls onClose after successful sign-in', async () => {
    const onClose = jest.fn();
    render(<AuthModal {...defaultProps} onClose={onClose} />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows error message when login throws', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<AuthModal {...defaultProps} />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  // ── Sign-up submission ─────────────────────────────────────────────────────

  it('shows error when passwords do not match', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'u1');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass1');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'pass2');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls register when sign-up form is valid', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'tester');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'tester', email: 'a@b.com', password: 'pass123' })
      );
    });
  });

  it('shows confirmation screen after successful registration', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'tester');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText('Account created!')).toBeInTheDocument();
    });
  });

  it('"Go to Sign In" button resets to login view', async () => {
    render(<AuthModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Create Account'));
    await userEvent.type(screen.getByPlaceholderText('Enter your username'), 'tester');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => screen.getByText('Account created!'));
    await userEvent.click(screen.getByText('Go to Sign In'));
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  // ── Keyboard ───────────────────────────────────────────────────────────────

  it('closes on Escape key press', () => {
    const onClose = jest.fn();
    render(<AuthModal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  // ── Feature label ──────────────────────────────────────────────────────────

  it('shows the feature name in the subtitle', () => {
    render(<AuthModal {...defaultProps} feature="Radio" />);
    expect(screen.getByText('Sign in to access Radio')).toBeInTheDocument();
  });
});
