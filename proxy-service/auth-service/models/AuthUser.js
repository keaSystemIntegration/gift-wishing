import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { cryptAsync } from '../utils/cryptPasword.js';

const authUserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

authUserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next;
  }

  cryptAsync(user.password, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    return next();
  });
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
