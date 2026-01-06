const Product = require('../models/productModel');
const User = require('../models/userModel');
const Portfolio = require('../models/portfolioModel');

const search = async (req, res) => {
  try {
    // 1. Capture all params sent by AdvancedSearchPage.jsx
    const { 
      q, 
      category, 
      minPrice, 
      maxPrice, 
      location, 
      itemType = 'all', 
      page = 1, 
      limit = 20 
    } = req.query;

    console.log("🔍 SEARCH PARAMS:", req.query);

    const regex = q ? new RegExp(q, 'i') : null;
    let results = [];

    // --- SEARCH PRODUCTS ---
    if (itemType === 'product' || itemType === 'all') {
      let productQuery = {};

      // Keyword Search (Name, Desc, Category)
      if (regex) {
        productQuery.$or = [
          { name: regex },
          { description: regex },
          { category: regex }
        ];
      }

      // Filters
      if (category && category !== 'All') productQuery.category = category;
      
      if (minPrice || maxPrice) {
        productQuery.price = {};
        if (minPrice) productQuery.price.$gte = Number(minPrice);
        if (maxPrice) productQuery.price.$lte = Number(maxPrice);
      }

      // REMOVED 'isApproved: true' for testing. Uncomment when production ready.
      // productQuery.isApproved = true;

      // Fetch products
      let products = await Product.find(productQuery)
        .populate('sellerId', 'name profileImage email profile');

      // Location Filter (Post-Fetch because location is inside sellerId)
      if (location) {
        products = products.filter(p => {
          const addr = p.sellerId?.profile?.address || {};
          const fullAddr = `${addr.city || ''} ${addr.district || ''}`.toLowerCase();
          return fullAddr.includes(location.toLowerCase());
        });
      }

      // Map to Frontend Structure
      results.push(...products.map(p => ({
        itemType: 'product',
        item: {
          ...p._doc,
          seller: p.sellerId // Fix: Map sellerId to 'seller' for frontend
        }
      })));
    }

    // --- SEARCH PORTFOLIOS ---
    if (itemType === 'portfolio' || itemType === 'all') {
      let portfolioQuery = {};
      if (regex) {
        portfolioQuery.$or = [
          { title: regex },
          { description: regex },
          { skills: regex } // Assuming skills is an array of strings
        ];
      }

      const portfolios = await Portfolio.find(portfolioQuery)
        .populate('userId', 'name profileImage');

      results.push(...portfolios.map(p => ({
        itemType: 'portfolio',
        item: {
          ...p._doc,
          creator: p.userId // Fix: Map userId to 'creator' for frontend
        }
      })));
    }

    // --- SEARCH CREATORS (USERS) ---
    if (itemType === 'user' || itemType === 'all') {
      let userQuery = { roles: { $in: ['business-owner', 'artist'] } };
      
      if (regex) {
        userQuery.name = regex;
      }
      
      // Location Filter for Users
      if (location) {
        // Note: This assumes simple string match on address fields if they exist on User root
        // If address is nested in profile, we might need post-filtering like Products
      }

      const users = await User.find(userQuery).select('name email roles profile profileImage');

      results.push(...users.map(u => ({
        itemType: 'user',
        item: u
      })));
    }

    console.log(`✅ RETURNED ${results.length} RESULTS`);

    // Return the EXACT structure your Frontend expects
    res.json({
      results, 
      pagination: { 
        total: results.length, 
        page: Number(page), 
        totalPages: 1 
      },
      filters: { applied: req.query }
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ 
      results: [], 
      pagination: { total: 0, page: 1, totalPages: 1 }, 
      error: error.message 
    });
  }
};

module.exports = { search };
