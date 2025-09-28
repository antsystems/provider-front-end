export interface User {
  id: string;
  uid?: string;
  email?: string;
  name?: string;
  displayName?: string;
  emailVerified?: boolean;
  role: 'rm' | 'rp' | 'employee' | 'hospital_admin';
  roles?: string[];
  status?: string;
  phone?: string;
  employee_name?: string;
  corporate_name?: string;
  dependents?: Dependent[];
  entity_assignments?: {
    hospitals?: Array<{
      id: string;
      name: string;
    }>;
  };
  assignedEntity?: {
    type: 'hospital' | 'provider' | 'corporate';
    id: string;
    name: string;
  };
}

export interface Dependent {
  name: string;
  relation: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PhoneLoginCredentials {
  phone: string;
  otp: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token?: string;
  user: User;
}

export interface PhoneLoginResponse {
  success: boolean;
  token: string;
  uid: string;
  role: string;
  employee_name: string;
  corporate_name: string;
  dependents: Dependent[];
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

export interface FirebaseVerifyResponse {
  success: boolean;
  user: User;
}

export type ProfileResponse = User;

export interface TokenValidationResponse {
  valid: boolean;
  user?: User;
  message?: string;
}