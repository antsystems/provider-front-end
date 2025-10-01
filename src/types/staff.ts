export interface Staff {
  id: string;
  staff_id: string;
  name: string;
  phone_number: string;
  email: string;
  department: string;
  department_id: string;
  designation: string;
  qualification: string;
  experience_years: number;
  hospital_id: string;
  hospital_name: string;
  status: 'active' | 'inactive';
  created_at: string;
  created_by: string;
  created_by_email: string;
  created_by_name: string;
  updated_at: string;
  updated_by: string;
  updated_by_email: string;
  updated_by_name: string;
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
}

export interface UpdateStaffRequest {
  name?: string;
  phone_number?: string;
  email?: string;
  department_id?: string;
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