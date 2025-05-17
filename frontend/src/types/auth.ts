export interface User {
  id: string;
  name: string;
  email: string;
  role: 'legal' | 'public';
  approve: boolean;
  phone: string;
  address: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
  phone: string;
  address: string;
} 