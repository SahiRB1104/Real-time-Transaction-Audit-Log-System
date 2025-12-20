
import React, { useState } from 'react';
import { X, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addBalance } from '../api/transactions.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ApiError } from '../types.ts';

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const valAmount = parseFloat(amount);
    if (isNaN(valAmount) || valAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await addBalance({ amount: valAmount });
      setSuccess(response.data.message);
      updateBalance(response.data.new_balance);
      setAmount('');
      setTimeout(() => {
        setSuccess(null);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const apiErr = err.response?.data as ApiError;
      setError(apiErr?.detail || 'Failed to add balance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-xl tracking-tight">Add Balance</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Enter the amount you would like to deposit into your account instantly.
          </p>
          
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider">Deposit Amount (Rs.)</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg select-none">Rs.</span>
              <input
                type="number"
                step="0.01"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-14 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xl font-bold text-gray-900 shadow-sm placeholder:text-gray-300"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 animate-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{success}</span>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-gray-600 font-bold hover:bg-gray-50 transition-all text-[15px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[1.5] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 text-[15px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Confirm Deposit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBalanceModal;
