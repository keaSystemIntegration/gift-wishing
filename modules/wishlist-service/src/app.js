import express from 'express';
import "dotenv/config";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const { WISHLIST_CONNECTION_URL, WISHLIST_SERVICE_PORT } = process.env;

mongoose.connect(WISHLIST_CONNECTION_URL);
const db = mongoose.connection;

db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Wishlist Mongo Database'));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*'
}));

import wishlistsRouter from './routes/wishlistRoutes.js';
app.use('/', wishlistsRouter);

const PORT = WISHLIST_SERVICE_PORT || 8001;
app.listen(PORT, () => {
  console.log(`WISHLIST server is running on PORT: ${PORT}`);
})
