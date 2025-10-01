import {
  GetTDSMappingsResponse,
  GetTDSMappingsParams,
  CreateTDSMappingRequest,
  CreateTDSMappingResponse,
  GetTDSMappingResponse,
  UpdateTDSMappingRequest,
  UpdateTDSMappingResponse,
  DeleteTDSMappingResponse,
  CalculateTDSRequest,
  CalculateTDSResponse,
  GetPayerNamesResponse,
  GetProviderNamesResponse
} from '@/types/tdsMapping';
import authService from './auth';

class TDSMappingApi {
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

  async getTDSMappings(params?: GetTDSMappingsParams): Promise<GetTDSMappingsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.payer_name) queryParams.append('payer_name', params.payer_name);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const url = `${this.baseUrl}/tds-mapping${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch TDS mappings' }));
      throw new Error(errorData.error || 'Failed to fetch TDS mappings');
    }

    return response.json();
  }

  async getTDSMapping(mappingId: string): Promise<GetTDSMappingResponse> {
    const url = `${this.baseUrl}/tds-mapping/${mappingId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch TDS mapping' }));
      throw new Error(errorData.error || 'Failed to fetch TDS mapping');
    }

    return response.json();
  }

  async createTDSMapping(data: CreateTDSMappingRequest): Promise<CreateTDSMappingResponse> {
    const url = `${this.baseUrl}/tds-mapping`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create TDS mapping' }));
      throw new Error(errorData.error || 'Failed to create TDS mapping');
    }

    return response.json();
  }

  async updateTDSMapping(mappingId: string, data: UpdateTDSMappingRequest): Promise<UpdateTDSMappingResponse> {
    const url = `${this.baseUrl}/tds-mapping/${mappingId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to update TDS mapping' }));
      throw new Error(errorData.error || 'Failed to update TDS mapping');
    }

    return response.json();
  }

  async deleteTDSMapping(mappingId: string): Promise<DeleteTDSMappingResponse> {
    const url = `${this.baseUrl}/tds-mapping/${mappingId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to delete TDS mapping' }));
      throw new Error(errorData.error || 'Failed to delete TDS mapping');
    }

    return response.json();
  }

  async calculateTDS(data: CalculateTDSRequest): Promise<CalculateTDSResponse> {
    const url = `${this.baseUrl}/calculate-tds`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to calculate TDS' }));
      throw new Error(errorData.error || 'Failed to calculate TDS');
    }

    return response.json();
  }

  async getPayerNames(): Promise<GetPayerNamesResponse> {
    const url = `${this.baseUrl}/payers/names`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch payer names' }));
      throw new Error(errorData.error || 'Failed to fetch payer names');
    }

    return response.json();
  }

  async getProviderNames(): Promise<GetProviderNamesResponse> {
    const url = `${this.baseUrl}/providers/names`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch provider names' }));
      throw new Error(errorData.error || 'Failed to fetch provider names');
    }

    return response.json();
  }
}

export const tdsMappingApi = new TDSMappingApi();
