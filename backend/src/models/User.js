import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fulName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: 200,
  },

  profilePicture: {
    type: String,
    default: '',
  },

  nativeLanguage: {
    type: String,
    default: '',
  },

  learningLanguage: {
    type: String,
    default: '',
  },

  location: {
    type: String,
    default: '',
  },

  isOnboarding: {
    type: Boolean,
    default: false,
  },

  friends: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  },
}, {
  timestamps: true,
});

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

export default User;