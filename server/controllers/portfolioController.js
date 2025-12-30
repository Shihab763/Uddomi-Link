const Portfolio = require('../models/portfolioModel');
const { AnalyticsEvent, UserAnalytics } = require('../models/analyticsModel');

const createPortfolio = async (req, res) => {
    try {
        const { title, description, mediaType, mediaUrl, thumbnailUrl, category, tags, skills, acceptsCustomOrders, priceRange } = req.body;

        if (!req.user.roles || !req.user.roles.includes('business-owner')) {
            return res.status(403).json({ message: 'Only business owners can create portfolio items' });
        }

        const portfolio = await Portfolio.create({
            title,
            description,
            mediaType,
            mediaUrl,
            thumbnailUrl: thumbnailUrl || mediaUrl,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
            acceptsCustomOrders,
            priceRange,
            creator: req.user._id,
            customOrderEnabled: acceptsCustomOrders || false
        });

        res.status(201).json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPortfolioItems = async (req, res) => {
    try {
        const { category, creatorId, search, tags, acceptsCustomOrders } = req.query;
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (creatorId) filter.creator = creatorId;
        if (acceptsCustomOrders === 'true') filter.acceptsCustomOrders = true;
        if (tags) filter.tags = { $in: tags.split(',') };

        if (search) {
            filter.$text = { $search: search };
        }

        const portfolios = await Portfolio.find(filter)
            .populate('creator', 'name email profileImage')
            .sort({ createdAt: -1 });

        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPortfolioById = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id)
            .populate('creator', 'name email profileImage bio location');

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        portfolio.viewCount += 1;
        await portfolio.save();

        await AnalyticsEvent.create({
            user: req.user?._id,
            eventType: 'portfolio_view',
            targetId: portfolio._id,
            targetType: 'portfolio',
            metadata: { portfolioId: portfolio._id, creatorId: portfolio.creator._id }
        });

        await UserAnalytics.findOneAndUpdate(
            { user: portfolio.creator },
            { $inc: { portfolioViews: 1 } },
            { upsert: true, new: true }
        );

        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updatePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        if (portfolio.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this portfolio item' });
        }

        const { title, description, mediaType, mediaUrl, thumbnailUrl, category, tags, skills, acceptsCustomOrders, priceRange, isActive } = req.body;

        portfolio.title = title || portfolio.title;
        portfolio.description = description || portfolio.description;
        portfolio.mediaType = mediaType || portfolio.mediaType;
        portfolio.mediaUrl = mediaUrl || portfolio.mediaUrl;
        portfolio.thumbnailUrl = thumbnailUrl || portfolio.thumbnailUrl;
        portfolio.category = category || portfolio.category;
        portfolio.tags = tags ? tags.split(',').map(tag => tag.trim()) : portfolio.tags;
        portfolio.skills = skills ? skills.split(',').map(skill => skill.trim()) : portfolio.skills;
        portfolio.acceptsCustomOrders = acceptsCustomOrders !== undefined ? acceptsCustomOrders : portfolio.acceptsCustomOrders;
        portfolio.customOrderEnabled = acceptsCustomOrders !== undefined ? acceptsCustomOrders : portfolio.customOrderEnabled;
        portfolio.priceRange = priceRange || portfolio.priceRange;
        portfolio.isActive = isActive !== undefined ? isActive : portfolio.isActive;

        await portfolio.save();

        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deletePortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        if (portfolio.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this portfolio item' });
        }

        await Portfolio.findByIdAndDelete(req.params.id);

        res.json({ message: 'Portfolio item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyPortfolios = async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ creator: req.user._id })
            .sort({ createdAt: -1 });

        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const incrementFavoriteCount = async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio item not found' });
        }

        portfolio.favoriteCount += 1;
        await portfolio.save();

        await AnalyticsEvent.create({
            user: req.user._id,
            eventType: 'portfolio_favorite',
            targetId: portfolio._id,
            targetType: 'portfolio',
            metadata: { portfolioId: portfolio._id, creatorId: portfolio.creator }
        });

        res.json({ favoriteCount: portfolio.favoriteCount });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPortfolio,
    getPortfolioItems,
    getPortfolioById,
    updatePortfolio,
    deletePortfolio,
    getMyPortfolios,
    incrementFavoriteCount
};
