import api from './axios.ts';
import { Transaction, TransferResponse } from '../types.ts';

export interface TransferPayload {
  receiver_id: number;
  amount: number;
}

/**
 * Fetch transaction history for logged-in user
 */
export const getTransactions = () =>
  api.get<Transaction[]>('/transactions');

/**
 * Transfer funds to another user
 */
export const transferFunds = (data: TransferPayload) =>
  api.post<TransferResponse>('/transfer', data);
