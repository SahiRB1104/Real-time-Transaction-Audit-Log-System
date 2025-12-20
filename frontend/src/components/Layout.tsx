import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LogOut, Wallet, CreditCard, User, Copy, Check } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /**
   * Copy user ID safely to clipboard
   */
  const copyToClipboard = useCallback(() => {
    if (!user?.id) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(user.id.toString()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [user?.id]);

  /**
   * Toggle profile dropdown
   */
  const toggleProfile = useCallback(() => {
    setShowProfile(prev => !prev);
  }, []);

  /**
   * Logout handler
   */
  const handleLogout = useCallback(() => {
    setShowProfile(false);
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                AuditPay
              </span>
            </div>

            {isAuthenticated && (
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-medium">
                  <Wallet className="w-4 h-4" />
                  <span>Rs. {user?.balance?.toLocaleString() ?? '0'}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-end mr-2 hidden md:flex">
                      <span className="text-sm font-semibold text-gray-900 leading-none">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        View Profile
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700">
                      <User className="w-5 h-5" />
                    </div>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
                      <div className="flex flex-col gap-3">
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
                            <button
                              onClick={copyToClipboard}
                              className="p-1.5 hover:bg-white rounded-md border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-indigo-600"
                              title="Copy ID"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 mt-2"
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
