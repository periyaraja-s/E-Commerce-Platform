import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    subtotal: { type: Number, default: 0 },
  },
  { _id: true },
);

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'United States' },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true, minlength: 1 },
    shippingAddress: { type: addressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'cod', 'razorpay', 'credit_card', 'standard'],
      default: 'cash_on_delivery',
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });

export default mongoose.model('Order', orderSchema);
