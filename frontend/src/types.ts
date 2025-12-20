
export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface Transaction {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: number;
  status: TransactionStatus;
  timestamp: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface TransferResponse {
  message: string;
  sender_balance: number;
}

export interface ApiError {
  detail: string;
}
