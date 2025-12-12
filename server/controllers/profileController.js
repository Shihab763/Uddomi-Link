const User = require('../models/userModel');
const Product = require('../models/productModel');

// Get user profile by ID (public)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Increment profile views
        if (!user.profile) {
            user.profile = {};
        }
        user.profile.profileViews = (user.profile.profileViews || 0) + 1;
        await user.save();

        // Get user's products, business owner view
        let products = [];
        if (user.roles && user.roles.includes('business-owner')) {
            products = await Product.find({ seller: user._id, isApproved: true }).limit(6);
        }

        res.json({
            user,
            products,
            stats: {
                memberSince: user.createdAt,
                productCount: products.length,
                profileViews: user.profile?.profileViews || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get my profile (authenticated)
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's products, business owner view
        let products = [];
        if (user.roles && user.roles.includes('business-owner')) {
            products = await Product.find({ seller: user._id });
        }

        res.json({
            user,
            products,
            stats: {
                memberSince: user.createdAt,
                productCount: products.length,
                profileViews: user.profile?.profileViews || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update my profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const {
            bio,
            profilePicture,
            coverPhoto,
            phone,
            address,
            socialLinks,
            businessName,
            businessType,
            yearsInBusiness
        } = req.body;

        // Update profile fields
        if (!user.profile) {
            user.profile = {};
        }

        if (bio !== undefined) user.profile.bio = bio;
        if (profilePicture !== undefined) user.profile.profilePicture = profilePicture;
        if (coverPhoto !== undefined) user.profile.coverPhoto = coverPhoto;
        if (phone !== undefined) user.profile.phone = phone;
        if (address !== undefined) user.profile.address = address;
        if (socialLinks !== undefined) user.profile.socialLinks = socialLinks;
        if (businessName !== undefined) user.profile.businessName = businessName;
        if (businessType !== undefined) user.profile.businessType = businessType;
        if (yearsInBusiness !== undefined) user.profile.yearsInBusiness = yearsInBusiness;

        user.profile.lastUpdated = new Date();

        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all sellers
const getAllSellers = async (req, res) => {
    try {
        const sellers = await User.find({ roles: 'business-owner' })
            .select('-password')
            .sort({ 'profile.lastUpdated': -1 });

        // Get product count for each seller
        const sellersWithStats = await Promise.all(
            sellers.map(async (seller) => {
                const productCount = await Product.countDocuments({
                    seller: seller._id,
                    isApproved: true
                });

                return {
                    _id: seller._id,
                    name: seller.name,
                    email: seller.email,
                    profile: seller.profile,
                    productCount,
                    memberSince: seller.createdAt
                };
            })
        );

        res.json(sellersWithStats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getMyProfile,
    updateProfile,
    getAllSellers
};
