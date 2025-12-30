const SearchIndex = require('../models/searchIndexModel');
const Product = require('../models/productModel');
const Portfolio = require('../models/portfolioModel');
const User = require('../models/userModel');
const { AnalyticsEvent } = require('../models/analyticsModel');

const searchItems = async (req, res) => {
    try {
        const {
            q,
            itemType,
            category,
            minPrice,
            maxPrice,
            location,
            radius,
            lat,
            lng,
            skills,
            tags,
            acceptsCustomOrders,
            acceptsBookings,
            availability,
            minRating,
            sortBy = 'relevance',
            page = 1,
            limit = 20
        } = req.query;

        let filter = { isActive: true };
        
        if (itemType && itemType !== 'all') {
            filter.itemType = itemType;
        }
        
        if (category) {
            filter.category = category;
        }
        
        if (minPrice !== undefined) {
            filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        }
        
        if (maxPrice !== undefined) {
            filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
        }
        
        if (skills) {
            filter.skills = { $in: skills.split(',') };
        }
        
        if (tags) {
            filter.tags = { $in: tags.split(',') };
        }
        
        if (acceptsCustomOrders === 'true') {
            filter.acceptsCustomOrders = true;
        }
        
        if (acceptsBookings === 'true') {
            filter.acceptsBookings = true;
        }
        
        if (availability) {
            filter.availability = availability;
        }
        
        if (minRating) {
            filter['rating.average'] = { $gte: parseFloat(minRating) };
        }

        if (lat && lng && radius) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius) * 1000
                }
            };
        } else if (location) {
            filter['location.city'] = new RegExp(location, 'i');
        }

        let searchPipeline = [];
        
        if (q && q.trim()) {
            searchPipeline.push({
                $match: {
                    $text: { $search: q }
                }
            });
            
            searchPipeline.push({
                $addFields: {
                    score: { $meta: "textScore" }
                }
            });
        } else {
            searchPipeline.push({
                $match: filter
            });
            
            searchPipeline.push({
                $addFields: {
                    score: 1
                }
            });
        }

        if (q && q.trim()) {
            searchPipeline.push({
                $match: filter
            });
        }

        let sortStage = {};
        switch (sortBy) {
            case 'price_asc':
                sortStage = { price: 1 };
                break;
            case 'price_desc':
                sortStage = { price: -1 };
                break;
            case 'newest':
                sortStage = { createdAt: -1 };
                break;
            case 'rating':
                sortStage = { 'rating.average': -1 };
                break;
            case 'relevance':
            default:
                sortStage = { score: -1 };
                break;
        }
        
        searchPipeline.push({ $sort: sortStage });

        const skip = (parseInt(page) - 1) * parseInt(limit);
        searchPipeline.push(
            { $skip: skip },
            { $limit: parseInt(limit) }
        );

        const searchResults = await SearchIndex.aggregate(searchPipeline);

        const countPipeline = [...searchPipeline];
        countPipeline.splice(countPipeline.length - 2, 2);
        countPipeline.push({ $count: 'total' });
        
        const countResult = await SearchIndex.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        const populatedResults = await populateSearchResults(searchResults);

        if (req.user) {
            await AnalyticsEvent.create({
                user: req.user._id,
                eventType: 'search_performed',
                targetId: null,
                targetType: 'search',
                metadata: {
                    query: q,
                    itemType,
                    category,
                    filters: {
                        minPrice,
                        maxPrice,
                        location,
                        skills,
                        tags,
                        acceptsCustomOrders,
                        acceptsBookings
                    },
                    resultCount: populatedResults.length
                }
            });
        }

        res.json({
            results: populatedResults,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            },
            filters: {
                applied: {
                    query: q,
                    itemType,
                    category,
                    minPrice,
                    maxPrice,
                    location,
                    skills,
                    tags,
                    acceptsCustomOrders,
                    acceptsBookings,
                    availability,
                    minRating,
                    sortBy
                }
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { q, itemType } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        const pipeline = [
            {
                $match: {
                    $text: { $search: q },
                    isActive: true
                }
            },
            {
                $project: {
                    title: 1,
                    itemType: 1,
                    category: 1,
                    score: { $meta: "textScore" }
                }
            },
            {
                $group: {
                    _id: {
                        title: "$title",
                        itemType: "$itemType",
                        category: "$category"
                    },
                    maxScore: { $max: "$score" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { maxScore: -1, count: -1 }
            },
            {
                $limit: 10
            }
        ];

        if (itemType && itemType !== 'all') {
            pipeline[0].$match.itemType = itemType;
        }

        const suggestions = await SearchIndex.aggregate(pipeline);

        const formattedSuggestions = suggestions.map(s => ({
            title: s._id.title,
            itemType: s._id.itemType,
            category: s._id.category,
            score: s.maxScore
        }));

        res.json({ suggestions: formattedSuggestions });
    } catch (error) {
        console.error('Suggestion error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getSearchFilters = async (req, res) => {
    try {
        const { itemType = 'all' } = req.query;
        
        const filter = itemType !== 'all' ? { itemType, isActive: true } : { isActive: true };

        const [
            categories,
            priceRange,
            locations,
            skills,
            tags
        ] = await Promise.all([
            SearchIndex.aggregate([
                { $match: filter },
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),
            
            SearchIndex.aggregate([
                { $match: { ...filter, price: { $exists: true, $gt: 0 } } },
                { 
                    $group: {
                        _id: null,
                        min: { $min: "$price" },
                        max: { $max: "$price" },
                        avg: { $avg: "$price" }
                    }
                }
            ]),
            
            SearchIndex.aggregate([
                { $match: { ...filter, 'location.city': { $exists: true, $ne: '' } } },
                { $group: { _id: "$location.city", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 15 }
            ]),
            
            SearchIndex.aggregate([
                { $match: { ...filter, skills: { $exists: true, $ne: [] } } },
                { $unwind: "$skills" },
                { $group: { _id: "$skills", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),
            
            SearchIndex.aggregate([
                { $match: { ...filter, tags: { $exists: true, $ne: [] } } },
                { $unwind: "$tags" },
                { $group: { _id: "$tags", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ])
        ]);

        const ratingDistribution = await SearchIndex.aggregate([
            { $match: { ...filter, 'rating.average': { $exists: true, $gt: 0 } } },
            {
                $bucket: {
                    groupBy: "$rating.average",
                    boundaries: [1, 2, 3, 4, 5, 6],
                    default: "other",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        res.json({
            categories: categories.map(c => ({ name: c._id, count: c.count })),
            priceRange: priceRange[0] || { min: 0, max: 0, avg: 0 },
            locations: locations.map(l => ({ city: l._id, count: l.count })),
            skills: skills.map(s => ({ name: s._id, count: s.count })),
            tags: tags.map(t => ({ name: t._id, count: t.count })),
            ratingDistribution,
            availabilityOptions: [
                { value: 'available', label: 'Available' },
                { value: 'limited', label: 'Limited Stock' },
                { value: 'unavailable', label: 'Out of Stock' }
            ],
            sortOptions: [
                { value: 'relevance', label: 'Most Relevant' },
                { value: 'newest', label: 'Newest First' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' }
            ]
        });
    } catch (error) {
        console.error('Filters error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPopularSearches = async (req, res) => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const popularSearches = await AnalyticsEvent.aggregate([
            {
                $match: {
                    eventType: 'search_performed',
                    createdAt: { $gte: last7Days },
                    'metadata.query': { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: '$metadata.query',
                    count: { $sum: 1 },
                    lastSearched: { $max: '$createdAt' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            popularSearches: popularSearches.map(ps => ({
                query: ps._id,
                count: ps.count,
                lastSearched: ps.lastSearched
            }))
        });
    } catch (error) {
        console.error('Popular searches error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

async function populateSearchResults(searchResults) {
    const populatedResults = [];
    
    for (const result of searchResults) {
        let populatedItem = null;
        
        switch (result.itemType) {
            case 'product':
                populatedItem = await Product.findById(result.itemId)
                    .select('name description price category imageUrl stock seller rating isApproved')
                    .populate('seller', 'name profileImage location');
                break;
                
            case 'portfolio':
                populatedItem = await Portfolio.findById(result.itemId)
                    .select('title description mediaType mediaUrl thumbnailUrl category tags skills priceRange acceptsCustomOrders viewCount favoriteCount')
                    .populate('creator', 'name profileImage location');
                break;
                
            case 'user':
                populatedItem = await User.findById(result.itemId)
                    .select('name email profileImage bio location businessInfo acceptsCustomOrders acceptsBookings serviceTypes isVerified')
                    .where('isActive', true);
                break;
        }
        
        if (populatedItem) {
            populatedResults.push({
                ...result,
                item: populatedItem.toObject ? populatedItem.toObject() : populatedItem
            });
        }
    }
    
    return populatedResults;
}

module.exports = {
    searchItems,
    getSearchSuggestions,
    getSearchFilters,
    getPopularSearches
};
