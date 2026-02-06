import { useState } from 'react';
import { LogIn, Shield } from 'lucide-react';
import { verifyTwoFactorLogin } from '../utils/Api';

const Login = ({ onLogin, onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onLogin(formData.username, formData.password);

      // Check if 2FA is required
      if (result && result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTempToken(result.tempToken);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyTwoFactorLogin(tempToken, twoFactorCode);
      if (result && result.token) {
        onLoginSuccess(result.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false);
    setTempToken('');
    setTwoFactorCode('');
    setError('');
  };

  // 2FA verification screen
  if (requiresTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Two-Factor Authentication</h1>
              <p className="text-slate-500 mt-2">Enter the code from your authenticator app</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 2FA Form */}
            <form onSubmit={handleTwoFactorSubmit} className="space-y-5">
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-semibold text-slate-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 text-center text-2xl tracking-widest placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="000000"
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Or enter a backup code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length < 6}
                className="w-full rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-green-600/30 transition hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToLogin}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 hover:underline"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
              <LogIn className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to Stucco Rite Inc.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your username or email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Stucco Rite Inc. Digital Forms Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
