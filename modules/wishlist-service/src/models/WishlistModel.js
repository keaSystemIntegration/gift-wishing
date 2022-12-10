import mongoose, { mongo } from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  subTitle: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  description: { type: String, required: true },
  overallRank: { type: Number, required: true },
  price: { type: Number, required: true }
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, immutable: true },
  products: [ProductSchema]
  // ,createdAt: { type: Date, immutable: true, default: () => Date.now() }
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

export default Wishlist;