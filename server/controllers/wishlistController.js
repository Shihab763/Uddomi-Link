const Wishlist = require('../models/wishlistModel');
const { AnalyticsEvent } = require('../models/analyticsModel');

const getMyWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'items.itemId',
                select: 'name title price thumbnailUrl mediaUrl creator profileImage',
                populate: {
                    path: 'creator',
                    select: 'name profileImage'
                }
            });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, items: [] });
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;

        if (!['portfolio', 'product', 'creator', 'training'].includes(itemType)) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, items: [] });
        }

        const existingItem = wishlist.items.find(item =>
            item.itemId.toString() === itemId && item.itemType === itemType
        );

        if (existingItem) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        }

        wishlist.items.push({
            itemType,
            itemId,
            addedAt: new Date()
        });

        await wishlist.save();

        await AnalyticsEvent.create({
            user: req.user._id,
            eventType: 'wishlist_add',
            targetId: itemId,
            targetType: itemType,
            metadata: { itemType, itemId }
        });

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { itemType, itemId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const initialLength = wishlist.items.length;
        wishlist.items = wishlist.items.filter(item =>
            !(item.itemId.toString() === itemId && item.itemType === itemType)
        );

        if (wishlist.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        await wishlist.save();

        await AnalyticsEvent.create({
            user: req.user._id,
            eventType: 'wishlist_remove',
            targetId: itemId,
            targetType: itemType,
            metadata: { itemType, itemId }
        });

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createWishlistCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const existingCategory = wishlist.categories.find(cat => cat.name === categoryName);
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        wishlist.categories.push({
            name: categoryName,
            itemIds: []
        });

        await wishlist.save();

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addItemToCategory = async (req, res) => {
    try {
        const { categoryName, itemId } = req.body;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const category = wishlist.categories.find(cat => cat.name === categoryName);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (!category.itemIds.includes(itemId)) {
            category.itemIds.push(itemId);
            await wishlist.save();
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getMyWishlist,
    addToWishlist,
    removeFromWishlist,
    createWishlistCategory,
    addItemToCategory
};
