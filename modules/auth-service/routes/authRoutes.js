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

  if (!email || !password || !username || !name) {
    return res.status(422).send({ error: 'Must provide user details' });
  }

  try {
    const authUser = new AuthUser({ email, password, username, name });
    await authUser.save();

    const user = {
      userId: authUser._id.toString(),
      email: authUser.email,
      name: authUser.name,
      username: authUser.username
    };

    const token = jwt.sign(user, JWT_SECRET);

    // integration team can perform sign up and friend invitation acceptance in the same way
    // invitation requires a token to be sent, however
    if (inviteToken) {
      try {
        const response = await axios.post(
          'http://proxy/user/invite/accept',
          {
            token: inviteToken,
            email: user.email,
            username: user.username,
            name: authUser.name
          },
          {
            headers: {
              Authorization: 'Bearer ' + token
            }
          }
        );

        if (response.data) {
          res.status(200).send({ token, user });
        }
      } catch (e) {
        const result = await AuthUser.deleteOne({ email: authUser.email });
        console.log(result);
        return res.status(500).send('Error in the User Service', e.message);
      }
    } else {
      try {
        const response = await axios.post(
          'http://proxy/user/user',
          {
            userId: authUser._id.toString(),
            email: user.email,
            username: user.username,
            name: authUser.name
          },
          {
            headers: {
              Authorization: 'Bearer ' + token
            }
          }
        );

        if (response.data) {
          res.status(200).send({ token, user });
        }
      } catch (e) {
        const result = await AuthUser.deleteOne({ email: authUser.email });
        console.log(result);
        return res.status(500).send({ error: 'Error in User Service: ' + e.message });
      }
    }
  } catch (e) {
    res.status(500).send({ error: e.message });
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
