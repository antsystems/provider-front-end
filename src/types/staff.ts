export interface Staff {
  staff_id: string;
  staff_name: string;
  contact_number: string;
  email: string;
  department_name: string;
  hospital_id: string;
  hospital_name: string;
  status: 'active' | 'inactive';
  created_by: string;
  created_by_email: string;
  created_on: string;
  updated_on: string;
}

export interface StaffResponse {
  message: string;
  staff: Staff[];
  count: number;
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
  staff_name?: string;
  contact_number?: string;
  email?: string;
  department_name?: string;
}

export interface DeleteStaffResponse {
  message: string;
  staff_id: string;
}

export interface StaffApiFilters {
  department_name?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentsResponse {
  message: string;
  departments: string[];
  count: number;
}