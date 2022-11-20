import mongoose, { mongo } from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true }
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, immutable: true },
  products: [ProductSchema]
  // ,createdAt: { type: Date, immutable: true, default: () => Date.now() }
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export default Wishlist;