import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('OrderItem', orderItemSchema);
