import api from './axios.ts';
import { Transaction, TransferResponse, AddBalanceResponse} from '../types.ts';

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


export const addBalance = (data: { amount: number }) =>
  api.post<AddBalanceResponse>('/add-balance', data);
