import { DoctorsResponse, DoctorsApiFilters, DoctorResponse, CreateDoctorRequest, UpdateDoctorRequest, DeleteDoctorResponse, SpecialtiesResponse, DepartmentsResponse } from '@/types/doctors';
import authService from '@/services/auth';
import { getCached, setCached } from '@/services/cache';
import { API_BASE_URL } from '@/config/api';

class DoctorsApiService {
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

  async getDoctors(filters: DoctorsApiFilters = {}): Promise<DoctorsResponse> {
    const params = new URLSearchParams();

    if (filters.specialty_name) params.set('specialty_name', filters.specialty_name);
    if (filters.department_name) params.set('department_name', filters.department_name);
    if (filters.status) params.set('status', filters.status);

    const url = `${this.baseUrl}/doctors${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DoctorsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      throw error;
    }
  }

  async getDoctorsBySpecialty(specialty: string): Promise<DoctorsResponse> {
    return this.getDoctors({ specialty_name: specialty });
  }

  async getDoctorsByDepartment(department: string): Promise<DoctorsResponse> {
    return this.getDoctors({ department_name: department });
  }

  async getActiveDoctors(): Promise<DoctorsResponse> {
    return this.getDoctors({ status: 'active' });
  }

  async getInactiveDoctors(): Promise<DoctorsResponse> {
    return this.getDoctors({ status: 'inactive' });
  }

  async createDoctor(doctorData: CreateDoctorRequest): Promise<DoctorResponse> {
    const url = `${this.baseUrl}/doctors`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DoctorResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create doctor:', error);
      throw error;
    }
  }

  async getDoctorById(doctorId: string): Promise<DoctorResponse> {
    const url = `${this.baseUrl}/doctors/${doctorId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DoctorResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
      throw error;
    }
  }

  async updateDoctor(doctorId: string, updateData: UpdateDoctorRequest): Promise<DoctorResponse> {
    const url = `${this.baseUrl}/doctors/${doctorId}`;

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

      const data: DoctorResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to update doctor:', error);
      throw error;
    }
  }

  async deleteDoctor(doctorId: string): Promise<DeleteDoctorResponse> {
    const url = `${this.baseUrl}/doctors/${doctorId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteDoctorResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      throw error;
    }
  }

  async getAvailableSpecialties(): Promise<SpecialtiesResponse> {
    const cacheKey = 'doctors:available-specialties'
    const cached = getCached<SpecialtiesResponse>(cacheKey)
    if (cached) return cached

    const url = `${this.baseUrl}/doctors/available-specialties`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();

      // Normalize response: backend may return specialty_names or specialties
      const specialty_names: string[] = data.specialty_names ?? data.specialties ?? [];
      const count: number = typeof data.count === 'number' ? data.count : specialty_names.length;

      const result: SpecialtiesResponse = {
        message: data.message ?? 'Available specialty names retrieved successfully',
        specialty_names,
        count,
      };

      setCached(cacheKey, result)
      return result;
    } catch (error) {
      console.error('Failed to fetch available specialties:', error);
      throw error;
    }
  }

  async getAvailableDepartments(): Promise<DepartmentsResponse> {
    const cacheKey = 'doctors:available-departments'
    const cached = getCached<DepartmentsResponse>(cacheKey)
    if (cached) return cached

    const url = `${this.baseUrl}/doctors/available-departments`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();

      // Normalize response: backend may return department_names or departments
      const department_names: string[] = data.department_names ?? data.departments ?? [];
      const count: number = typeof data.count === 'number' ? data.count : department_names.length;

      const result = {
        message: data.message ?? 'Available department names retrieved successfully',
        department_names,
        count,
      };

      setCached(cacheKey, result)
      return result;
    } catch (error) {
      console.error('Failed to fetch available departments:', error);
      throw error;
    }
  }

  async bulkUploadDoctors(file: File): Promise<{
    successful: number;
    failed: number;
    message?: string;
    created_doctors?: string[];
    errors?: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = authService.getCurrentToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${this.baseUrl}/doctors/bulk-upload`, {
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
      console.error('Failed to bulk upload doctors:', error);
      throw error;
    }
  }
}

export const doctorsApi = new DoctorsApiService();