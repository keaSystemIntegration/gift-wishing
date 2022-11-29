import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const AuthUser = mongoose.model('AuthUser');

const router = express.Router();
const JWT_SECRET = process.env.AUTH_SERVICE_JWT_SECRET;

router.post('/signup', async (req, res) => {
  const { email, name, username, password, inviteToken } = req.body;

  try {
    const authUser = new AuthUser({ email, password, username, name });
    await authUser.save();

    const user = {
      userId: authUser._id.toString(),
      email: authUser.email,
      name: authUser.name,
      username: authUser.username
    };

    console.log(authUser.email);

    // integration team can perform sign up and friend invitation acceptance in the same way
    // invitation requires a token to be sent
    if (inviteToken) {
      axios
        .post('http://proxy/user/invite/accept', {
          token: inviteToken,
          email: user.email,
          username: user.username,
          name: authUser.name
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch(async (error) => {
          console.log(error);
          const result = await AuthUser.deleteOne({ email: authUser.email });
          console.log(result);
          return res.status(500).send('Error in the User Service');
        });
    } else {
      axios
        .post('http://proxy/user/user', {
          userId: authUser._id.toString(),
          email: user.email,
          username: user.username,
          name: authUser.name
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch(async (error) => {
          console.log(error);
          const result = await AuthUser.deleteOne({ email: authUser.email });
          console.log(result);
          return res.status(500).send('Error in the User Service');
        });
    }

    const token = jwt.sign(user, JWT_SECRET);

    console.log('Token:', token);

    res.status(200).send({ token, user });
  } catch (e) {
    return res.status(422).send(e.message); // invalid data
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }

  const authUser = await AuthUser.findOne({ email });
  if (!authUser) {
    return res.status(404).send({ error: 'Invalid password or email' });
  }

  const user = { userId: authUser._id.toString(), email };

  try {
    await authUser.comparePassword(password);
    const token = jwt.sign(user, JWT_SECRET);

    console.log('Token:', token);

    res.status(200).send({ token, user });
  } catch (e) {
    return res.status(401).send({ error: 'Invalid password or email' });
  }
});

export default router;
