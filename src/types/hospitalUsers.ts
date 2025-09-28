export interface HospitalUser {
  user_id: string;
  firebase_uid?: string;
  name: string;
  email: string;
  phone_number?: string;
  hospital_id: string;
  hospital_name: string;
  role: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending_password_set';
  created_by: string;
  created_by_email: string;
  created_on: string;
  updated_on: string;
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