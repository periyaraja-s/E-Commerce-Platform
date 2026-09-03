import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
