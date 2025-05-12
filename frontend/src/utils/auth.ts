import { AuthState } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  role?: 'legal' | 'advocate' | 'public';
}

export const login = async (credentials: LoginCredentials): Promise<AuthState> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  const authState: AuthState = {
    user: data.user,
    token: data.token,
  };

  localStorage.setItem('authState', JSON.stringify(authState));
  return authState;
};

export const signup = async (credentials: SignupCredentials): Promise<AuthState> => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  const data = await response.json();
  const authState: AuthState = {
    user: data.user,
    token: data.token,
  };

  localStorage.setItem('authState', JSON.stringify(authState));
  return authState;
};

export const logout = (): void => {
  localStorage.removeItem('authState');
};

export const getAuthState = (): AuthState | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('authState');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthState() !== null;
}; 