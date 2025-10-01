export interface EditHistoryEntry {
  action: string;
  changes: string;
  edited_at: string;
  edited_by: string;
  edited_by_email: string;
  edited_by_name: string;
}

export interface Department {
  id: string;
  department_id: string;
  department_name: string;
  department_type: 'CLINICAL' | 'NON-CLINICAL' | 'SUPPORTIVE' | 'AUXILIARY';
  point_of_contact: string;
  phone_no: string;
  email_id: string;
  hospital_id?: string;
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
  edit_history?: EditHistoryEntry[];
}

export interface PaginationMetadata {
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface DepartmentsResponse {
  message: string;
  departments: Department[];
  pagination: PaginationMetadata;
}

export interface DepartmentsApiFilters {
  page?: number;
  limit?: number;
  include_inactive?: boolean;
}

export interface SingleDepartmentResponse {
  message: string;
  department: Department;
}

export interface StaffMember {
  name: string;
  designation: string;
  email: string;
  phone_number: string;
  qualification?: string;
  experience_years?: number;
}

export interface CreateDepartmentRequest {
  department_type: 'CLINICAL' | 'NON-CLINICAL' | 'SUPPORTIVE' | 'AUXILIARY';
  department_id: string;
  department_name: string;
  point_of_contact: string;
  phone_no: string;
  email_id: string;
  staff_members?: StaffMember[];
}

export interface CreateDepartmentResponse {
  message: string;
  department: Department;
  staff_created?: number;
  staff_count?: number;
}

export interface UpdateDepartmentRequest {
  department_name?: string;
  department_type?: 'CLINICAL' | 'NON-CLINICAL' | 'SUPPORTIVE' | 'AUXILIARY';
  point_of_contact?: string;
  phone_no?: string;
  email_id?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateDepartmentResponse {
  message: string;
  department: Department;
}

export interface DeleteDepartmentResponse {
  message: string;
}

export interface DepartmentStatistics {
  total: number;
  active: number;
  inactive: number;
  by_type: {
    CLINICAL: number;
    'NON-CLINICAL': number;
    SUPPORTIVE: number;
    AUXILIARY: number;
  };
}

// Department type options with display labels
export const DEPARTMENT_TYPE_OPTIONS = [
  { value: 'CLINICAL', label: 'Clinical', description: 'Direct patient care departments' },
  { value: 'NON-CLINICAL', label: 'Non-Clinical', description: 'Administrative and support departments' },
  { value: 'SUPPORTIVE', label: 'Supportive', description: 'Essential service departments' },
  { value: 'AUXILIARY', label: 'Auxiliary', description: 'Additional service departments' },
] as const;

// Status options
export const DEPARTMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', description: 'Department is active' },
  { value: 'inactive', label: 'Inactive', description: 'Department is inactive' },
] as const;

export type DepartmentType = typeof DEPARTMENT_TYPE_OPTIONS[number]['value'];
export type DepartmentStatus = typeof DEPARTMENT_STATUS_OPTIONS[number]['value'];