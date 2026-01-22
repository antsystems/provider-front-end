export interface Bank {
  id: string; // Document ID - use this as bank_id when creating accounts
  bank_name: string;
  bank_code?: string;
}

export interface BankAccount {
  bank_id?: string;
  bank_name: string;
  account_number: string; // API returns this as account_number
  bank_account_number?: string; // Alias for account_number for backward compatibility
  ifsc_code?: string;
  branch?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  bank_code?: string;
  hospital_id?: string; // Hospital-specific - backend filters by authenticated user's hospital
  created_at?: string;
  created_by?: string;
  created_by_email?: string;
  updated_at?: string;
  updated_by?: string;
  updated_by_email?: string;
}

export interface BankAccountsByBank {
  bank_name: string;
  accounts: string[]; // Array of account numbers
}

export interface AvailableBanksResponse {
  banks: Bank[];
  count: number;
}

export interface BankAccountsResponse {
  bank_accounts: BankAccount[]; // Flat list for table display
  bank_accounts_by_bank: BankAccountsByBank[]; // Grouped by bank
  count: number;
}

export interface ValidateIFSCRequest {
  ifsc_code: string;
}

export interface ValidateIFSCResponse {
  valid: boolean;
  bank_name?: string;
  branch?: string;
  ifsc?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  error?: string;
}

export interface CreateBankAccountRequest {
  bank_name: string; // From dropdown
  bank_account_number: string; // User enters
  ifsc_code: string; // User enters
}

export interface CreateBankAccountResponse {
  message: string;
  bank_account: BankAccount;
}

export interface UpdateBankAccountRequest {
  bank_name: string; // From dropdown
  bank_account_number: string; // User enters
  ifsc_code: string; // User enters
}

export interface UpdateBankAccountResponse {
  message: string;
  bank_account: BankAccount;
}

export interface DeleteBankAccountResponse {
  message: string;
  account_number: string;
}
