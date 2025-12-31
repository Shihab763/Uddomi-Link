const Wishlist = require('../models/wishlistModel');

const getMyWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products')
    .populate('portfolios')
    .populate('sellers', 'name email profileImage');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id });
  }

  res.json(wishlist);
};

const checkWishlist = async (req, res) => {
  const { itemType, itemId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.json({ inWishlist: false });

  const exists = wishlist[itemType + 's']?.some(
    (id) => String(id) === itemId
  );

  res.json({ inWishlist: !!exists });
};

const addToWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id });

  const key = itemType + 's';
  if (!wishlist[key].includes(itemId)) wishlist[key].push(itemId);

  await wishlist.save();
  res.json({ success: true });
};

const removeFromWishlist = async (req, res) => {
  const { itemId, itemType } = req.body;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.json({ success: true });

  wishlist[itemType + 's'] = wishlist[itemType + 's'].filter(
    (id) => String(id) !== itemId
  );

  await wishlist.save();
  res.json({ success: true });
};

module.exports = {
  getMyWishlist,
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
};
