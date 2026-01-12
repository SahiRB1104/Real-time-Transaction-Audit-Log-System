import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth.ts';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  WifiOff,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{
    message: string;
    type: 'auth' | 'network' | 'server' | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showColdStartWarning, setShowColdStartWarning] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      setShowColdStartWarning(false);

      // Show cold start warning after 5 seconds
      const coldStartTimer = setTimeout(() => {
        setShowColdStartWarning(true);
      }, 5000);

      try {
        const response = await loginUser({ email, password });

        // Only handle token here
        await login(response.data.access_token);
        clearTimeout(coldStartTimer);
        navigate('/');
      } catch (err: any) {
        // Check for custom user message from axios interceptor
        if (err.userMessage) {
          setError({
            message: err.userMessage,
            type: 'network',
          });
        } else if (err.response) {
          const status = err.response.status;
          const detail = err.response.data?.detail;

          if (status === 401) {
            setError({
              message: 'Invalid email or password. Please try again.',
              type: 'auth',
            });
          } else if (status === 422) {
            setError({
              message:
                'Invalid input format. Please check your email and password.',
              type: 'server',
            });
          } else if (status >= 500) {
            setError({
              message:
                'The server is currently unavailable. Please try again later.',
              type: 'server',
            });
          } else {
            setError({
              message:
                detail ||
                'An error occurred during login. Please try again.',
              type: 'server',
            });
          }
        } else if (err.request) {
          setError({
            message:
              'Server is not responding. If this is your first request, the server may be starting up (Render free tier takes 30-60 seconds). Please wait and try again.',
            type: 'network',
          });
        } else {
          setError({
            message: 'An unexpected error occurred. Please try again.',
            type: 'server',
          });
        }
      } finally {
        clearTimeout(coldStartTimer);
        setIsLoading(false);
        setShowColdStartWarning(false);
      }
    },
    [email, password, login, navigate]
  );

  const renderErrorIcon = () => {
    if (!error) return null;
    switch (error.type) {
      case 'network':
        return <WifiOff className="w-5 h-5 mt-0.5 flex-shrink-0" />;
      case 'auth':
        return <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />;
      default:
        return <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4">
          <LogIn className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2">
          Log in to manage your transactions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              error.type === 'auth'
                ? 'bg-orange-50 text-orange-800 border border-orange-100'
                : error.type === 'network'
                ? 'bg-blue-50 text-blue-800 border border-blue-100'
                : 'bg-red-50 text-red-800 border border-red-100'
            }`}
          >
            {renderErrorIcon()}
            <div>
              <p className="font-bold">
                {error.type === 'auth'
                  ? 'Authentication Failed'
                  : error.type === 'network'
                  ? 'Connection Problem'
                  : 'System Error'}
              </p>
              <p className="opacity-90">{error.message}</p>
            </div>
          </div>
        )}

        {isLoading && showColdStartWarning && (
          <div className="flex items-start gap-3 p-4 rounded-xl text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <Loader2 className="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" />
            <div>
              <p className="font-bold">Server is waking up...</p>
              <p className="opacity-90">
                The free server takes 30-60 seconds to start after inactivity. Please wait, this is normal for the first request.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="text-indigo-600 font-bold hover:underline"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
