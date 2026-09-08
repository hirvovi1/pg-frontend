// 1. Define exact TypeScript blueprints for your data payloads
// Matches CreateAccountRequest
export interface CreateAccountRequest {
  ownerName: string;
  balanceInCents: number;
}

// Matches the Spring domain model Account returned from POST /accounts
export interface Account {
  id: string; // UUID from backend
  ownerName: string; 
  balanceInCents: number; 
}

// Matches TransferRequest record
export interface TransferRequest {
  idempotencyKey: string; // UUID
  accountIdFrom: string;  // UUID
  accountIdTo: string;    // UUID
  amountInCents: number;
}

// Matches TransferResponse record returned by POST /transfer
export interface TransferResponse {
  message: string;
  transactionId: string; // UUID
  paymentUrl: string;    // Paytrail redirection URL
}

// Matches the response of GET /{id}/status
export interface TransactionStatusResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
}

export const PENDING_TRANSACTION_STORAGE_KEY = 'pgfrontend.pendingTransactionId';
export const MERCHANT_ACCOUNT_ID = '7d8f2b5c-9a44-4f1e-b6d2-31c7e8a95024';
export const MERCHANT_ACCOUNT_OWNER = 'Webstable store';


// 2. Base URL mapping pointing to your exposed Docker container port
const API_BASE_URL = 'http://localhost:8080';

export const paytrailService = {
  
  /**
   * GET /accounts
   * Map to Java backend: getAllAccounts(): List<Account>
   */
  async getAllAccounts(): Promise<Account[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts list');
    return response.json();
  },

  async ensureMerchantAccount(): Promise<Account> {
    const accounts = await this.getAllAccounts();
    const existingMerchant = accounts.find(
      (account) => account.id === MERCHANT_ACCOUNT_ID || account.ownerName === MERCHANT_ACCOUNT_OWNER,
    );

    if (existingMerchant) return existingMerchant;

    return this.createAccount({
      ownerName: MERCHANT_ACCOUNT_OWNER,
      balanceInCents: 0,
    });
  },

  /**
   * POST /accounts
   * Map to Java backend: createAccount(): Account
   */
  createAccount: async (accountData: CreateAccountRequest): Promise<Account> => {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error('Failed to create account profile');
    return response.json();
  },

  /**
   * DELETE /accounts/{id}
   * Map to Java backend: deleteAccount(): void
   */
  deleteAccount: async (accountId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete account');
  },

  /**
   * POST /transfer
   * Map to Java backend: transfer(): ResponseEntity<?>
   */
  executeTransfer: async (payload: TransferRequest): Promise<TransferResponse> => {
    const response = await fetch(`${API_BASE_URL}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Transaction processing failed');
    return response.json();
  },

  /**
   * GET /{id}/status
   * Map to Java backend: getTransactionStatus(): ResponseEntity<?>
   */
  getTransactionStatus: async (transactionId: string | number): Promise<TransactionStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/${transactionId}/status`);
    if (!response.ok) throw new Error(`Could not fetch confirmation for ID: ${transactionId}`);
    return response.json();
  }
};
