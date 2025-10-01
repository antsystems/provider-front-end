import {
  HospitalUsersResponse,
  HospitalUsersApiFilters,
  SingleHospitalUserResponse,
  CreateHospitalUserRequest,
  CreateHospitalUserResponse,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
  BulkUpdateStatusRequest,
  BulkUpdateStatusResponse
} from '@/types/hospitalUsers';
import authService from '@/services/auth';

class HospitalUsersApiService {
  private baseUrl = 'https://provider-4.onrender.com/api';

  private getAuthHeaders() {
    const token = authService.getCurrentToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getHospitalUsers(filters: HospitalUsersApiFilters = {}): Promise<HospitalUsersResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.role) params.set('role', filters.role);

    const url = `${this.baseUrl}/hospital-users${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HospitalUsersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch hospital users:', error);
      throw error;
    }
  }

  async getHospitalUsersByStatus(status: 'active' | 'inactive' | 'pending_password_set'): Promise<HospitalUsersResponse> {
    return this.getHospitalUsers({ status });
  }

  async getHospitalUsersByRole(role: string): Promise<HospitalUsersResponse> {
    return this.getHospitalUsers({ role });
  }

  async getActiveHospitalUsers(): Promise<HospitalUsersResponse> {
    return this.getHospitalUsers({ status: 'active' });
  }

  async getInactiveHospitalUsers(): Promise<HospitalUsersResponse> {
    return this.getHospitalUsers({ status: 'inactive' });
  }

  async getPendingHospitalUsers(): Promise<HospitalUsersResponse> {
    return this.getHospitalUsers({ status: 'pending_password_set' });
  }

  async createHospitalUser(userData: CreateHospitalUserRequest): Promise<CreateHospitalUserResponse> {
    const url = `${this.baseUrl}/hospital-users`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateHospitalUserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create hospital user:', error);
      throw error;
    }
  }

  async getHospitalUserById(userId: string): Promise<SingleHospitalUserResponse> {
    const url = `${this.baseUrl}/hospital-users/${userId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SingleHospitalUserResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch hospital user:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, statusData: UpdateUserStatusRequest): Promise<UpdateUserStatusResponse> {
    const url = `${this.baseUrl}/hospital-users/${userId}/status`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdateUserStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  }

  async bulkUpdateUserStatus(bulkData: BulkUpdateStatusRequest): Promise<BulkUpdateStatusResponse> {
    const url = `${this.baseUrl}/hospital-users/bulk-update-status`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkUpdateStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to bulk update user status:', error);
      throw error;
    }
  }

  // Helper method to resend password setup email
  async resendPasswordSetupEmail(userId: string): Promise<{ message: string; email_sent: boolean }> {
    const url = `${this.baseUrl}/hospital-users/${userId}/resend-password-setup`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to resend password setup email:', error);
      throw error;
    }
  }
}

export const hospitalUsersApi = new HospitalUsersApiService();