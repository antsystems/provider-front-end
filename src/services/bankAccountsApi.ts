import {
  AvailableBanksResponse,
  BankAccountsResponse,
  CreateBankAccountRequest,
  CreateBankAccountResponse,
  UpdateBankAccountRequest,
  UpdateBankAccountResponse,
  DeleteBankAccountResponse,
  ValidateIFSCRequest,
  ValidateIFSCResponse,
} from '@/types/bankAccounts';
import authService from '@/services/auth';
import { getCached, setCached, clearCache } from '@/services/cache';
import { API_BASE_URL } from '@/config/api';

class BankAccountsApiService {
  private baseUrl = API_BASE_URL;

  private getAuthHeaders() {
    const token = authService.getCurrentToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Validate IFSC code and get bank details
   */
  async validateIFSC(ifscCode: string): Promise<ValidateIFSCResponse> {
    const url = `${this.baseUrl}/bank-accounts/validate-ifsc`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ifsc_code: ifscCode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ValidateIFSCResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to validate IFSC code:', error);
      throw error;
    }
  }

  /**
   * Get available banks (deprecated - use IFSC validation instead)
   */
  async getAvailableBanks(useCache = true): Promise<AvailableBanksResponse> {
    const cacheKey = 'available-banks';

    // Check cache first if enabled
    if (useCache) {
      const cached = getCached<AvailableBanksResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.baseUrl}/bank-accounts/available-banks`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AvailableBanksResponse = await response.json();

      // Cache for 10 minutes
      setCached(cacheKey, data, 1000 * 60 * 10);

      return data;
    } catch (error) {
      console.error('Failed to fetch available banks:', error);
      
      // Handle network errors (Failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection or contact support if the problem persists.');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Get all bank accounts
   */
  async getBankAccounts(): Promise<BankAccountsResponse> {
    const url = `${this.baseUrl}/bank-accounts`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: BankAccountsResponse = await response.json();
      
      // Normalize account_number to bank_account_number for consistency
      if (data.bank_accounts) {
        data.bank_accounts = data.bank_accounts.map(account => ({
          ...account,
          bank_account_number: account.account_number || account.bank_account_number || '',
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
      
      // Handle network errors (Failed to fetch)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection or contact support if the problem persists.');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Create a new bank account
   */
  async createBankAccount(accountData: CreateBankAccountRequest): Promise<CreateBankAccountResponse> {
    const url = `${this.baseUrl}/bank-accounts`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreateBankAccountResponse = await response.json();

      // Clear cache after successful creation
      this.clearBankAccountsCache();

      return data;
    } catch (error) {
      console.error('Failed to create bank account:', error);
      throw error;
    }
  }

  /**
   * Update a bank account
   */
  async updateBankAccount(
    oldAccountNumber: string,
    accountData: UpdateBankAccountRequest
  ): Promise<UpdateBankAccountResponse> {
    const url = `${this.baseUrl}/bank-accounts/${encodeURIComponent(oldAccountNumber)}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UpdateBankAccountResponse = await response.json();

      // Clear cache after successful update
      this.clearBankAccountsCache();

      return data;
    } catch (error) {
      console.error('Failed to update bank account:', error);
      throw error;
    }
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(accountNumber: string): Promise<DeleteBankAccountResponse> {
    const url = `${this.baseUrl}/bank-accounts/${encodeURIComponent(accountNumber)}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DeleteBankAccountResponse = await response.json();

      // Clear cache after successful deletion
      this.clearBankAccountsCache();

      return data;
    } catch (error) {
      console.error('Failed to delete bank account:', error);
      throw error;
    }
  }

  /**
   * Clear the available banks cache
   */
  clearAvailableBanksCache(): void {
    clearCache('available-banks');
  }

  /**
   * Clear the bank accounts cache
   */
  clearBankAccountsCache(): void {
    clearCache('bank-accounts');
  }
}

export const bankAccountsApi = new BankAccountsApiService();
