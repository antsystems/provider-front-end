export interface Doctor {
  doctor_id: string;
  doctor_name: string;
  doctor_code?: string;
  email: string;
  contact_number: string;
  hospital_id: string;
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
  hospital_name?: string;
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
  created_by?: string;
  created_by_email?: string;
  created_on?: string;
  updated_on?: string;
}

export interface DoctorsResponse {
  message: string;
  doctors: Doctor[];
  count: number;
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