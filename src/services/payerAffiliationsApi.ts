import {
  PayerAffiliationsResponse,
  PayerAffiliationsApiFilters,
  SinglePayerAffiliationResponse,
  CreatePayerAffiliationRequest,
  CreatePayerAffiliationResponse,
  UpdatePayerAffiliationRequest,
  UpdatePayerAffiliationResponse,
  DeletePayerAffiliationResponse,
  BulkAffiliatePayersRequest,
  BulkAffiliatePayersResponse,
  AvailablePayersResponse,
  PayersByTypeResponse,
  PayersApiFilters
} from '@/types/payerAffiliations';
import authService from '@/services/auth';
import { getCached, setCached, clearCache } from '@/services/cache';
import { API_BASE_URL } from '@/config/api';

class PayerAffiliationsApiService {
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

  async getPayerAffiliations(filters: PayerAffiliationsApiFilters = {}): Promise<PayerAffiliationsResponse> {
    const params = new URLSearchParams();

    if (filters.status) params.set('status', filters.status);
    if (filters.payer_type) params.set('payer_type', filters.payer_type);

    const url = `${this.baseUrl}/payer-affiliations${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PayerAffiliationsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch payer affiliations:', error);
      throw error;
    }
  }

  async getPayerAffiliationsByStatus(status: 'active' | 'inactive'): Promise<PayerAffiliationsResponse> {
    return this.getPayerAffiliations({ status });
  }

  async getActivePayerAffiliations(): Promise<PayerAffiliationsResponse> {
    return this.getPayerAffiliations({ status: 'active' });
  }

  async getInactivePayerAffiliations(): Promise<PayerAffiliationsResponse> {
    return this.getPayerAffiliations({ status: 'inactive' });
  }

  async createPayerAffiliation(affiliationData: CreatePayerAffiliationRequest): Promise<CreatePayerAffiliationResponse> {
    const url = `${this.baseUrl}/payer-affiliations`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(affiliationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreatePayerAffiliationResponse = await response.json();

      // Clear cache after successful creation
      this.clearAvailablePayersCache();

      return data;
    } catch (error) {
      console.error('Failed to create payer affiliation:', error);
      throw error;
    }
  }

  async getPayerAffiliationById(affiliationId: string): Promise<SinglePayerAffiliationResponse> {
    const url = `${this.baseUrl}/payer-affiliations/${affiliationId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: SinglePayerAffiliationResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch payer affiliation:', error);
      throw error;
    }
  }

  async updatePayerAffiliation(affiliationId: string, updateData: UpdatePayerAffiliationRequest): Promise<UpdatePayerAffiliationResponse> {
    const url = `${this.baseUrl}/payer-affiliations/${affiliationId}`;

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

      const data: UpdatePayerAffiliationResponse = await response.json();

      // Clear cache after successful update (in case status changed)
      this.clearAvailablePayersCache();

      return data;
    } catch (error) {
      console.error('Failed to update payer affiliation:', error);
      throw error;
    }
  }

  async deletePayerAffiliation(affiliationId: string): Promise<DeletePayerAffiliationResponse> {
    const url = `${this.baseUrl}/payer-affiliations/${affiliationId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeletePayerAffiliationResponse = await response.json();

      // Clear cache after successful deletion
      this.clearAvailablePayersCache();

      return data;
    } catch (error) {
      console.error('Failed to delete payer affiliation:', error);
      throw error;
    }
  }

  async bulkAffiliatePayersWithNewMethod(bulkData: BulkAffiliatePayersRequest): Promise<BulkAffiliatePayersResponse> {
    const url = `${this.baseUrl}/payer-affiliations/bulk`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkAffiliatePayersResponse = await response.json();

      // Clear cache after successful bulk creation
      this.clearAvailablePayersCache();

      return data;
    } catch (error) {
      console.error('Failed to bulk affiliate payers:', error);
      throw error;
    }
  }

  async getAvailablePayers(useCache = true): Promise<AvailablePayersResponse> {
    const cacheKey = 'available-payers';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<AvailablePayersResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/available-payers`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AvailablePayersResponse = await response.json();

      // Cache for 10 minutes (600000 ms)
      setCached(cacheKey, data, 1000 * 60 * 10);

      return data;
    } catch (error) {
      console.error('Failed to fetch available payers:', error);
      throw error;
    }
  }

  async getActivePayerAffiliationsForMapping(useCache = true): Promise<AvailablePayersResponse> {
    const cacheKey = 'active-payer-affiliations-mapping';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<AvailablePayersResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/payer-affiliations?status=active`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const affiliationsData: PayerAffiliationsResponse = await response.json();

      // Transform PayerAffiliationsResponse to AvailablePayersResponse
      const transformedData: AvailablePayersResponse = {
        affiliated_payers: affiliationsData.affiliations.map(aff => aff.payer_name),
        available_payers: affiliationsData.affiliations.map(aff => ({
          id: aff.payer_id,
          auto_id: aff.id,
          name: aff.payer_name,
          type: aff.payer_type,
          code: aff.payer_code,
        })),
      };

      // Cache for 10 minutes (600000 ms)
      setCached(cacheKey, transformedData, 1000 * 60 * 10);

      return transformedData;
    } catch (error) {
      console.error('Failed to fetch active payer affiliations:', error);
      throw error;
    }
  }

  /**
   * Clear the available payers cache
   */
  clearAvailablePayersCache(): void {
    clearCache('available-payers');
  }

  async getPayersByType(filters: PayersApiFilters = {}): Promise<PayersByTypeResponse> {
    const params = new URLSearchParams();

    if (filters.type) params.set('type', filters.type);

    const url = `${this.baseUrl}/payers${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PayersByTypeResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch payers by type:', error);
      throw error;
    }
  }
}

export const payerAffiliationsApi = new PayerAffiliationsApiService();