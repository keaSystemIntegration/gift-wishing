import express from 'express';
import "dotenv/config";
import mongoose from 'mongoose';

const app = express();

mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Wishlist Mongo Database'));

app.use(express.json());

import wishlistsRouter from './routes/wishlistRoutes.js';
app.use('/', wishlistsRouter);


const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
})
