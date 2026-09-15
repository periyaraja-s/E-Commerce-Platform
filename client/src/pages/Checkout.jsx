import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    loading: cartLoading,
    cartSubtotal,
    cartCount,
    shipping,
    tax,
    grandTotal,
    clearCart,
  } = useCart();

  // Shipping & Contact form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    notes: '',
  });

  // Payment Method Selection: 'razorpay' (default) or 'cash_on_delivery'
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Validation errors
  const [errors, setErrors] = useState({});
  // Submission, verification & server error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [paymentNotice, setPaymentNotice] = useState(null);

  // Fallback simulator modal for environments where external Razorpay script is blocked or offline
  const [testSimulatorData, setTestSimulatorData] = useState(null);

  // Sync user name/email if user loads late
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Admin access restriction
  if (user?.role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Admin Account Notice</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Administrators manage products and view store orders, but cannot place consumer retail orders.
          </p>
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              View Store Orders &rarr;
            </Link>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle empty cart state
  if (!cartLoading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6">
            You cannot proceed to checkout without items in your shopping cart. Add your favorite products first!
          </p>
          <div className="flex justify-center">
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold no-underline transition-colors shadow-xs"
            >
              Explore Products &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.trim().replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Please provide a valid phone number (minimum 7 digits)';
    }

    if (!formData.line1.trim()) newErrors.line1 = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State or province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal / ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setServerError(null);
    setPaymentNotice(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map current cart items for validation
      const itemsPayload = items.map((item) => ({
        product: item.product._id || item.product.id || item.product,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
      }));

      const shippingAddressPayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        line1: formData.line1.trim(),
        line2: (formData.line2 || '').trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
      };

      if (paymentMethod === 'razorpay') {
        // === RAZORPAY TEST MODE PAYMENT FLOW ===
        // Step 1: Create Razorpay Order on server (server calculates amount & validates inventory)
        const createRes = await api.post('/orders/razorpay/create-order', {
          shippingAddress: shippingAddressPayload,
          notes: (formData.notes || '').trim(),
          items: itemsPayload,
        });

        if (!createRes.data?.success || !createRes.data?.data) {
          throw new Error(createRes.data?.message || 'Failed to initialize Razorpay payment order.');
        }

        const rzpData = createRes.data.data;

        // Step 2: If Razorpay SDK is loaded, launch the standard Razorpay checkout modal
        if (typeof window !== 'undefined' && typeof window.Razorpay === 'function') {
          const options = {
            key: rzpData.keyId,
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'E-Commerce Store',
            description: `Payment for Order #${rzpData.orderNumber}`,
            order_id: rzpData.orderId,
            prefill: {
              name: formData.name.trim(),
              email: user?.email || formData.email || '',
              contact: formData.phone.trim(),
            },
            notes: {
              orderNumber: rzpData.orderNumber,
              environment: 'Test Mode',
            },
            theme: {
              color: '#2563eb',
            },
            modal: {
              ondismiss: async function () {
                setIsSubmitting(false);
                setPaymentNotice('Payment modal was closed. Your cart remains saved so you can retry checkout whenever ready.');
              },
            },
            handler: async function (response) {
              // Step 3: Verify cryptographic signature on server
              try {
                setIsVerifying(true);
                const verifyRes = await api.post('/orders/razorpay/verify-payment', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                });

                if (verifyRes.data?.success && verifyRes.data?.data) {
                  // Clear customer cart only after server verifies signature & completes order
                  await clearCart();
                  const paidOrder = verifyRes.data.data;
                  navigate(`/order-confirmation/${paidOrder.orderNumber || paidOrder._id}`, {
                    state: { order: paidOrder, isNewOrder: true, paymentSuccess: true },
                    replace: true,
                  });
                } else {
                  throw new Error(verifyRes.data?.message || 'Payment signature verification failed.');
                }
              } catch (verifyErr) {
                console.error('Razorpay payment verification error:', verifyErr);
                setServerError(
                  verifyErr.response?.data?.message ||
                    verifyErr.message ||
                    'Payment verification failed. Please contact support or retry.'
                );
                setIsVerifying(false);
                setIsSubmitting(false);
              }
            },
          };

          const rzpInstance = new window.Razorpay(options);

          rzpInstance.on('payment.failed', async function (failedResponse) {
            try {
              await api.post('/orders/razorpay/payment-failed', {
                razorpay_order_id: rzpData.orderId,
                razorpay_payment_id: failedResponse.error?.metadata?.payment_id,
                error_description: failedResponse.error?.description,
              });
            } catch (failErr) {
              console.error('Failed to notify payment failure:', failErr);
            }
            setServerError(`Payment Failed: ${failedResponse.error?.description || 'Transaction was declined.'}`);
            setIsSubmitting(false);
          });

          rzpInstance.open();
        } else {
          // If Razorpay SDK script is not available (e.g. adblocker, sandbox, or offline), open test simulator
          setTestSimulatorData({
            keyId: rzpData.keyId,
            orderId: rzpData.orderId,
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            orderNumber: rzpData.orderNumber,
            customerName: formData.name.trim(),
          });
          setIsSubmitting(false);
        }
      } else {
        // === CASH ON DELIVERY FLOW ===
        const payload = {
          shippingAddress: shippingAddressPayload,
          paymentMethod: 'cash_on_delivery',
          notes: (formData.notes || '').trim(),
          items: itemsPayload,
        };

        const res = await api.post('/orders', payload);

        if (res.data?.success && res.data?.data) {
          const createdOrder = res.data.data;
          await clearCart();
          navigate(`/order-confirmation/${createdOrder._id || createdOrder.orderNumber}`, {
            state: { order: createdOrder, isNewOrder: true },
            replace: true,
          });
        } else {
          throw new Error(res.data?.message || 'Order creation failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while placing your order. Please check your information and try again.';
      setServerError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      if (paymentMethod === 'cash_on_delivery') {
        setIsSubmitting(false);
      }
    }
  };

  // Test Simulator Actions for Test Mode
  const handleSimulatePaymentSuccess = async () => {
    if (!testSimulatorData) return;
    setIsVerifying(true);
    setServerError(null);

    try {
      // 1. Get valid HMAC signature calculated by backend using test secret
      const simRes = await api.post('/orders/razorpay/simulate-signature', {
        razorpay_order_id: testSimulatorData.orderId,
      });

      if (!simRes.data?.success) {
        throw new Error(simRes.data?.message || 'Could not generate test payment credentials.');
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = simRes.data.data;

      // 2. Call real verify-payment endpoint with the generated test signature
      const verifyRes = await api.post('/orders/razorpay/verify-payment', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (verifyRes.data?.success && verifyRes.data?.data) {
        await clearCart();
        const paidOrder = verifyRes.data.data;
        setTestSimulatorData(null);
        navigate(`/order-confirmation/${paidOrder.orderNumber || paidOrder._id}`, {
          state: { order: paidOrder, isNewOrder: true, paymentSuccess: true },
          replace: true,
        });
      } else {
        throw new Error(verifyRes.data?.message || 'Test payment verification failed.');
      }
    } catch (err) {
      console.error('Simulate payment error:', err);
      setServerError(err.response?.data?.message || err.message || 'Failed to complete test payment verification.');
      setIsVerifying(false);
    }
  };

  const handleSimulatePaymentFailure = async () => {
    if (!testSimulatorData) return;
    try {
      await api.post('/orders/razorpay/payment-failed', {
        razorpay_order_id: testSimulatorData.orderId,
        error_description: 'Test Mode: Payment cancelled by user in simulator.',
      });
    } catch (e) {
      console.error(e);
    }
    setTestSimulatorData(null);
    setServerError('Payment was declined or cancelled (Test Mode). You can retry payment whenever you are ready.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium" aria-label="Breadcrumb">
        <Link to="/cart" className="text-slate-600 hover:text-blue-600 transition-colors no-underline">
          &larr; Return to Cart
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Checkout</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">
          Confirm your delivery address, review order items, and place your order.
        </p>
      </div>

      {/* Global Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 mt-0.5 text-rose-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="flex-1">
            <strong className="block text-sm font-bold">Unable to place order</strong>
            <span className="text-xs sm:text-sm mt-0.5">{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="text-rose-500 hover:text-rose-700 text-lg font-bold cursor-pointer bg-transparent border-0 p-0"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Checkout Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          <form id="checkout-address-form" onSubmit={handleSubmitOrder}>
            {/* Contact Information */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Contact Information</h2>
                  <p className="text-xs text-slate-500">We will use this to send order confirmations and delivery updates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.name}</span>}
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Account)</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="checkout-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. +1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.phone ? (
                  <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.phone}</span>
                ) : (
                  <span className="block text-xs text-slate-400 mt-1">Required for carrier delivery and dispatch notifications</span>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Shipping Address</h2>
                  <p className="text-xs text-slate-500">Where should we deliver your order?</p>
                </div>
              </div>

              <div>
                <label htmlFor="checkout-line1" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="checkout-line1"
                  type="text"
                  name="line1"
                  placeholder="House / Flat No., Street, Building"
                  value={formData.line1}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.line1 ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.line1 && <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.line1}</span>}
              </div>

              <div className="mt-4">
                <label htmlFor="checkout-line2" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Apartment, Suite, Unit <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="checkout-line2"
                  type="text"
                  name="line2"
                  placeholder="Apt, Suite, Floor, Landmark"
                  value={formData.line2}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="checkout-city" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    placeholder="e.g. San Francisco"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.city && <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.city}</span>}
                </div>

                <div>
                  <label htmlFor="checkout-state" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    placeholder="e.g. CA"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.state && <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.state}</span>}
                </div>

                <div>
                  <label htmlFor="checkout-postal" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Postal / ZIP Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    name="postalCode"
                    placeholder="e.g. 94105"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.postalCode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 bg-white'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.postalCode && <span className="block text-xs text-rose-600 mt-1 font-medium">{errors.postalCode}</span>}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="checkout-country" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country / Region
                </label>
                <select
                  id="checkout-country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="India">India</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>

              <div className="mt-4">
                <label htmlFor="checkout-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="checkout-notes"
                  name="notes"
                  rows={2}
                  placeholder="e.g. Leave package on front porch, gate code #4912"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
                  <p className="text-xs text-slate-500">Choose your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Razorpay Test Mode Option (Recommended & Default) */}
                <label
                  htmlFor="payment-method-razorpay"
                  className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        id="payment-method-razorpay"
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        disabled={isSubmitting || isVerifying}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            Razorpay Payment Gateway
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide uppercase border border-amber-200">
                            Test Mode
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          Pay securely with Cards (Visa, Mastercard, RuPay), UPI, NetBanking, or Wallets in Razorpay Test Mode.
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-blue-700 font-medium bg-blue-100/60 px-2.5 py-1 rounded-lg">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          <span>Safe sandbox: No real credit card or bank account will be charged.</span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold text-xs text-blue-600 hidden sm:inline">Instant</span>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  htmlFor="payment-method-cod"
                  className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        id="payment-method-cod"
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        disabled={isSubmitting || isVerifying}
                      />
                      <div>
                        <span className="font-bold text-sm text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          Pay in cash or upon package arrival at your doorstep. No payment credentials required today.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Notice */}
              {paymentNotice && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="8" />
                  </svg>
                  <span className="flex-1">{paymentNotice}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Items List Preview */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-4 pr-1">
              {items.map(({ product, quantity, itemSubtotal }) => {
                if (!product) return null;
                const pId = product._id || product.id;
                const price = Number(product.price) || 0;
                const computed = itemSubtotal != null ? itemSubtotal : price * quantity;
                const img =
                  Array.isArray(product.images) && product.images[0]
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

                return (
                  <div key={pId} className="py-3 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={img}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                        }}
                      />
                      <span className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                        {quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ${price.toFixed(2)} &times; {quantity}
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-900 shrink-0">
                      ${computed.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${cartSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  Shipping &amp; Handling
                  {shipping === 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      FREE
                    </span>
                  )}
                </span>
                <span className="font-semibold text-slate-900">{shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
              </div>

              {cartSubtotal < 50 && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs font-medium">
                  Add ${(50 - cartSubtotal).toFixed(2)} more to qualify for <strong>FREE shipping</strong>!
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-xl text-blue-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit / Place Order Button */}
            <button
              type="submit"
              form="checkout-address-form"
              className="w-full mt-6 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSubmitting || isVerifying || cartLoading || items.length === 0}
            >
              {isVerifying ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Verifying Razorpay Signature...
                </span>
              ) : isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  {paymentMethod === 'razorpay' ? 'Connecting to Razorpay...' : 'Creating Order...'}
                </span>
              ) : paymentMethod === 'razorpay' ? (
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  Proceed to Razorpay • ${grandTotal.toFixed(2)}
                </span>
              ) : (
                `Place Order (COD) • $${grandTotal.toFixed(2)}`
              )}
            </button>

            {/* Trust and Guarantee Badges */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Razorpay 256-bit encrypted Test Mode gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Cryptographic HMAC-SHA256 signature verification</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Atomic stock and order updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Simulator Dialog (shown if external Razorpay SDK is blocked or simulated) */}
      {testSimulatorData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Razorpay Test Simulator</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      TEST MODE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Official Razorpay test order initialized</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestSimulatorData(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
                aria-label="Close simulator"
              >
                &times;
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-slate-900">{testSimulatorData.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Order ID:</span>
                <span className="font-mono text-blue-700 font-semibold truncate max-w-[200px]" title={testSimulatorData.orderId}>
                  {testSimulatorData.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{(testSimulatorData.amount / 100).toFixed(2)} ({testSimulatorData.currency})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium text-slate-800">{testSimulatorData.customerName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              In test mode, simulate customer checkout by authorizing this payment. The server will compute an authentic HMAC-SHA256 signature using your secret and perform atomic verification.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleSimulatePaymentSuccess}
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                    </svg>
                    <span>Verifying Signature &amp; Finalizing Order...</span>
                  </>
                ) : (
                  <>
                    <span>✓ Simulate Successful Payment (Authorize)</span>
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSimulatePaymentFailure}
                  disabled={isVerifying}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Simulate Payment Decline
                </button>
                <button
                  type="button"
                  onClick={() => setTestSimulatorData(null)}
                  disabled={isVerifying}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
