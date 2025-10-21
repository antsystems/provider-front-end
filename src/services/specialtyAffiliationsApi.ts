import {
  AvailableSpecialtiesResponse,
  CreateSpecialtyAffiliationRequest,
  CreateSpecialtyAffiliationResponse,
  GetSpecialtyAffiliationResponse,
  AffiliatedSpecialtyNamesResponse,
  AddSpecialtiesRequest,
  AddSpecialtiesResponse,
  RemoveSpecialtyResponse,
  DeleteAffiliationResponse
} from '@/types/specialtyAffiliations';
import authService from '@/services/auth';
import { getCached, setCached, clearCache } from '@/services/cache';
import { API_BASE_URL } from '@/config/api';

class SpecialtyAffiliationsApiService {
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

  async getAvailableSpecialties(useCache = true): Promise<AvailableSpecialtiesResponse> {
    const cacheKey = 'available-specialties';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<AvailableSpecialtiesResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/specialty-affiliations/available-specialties`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AvailableSpecialtiesResponse = await response.json();

      // Cache for 10 minutes (600000 ms)
      setCached(cacheKey, data, 1000 * 60 * 10);

      return data;
    } catch (error) {
      console.error('Failed to fetch available specialties:', error);
      throw error;
    }
  }

  async getSpecialtyAffiliation(): Promise<GetSpecialtyAffiliationResponse> {
    const url = `${this.baseUrl}/specialty-affiliations`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle specific backend errors
        if (errorMessage.includes("'<' not supported between instances of 'NoneType' and 'str'")) {
          throw new Error('Backend error: Invalid data comparison. Please contact support.');
        }
        
        throw new Error(errorMessage);
      }

      const data: GetSpecialtyAffiliationResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch specialty affiliation:', error);
      throw error;
    }
  }

  async createOrUpdateSpecialtyAffiliation(
    requestData: CreateSpecialtyAffiliationRequest
  ): Promise<CreateSpecialtyAffiliationResponse> {
    const url = `${this.baseUrl}/specialty-affiliations`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateSpecialtyAffiliationResponse = await response.json();

      // Clear cache after successful creation/update
      this.clearSpecialtyAffiliationCache();

      return data;
    } catch (error) {
      console.error('Failed to create/update specialty affiliation:', error);
      throw error;
    }
  }

  async getAffiliatedSpecialtyNames(useCache = true): Promise<AffiliatedSpecialtyNamesResponse> {
    const cacheKey = 'affiliated-specialty-names';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<AffiliatedSpecialtyNamesResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/specialty-affiliations/affiliated-specialties`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AffiliatedSpecialtyNamesResponse = await response.json();

      // Cache for 5 minutes (300000 ms)
      setCached(cacheKey, data, 1000 * 60 * 5);

      return data;
    } catch (error) {
      console.error('Failed to fetch affiliated specialty names:', error);
      throw error;
    }
  }

  async addSpecialties(requestData: AddSpecialtiesRequest): Promise<AddSpecialtiesResponse> {
    const url = `${this.baseUrl}/specialty-affiliations/add-specialties`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AddSpecialtiesResponse = await response.json();

      // Clear cache after successful addition
      this.clearSpecialtyAffiliationCache();

      return data;
    } catch (error) {
      console.error('Failed to add specialties:', error);
      throw error;
    }
  }

  async removeSpecialty(specialtyId: string): Promise<RemoveSpecialtyResponse> {
    const url = `${this.baseUrl}/specialty-affiliations/remove-specialty/${specialtyId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: RemoveSpecialtyResponse = await response.json();

      // Clear cache after successful removal
      this.clearSpecialtyAffiliationCache();

      return data;
    } catch (error) {
      console.error('Failed to remove specialty:', error);
      throw error;
    }
  }

  async deleteAffiliation(): Promise<DeleteAffiliationResponse> {
    const url = `${this.baseUrl}/specialty-affiliations`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteAffiliationResponse = await response.json();

      // Clear cache after successful deletion
      this.clearSpecialtyAffiliationCache();

      return data;
    } catch (error) {
      console.error('Failed to delete specialty affiliation:', error);
      throw error;
    }
  }

  /**
   * Clear the specialty affiliation cache
   */
  clearSpecialtyAffiliationCache(): void {
    clearCache('specialty-affiliation');
    clearCache('affiliated-specialty-names');
  }
}

export const specialtyAffiliationsApi = new SpecialtyAffiliationsApiService();
