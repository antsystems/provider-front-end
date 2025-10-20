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
    try {
      // Parse CSV file
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const results = {
        successful: 0,
        failed: 0,
        created_doctors: [] as string[],
        errors: [] as Array<{ row: number; error: string }>
      };

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length < 5) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Insufficient data - required: doctor_name, specialty_name, contact_number, email, department_name'
          });
          continue;
        }

        try {
          // Map CSV columns to doctor fields
          const doctorData: CreateDoctorRequest = {
            doctor_name: values[0] || '',
            specialty_name: values[1] || '',
            contact_number: values[2] || '',
            email: values[3] || '',
            department_name: values[4] || '',
            qualification: values[5] || 'Not specified', // Provide default value since backend requires it
          };

          // Validate required fields
          if (!doctorData.doctor_name || !doctorData.specialty_name || !doctorData.contact_number || !doctorData.email || !doctorData.department_name) {
            results.failed++;
            results.errors.push({
              row: i + 1,
              error: 'Missing required fields: doctor_name, specialty_name, contact_number, email, department_name'
            });
            continue;
          }

          // Ensure qualification is provided (backend requirement)
          if (!doctorData.qualification || doctorData.qualification.trim() === '') {
            doctorData.qualification = 'Not specified';
          }

          // Create doctor using individual API call
          const response = await this.createDoctor(doctorData);
          results.successful++;
          results.created_doctors.push(response.doctor.doctor_id);
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Generate result message
      const message = `Bulk upload completed: ${results.successful} successful, ${results.failed} failed`;
      
      return {
        ...results,
        message
      };
    } catch (error) {
      console.error('Failed to bulk upload doctors:', error);
      throw error;
    }
  }
}

export const doctorsApi = new DoctorsApiService();