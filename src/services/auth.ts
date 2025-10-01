import axios, { AxiosInstance } from 'axios';
import { signInWithEmail } from './firebaseClient';
import type {
  LoginCredentials,
  PhoneLoginCredentials,
  LoginResponse,
  PhoneLoginResponse,
  OTPResponse,
  FirebaseVerifyResponse,
  ProfileResponse,
  TokenValidationResponse,
  User
} from '@/types/auth';

class AuthService {
  private api: AxiosInstance;
  private baseURL = 'https://provider-4.onrender.com/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearStoredAuth();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Direct API login for hospital admin users (PRIMARY LOGIN METHOD)
  async loginDirect(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔑 Starting login process with:', credentials.email);

      const response = await this.api.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('✅ Login successful, received response');

      if (response.data && response.data.access_token) {
        // Store the access token and user data
        this.storeAuth(response.data.access_token, response.data.user);

        console.log('💾 Auth data stored successfully');

        return {
          message: response.data.message,
          access_token: response.data.access_token,
          token: response.data.access_token,
          user: response.data.user
        };
      }

      throw new Error('Login response missing required data');
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  }

  // Email/Password login for RM/RP users using Firebase SDK
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Step 1: Firebase authentication to get ID token
      const { idToken, uid } = await signInWithEmail(credentials.email, credentials.password);

      // Step 2: Verify the Firebase ID token with backend to get complete user profile
      const verifyResponse = await this.verifyFirebaseToken(idToken);

      if (verifyResponse.success && verifyResponse.user) {
        // Store the Firebase ID token and complete user profile
        this.storeAuth(idToken, verifyResponse.user);

        return {
          message: 'Login successful',
          access_token: idToken,
          token: idToken,
          user: verifyResponse.user
        };
      }

      throw new Error('Backend verification failed');
    } catch (error: unknown) {
      // Handle Firebase auth errors specifically
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          throw new Error('No account found with this email address');
        }
        if (error.message.includes('auth/wrong-password')) {
          throw new Error('Incorrect password');
        }
        if (error.message.includes('auth/invalid-email')) {
          throw new Error('Invalid email address');
        }
        if (error.message.includes('auth/user-disabled')) {
          throw new Error('This account has been disabled');
        }
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    }
  }

  // Send OTP for employee login
  async sendOTP(phone: string): Promise<OTPResponse> {
    try {
      const response = await this.api.post<OTPResponse>('/employee/send-otp', { phone });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send OTP';
      throw new Error(errorMessage);
    }
  }

  // Verify OTP for employee login
  async verifyOTP(credentials: PhoneLoginCredentials): Promise<PhoneLoginResponse> {
    try {
      const response = await this.api.post<PhoneLoginResponse>('/employee/verify-otp', {
        phone: credentials.phone,
        code: credentials.otp,
      });

      if (response.data.success && response.data.token) {
        // Transform employee response to match User interface
        const user: User = {
          id: response.data.uid,
          uid: response.data.uid,
          role: 'employee',
          employee_name: response.data.employee_name,
          phone: credentials.phone,
          corporate_name: response.data.corporate_name,
          dependents: response.data.dependents,
          assignedEntity: {
            type: 'corporate',
            id: 'corporate_' + response.data.corporate_name.toLowerCase().replace(/\s+/g, '_'),
            name: response.data.corporate_name
          }
        };

        this.storeAuth(response.data.token, user);
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'OTP verification failed';
      throw new Error(errorMessage);
    }
  }

  // Verify Firebase ID token for RM/RP users
  async verifyFirebaseToken(idToken: string): Promise<FirebaseVerifyResponse> {
    try {
      const response = await this.api.post<FirebaseVerifyResponse>('/firebase/verify-token', {
        id_token: idToken,
      });

      if (response.data.success && response.data.user) {
        this.storeAuth(idToken, response.data.user);
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Token verification failed';
      throw new Error(errorMessage);
    }
  }

  // Get user profile using new endpoint
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await this.api.get<ProfileResponse>('/auth/profile');

      if (response.data) {
        // Update stored user data with fresh profile data
        const token = this.getStoredToken();
        if (token) {
          this.storeAuth(token, response.data);
        }
      }

      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  }

  // Logout
  logout(): void {
    this.clearStoredAuth();
  }

  // Validate token with backend (only call when explicitly needed)
  async validateToken(): Promise<TokenValidationResponse> {
    try {
      console.log('🔍 Validating token...');
      const response = await this.api.get<TokenValidationResponse>('/auth/validate-token');
      console.log('✅ Token validation result:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Token validation error:', error);
      return { valid: false };
    }
  }

  // Check if user is authenticated (local check)
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  // Check if user is authenticated with server validation
  async isAuthenticatedAsync(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const validation = await this.validateToken();
      if (!validation.valid) {
        this.clearStoredAuth();
        return false;
      }

      // Update user data if provided
      if (validation.user) {
        const token = this.getStoredToken();
        if (token) {
          this.storeAuth(token, validation.user);
        }
      }

      return true;
    } catch (error) {
      console.error('Authentication validation failed:', error);
      this.clearStoredAuth();
      return false;
    }
  }

  // Get current user from storage
  getCurrentUser(): User | null {
    return this.getStoredUser();
  }

  // Get current token from storage
  getCurrentToken(): string | null {
    return this.getStoredToken();
  }

  // Get token expiry information
  getTokenExpiryInfo(): { isExpired: boolean; expiresAt: Date | null; timeRemaining: string | null } {
    if (typeof window !== 'undefined') {
      const timestamp = localStorage.getItem('auth_token_timestamp');
      if (timestamp) {
        const tokenCreated = parseInt(timestamp);
        const expiryTime = tokenCreated + (24 * 60 * 60 * 1000); // 24 hours from creation
        const now = Date.now();
        const timeRemaining = expiryTime - now;

        return {
          isExpired: timeRemaining <= 0,
          expiresAt: new Date(expiryTime),
          timeRemaining: timeRemaining > 0 ?
            `${Math.floor(timeRemaining / (60 * 60 * 1000))}h ${Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000))}m` :
            null
        };
      }
    }

    return { isExpired: true, expiresAt: null, timeRemaining: null };
  }

  // Private methods for token/user storage
  private storeAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Store token timestamp for 24-hour expiry tracking
      localStorage.setItem('auth_token_timestamp', Date.now().toString());
    }
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const timestamp = localStorage.getItem('auth_token_timestamp');

      if (token && timestamp) {
        const tokenAge = Date.now() - parseInt(timestamp);
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        // Check if token is expired (older than 24 hours)
        if (tokenAge > twentyFourHours) {
          console.log('🔒 Token expired (24+ hours old), clearing auth state');
          this.clearStoredAuth();
          return null;
        }
      }

      return token;
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('auth_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private clearStoredAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token_timestamp');
    }
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;