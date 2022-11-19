import bcrypt from 'bcrypt';

export const cryptSync = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const cryptAsync = (password, callback) => {
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return callback(err);
    }

    bcrypt.hash(password, salt, callback, function (err, hash) {
      return callback(err, hash);
    });
  });
};
