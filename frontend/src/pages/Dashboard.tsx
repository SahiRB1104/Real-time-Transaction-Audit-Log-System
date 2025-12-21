import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import TransferForm from '../components/TransferForm.tsx';
import TransactionTable from '../components/TransactionTable.tsx';
import AddBalanceModal from '../components/AddBalanceModel.tsx';
import { getTransactions } from '../api/transactions.ts';
import { Transaction } from '../types.ts';
import {
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddBalanceOpen, setIsAddBalanceOpen] = useState(false);

  /**
   * Fetch transaction history
   */
  const fetchTransactions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await getTransactions();
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch {
      console.warn('Backend unavailable, showing cached transactions.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /**
   * 🔑 Register global Add Balance trigger (used by Layout)
   */
  useEffect(() => {
    (window as any).__openAddBalance = () => {
      setIsAddBalanceOpen(true);
    };

    return () => {
      delete (window as any).__openAddBalance;
    };
  }, []);

  /**
   * After transfer success
   */
  const handleTransferSuccess = useCallback(() => {
    fetchTransactions();
    refreshUser();
  }, [fetchTransactions, refreshUser]);

  /**
   * After top-up success
   */
  const handleTopUpSuccess = useCallback(() => {
    fetchTransactions();
    refreshUser();
  }, [fetchTransactions, refreshUser]);

  /**
   * Totals (SUCCESS only)
   */
  const incomingTotal = useMemo(() => {
    if (!user?.public_id) return 0;

    return transactions
      .filter(
        t =>
          t.receiver_public_id === user.public_id &&
          t.status === 'SUCCESS' &&
          t.type === 'TRANSFER'
      )
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions, user?.public_id]);

  const outgoingTotal = useMemo(() => {
    if (!user?.public_id) return 0;

    return transactions
      .filter(
        t =>
          t.sender_public_id === user.public_id &&
          t.status === 'SUCCESS' &&
          t.type === 'TRANSFER'
      )
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [transactions, user?.public_id]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Overview
          </h1>
          <p className="text-gray-500">
            Manage your transfers and view audit trails
          </p>
        </div>

        <button
          onClick={() => {
            fetchTransactions();
            
          }}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Sync Data
        </button>
      </header>

      {/* Stats Grid — UNCHANGED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            Rs. {(user?.balance || 0).toLocaleString()}
          </div>
          <div className="text-xs text-indigo-100 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Updated in real-time</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Total Received
            </div>
            <div className="text-xl font-bold text-gray-900">
              Rs. {incomingTotal.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ArrowUpRight className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">
              Total Sent
            </div>
            <div className="text-xl font-bold text-gray-900">
              Rs. {outgoingTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid — UNCHANGED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TransferForm onSuccess={handleTransferSuccess} />
        </div>
        <div className="lg:col-span-2">
          <TransactionTable
            transactions={transactions}
            currentUserPublicId={user?.public_id ?? ''}
          />
        </div>
      </div>

      {/* Add Balance Modal (hidden trigger) */}
      <AddBalanceModal
        isOpen={isAddBalanceOpen}
        onClose={() => setIsAddBalanceOpen(false)}
        onSuccess={handleTopUpSuccess}
      />
    </div>
  );
};

export default Dashboard;
