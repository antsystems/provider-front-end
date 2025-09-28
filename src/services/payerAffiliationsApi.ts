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

class PayerAffiliationsApiService {
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
      return data;
    } catch (error) {
      console.error('Failed to bulk affiliate payers:', error);
      throw error;
    }
  }

  async getAvailablePayers(): Promise<AvailablePayersResponse> {
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
      return data;
    } catch (error) {
      console.error('Failed to fetch available payers:', error);
      throw error;
    }
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