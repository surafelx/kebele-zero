import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── API mock ────────────────────────────────────────────────────────────────

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

jest.mock('../../services/api', () => ({ __esModule: true, default: mockApi }));

import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// ── Helper component ───────────────────────────────────────────────────────

function AuthConsumer() {
  const { user, loading, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="role">{user?.role ?? ''}</span>
      <button onClick={() => login('a@b.com', 'pass')} data-testid="login">login</button>
      <button onClick={() => register({ username: 'u', email: 'a@b.com', password: 'p' })} data-testid="register">register</button>
      <button onClick={() => logout()} data-testid="logout">logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    spy.mockRestore();
  });

  it('starts loading and resolves when no token exists', async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  it('user is null when no token in localStorage', async () => {
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('restores user when a valid token is in localStorage', async () => {
    localStorageMock.setItem('kz_token', 'fake-token');
    mockApi.get.mockResolvedValueOnce({
      data: {
        user: {
          _id: 'user-1',
          id: 'user-1',
          email: 'test@example.com',
          username: 'tester',
          role: 'user',
        },
      },
    });
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });
    expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
  });

  it('clears token when /auth/me fails', async () => {
    localStorageMock.setItem('kz_token', 'bad-token');
    mockApi.get.mockRejectedValueOnce(new Error('401 Unauthorized'));
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
    expect(localStorageMock.getItem('kz_token')).toBeNull();
  });

  it('login calls POST /auth/login and sets user', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        token: 'new-token',
        user: { _id: 'u1', id: 'u1', email: 'a@b.com', username: 'tester', role: 'user' },
      },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      await userEvent.click(screen.getByTestId('login'));
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });
    expect(localStorageMock.getItem('kz_token')).toBe('new-token');
  });

  it('login re-throws when API returns an error', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    let caughtError: unknown;
    function LoginTester() {
      const { login } = useAuth();
      return (
        <button
          onClick={() => login('a@b.com', 'bad').catch((e) => { caughtError = e; })}
          data-testid="direct-login"
        />
      );
    }
    render(<AuthProvider><LoginTester /></AuthProvider>);
    await waitFor(() => {});

    await act(async () => {
      await userEvent.click(screen.getByTestId('direct-login'));
    });
    await waitFor(() => expect(caughtError).toBeInstanceOf(Error));
  });

  it('register calls POST /auth/register and sets user', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        token: 'reg-token',
        user: { _id: 'u2', id: 'u2', email: 'a@b.com', username: 'u', role: 'user' },
      },
    });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      await userEvent.click(screen.getByTestId('register'));
    });

    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
      username: 'u',
      email: 'a@b.com',
      password: 'p',
    });
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    });
  });

  it('logout removes token and clears user', async () => {
    localStorageMock.setItem('kz_token', 'some-token');
    mockApi.get.mockResolvedValueOnce({
      data: {
        user: { _id: 'u1', id: 'u1', email: 'test@example.com', username: 'u', role: 'user' },
      },
    });
    renderAuth();
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
    expect(localStorageMock.getItem('kz_token')).toBeNull();
  });
});
