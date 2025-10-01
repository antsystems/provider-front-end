// Tariff Line Item
export interface TariffLineItem {
  id: string
  code: string
  line_item: string
  price: number
  description?: string
  hospital_id: string
  created_at: string
  created_by: string
}

// Payer Mapping
export interface PayerMapping {
  id: string
  payer_id: string
  payer_name: string
  mapped_price?: number
  effective_from?: string
  effective_to?: string
  status: 'active' | 'inactive'
  created_at: string
  created_by: string
}

// Tariff
export interface Tariff {
  id: string
  tariff_id: string
  tariff_name: string
  tariff_start_date: string
  tariff_end_date?: string
  document_name?: string
  hospital_id: string
  hospital_name: string
  line_items: TariffLineItem[]
  payer_mappings: PayerMapping[]
  status: 'active' | 'inactive'
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
}

// Pagination
export interface Pagination {
  current_page: number
  per_page: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// API Request/Response Types
export interface GetTariffsParams {
  page?: number
  limit?: number
  include_inactive?: boolean
}

export interface GetTariffsResponse {
  message: string
  tariffs: Tariff[]
  pagination: Pagination
}

export interface GetTariffByIdResponse {
  message: string
  tariff: Tariff
}

export interface CreateTariffLineItem {
  code: string
  line_item: string
  amount: number
  description?: string
}

export interface CreateTariffRequest {
  tariff_name: string
  tariff_id: string
  tariff_start_date: string
  tariff_end_date?: string
  document_name?: string
  line_items: CreateTariffLineItem[]
}

export interface CreateTariffResponse {
  message: string
  tariff: Tariff
}

export interface UpdateTariffRequest {
  tariff_name?: string
  tariff_start_date?: string
  tariff_end_date?: string
  document_name?: string
  status?: 'active' | 'inactive'
}

export interface UpdateTariffResponse {
  message: string
  tariff: Tariff
}

export interface DeleteTariffResponse {
  message: string
}

// Line Item Types
export interface CreateLineItemRequest {
  code: string
  line_item: string
  amount: number
  description?: string
}

export interface CreateLineItemResponse {
  message: string
  line_item: TariffLineItem
}

export interface UpdateLineItemRequest {
  code?: string
  line_item?: string
  amount?: number
  description?: string
}

export interface UpdateLineItemResponse {
  message: string
  line_item: TariffLineItem
}

export interface DeleteLineItemResponse {
  message: string
}

// Payer Mapping Types
export interface CreatePayerMappingRequest {
  payer_id: string
  payer_name: string
  mapping_type: string
}

export interface CreatePayerMappingResponse {
  message: string
  payer_mapping: PayerMapping
}

export interface BulkPayerMappingItem {
  payer_id: string
  payer_name: string
  mapping_type: string
}

export interface BulkCreatePayerMappingsRequest {
  payers: BulkPayerMappingItem[]
}

export interface BulkCreatePayerMappingsResponse {
  message: string
  successful: number
  failed: number
  payer_mappings: PayerMapping[]
}

export interface UpdatePayerMappingRequest {
  mapped_price?: number
  effective_from?: string
  effective_to?: string
  status?: 'active' | 'inactive'
}

export interface UpdatePayerMappingResponse {
  message: string
  payer_mapping: PayerMapping
}

export interface DeletePayerMappingResponse {
  message: string
}

// Available Payers Types
export interface AvailablePayer {
  payer_id: string
  payer_name: string
  payer_code: string
  payer_type: string
  status: string
}

export interface GetAvailablePayersResponse {
  message: string
  payers: AvailablePayer[]
  count: number
}

export interface GetPayerTypesResponse {
  message: string
  types: string[]
}

export interface PayerDetails {
  payer_id: string
  payer_name: string
  payer_code: string
  payer_type: string
  contact_person?: string
  phone?: string
  email?: string
  status: string
  created_at: string
}

export interface GetPayerDetailsResponse {
  message: string
  payer: PayerDetails
}

// Tariff Statistics Types
export interface TariffStatistics {
  total_tariffs: number
  total_line_items: number
  total_payer_mappings: number
  active_tariffs: number
  inactive_tariffs: number
  by_hospital: Record<string, number>
}

export interface GetTariffStatisticsResponse {
  message: string
  stats: TariffStatistics
}