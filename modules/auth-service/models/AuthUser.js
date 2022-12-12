import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { cryptAsync, cryptSync } from '../utils/cryptPasword.js';

const authUserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

authUserSchema.pre('save', async function (next) {
  let user = this;
  if (!user.isModified('password')) {
    return next;
  }

  try {
    user.password = await cryptSync(user.password);
    next();
  } catch (err) {
    next(err);
  }
});

authUserSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

mongoose.model('AuthUser', authUserSchema);
