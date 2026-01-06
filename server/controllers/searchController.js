const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Get search suggestions (Typeahead)
// @route   GET /api/search/suggestions?q=keyword
// @access  Public
const getSuggestions = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    // Regex for case-insensitive partial match
    const regex = new RegExp(query, 'i');

    // 1. Find matching Products (limit 5)
    const products = await Product.find({ name: { $regex: regex } })
      .select('name image price category')
      .limit(5);

    // 2. Find matching Creators (limit 3)
    const creators = await User.find({
      name: { $regex: regex },
      roles: 'business-owner' 
    }).select('name profile.avatar profile.businessName');

    res.json({ products, creators });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Advanced Search with Filters
// @route   GET /api/search?q=...&type=...&min=...&max=...&sort=...
// @access  Public
const searchAll = async (req, res) => {
  try {
    const { q, type, min, max, sort } = req.query;
    const regex = q ? new RegExp(q, 'i') : null;
    let results = {};

    // --- SEARCH PRODUCTS ---
    if (!type || type === 'products') {
      let queryObj = {};
      if (regex) queryObj.name = { $regex: regex };

      // Price Filter
      if (min || max) {
        queryObj.price = {};
        if (min) queryObj.price.$gte = Number(min);
        if (max) queryObj.price.$lte = Number(max);
      }

      // Sorting Logic
      let sortObj = {};
      if (sort === 'highToLow') sortObj.price = -1; // Descending
      if (sort === 'lowToHigh') sortObj.price = 1;  // Ascending
      
      const products = await Product.find(queryObj).sort(sortObj);
      results.products = products;
    }

    // --- SEARCH CREATORS ---
    // (Only if type is NOT 'products', i.e., 'creators' or 'all')
    if (!type || type === 'creators') {
      let userQuery = { roles: 'business-owner' };
      if (regex) userQuery.name = { $regex: regex };

      const creators = await User.find(userQuery).select('-password');
      results.creators = creators;
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuggestions, searchAll };
