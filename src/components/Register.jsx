import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        inviteCode: formData.inviteCode
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-100 to-blue-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
              <UserPlus className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-2">Join Stucco Rite Inc.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-semibold text-slate-700 mb-2">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your invite code"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={30}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="johndoe"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="john@example.com"
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
                minLength={6}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="At least 6 characters"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Re-enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign in
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

export default Register;
