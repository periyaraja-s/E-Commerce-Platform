import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const intendedAction = location.state?.action;
  const intendedProduct = location.state?.product;

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Strictly register as customer - public registration never passes role
      await register(form.name.trim(), form.email.trim(), form.password);

      // Check if user had an intended action (e.g. Add to Cart)
      if (intendedAction === 'add-to-cart' && intendedProduct) {
        addToCart(intendedProduct, location.state?.quantity || 1);
        navigate('/cart', { replace: true });
      } else {
        const destination = location.state?.from || '/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request ? 'Server is unreachable. Please try again.' : 'Failed to create account. Please try again.');
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500">Join us to browse catalog, cart, and track orders</p>
        </div>

        {/* Intended Action Notice Banner */}
        {intendedAction === 'add-to-cart' && intendedProduct && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            <span className="text-xl">🛍️</span>
            <div className="text-xs">
              <strong className="block font-semibold">Complete registration to add to cart:</strong>
              <div className="text-amber-800">{intendedProduct.name} &bull; ${Number(intendedProduct.price).toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Role Notice Affirmation */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5 text-blue-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <strong className="font-semibold text-blue-900">Customer Registration:</strong> All public accounts are created with verified customer access. Administrative roles are provisioned securely via system seeding.
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="flex-1 text-xs">{apiError}</div>
            <button
              type="button"
              onClick={() => setApiError('')}
              className="text-red-500 hover:text-red-700 cursor-pointer text-lg leading-none"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="register-name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="register-name"
                type="text"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                }`}
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={submitting}
                autoComplete="name"
                autoFocus
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="register-email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="register-email"
                type="email"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                }`}
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={submitting}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="register-password">
              Password <span className="text-red-500">*</span> (8+ characters)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                }`}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="register-confirm-password">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-400 bg-red-50/20'
                    : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 bg-white'
                }`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={submitting}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Customer Account</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-blue-600 font-semibold hover:underline no-underline">
            Sign In
          </Link>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 no-underline">
            &larr; Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
