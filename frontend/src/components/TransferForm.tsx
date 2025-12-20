import React, { useState, useCallback, useRef } from 'react';
import { Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { transferFunds } from '../api/transactions.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ApiError } from '../types.ts';

interface TransferFormProps {
  onSuccess: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess }) => {
  const { updateBalance } = useAuth();
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const successTimeoutRef = useRef<number | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      const parsedReceiverId = Number(receiverId);
      const parsedAmount = Number(amount);

      if (!Number.isInteger(parsedReceiverId) || parsedReceiverId <= 0) {
        setError('Please enter a valid Receiver ID.');
        return;
      }

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid positive amount.');
        return;
      }

      setIsLoading(true);

      try {
        const response = await transferFunds({
          receiver_id: parsedReceiverId,
          amount: parsedAmount,
        });

        setSuccess(response.data.message);
        updateBalance(response.data.sender_balance);
        setAmount('');
        setReceiverId('');
        onSuccess();

        // Clear success message after 3 seconds
        successTimeoutRef.current = window.setTimeout(
          () => setSuccess(null),
          3000
        );
      } catch (err: unknown) {
        const apiErr = (err as any)?.response?.data as ApiError;
        setError(
          apiErr?.detail ||
            'An unexpected error occurred during the transfer.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [receiverId, amount, onSuccess, updateBalance]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Send className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Transfer Funds
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receiver ID
          </label>
          <input
            type="number"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Enter Receiver's ID"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
              Rs.
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="0.00"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Money
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
