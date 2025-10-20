import authService from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

class HospitalSummaryApiService {
  private baseUrl = API_BASE_URL;

  private getAuthHeaders() {
    const token = authService.getCurrentToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getHospitalSummary(): Promise<any> {
    const url = `${this.baseUrl}/hospital-summary`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch hospital summary:', error);
      throw error;
    }
  }
}

export const hospitalSummaryApi = new HospitalSummaryApiService();
