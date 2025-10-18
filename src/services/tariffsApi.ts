import {
  GetTariffsParams,
  GetTariffsResponse,
  GetTariffByIdResponse,
  CreateTariffRequest,
  CreateTariffResponse,
  UpdateTariffRequest,
  UpdateTariffResponse,
  DeleteTariffResponse,
  CreateLineItemRequest,
  CreateLineItemResponse,
  UpdateLineItemRequest,
  UpdateLineItemResponse,
  DeleteLineItemResponse,
  BulkLineItemsUploadResponse,
  CreatePayerMappingRequest,
  CreatePayerMappingResponse,
  BulkCreatePayerMappingsRequest,
  BulkCreatePayerMappingsResponse,
  BulkCreatePayerMappingsWithRelationshipsRequest,
  BulkCreatePayerMappingsWithRelationshipsResponse,
  UpdatePayerMappingRequest,
  UpdatePayerMappingResponse,
  DeletePayerMappingResponse,
  GetAvailablePayersResponse,
  GetPayerTypesResponse,
  GetPayerDetailsResponse,
  GetTariffStatisticsResponse,
} from '@/types/tariffs';
import authService from '@/services/auth';
import { getCached, setCached, clearCache } from '@/services/cache';

class TariffsApiService {
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

  /**
   * Get all tariffs with pagination
   */
  async getTariffs(params: GetTariffsParams = {}, useCache = true): Promise<GetTariffsResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.include_inactive !== undefined) {
      queryParams.set('include_inactive', params.include_inactive.toString());
    }

    const cacheKey = `tariffs-${queryParams.toString()}`;

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<GetTariffsResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/tariffs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetTariffsResponse = await response.json();

      // Cache for 5 minutes
      setCached(cacheKey, data, 1000 * 60 * 5);

      return data;
    } catch (error) {
      console.error('Failed to fetch tariffs:', error);
      throw error;
    }
  }

  /**
   * Get a single tariff by ID
   */
  async getTariffById(tariffId: string): Promise<GetTariffByIdResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetTariffByIdResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch tariff:', error);
      throw error;
    }
  }

  /**
   * Create a new tariff
   */
  async createTariff(tariffData: CreateTariffRequest): Promise<CreateTariffResponse> {
    const url = `${this.baseUrl}/tariffs`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tariffData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateTariffResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to create tariff:', error);
      throw error;
    }
  }

  /**
   * Update an existing tariff
   */
  async updateTariff(tariffId: string, tariffData: UpdateTariffRequest): Promise<UpdateTariffResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tariffData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdateTariffResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to update tariff:', error);
      throw error;
    }
  }

  /**
   * Delete a tariff
   */
  async deleteTariff(tariffId: string): Promise<DeleteTariffResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteTariffResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to delete tariff:', error);
      throw error;
    }
  }

  // ==================== Line Items ====================

  /**
   * Add a line item to a tariff
   */
  async addLineItem(tariffId: string, lineItemData: CreateLineItemRequest): Promise<CreateLineItemResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/line-items`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(lineItemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateLineItemResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to add line item:', error);
      throw error;
    }
  }

  /**
   * Update a line item
   */
  async updateLineItem(
    tariffId: string,
    lineItemId: string,
    lineItemData: UpdateLineItemRequest
  ): Promise<UpdateLineItemResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/line-items/${lineItemId}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(lineItemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdateLineItemResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to update line item:', error);
      throw error;
    }
  }

  /**
   * Delete a line item
   */
  async deleteLineItem(tariffId: string, lineItemId: string): Promise<DeleteLineItemResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/line-items/${lineItemId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteLineItemResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to delete line item:', error);
      throw error;
    }
  }

  /**
   * Bulk upload line items from CSV or JSON file
   */
  async bulkUploadLineItems(file: File): Promise<BulkLineItemsUploadResponse> {
    const url = `${this.baseUrl}/tariffs/bulk-upload`;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = authService.getCurrentToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkLineItemsUploadResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to bulk upload line items:', error);
      throw error;
    }
  }

  // ==================== Payer Mappings ====================

  /**
   * Add a single payer mapping to a tariff
   */
  async addPayerMapping(
    tariffId: string,
    payerMappingData: CreatePayerMappingRequest
  ): Promise<CreatePayerMappingResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/payers`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payerMappingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreatePayerMappingResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to add payer mapping:', error);
      throw error;
    }
  }

  /**
   * Add multiple payer mappings to a tariff (bulk)
   */
  async bulkAddPayerMappings(
    tariffId: string,
    payerMappingsData: BulkCreatePayerMappingsRequest
  ): Promise<BulkCreatePayerMappingsResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/payers/bulk`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payerMappingsData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkCreatePayerMappingsResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to bulk add payer mappings:', error);
      throw error;
    }
  }

  /**
   * Add multiple payer mappings with TPA relationships to a tariff
   */
  async bulkAddPayerMappingsWithRelationships(
    tariffId: string,
    payerMappingsData: BulkCreatePayerMappingsWithRelationshipsRequest
  ): Promise<BulkCreatePayerMappingsWithRelationshipsResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/payers/bulk-with-relationships`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payerMappingsData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BulkCreatePayerMappingsWithRelationshipsResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to bulk add payer mappings with relationships:', error);
      throw error;
    }
  }

  /**
   * Update a payer mapping
   */
  async updatePayerMapping(
    tariffId: string,
    payerMappingId: string,
    payerMappingData: UpdatePayerMappingRequest
  ): Promise<UpdatePayerMappingResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/payer-mappings/${payerMappingId}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payerMappingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdatePayerMappingResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to update payer mapping:', error);
      throw error;
    }
  }

  /**
   * Delete a payer mapping
   */
  async deletePayerMapping(tariffId: string, payerId: string): Promise<DeletePayerMappingResponse> {
    const url = `${this.baseUrl}/tariffs/${tariffId}/payers/${payerId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeletePayerMappingResponse = await response.json();

      // Clear tariffs cache
      this.clearTariffsCache();

      return data;
    } catch (error) {
      console.error('Failed to delete payer mapping:', error);
      throw error;
    }
  }

  // ==================== Payer Selection ====================

  /**
   * Get available payers for mapping
   */
  async getAvailablePayers(useCache = true): Promise<GetAvailablePayersResponse> {
    const cacheKey = 'tariff-available-payers';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<GetAvailablePayersResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/tariffs/available-payers`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetAvailablePayersResponse = await response.json();

      // Cache for 10 minutes
      setCached(cacheKey, data, 1000 * 60 * 10);

      return data;
    } catch (error) {
      console.error('Failed to fetch available payers:', error);
      throw error;
    }
  }

  /**
   * Get payer types
   */
  async getPayerTypes(useCache = true): Promise<GetPayerTypesResponse> {
    const cacheKey = 'tariff-payer-types';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<GetPayerTypesResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/tariffs/payer-types`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetPayerTypesResponse = await response.json();

      // Cache for 1 hour
      setCached(cacheKey, data, 1000 * 60 * 60);

      return data;
    } catch (error) {
      console.error('Failed to fetch payer types:', error);
      throw error;
    }
  }

  /**
   * Get payer details by ID
   */
  async getPayerDetails(payerId: string): Promise<GetPayerDetailsResponse> {
    const url = `${this.baseUrl}/tariffs/payers/${payerId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetPayerDetailsResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch payer details:', error);
      throw error;
    }
  }

  // ==================== Statistics ====================

  /**
   * Get tariff statistics
   */
  async getTariffStatistics(useCache = true): Promise<GetTariffStatisticsResponse> {
    const cacheKey = 'tariff-statistics';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<GetTariffStatisticsResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/tariffs/stats`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GetTariffStatisticsResponse = await response.json();

      // Cache for 5 minutes
      setCached(cacheKey, data, 1000 * 60 * 5);

      return data;
    } catch (error) {
      console.error('Failed to fetch tariff statistics:', error);
      throw error;
    }
  }

  // ==================== Cache Management ====================

  /**
   * Clear all tariffs cache
   */
  clearTariffsCache(): void {
    // Clear all cache entries that start with 'tariffs-'
    clearCache();
  }
}

export const tariffsApi = new TariffsApiService();