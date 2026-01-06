const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');


const getMyWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('items.product', 'name price imageUrl stock seller');

        if (!wishlist) {
            return res.json({ items: [] });
        }

        wishlist.items = wishlist.items.filter(item => item.product !== null);
        
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const addToWishlist = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (req.user.roles.includes('admin') || req.user.roles.includes('business-owner')) {
            return res.status(403).json({ message: 'Wishlist is only for Customers and NGOs' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

    
        const itemIndex = wishlist.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
    
            wishlist.items[itemIndex].savedQuantity = quantity;
        } else {
      
            wishlist.items.push({ product: productId, savedQuantity: quantity });
        }

        await wishlist.save();
        res.status(200).json({ message: 'Added to wishlist' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


const removeFromWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (wishlist) {
            wishlist.items = wishlist.items.filter(
                item => item.product.toString() !== req.params.productId
            );
            await wishlist.save();
        }
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMyWishlist, addToWishlist, removeFromWishlist };
