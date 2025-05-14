import mongoose from 'mongoose';

// Define the user schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Don't return password by default in queries
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true, // Add createdAt and updatedAt fields
});

// Check if model already exists (for hot reloading in development)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User; 