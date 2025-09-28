import { DoctorsResponse, DoctorsApiFilters, DoctorResponse, CreateDoctorRequest, UpdateDoctorRequest, DeleteDoctorResponse, SpecialtiesResponse, DepartmentsResponse } from '@/types/doctors';
import authService from '@/services/auth';

class DoctorsApiService {
  private baseUrl = 'https://provider-3.onrender.com/api';

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

      const data: SpecialtiesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch available specialties:', error);
      throw error;
    }
  }

  async getAvailableDepartments(): Promise<DepartmentsResponse> {
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

      const data: DepartmentsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch available departments:', error);
      throw error;
    }
  }
}

export const doctorsApi = new DoctorsApiService();