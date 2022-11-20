import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const AuthUser = mongoose.model('AuthUser');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
  const { email, name, username, password } = req.body;

  console.log(JWT_SECRET);

  try {
    const session = await mongoose.startSession();
    session.withTransaction(async () => {
      const authUser = new AuthUser({ email, password, username, name });
      await authUser.save({ session });

      const user = {
        userId: authUser._id.toString(),
        email: authUser.email,
        name: authUser.name,
        username: authUser.username
      };

      // call user api to add new user
      // I suppose the url would be like this: proxy.domain.com/user/create
      // ("user" is a flag to be used by the proxy to know what service to point to)
      // ("create" is an example of an endpoint inside the user service)

      // does the user service need the uuid from the authuser here?
      // const res = await axios.post('https://localhost:8000/user-service/user', {
      //   id: authUser._id.toString(),
      //   email: user.email,
      //   username: user.username,
      //   name: authUser.name
      // });

      // if (!res.data) {
      //   throw new Error("Couldn't add user to the user-service");
      // }

      const token = jwt.sign(user, JWT_SECRET);

      console.log('Token:', token);

      res.send({ token, user });
    });
    session.endSession();
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

    res.send({ token, user });
  } catch (e) {
    return res.status(401).send({ error: 'Invalid password or email' });
  }
});

export default router;
