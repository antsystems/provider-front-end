export interface HospitalUser {
  user_id?: string;
  uid?: string;
  firebase_uid?: string;
  name?: string;
  displayName?: string;
  email: string;
  phone_number?: string;
  mobile?: string;
  hospital_id: string;
  hospital_name: string;
  hospitalCode?: string;
  role: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'pending_password_set';
  is_active?: boolean;
  created_by?: string;
  created_by_email?: string;
  created_on?: string;
  createdAt?: string;
  created_at?: string;
  updated_on?: string;
  updatedAt?: string;
  updated_at?: string;
  department?: string;
  designation?: string;
  emailVerified?: boolean;
  employee_id?: string;
  auto_id?: string;
  preferences?: {
    language: string;
    notifications: boolean;
    theme: string;
  };
  entity_assignments?: {
    hospitals: Array<{
      city: string;
      code: string;
      id: string;
      name: string;
    }>;
  };
  password_setup_required?: boolean;
  password_setup_completed_at?: string;
  password_setup_email_sent?: boolean;
  password_setup_email_sent_at?: string;
  account_activated_at?: string;
}

export interface HospitalUsersResponse {
  message: string;
  users: HospitalUser[];
  count: number;
}

export interface SingleHospitalUserResponse {
  message: string;
  user: HospitalUser;
}

export interface CreateHospitalUserRequest {
  name: string;
  email: string;
  phone_number?: string;
}

export interface CreateHospitalUserResponse {
  message: string;
  user: HospitalUser;
  email_sent: boolean;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'pending_password_set';
}

export interface UpdateUserStatusResponse {
  message: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    status: string;
    updated_on: string;
  };
}

export interface BulkUpdateStatusRequest {
  user_ids: string[];
  status: 'active' | 'inactive' | 'pending_password_set';
}

export interface BulkUpdateStatusResponse {
  message: string;
  successful_updates: {
    user_id: string;
    status: string;
  }[];
  failed_updates: {
    user_id: string;
    error: string;
  }[];
  total_processed: number;
}

export interface HospitalUsersApiFilters {
  status?: 'active' | 'inactive' | 'pending_password_set';
  role?: string;
}

// Available user roles
export const USER_ROLES = [
  'hospital_admin',
  'hospital_user',
  'rm',
  'rp'
] as const;

export type UserRole = typeof USER_ROLES[number];

// Status options with display labels
export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', description: 'User can login and access the system' },
  { value: 'inactive', label: 'Inactive', description: 'User cannot login' },
  { value: 'pending_password_set', label: 'Pending Password', description: 'User needs to set password' },
] as const;