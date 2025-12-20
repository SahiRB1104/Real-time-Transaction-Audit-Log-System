import React, { useState, useMemo, useCallback } from 'react';
import { Transaction, TransactionStatus } from '../types.ts';
import {
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  currentUserId: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  /**
   * Handle column sorting
   */
  const handleSort = useCallback(
    (field: keyof Transaction) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField]
  );

  /**
   * Memoized filtered & sorted transactions
   */
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) =>
        tx.id.toString().includes(searchTerm) ||
        tx.receiver_id.toString().includes(searchTerm) ||
        tx.sender_id.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
  }, [transactions, searchTerm, sortField, sortDirection]);

  /**
   * Date formatter
   */
  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  /**
   * Sort icon renderer
   */
  const getSortIcon = useCallback(
    (field: keyof Transaction) => {
      if (sortField !== field) {
        return <ArrowUpDown className="w-4 h-4 opacity-30" />;
      }
      return sortDirection === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    },
    [sortField, sortDirection]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900">
          Transaction Audit Log
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID {getSortIcon('id')}
                </div>
              </th>
              <th className="px-6 py-4">Type</th>
              <th
                className="px-6 py-4 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-2">
                  Amount {getSortIcon('amount')}
                </div>
              </th>
              <th className="px-6 py-4">Counterparty</th>
              <th
                className="px-6 py-4 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:text-indigo-600"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-2">
                  Date {getSortIcon('timestamp')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 opacity-20" />
                    <p>No transactions found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isIncoming = tx.receiver_id === currentUserId;
                const isSuccess = tx.status === TransactionStatus.SUCCESS;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      #{tx.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isIncoming ? (
                          <div className="p-1.5 bg-emerald-50 rounded-full">
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-indigo-50 rounded-full">
                            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {isIncoming ? 'Received' : 'Sent'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      <span
                        className={
                          isIncoming ? 'text-emerald-600' : 'text-gray-900'
                        }
                      >
                        {isIncoming ? '+' : '-'}Rs.{' '}
                        {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {isIncoming
                        ? `From ID: ${tx.sender_id}`
                        : `To ID: ${tx.receiver_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(tx.timestamp)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
