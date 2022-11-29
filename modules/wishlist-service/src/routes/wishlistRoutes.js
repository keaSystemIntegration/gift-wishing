// https://www.youtube.com/watch?v=fgTGADljAeg&ab_channel=WebDevSimplified

import express from 'express';
const router = express.Router();
import Wishlist from '../models/WishlistModel.js';

// used for development purposes only
router.get('/all', async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.json(wishlists);
  } catch (error) {
    // means the database has an error and it has nothing to do with the client using the API
    res.status(500).json({ message: error.message });
  }
});

// get wishlists
router.get('/', async (req, res) => {
  if (req.body.friendsList === null) {
    return res.status(404).json({ message: "Friends list missing" });
  }

  try {
    Wishlist.find({
      userId: { $in: req.body.friendsList }
    }, function (err, docs) {
      res.status(200).json(docs);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get user's wishlist
router.get('/:id', async(req, res) => {
  // console.log(req.params.id);

  try {
    const wishlist = await Wishlist.find({ userId: req.params.id });
    // console.log(wishlist)
    // create a new wishlist for new users
    if (wishlist.length === 0) {
      const newWishlist = new Wishlist({
        userId: req.params.id
      });
      await newWishlist.save();
      return res.status(201).json({message: "Successfully created", wishlist: newWishlist} )
    } else {
      return res.status(201).json( wishlist );
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// supplies a set of instructions to modify the resource instead of replacing it
router.patch('/:id', getWishlist, async (req, res) => {
  let newProducts;
  if (Array.isArray(req.body.products)) {
    newProducts = req.body.products;
  } else {
    return res.status(404).json({ message: "Product/s missing" });
  }
  try {
    let updatedWishlist = res.wishlist;
    updatedWishlist.products = newProducts;
    updatedWishlist.save();

    res.status(202).json(updatedWishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', getWishlist, async (req, res) => {
  try {
    const wishlist = res.wishlist;
    await wishlist.remove();
    // 202: Accepted
    res.status(202).json({ message: 'Deleted Wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


async function getWishlist(req, res, next) {
  let wishlist;
  try {
    wishlist = await Wishlist.find({ userId: req.params.id });
    if (wishlist.length === 0) {
      return res.status(404).json({ message: 'Cannot find wishlist' })
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.wishlist = wishlist[0];
  next();
}

export default router;