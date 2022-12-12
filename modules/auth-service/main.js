import express from 'express';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

import './models/AuthUser.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();

// allows to recognise incoming object as json object
app.use(express.json());

// allow to pass form data
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);

const mongoURI = `mongodb+srv://${process.env.AUTH_SERVICE_MONGO_USERNAME}:${process.env.AUTH_SERVICE_MONGO_PASSWORD}
@gift-wish-auth.rpteshg.mongodb.net/${process.env.AUTH_SERVICE_MONGO_DATABASE}?retryWrites=true&w=majority`;

try {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Successfully connected to the mongo db instance');
  });
} catch (error) {
  console.log('Unable to connect to the database:', error);
}

const PORT = process.env.APPID || 5000;

app.listen(PORT, () => console.log('Listening on port:', PORT));
