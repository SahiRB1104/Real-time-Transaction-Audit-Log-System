import api from './axios.ts';
import { AuthResponse, User } from '../types.ts';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Login user
 * Returns JWT access token
 */
export const loginUser = (credentials: LoginCredentials) =>
  api.post<AuthResponse>('/login', credentials);

/**
 * Register new user
 * Returns created user object
 */
export const registerUser = (userData: RegisterPayload) =>
  api.post<User>('/register', userData);
