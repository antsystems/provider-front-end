import {
  StaffResponse,
  StaffApiFilters,
  SingleStaffResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  DeleteStaffResponse,
  DepartmentsResponse
} from '@/types/staff';
import authService from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class StaffApiService {
  private baseUrl = API_BASE_URL;

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

  async getStaff(filters: StaffApiFilters = {}): Promise<StaffResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.department_name) params.set('department_name', filters.department_name);
    if (filters.status) params.set('status', filters.status);

    const url = `${this.baseUrl}/staff${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StaffResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      throw error;
    }
  }

  async createStaff(staffData: CreateStaffRequest): Promise<SingleStaffResponse> {
    const url = `${this.baseUrl}/staff`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(staffData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SingleStaffResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create staff member:', error);
      throw error;
    }
  }

  async getStaffById(staffId: string): Promise<SingleStaffResponse> {
    const url = `${this.baseUrl}/staff/${staffId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SingleStaffResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch staff member:', error);
      throw error;
    }
  }

  async updateStaff(staffId: string, updateData: UpdateStaffRequest): Promise<SingleStaffResponse> {
    const url = `${this.baseUrl}/staff/${staffId}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SingleStaffResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update staff member:', error);
      throw error;
    }
  }

  async deleteStaff(staffId: string): Promise<DeleteStaffResponse> {
    const url = `${this.baseUrl}/staff/${staffId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteStaffResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      throw error;
    }
  }

  async getAvailableDepartments(): Promise<DepartmentsResponse> {
    const url = `${this.baseUrl}/staff/available-departments`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DepartmentsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch available departments:', error);
      throw error;
    }
  }

  async bulkUploadStaff(file: File): Promise<{
    successful: number;
    failed: number;
    message?: string;
    created_staff?: string[];
    errors?: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = authService.getCurrentToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${this.baseUrl}/staff/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to bulk upload staff:', error);
      throw error;
    }
  }
}

export const staffApi = new StaffApiService();