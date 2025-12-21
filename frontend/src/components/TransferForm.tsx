import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { transferFunds } from '../api/transactions.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ApiError } from '../types.ts';

interface TransferFormProps {
  onSuccess: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();

  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const successTimeoutRef = useRef<number | null>(null);

  /**
   * ✅ Detect self-transfer using PUBLIC ID
   */
  const isSelfTransfer = useMemo(() => {
    if (!receiverId || !user?.public_id) return false;
    return receiverId.trim() === user.public_id;
  }, [receiverId, user?.public_id]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      const parsedAmount = Number(amount);

      // ❌ Self-transfer guard
      if (receiverId.trim() === user?.public_id) {
        setError('You cannot transfer money to your own account.');
        return;
      }

      // ❌ Invalid Receiver Public ID
      if (!receiverId || receiverId.trim().length < 6) {
        setError('Please enter a valid Receiver ID.');
        return;
      }

      // ❌ Invalid amount
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Please enter a valid positive amount.');
        return;
      }

      setIsLoading(true);

      try {
        const response = await transferFunds({
          receiver_public_id: receiverId.trim(),
          amount: parsedAmount,
        });

        setSuccess(response.data.message);
        setReceiverId('');
        setAmount('');

        // ✅ SUCCESS → refresh transactions
        onSuccess();

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

        // ✅ FAILURE → refresh transactions (FAILED audit log)
        onSuccess();
      } finally {
        setIsLoading(false);
      }
    },
    [receiverId, amount, user?.public_id, onSuccess]
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
        {/* Receiver ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Receiver ID
          </label>
          <input
            type="text"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Enter Receiver's ID"
            required
            disabled={isLoading}
          />
        </div>

        {/* Self-transfer warning */}
        {isSelfTransfer && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>You cannot send money to your own account.</span>
          </div>
        )}

        {/* Amount */}
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

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || isSelfTransfer}
          className={`w-full font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2
            ${
              isSelfTransfer
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }
          `}
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
