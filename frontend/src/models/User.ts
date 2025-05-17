import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'legal' | 'advocate' | 'public';
  approve: boolean;
  phone: string;
  address: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: ['legal', 'advocate', 'public'],
    default: 'public',
  },
  approve: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true,
  }
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure the model is only created once
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 