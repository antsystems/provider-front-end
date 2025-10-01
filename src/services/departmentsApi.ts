import {
  DepartmentsResponse,
  DepartmentsApiFilters,
  SingleDepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse
} from '@/types/departments';
import authService from '@/services/auth';

class DepartmentsApiService {
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

  async getDepartments(filters: DepartmentsApiFilters = {}): Promise<DepartmentsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.include_inactive !== undefined) params.set('include_inactive', filters.include_inactive.toString());

    const url = `${this.baseUrl}/departments${params.toString() ? '?' + params.toString() : ''}`;

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
      console.error('Failed to fetch departments:', error);
      throw error;
    }
  }

  async getActiveDepartments(): Promise<DepartmentsResponse> {
    return this.getDepartments({ include_inactive: false });
  }

  async getAllDepartments(): Promise<DepartmentsResponse> {
    return this.getDepartments({ include_inactive: true });
  }

  async createDepartment(departmentData: CreateDepartmentRequest): Promise<CreateDepartmentResponse> {
    const url = `${this.baseUrl}/departments`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(departmentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateDepartmentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  }

  async getDepartmentById(departmentId: string): Promise<SingleDepartmentResponse> {
    const url = `${this.baseUrl}/departments/${departmentId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SingleDepartmentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId: string, updateData: UpdateDepartmentRequest): Promise<UpdateDepartmentResponse> {
    const url = `${this.baseUrl}/departments/${departmentId}`;

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

      const data: UpdateDepartmentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update department:', error);
      throw error;
    }
  }

  async deleteDepartment(departmentId: string): Promise<DeleteDepartmentResponse> {
    const url = `${this.baseUrl}/departments/${departmentId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteDepartmentResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete department:', error);
      throw error;
    }
  }
}

export const departmentsApi = new DepartmentsApiService();