export interface Bank {
  id: string; // Document ID - use this as bank_id when creating accounts
  bank_name: string;
  bank_code?: string;
}

export interface BankAccount {
  bank_id: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code?: string;
  branch?: string;
  remarks?: string;
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

export interface CreateBankAccountRequest {
  bank_id: string;
  bank_account_number: string;
  ifsc_code?: string;
  branch?: string;
  remarks?: string;
}

export interface CreateBankAccountResponse {
  message: string;
  bank_account: BankAccount;
}

export interface UpdateBankAccountRequest {
  bank_account_number: string;
  ifsc_code?: string;
  branch?: string;
  remarks?: string;
}

export interface UpdateBankAccountResponse {
  message: string;
  bank_account: BankAccount;
}

export interface DeleteBankAccountResponse {
  message: string;
  account_number: string;
}
