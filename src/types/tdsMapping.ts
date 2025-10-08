export interface TDSMapping {
  id: string;
  provider_name: string;
  payer_name: string;
  tds_percentage: number;
  effective_date?: string;
  description?: string;
  hospital_id: string;
  status: 'active' | 'inactive';
  created_by: string;
  created_by_email: string;
  created_on: string;
  updated_by: string;
  updated_by_email: string;
  updated_on: string;
}

export interface Pagination {
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface GetTDSMappingsResponse {
  message: string;
  tds_mappings: TDSMapping[];
  pagination: Pagination;
}

export interface GetTDSMappingsParams {
  payer_name?: string;
  status?: 'active' | 'inactive';
  page?: number;
  per_page?: number;
}

export interface CreateTDSMappingRequest {
  provider_name: string;
  payer_name: string;
  tds_percentage: number;
  effective_date?: string;
  description?: string;
}

export interface CreateTDSMappingResponse {
  message: string;
  tds_mapping: TDSMapping;
}

export interface GetTDSMappingResponse {
  message: string;
  tds_mapping: TDSMapping;
}

export interface UpdateTDSMappingRequest {
  tds_percentage?: number;
  effective_date?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateTDSMappingResponse {
  message: string;
  tds_mapping: TDSMapping;
}

export interface DeleteTDSMappingResponse {
  message: string;
  mapping_id: string;
}

export interface CalculateTDSRequest {
  provider_name: string;
  payer_name: string;
  amount: number;
  calculation_date?: string;
}

export interface TDSCalculation {
  provider_name: string;
  payer_name: string;
  amount: number;
  tds_percentage: number;
  tds_amount: number;
  net_amount: number;
  calculation_date: string;
  mapping_id: string;
}

export interface CalculateTDSResponse {
  message: string;
  calculation: TDSCalculation;
}

export interface GetPayerNamesResponse {
  message: string;
  payer_names: string[];
  count: number;
}

export interface GetProviderNamesResponse {
  message: string;
  provider_names: string[];
  count: number;
}

export interface PayerType {
  value: string;
  label: string;
}

export interface GetPayerTypesResponse {
  message: string;
  payer_types: PayerType[];
  note?: string;
}

export interface AffiliatedPayer {
  payer_id: string;
  payer_name: string;
  payer_type: string;
  affiliation_id: string;
}

export interface GetAffiliatedPayersResponse {
  message: string;
  payer_type: string;
  affiliated_payers: AffiliatedPayer[];
  count: number;
}
