export interface PayerAffiliation {
  id: string;
  payer_id: string;
  payer_name: string;
  payer_type: string;
  payer_code: string;
  affiliated_by: string;
  affiliated_by_email: string;
  affiliated_at: string;
}

export interface PayerAffiliationsResponse {
  message: string;
  affiliations: PayerAffiliation[];
  pagination: {
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface SinglePayerAffiliationResponse {
  message: string;
  affiliation: PayerAffiliation;
}

export interface CreatePayerAffiliationRequest {
  payer_name: string;
}

export interface CreatePayerAffiliationResponse {
  message: string;
  affiliation: {
    id: string;
    payer_name: string;
    payer_type: string;
    payer_code: string;
  };
}

export interface UpdatePayerAffiliationRequest {
  status: 'active' | 'inactive';
}

export interface UpdatePayerAffiliationResponse {
  message: string;
  affiliation: {
    id: string;
    payer_name: string;
    payer_type: string;
    payer_code: string;
    status: string;
    updated_on: string;
  };
}

export interface DeletePayerAffiliationResponse {
  message: string;
  affiliation_id: string;
}

export interface PayerAffiliationsApiFilters {
  status?: 'active' | 'inactive';
  payer_type?: string;
}

// Bulk affiliation interfaces
export interface BulkAffiliatePayersRequest {
  payer_names: string[];
}

export interface BulkAffiliatePayersResponse {
  message: string;
  successful_affiliations: {
    payer_name: string;
    payer_type: string;
    affiliation_id: string;
  }[];
  failed_affiliations: {
    payer_name: string;
    error: string;
  }[];
  total_processed: number;
}

// Available payers interfaces
export interface AvailablePayer {
  id: string;
  auto_id?: string;
  mvid?: string;
  name: string;
  type: string;
  code: string;
  status?: 'active' | 'inactive';
  address?: string;
  contact_email?: string;
  contact_person?: string;
  contact_person_number?: string;
  contact_phone?: string;
  country?: string;
  created_at?: string;
  district?: string;
  location?: string;
  login_url?: string;
  ownership?: string;
  pin_code?: string;
  regd_number?: string;
  region?: string;
  state?: string;
}

export interface AvailablePayersResponse {
  affiliated_payers: string[];
  available_payers: AvailablePayer[];
}

export interface PayersByTypeResponse {
  message: string;
  payers: AvailablePayer[];
  count: number;
  filter_type?: string;
}

export interface PayersApiFilters {
  type?: string;
}

// Status options with display labels
export const PAYER_AFFILIATION_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', description: 'Affiliation is active and can be used' },
  { value: 'inactive', label: 'Inactive', description: 'Affiliation is inactive' },
] as const;

// Common payer types
export const PAYER_TYPES = [
  'TPA',
  'Insurance Company',
  'Government',
  'Corporate',
  'Other'
] as const;

export type PayerType = typeof PAYER_TYPES[number];
export type PayerAffiliationStatus = typeof PAYER_AFFILIATION_STATUS_OPTIONS[number]['value'];