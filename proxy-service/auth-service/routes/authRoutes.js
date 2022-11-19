import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const AuthUser = mongoose.model('AuthUser');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  console.log(JWT_SECRET);

  try {
    const authUser = new AuthUser({ email, password });
    await authUser.save();

    const token = jwt.sign(
      { userId: authUser._id.toString(), email: authUser.email },
      JWT_SECRET
    );

    console.log('Token:', token);

    res.send({ token });

    // call user api to add new user
    // I suppose the url would be like this: proxy.domain.com/user/create
    // ("user" is a flag to be used by the proxy to know what service to point to)
    // ("create" is an example of an endpoint inside the user service)
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

  try {
    await authUser.comparePassword(password);
    const token = jwt.sign({ userId: authUser._id.toString(), email }, JWT_SECRET);

    console.log('Token:', token);

    res.send({ token });
  } catch (e) {
    return res.status(401).send({ error: 'Invalid password or email' });
  }
});

export default router;
