export interface Doctor {
  doctor_id: string;
  doctor_name: string;
  doctor_code?: string;
  email: string;
  contact_number: string;
  hospital_id: string;
  hospital_name: string;
  department: string;
  department_id: string;
  department_name: string;
  specialty_id: string;
  specialty_name: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  phone_number?: string;
  availability?: string;
  status?: 'active' | 'inactive';
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
}

export interface Pagination {
  current_page: number;
  has_next: boolean;
  has_prev: boolean;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface DoctorsResponse {
  message: string;
  doctors: Doctor[];
  pagination: Pagination;
}

export interface DoctorResponse {
  message: string;
  doctor: Doctor;
}

export interface CreateDoctorRequest {
  doctor_name: string;
  specialty_name: string;
  department_name: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  contact_number?: string;
  email?: string;
  availability?: string;
}

export interface UpdateDoctorRequest {
  doctor_name?: string;
  qualification?: string;
  experience_years?: number;
  consultation_fee?: number;
  contact_number?: string;
  email?: string;
  availability?: string;
}

export interface DeleteDoctorResponse {
  message: string;
  doctor_id: string;
}

export interface DoctorsApiFilters {
  specialty_name?: string;
  department_name?: string;
  status?: 'active' | 'inactive';
}

export interface SpecialtiesResponse {
  message: string;
  specialty_names: string[];
  count: number;
}

export interface DepartmentsResponse {
  message: string;
  department_names: string[];
  count: number;
}