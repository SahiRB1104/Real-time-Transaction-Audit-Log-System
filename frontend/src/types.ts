
export interface User {
  id: number;
  name: string;
  email: string;
  balance: number;
  public_id: string;
  username: string;
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
  sender_public_id?: string;
  receiver_public_id: string;
  sender_username?: string;
  receiver_username: string;
  type: 'TRANSFER' | 'TOP_UP';


}

export interface AuthResponse {
  access_token: string;
}

export interface TransferResponse {
  message: string;
  sender_balance: number;
}

export interface AddBalanceResponse {
  message: string;
  new_balance: number;
}


export interface ApiError {
  detail: string;
}
