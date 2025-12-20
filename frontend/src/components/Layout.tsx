import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LogOut,
  Wallet,
  CreditCard,
  User,
  Copy,
  Check,
  Plus,
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();

  const [copied, setCopied] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const copyToClipboard = useCallback(() => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [user?.id]);

  const toggleProfile = useCallback(() => {
    setShowProfile(prev => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setShowProfile(false);
    logout();
  }, [logout]);

  const openAddBalance = () => {
    (window as any).__openAddBalance?.();
    setShowProfile(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-100">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                AuditPay
              </span>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-4 lg:gap-8">
                {/* Balance pill (RIGHT SIDE) */}
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full text-indigo-700 font-medium cursor-pointer hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                  onClick={openAddBalance}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Rs. {user?.balance?.toLocaleString() ?? '0'}</span>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-end mr-2 hidden md:flex">
                      <span className="text-sm font-semibold text-gray-900 leading-none">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500">View Profile</span>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                      <User className="w-5 h-5" />
                    </div>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
                      <div className="flex flex-col gap-4">
                        <div className="border-b border-gray-100 pb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            My Account
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {user?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user?.email}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Personal ID
                          </p>
                          <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                            <code className="text-indigo-600 font-mono font-bold">
                              {user?.id}
                            </code>
                            <button onClick={copyToClipboard}>
                              {copied ? <Check /> : <Copy />}
                            </button>
                          </div>
                        </div>

                        {/* RIGHT SIDE Add Balance */}
                        <button
                          onClick={openAddBalance}
                          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                          Add Balance
                        </button>

                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AuditPay Secure Transaction Systems
      </footer>
    </div>
  );
};

export default Layout;
