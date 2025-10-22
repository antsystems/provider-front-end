export interface Staff {
  staff_id: string;
  staff_name: string;
  staff_code: string;
  contact_number: string;
  email: string;
  department_name: string;
  department_id: string;
  hospital_id: string;
  hospital_name: string;
  status: 'active' | 'inactive';
  IsActive: number;
  CreatedBy: string;
  CreatedByEmail: string;
  CreatedDate: string;
  EditedBy: string;
  EditedByEmail: string;
  EditedDate: string;
  UpdatedBy: string;
  UpdatedByEmail: string;
  UpdatedTime: string;
  // Optional fields that may not be in API response
  designation?: string;
  qualification?: string;
  experience_years?: number;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  per_page: number;
  total_items: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface StaffResponse {
  message: string;
  staff: Staff[];
  pagination: Pagination;
}

export interface SingleStaffResponse {
  message: string;
  staff: Staff;
}

export interface CreateStaffRequest {
  staff_name: string;
  contact_number: string;
  email: string;
  department_name: string;
  designation?: string;
  qualification?: string;
  experience_years?: number;
}

export interface UpdateStaffRequest {
  name?: string;
  phone_number?: string;
  email?: string;
  department_name?: string;
  designation?: string;
  qualification?: string;
  experience_years?: number;
  status?: 'active' | 'inactive';
}

export interface DeleteStaffResponse {
  message: string;
  staff_id: string;
}

export interface StaffApiFilters {
  page?: number;
  limit?: number;
  department_name?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentsResponse {
  message: string;
  department_names: string[];
  count: number;
}